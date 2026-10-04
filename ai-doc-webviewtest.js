/* ============================================================================
   webview-compat.js — يختبر توافق الواجهة مع WebView/Android القديم
   السبب: في بعض أجهزة Android لا تتوفر File.prototype.arrayBuffer،
   فيسقط التحليل برسالة "خطأ غير متوقع". هذا الملف يمنع تكرارها.
   تشغيل:  node ai-doc-webviewtest.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
let pass = 0, fail = 0;
function t(name, cond) {
    if (cond) { pass++; console.log('  PASS  ' + name); }
    else { fail++; console.log('  FAIL  ' + name); }
}

/* بيئة متصفح مختصرة */
const sb = {
    console, TextDecoder, Date, Math, JSON, parseFloat, isFinite, setTimeout, clearTimeout,
    navigator: { onLine: true }
};
sb.window = sb; sb.globalThis = sb;
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, 'ai-doc-schema.js'), 'utf8'), sb, { filename: 'schema' });
sb.AiDocSchema = sb.AiDocSchema;
vm.runInContext(fs.readFileSync(path.join(ROOT, 'ai-doc-service.js'), 'utf8'), sb, { filename: 'service' });
const A = sb.AiDocService;

/* FileReaderStub يحاكي FileReader في WebView (blob.arrayBuffer غير متاح) */
class FileReaderStub {
    readAsDataURL(file) {
        setTimeout(() => {
            this.result = 'data:' + file.type + ';base64,' + file._b64;
            if (this.onload) this.onload();
        }, 0);
    }
    readAsArrayBuffer(file) {
        setTimeout(() => {
            this.result = file._buf;
            if (this.onload) this.onload();
        }, 0);
    }
}
sb.FileReader = FileReaderStub;

/* ملف PNG صغير 1×1 */
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const b64 = PNG.toString('base64');

function makeFile(withArrayBuffer) {
    const f = {
        name: 'test.png', type: 'image/png', size: PNG.length,
        _b64: b64, _buf: PNG.buffer.slice(PNG.byteOffset, PNG.byteOffset + PNG.byteLength)
    };
    if (withArrayBuffer) f.arrayBuffer = async () => f._buf;
    return f;
}

(async () => {
    console.log('\n=== 1) متصفح حديث: arrayBuffer متاح ===');
    const modern = makeFile(true);
    const r1 = await A.analyze(modern, {
        uiLang: 'ar',
        onProgress: () => { }
    }).then(() => 'network-result').catch(e => 'code:' + e.code);

    console.log('\n=== 2) WebView/Android قديم: arrayBuffer غير متاح ===');
    const legacy = makeFile(false);
    const r2 = await A.analyze(legacy, {
        uiLang: 'ar',
        onProgress: () => { }
    }).then(() => 'network-result').catch(e => 'code:' + e.code);

    /* المطلوب: في الحالتين يجب أن يصل الخطأ إلى الشبكة (fetch)، لا أن ينهار
       قبل ذلك بـ "unknown" بسبب arrayBuffer. */
    t('المتصفح الحديث يصل إلى الشبكة', r1 !== 'code:unknown', true);
    t('WebView القديم لا يعطي unknown من arrayBuffer', r2 !== 'code:unknown', true);

    console.log('\n=== 3) أنماط الملف: PDF و JPG و PNG ===');
    ['application/pdf', 'image/jpeg', 'image/png'].forEach(mt => {
        const f = makeFile(false);
        f.type = mt; f.name = 'x.' + mt.split('/')[1];
        t('قبول ' + mt + ' بدون arrayBuffer', !!A.validateFile(f), true);
    });

    console.log('\n=== 4) توحيد التواريخ والأوقات على WebView ===');
    const S = sb.AiDocSchema;
    t('14/06/1985', S.normalizeDate('14/06/1985'), '1985-06-14');
    t('8:05 PM', S.normalizeTime('8:05 PM'), '20:05');

    console.log('\n=== 5) الاتصال المباشر بـ Google Gemini ===');
    const svcSrc = fs.readFileSync(path.join(ROOT, 'ai-doc-service.js'), 'utf8');
    const uiSrc = fs.readFileSync(path.join(ROOT, 'ai-doc-ui.js'), 'utf8');
    const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

    t('no Cloudflare endpoint', A.GEMINI_ENDPOINT === 'https://generativelanguage.googleapis.com/v1beta/models/');
    t('نموذج Gemini معرّف', typeof A.GEMINI_MODEL === 'string' && A.GEMINI_MODEL.length > 0, A.GEMINI_MODEL);
    t('لا دالة proxy/endpoint متبقية', typeof A.isEndpointAllowed === 'undefined' && typeof A.checkHealth === 'undefined');
    t('لا /v1/analyze في التطبيق', svcSrc.indexOf('/v1/analyze') < 0 && uiSrc.indexOf('/v1/analyze') < 0);
    t('buildGeminiRequest موجود', typeof A.buildGeminiRequest === 'function');
    t('الاتصال مباشر بـ generativelanguage', svcSrc.indexOf('generativelanguage.googleapis.com') > 0);

    console.log('\n=== 6) المفتاح في مكان واحد فقط (بدون أسراب) ===');
    /* كاشف تسريب لا يفترض بداية ثابتة للمفتاح */
    const LEAK_RE = /GEMINI_API_KEY\s*=\s*['"](?!['"])[^'"]{16,}['"]/;
    t('المفتاح المدمج فارغ افتراضياً', /const GEMINI_API_KEY = '';/.test(svcSrc));
    t('مرتبط مرة واحدة فقط', (svcSrc.match(/apiKey\s*:\s*GEMINI_API_KEY/g) || []).length === 1);
    t('لا مفتاح مدمج في الخدمة', !LEAK_RE.test(svcSrc));
    t('لا مفتاح مدمج في الواجهة', !LEAK_RE.test(uiSrc));
    t('لا مفتاح مدمج في HTML', !LEAK_RE.test(htmlSrc));
    t('لا يطبع المفتاح', svcSrc.indexOf('console.log(CONFIG') < 0 && uiSrc.indexOf('console.log(CONFIG') < 0);
    t('حقل إدخال المفتاح موجود', htmlSrc.indexOf('id="aiApiKey"') >= 0);
    t('المفتاح يُخزَّن في قاعدة البرنامج', uiSrc.indexOf('databaseSet') > 0);

    console.log('\n=== 7) لا شرط AIza في أي مكان ===');
    t('لا AIza في الخدمة', svcSrc.indexOf('AIza') < 0);
    t('لا AIza في الواجهة', uiSrc.indexOf('AIza') < 0);
    t('لا AIza في HTML', htmlSrc.indexOf('AIza') < 0);
    t('لا indexOf AIza', uiSrc.indexOf("indexOf('AIza')") < 0 && svcSrc.indexOf("indexOf('AIza')") < 0);

    console.log('\n=== 8) التحقق يقبل أي مفتاح غير فارغ ===');
    const KEYS = ['', '   ', 'TEST_GEMINI_KEY_EXAMPLE', 'x', 'a-very-short-one',
        'ZZZ999', 'clé-française', '\t\nZZZ9\t\n', '999999999999'];
    KEYS.forEach(function (k) {
        A.configure({ apiKey: k });
        const ok = A.hasApiKey();
        const shouldAccept = (k.trim() !== '');
        t('  «' + (k === '' ? '(فارغ)' : k.trim() === '' ? '(مسافات فقط)' : k.trim()) + '» => ' + (ok ? 'مقبول' : 'مرفوض'),
            ok === shouldAccept);
    });
    A.configure({ apiKey: A.GEMINI_BUILTIN_KEY });
    t('الفراغ يُرفض', (function () { A.configure({ apiKey: '   ' }); const r = A.hasApiKey(); A.configure({ apiKey: A.GEMINI_BUILTIN_KEY }); return r === false; })());
    t('المفتاح المدمج الافتراضي غير مضبوط', A.GEMINI_BUILTIN_KEY === '' && A.hasApiKey() === false);

    console.log('\n============================================');
    console.log('  نجح: ' + pass + '   |   فشل: ' + fail);
    console.log('============================================');
    process.exit(fail === 0 ? 0 : 1);
})();