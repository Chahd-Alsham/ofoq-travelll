/* ============================================================================
   ai-doc-livetest.js — اختبار حقيقي لـ Google Gemini API (ليس Mock)
   ----------------------------------------------------------------------------
   لا ينجح الاختبار الحي إلا بمفتاح Gemini حقيقي.
   التشغيل:
       node ai-doc-livetest.js
   أو بمفتاح مؤقت دون تعديل الملف:
       $env:GEMINI_API_KEY='ضع-مفتاحك-هنا'; node ai-doc-livetest.js
   ========================================================================== */
'use strict';

const path = require('path');
const fs = require('fs');
const vm = require('vm');

const WEB = __dirname;
function loadModule(file, extra) {
    const code = fs.readFileSync(path.join(WEB, file), 'utf8');
    const sb = Object.assign({ console, TextDecoder, Date, Math, JSON, parseFloat, isFinite, setTimeout, clearTimeout }, extra);
    sb.window = sb; sb.globalThis = sb;
    vm.createContext(sb);
    vm.runInContext(code, sb, { filename: file });
    return sb;
}

const S = loadModule('ai-doc-schema.js', {}).AiDocSchema;
const A = loadModule('ai-doc-service.js', { AiDocSchema: S }).AiDocService;

/* المفتاح: من متغير البيئة، وإلا من ai-doc-service.js */
const envKey = (process.env.GEMINI_API_KEY || '').trim();
if (envKey) A.configure({ apiKey: envKey });

let pass = 0, fail = 0, skip = 0;
const R = s => console.log('  ' + s);
function t(name, cond, extra) {
    if (cond) { pass++; R('\x1b[32mPASS\x1b[0m  ' + name + (extra ? '  ' + extra : '')); }
    else { fail++; R('\x1b[31mFAIL\x1b[0m  ' + name + (extra ? '  ' + extra : '')); }
}
function sk(name) { skip++; R('\x1b[33mSKIP\x1b[0m  ' + name); }

/* مستندات اختبار اصطناعية غير حساسة */
const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const PDF = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Page>>endobj\nBT (Booking PNR X7K2QM) Tj (MOHAMMED AHMED) Tj ET').toString('base64');

class FR {
    readAsDataURL(f) { setTimeout(() => { this.result = 'data:' + f.type + ';base64,' + f._b64; if (this.onload) this.onload(); }, 0); }
    readAsArrayBuffer() { setTimeout(() => { this.result = new ArrayBuffer(0); if (this.onload) this.onload(); }, 0); }
}
function toFile(name, mime, b64) {
    const buf = Buffer.from(b64, 'base64');
    return {
        name, type: mime, size: buf.length, _b64: b64,
        arrayBuffer: async () => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    };
}

(async () => {
    globalThis.FileReader = FR;

    console.log('\n══════════════════════════════════════════════');
    console.log('  اختبار حقيقي — Google Gemini API (بدون Mock)');
    console.log('══════════════════════════════════════════════');

    console.log('\n=== 1) بنية الطلب (تُتحقق دائماً) ===');
    const doc = { mimeType: 'application/pdf', base64: PDF, embeddedText: 'PNR X7K2QM', fileName: 't.pdf' };
    const realInstructions = A.buildInstructions('ar');
    const req = A.buildGeminiRequest(doc, realInstructions);
    t('URL يشير إلى Google', req.url.indexOf('https://generativelanguage.googleapis.com') === 0);
    t('نموذج Gemini في المسار', req.url.indexOf(A.GEMINI_MODEL) > 0);
    t('المفتاح في المسار (key=)', req.url.indexOf('?key=') > 0);
    t('temperature = 0', req.body.generationConfig.temperature === 0);
    t('JSON mode مفعّل', req.body.generationConfig.responseMimeType === 'application/json');
    t('الملف مضمّن base64', req.body.contents[0].parts.some(p => p.inline_data && p.inline_data.data === PDF));
    t('نوع الملف صحيح', req.body.contents[0].parts.some(p => p.inline_data && p.inline_data.mime_type === 'application/pdf'));
    t('طبقة النص المدمج', req.body.contents[0].parts.some(p => p.text && p.text.indexOf('TEXT LAYER') >= 0));
    t('تعليمات الحقول موجودة', req.body.contents[0].parts.some(p => p.text && p.text.indexOf('"field":"passport"') >= 0));
    t('منع التخمين في التعليمات', req.body.contents[0].parts.some(p => p.text && p.text.indexOf('use null') >= 0));

    console.log('\n=== 2) حالة المفتاح ===');
    t('hasApiKey يعكس الواقع',
        A.hasApiKey() === (String(A.getConfig().apiKey).indexOf('PUT_YOUR') !== 0 && String(A.getConfig().apiKey).length > 20));

    if (!A.hasApiKey()) {
        console.log('\n  ⛔ لا يوجد مفتاح Gemini — لا يمكن تنفيذ اختبار حي.');
        R('     ضع المفتاح في أحدهما:');
        R("       1) www.ofoqtravel.com/ai-doc-service.js → const GEMINI_API_KEY");
        R("       2) أو: $env:GEMINI_API_KEY='ضع-مفتاحك-هنا'; node ai-doc-livetest.js");
        sk('Windows → Gemini');
        sk('PDF → Gemini');
        sk('Image → Gemini');
        sk('Arabic');
        sk('English');
        sk('French');
    } else {
        console.log('\n=== 3) اتصال حقيقي بـ Gemini ===');
        const h = await A.checkConnection();
        t('الاتصال بـ Gemini', h.ok === true, JSON.stringify(h));
        if (!h.ok) R('     خطأ: ' + h.code);

        console.log('\n=== 4) تحليل PDF حقيقي ===');
        const rp = await A.analyze(toFile('t.pdf', 'application/pdf', PDF), { uiLang: 'ar' })
            .then(r => ({ ok: true, r })).catch(e => ({ ok: false, code: e.code, detail: e.message }));
        if (rp.ok) {
            t('PDF تم تحليله', true);
            R('       نوع المستند: ' + rp.r.documentType);
            R('       مسافرون: ' + rp.r.passengers.length + ' | رحلات: ' + rp.r.flights.length);
            t('meta.provider = gemini', rp.r.meta && rp.r.meta.provider === 'gemini');
        } else {
            t('PDF تم تحليله', false, 'code=' + rp.code + ' ' + (rp.detail || ''));
        }

        console.log('\n=== 5) تحليل صورة حقيقية ===');
        const ri = await A.analyze(toFile('t.png', 'image/png', PNG), { uiLang: 'en' })
            .then(r => ({ ok: true, r })).catch(e => ({ ok: false, code: e.code, detail: e.message }));
        if (ri.ok) {
            t('Image تم تحليله', true);
            R('       نوع المستند: ' + ri.r.documentType);
        } else {
            const benign = ['empty_result', 'invalid_json'].indexOf(ri.code) >= 0;
            t('Image طلب صحيح (صورة 1×1 فارغة)', benign,
                benign ? 'بلا بيانات — صحيح لصورة فارغة' : 'code=' + ri.code);
        }

        console.log('\n=== 6) اللغات الثلاث ===');
        for (const lang of ['ar', 'en', 'fr']) {
            const ins = A.buildInstructions(lang);
            t('تعليمات ' + lang, ins.indexOf('"field":"passport"') >= 0 && ins.indexOf('use null') >= 0);
        }
    }

    console.log('\n=== 7) حماية من التخمين (محلية) ===');
    t('قيمة مشوّهة => null', A.buildField('passport', { value: '???', confidence: 0.99 }).value === null);
    t('تاريخ مستحيل => null', A.buildField('dob', { value: '31/02/1985', confidence: 0.99 }).value === null);
    t('confidence محفوظ', A.buildField('name', { value: 'X', confidence: 0.4 }).confidence === 0.4);
    t('prompt injection محمي', A.buildInstructions('ar').indexOf('prompt-injection') >= 0);

    console.log('\n══════════════════════════════════════════════');
    console.log('  نجح: \x1b[32m' + pass + '\x1b[0m   فشل: \x1b[31m' + fail + '\x1b[0m   متخطّى: \x1b[33m' + skip + '\x1b[0m');
    console.log('══════════════════════════════════════════════\n');
    process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('FATAL', e && e.message); process.exit(1); });