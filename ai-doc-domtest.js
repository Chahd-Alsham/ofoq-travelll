/* ============================================================================
   dom-contract.js — يتحقق أن كل عنصر يحتاجه ai-doc-ui.js موجود فعلاً في
   index.html، وأن الأقسام القائمة لم تُمس.
   تشغيل:  node ai-doc-domtest.js
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = __dirname;
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const ui = fs.readFileSync(path.join(ROOT, 'ai-doc-ui.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
const app = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
const svc = fs.readFileSync(path.join(ROOT, 'ai-doc-service.js'), 'utf8');

let pass = 0, fail = 0;
function t(name, cond) {
    if (cond) { pass++; console.log('  PASS  ' + name); }
    else { fail++; console.log('  FAIL  ' + name); }
}

/* 1) كل getElementById في ai-doc-ui.js يجب أن يقابله id في index.html */
/* عناصر ينشئها ai-doc-ui.js ديناميكياً (لا يلزم وجودها في index.html) */
const DYNAMIC = ['aiFileClear'];

const ids = [...new Set((ui.match(/getElementById\('([A-Za-z0-9_-]+)'\)/g) || [])
    .map(m => m.match(/'([^']+)'/)[1]))];
const missing = ids.filter(id => DYNAMIC.indexOf(id) < 0 && html.indexOf('id="' + id + '"') < 0);
console.log('\n=== 1) عناصر الواجهة المطلوبة (' + ids.length + ') ===');
t('لا يوجد id مفقود في index.html', missing.length === 0);
if (missing.length) console.log('        missing: ' + missing.join(', '));
t('aiFileClear يُنشأ ديناميكياً', ui.indexOf('id="aiFileClear"') >= 0);

console.log('\n=== 2) القسم الجديد موجود ومسجّل ===');
t('section-ai موجود', html.indexOf('id="section-ai"') >= 0);
t('nav-ai موجود', html.indexOf('data-target="section-ai"') >= 0);
t('nav_ai في الترجمة العربية', /nav_ai:\s*"[^"]+"/.test(app));
t('ملفات ai-doc محمّلة بالترتيب', (() => {
    const a = html.indexOf('ai-doc-schema.js');
    const b = html.indexOf('ai-doc-service.js');
    const c = html.indexOf('ai-doc-ui.js');
    return a > 0 && b > a && c > b;
})());
t('section-ai ليس نشطاً افتراضياً', html.indexOf('id="section-ai" class="app-section"') >= 0);

console.log('\n=== 3) الأقسام القائمة سليمة (المتطلّب #27) ===');
['section-dashboard', 'section-new-booking', 'section-history', 'section-airlines', 'section-settings']
    .forEach(id => t('القسم ' + id + ' ما زال موجوداً', html.indexOf('id="' + id + '"') >= 0));
t('حقول الحجز الأصلية سليمة',
    ['bookingPnr', 'ticketNumber', 'bookingReference', 'bookingDate', 'mainTripType', 'bookingStatus']
        .every(id => html.indexOf('id="' + id + '"') >= 0));
t('حاويتا المسافرين والرحلات سليمتان',
    html.indexOf('id="passengersContainer"') >= 0 && html.indexOf('id="flightsContainer"') >= 0);

console.log('\n=== 4) حقول النموذج التي يكتب فيها الذكاء الاصطناعي ===');
const writeTargets = ['bookingPnr', 'ticketNumber', 'bookingReference', 'bookingDate', 'mainTripType', 'bookingStatus'];
writeTargets.forEach(id => t('الحقل ' + id + ' موجود في النموذج', html.indexOf('id="' + id + '"') >= 0));

console.log('\n=== 5) تنسيقات CSS موجودة ===');
['.ai-root', '.ai-dropzone', '.ai-split', '.ai-table', '.ai-row-conf', '.ai-log-list', '.ai-status']
    .forEach(s => t('تنسيق ' + s, css.indexOf(s) >= 0));
t('استعلام الجوال للتبويبات', css.indexOf('.ai-tabs { display: flex; }') >= 0);

console.log('\n=== 6) لا مفتاح حقيقي في أي ملف واجهة ===');
const all = html + app + ui + css;
/* كاشف تسريب مفاتيح: لا يفترض بداية ثابتة للمفتاح.
   أي قيمة طويلة تُسند لـ GEMINI_API_KEY أو aiApiKey تُعدّ تسريباً. */
const LEAK_RE = /GEMINI_API_KEY\s*=\s*['"](?!['"])[^'"]{16,}['"]/;
const LEAK_UI_RE = /id="aiApiKey"[^>]*value\s*=\s*['"][^'"]{16,}['"]/;

t('لا sk-', all.indexOf('sk-') < 0);
t('لا مفتاح مدمج حقيقي', !LEAK_RE.test(svc) && !LEAK_RE.test(ui));
t('لا مفتاح مدمج في HTML', !LEAK_RE.test(html));
t('لا قيمة مفتاح في HTML', !LEAK_UI_RE.test(html));
t('المفتاح المدمج فارغ افتراضياً', /const GEMINI_API_KEY = '';/.test(svc));

console.log('\n=== 7) لا اعتماد تشغيلي على Cloudflare / Proxy / localhost ===');
t('لا workers.dev', all.indexOf('workers.dev') < 0);
t('لا wrangler', all.indexOf('wrangler') < 0);
t('لا Cloudflare', all.indexOf('Cloudflare') < 0);
t('لا ai.ofoqtravel.com', all.indexOf('ai.ofoqtravel.com') < 0);
t('لا localhost', all.indexOf('localhost') < 0);
t('لا 127.0.0.1', all.indexOf('127.0.0.1') < 0);
t('لا /v1/analyze', all.indexOf('/v1/analyze') < 0);
t('الاتصال المباشر بـ Google', svc.indexOf('generativelanguage.googleapis.com') > 0);
t('لا عنصر aiEndpoint في HTML', html.indexOf('aiEndpoint') < 0);
t('يوجد حقل aiApiKey', html.indexOf('id="aiApiKey"') >= 0);

console.log('\n=== 8) جسر آمن مع script.js ===');
t('يقرأ workingPassengers بأمان', ui.indexOf("typeof workingPassengers !== 'undefined'") >= 0);
t('يقرأ workingFlights بأمان', ui.indexOf("typeof workingFlights !== 'undefined'") >= 0);
t('يقرأ bookingsList بأمان', ui.indexOf("typeof bookingsList !== 'undefined'") >= 0);
t('يستدعي renderPassengersForm', ui.indexOf('renderPassengersForm') >= 0);
t('يستدعي renderFlightsForm', ui.indexOf('renderFlightsForm') >= 0);
t('يستدعي updateLivePreview', ui.indexOf('updateLivePreview') >= 0);
t('script.js يستدعي onLangChange للوحدة', app.indexOf('AiDocUI.onLangChange') >= 0);

console.log('\n=== 9) شكل كائن المسافر/الرحلة يطابق script.js ===');
t('مفاتيح المسافر الخمسة', ui.indexOf("{ name: '', type: 'Adult', gender: 'Male', passport: '', dob: '' }") >= 0);
t('مفاتيح الرحلة مطابقة لـ addFlightItem', (() => {
    const need = ['airline', 'flightNo', 'depCity', 'depAirport', 'depDate', 'depTime', 'depTerminal',
        'arrCity', 'arrAirport', 'arrDate', 'arrTime', 'arrTerminal', 'bagChecked', 'bagCabin',
        'travelClass', 'seat', 'transitWaiting'];
    return need.every(k => ui.indexOf(k + ':') >= 0);
})());

console.log('\n============================================');
console.log('  نجح: ' + pass + '   |   فشل: ' + fail);
console.log('============================================');
process.exit(fail === 0 ? 0 : 1);