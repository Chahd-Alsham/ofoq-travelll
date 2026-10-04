/* اختبار وحدة للمخطط والخدمة — تشغيل:  node ai-doc-selftest.js
   لا يحتاج إنترنت ولا مفتاح API.                                     */
const path = require('path');
const fs = require('fs');
const vm = require('vm');

const ROOT = __dirname;
function loadModule(file, globals) {
    const code = fs.readFileSync(path.join(ROOT, file), 'utf8');
    const sandbox = Object.assign({ console, TextDecoder, Date, Math, JSON, parseFloat, isFinite, setTimeout, clearTimeout }, globals);
    sandbox.window = sandbox;
    sandbox.globalThis = sandbox;
    vm.createContext(sandbox);
    vm.runInContext(code, sandbox, { filename: file });
    return sandbox;
}

const win = loadModule('ai-doc-schema.js', {});
const S = win.AiDocSchema;
const win2 = loadModule('ai-doc-service.js', { AiDocSchema: S });
const A = win2.AiDocService;

let pass = 0, fail = 0;
function t(name, actual, expected) {
    const ok = String(actual) === String(expected);
    ok ? pass++ : fail++;
    console.log((ok ? '  PASS  ' : '  FAIL  ') + name + '  -> ' + JSON.stringify(actual) + (ok ? '' : ' (expected ' + JSON.stringify(expected) + ')'));
}
function tNull(name, actual) { t(name, (actual === null || actual === undefined) ? null : actual, null); }

console.log('\n=== 1) توحيد التواريخ (المتطلّب #18) ===');
t('ISO 1985-06-14', S.normalizeDate('1985-06-14'), '1985-06-14');
t('DD/MM/YYYY 14/06/1985', S.normalizeDate('14/06/1985'), '1985-06-14');
t('DD-MM-YYYY 14-06-1985', S.normalizeDate('14-06-1985'), '1985-06-14');
t('June 14, 1985 (en)', S.normalizeDate('June 14, 1985'), '1985-06-14');
t('14 Juin 1985 (fr)', S.normalizeDate('14 Juin 1985'), '1985-06-14');
t('14 جوان 1985 (dz)', S.normalizeDate('14 جوان 1985'), '1985-06-14');
t('14 يونيو 1985 (ar)', S.normalizeDate('14 يونيو 1985'), '1985-06-14');
t('14/06/85 (سنتان)', S.normalizeDate('14/06/85'), '1985-06-14');
t('MM/DD/YYYY 06/14/1985', S.normalizeDate('06/14/1985'), '1985-06-14');
tNull('نص غير تاريخي', S.normalizeDate('abc'));
tNull('31 فبراير (مستحيل)', S.normalizeDate('31/02/1985'));
tNull('فارغ', S.normalizeDate(''));
tNull('undefined', S.normalizeDate(undefined));
t('الأرقام العربية-الهندية', S.normalizeDate('١٤/٠٦/١٩٨٥'), '1985-06-14');

console.log('\n=== 2) توحيد الأوقات ===');
t('08:00', S.normalizeTime('08:00'), '08:00');
t('8:05am', S.normalizeTime('8:05 AM'), '08:05');
t('8:05pm', S.normalizeTime('8:05 PM'), '20:05');
t('20:30 مع ثوانٍ', S.normalizeTime('20:30:00'), '20:30');
tNull('وقت غير صالح', S.normalizeTime('99:99'));
tNull('نص', S.normalizeTime('abc'));

console.log('\n=== 3) توحيد الأكواد (PNR / جواز / رحلة) ===');
t('PNR abc123', S.normalizeFieldValue('bookingPnr', 'abc123'), 'ABC123');
t('PNR بمسافات', S.normalizeFieldValue('bookingPnr', ' A1B 2C3 '), 'A1B2C3');
tNull('PNR = N/A', S.normalizeFieldValue('bookingPnr', 'N/A'));
t('جواز A1234567', S.normalizeFieldValue('passport', 'A1234567'), 'A1234567');
t('رحلة AH 1010', S.normalizeFieldValue('flightNo', 'AH 1010'), 'AH1010');
t('رحلة ah-1010', S.normalizeFieldValue('flightNo', 'ah-1010'), 'AH1010');
t('مقعد 12A', S.normalizeFieldValue('seat', '12A'), '12A');
tNull('فارغ => null', S.normalizeFieldValue('passport', ''));

console.log('\n=== 4) توحيد القيم المسموحة (3 لغات) ===');
t('EN economy', S.normalizeFieldValue('travelClass', 'Economy'), 'Economy');
t('FR économique', S.normalizeFieldValue('travelClass', 'Économique'), 'Economy');
t('AR سياحية', S.normalizeFieldValue('travelClass', 'سياحية'), 'Economy');
t('AR رجال الأعمال', S.normalizeFieldValue('travelClass', 'رجال الأعمال'), 'Business');
t('EN Male', S.normalizeFieldValue('gender', 'Male'), 'Male');
t('AR ذكر', S.normalizeFieldValue('gender', 'ذكر'), 'Male');
t('FR Homme', S.normalizeFieldValue('gender', 'Homme'), 'Male');
t('FR Adulte => Adult', S.normalizeFieldValue('type', 'Adulte'), 'Adult');
t('AR طفل => Child', S.normalizeFieldValue('type', 'طفل'), 'Child');
t('one-way', S.normalizeFieldValue('mainTripType', 'One Way'), 'One Way');
t('aller simple', S.normalizeFieldValue('mainTripType', 'Aller simple'), 'One Way');
t('ذهاب وعودة', S.normalizeFieldValue('mainTripType', 'ذهاب وعودة'), 'Round Trip');
tNull('قيمة غير معروفة', S.normalizeFieldValue('travelClass', 'ZZZ'));

console.log('\n=== 5) منع التخمين (المتطلّب #11) ===');
tNull('رقم غير موجود', A.buildField('passport', null).value);
tNull('undefined', A.buildField('passport', undefined).value);
tNull('نص مشوَّه', A.buildField('passport', { value: '???', confidence: 0.9 }).value);
tNull('كائن فارغ', A.buildField('name', {}).value);
tNull('تاريخ مستحيل رغم الثقة العالية', A.buildField('dob', { value: '31/02/1985', confidence: 0.99 }).value);
t('قيمة صحيحة تُحفظ', A.buildField('dob', { value: '14/06/1985', confidence: 0.99 }).value, '1985-06-14');
t('raw يُستخدم إن اختلف', A.buildField('dob', { value: 'X', raw: 'June 14, 1985', confidence: 0.9 }).value, '1985-06-14');
t('ثقة منخفضة => needsReview', A.buildField('passport', { value: 'AB123456', confidence: 0.5 }).needsReview, true);
t('ثقة عالية => لا مراجعة', A.buildField('passport', { value: 'AB123456', confidence: 0.97 }).needsReview, false);
t('needsReview من النموذج محترم', A.buildField('passport', { value: 'AB123456', confidence: 0.97, needsReview: true }).needsReview, true);
t('حقل غير معروف يُسقط بالكامل', A.buildField('nationality', { value: 'Algerian', confidence: 0.99 }).value, null);
t('confidence غير رقمي => 0', A.buildField('passport', { value: 'AB1', confidence: 'high' }).confidence, 0);

console.log('\n=== 6) التنظيف الكامل + قواعد ما بعد الاستخراج ===');
const good = A.sanitizeResponse({
    documentType: 'Booking Confirmation',
    documentTypeConfidence: 0.9,
    languages: ['en', 'fr'],
    booking: { bookingPnr: { value: 'X7K2QM', confidence: 0.95 } },
    passengers: [{ name: { value: 'MOHAMMED AHMED', confidence: 0.97 }, passport: { value: 'A1234567', confidence: 0.93 }, dob: { value: '14/06/1985', confidence: 0.9 } }],
    flights: [{ airline: { value: 'Air Algérie', confidence: 0.9 }, flightNo: { value: 'AH1010', confidence: 0.95 } }]
});
t('نوع المستند', good.documentType, 'Booking Confirmation');
t('عدد المسافرين', good.passengers.length, 1);
t('عدد الرحلات', good.flights.length, 1);
t('الاسم', good.passengers[0].name.value, 'MOHAMMED AHMED');
t('تاريخ الميلاد موحَّد', good.passengers[0].dob.value, '1985-06-14');
t('رقم الرحلة موحَّد', good.flights[0].flightNo.value, 'AH1010');
t('لا تحذيرات', good.warnings.length, 0);

const unknownType = A.sanitizeResponse({ documentType: 'Unknown', passengers: [{ name: { value: 'X', confidence: 0.5 } }] });
t('Unknown يُطلق تحذيراً', unknownType.warnings.indexOf('doc_type_unknown') >= 0, true);

const blurry = A.sanitizeResponse({ documentType: 'Passport', quality: { blurry: true }, passengers: [{ name: { value: 'X', confidence: 0.5 } }] });
t('جودة ضعيفة تُطلق تحذيراً', blurry.warnings.indexOf('low_quality') >= 0, true);

const dupPnr = A.sanitizeResponse({
    documentType: 'Booking Confirmation',
    booking: { bookingPnr: { value: 'ABC123', confidence: 0.9 }, ticketNumber: { value: 'ABC123', confidence: 0.9 } },
    passengers: [{ name: { value: 'X', confidence: 0.5 } }]
});
t('PNR مكرر مع التذكرة => تحذير', dupPnr.warnings.indexOf('ambiguous_pnr') >= 0, true);
const longPnr = A.sanitizeResponse({
    documentType: 'Booking Confirmation',
    booking: { bookingPnr: { value: '057-28392011-99', confidence: 0.9 } },
    passengers: [{ name: { value: 'X', confidence: 0.5 } }]
});
t('PNR طويل (رقم تذكرة بالخطأ) => تحذير', longPnr.warnings.indexOf('ambiguous_pnr') >= 0, true);
const cleanPnr = A.sanitizeResponse({
    documentType: 'Booking Confirmation',
    booking: { bookingPnr: { value: 'X7K2QM', confidence: 0.95 }, ticketNumber: { value: '05728392011', confidence: 0.9 } },
    passengers: [{ name: { value: 'X', confidence: 0.9 } }]
});
t('PNR سليم + تذكرة مختلفة => لا تحذير', cleanPnr.warnings.indexOf('ambiguous_pnr'), -1);

let emptyThrew = false;
try { A.sanitizeResponse({ documentType: 'Unknown', passengers: [], flights: [] }); } catch (e) { emptyThrew = e.code === A.AiError.EMPTY_RESULT; }
t('مستند فارغ => EMPTY_RESULT', emptyThrew, true);

let badThrew = false;
try { A.sanitizeResponse(null); } catch (e) { badThrew = e.code === A.AiError.INVALID_JSON; }
t('JSON غير صالح => INVALID_JSON', badThrew, true);

const nulls = A.sanitizeResponse({ documentType: 'Passport', passengers: [{ name: { value: 'JOHN', confidence: 0.9 }, passport: { value: null, confidence: 0 } }] });
tNull('حقل غير موجود يبقى null', nulls.passengers[0].passport.value);

console.log('\n=== 7) فحص نوع الملف ===');
const fakeFile = (name, type, size) => ({ name, type, size, arrayBuffer: async () => new ArrayBuffer(0) });
t('PDF', A.sniffType(fakeFile('a.pdf', 'application/pdf', 10)).kind, 'pdf');
t('JPG', A.sniffType(fakeFile('a.jpg', 'image/jpeg', 10)).kind, 'image');
t('PNG بدون نوع', A.sniffType(fakeFile('a.png', '', 10)).mime, 'image/png');
tNull('DOCX مرفوض', A.sniffType(fakeFile('a.docx', 'application/msword', 10)));
let tooLarge = false;
try { A.validateFile(fakeFile('big.pdf', 'application/pdf', 50 * 1024 * 1024)); } catch (e) { tooLarge = e.code === A.AiError.TOO_LARGE; }
t('ملف أكبر من الحد مرفوض', tooLarge, true);
let emptyFile = false;
try { A.validateFile(fakeFile('e.pdf', 'application/pdf', 0)); } catch (e) { emptyFile = true; }
t('ملف فارغ مرفوض', emptyFile, true);

console.log('\n=== 8) استخراج نص PDF المدمج ===');
const fakePdf = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Page/Count/3>>endobj\nBT (PNR) Tj (ABC123) Tj (ETicket) Tj (05728392011) Tj ET');
t('نص PDF يُستخرج', A.extractPdfTextLite(new Uint8Array(fakePdf)).indexOf('ABC123') >= 0, true);
t('ملف بلا نص => نص فارغ', A.extractPdfTextLite(new Uint8Array(Buffer.from('%PDF-1.4 scanned image only'))), '');
t('محتوى عشوائي لا يكسر الدالة', typeof A.extractPdfTextLite(new Uint8Array(Buffer.from([1, 2, 3, 4, 5]))), 'string');

console.log('\n=== 9) عقد المخطط: لا حقول مخترعة ===');
const keys = Object.keys(S.FIELDS).sort().join(',');
const expectedKeys = 'airline,arrAirport,arrCity,arrDate,arrTerminal,arrTime,bagCabin,bagChecked,bookingDate,bookingPnr,' +
    'bookingReference,bookingStatus,depAirport,depCity,depDate,depTerminal,depTime,dob,flightNo,flightType,gender,' +
    'mainTripType,name,passport,seat,ticketNumber,transitWaiting,travelClass,type';
t('قائمة الحقول مطابقة تماماً للنموذج', keys, expectedKeys);
t('عدد الحقول', Object.keys(S.FIELDS).length, 29);
t('حقول الحجز', S.GROUP_FIELDS.booking.length, 6);
t('حقول المسافر', S.GROUP_FIELDS.passenger.length, 5);
t('حقول الرحلة', S.GROUP_FIELDS.flight.length, 18);

console.log('\n=== 10) التحقق قبل الكتابة (fail-closed) ===');
t('حقل معروف', S.validateBeforeWrite('passport', 'A 123 4567').value, 'A1234567');
t('حقل غير معروف مرفوض', S.validateBeforeWrite('nationality', 'Algerian').ok, false);
tNull('قيمة فاسدة => null', S.validateBeforeWrite('dob', '31/02/1985').value);
tNull('قيمة فارغة => null', S.validateBeforeWrite('name', '').value);
t('تعديل يدوي للمستخدم يُقبل', S.validateBeforeWrite('bookingPnr', 'k7k2qm').value, 'K7K2QM');

console.log('\n=== 11) التعليمات تُمرّر أسماء الحقول الحقيقية ===');
const instr = A.buildInstructions('en');
t('الinstructions تذكر passport', instr.indexOf('"field":"passport"') >= 0, true);
t('الinstructions تذكر bookingPnr', instr.indexOf('"field":"bookingPnr"') >= 0, true);
t('الinstructions تطلب null عند الغموض', instr.indexOf('use null') >= 0, true);
t('الinstructions تمنع الاستنتاج', instr.indexOf('NEVER derive') >= 0, true);

console.log('\n=== 12) منع التكرار (المتطلّب #16) ===');
const dupIndex = (() => {
    /* نحاكي سجل الحجوزات الموجود شكلاً كما هو في script.js */
    const bookingsList = [
        { id: 'BK1', bookingPnr: 'AAA111', passengers: [{ name: 'JOHN DOE', passport: 'X1234567', dob: '1980-01-01', gender: 'Male', type: 'Adult' }] },
        { id: 'BK2', bookingPnr: 'BBB222', passengers: [{ name: 'JANE ROE', passport: 'Y7654321', dob: '1992-05-05', gender: 'Female', type: 'Adult' }] }
    ];
    const find = (p) => {
        const norm = v => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        const hits = [];
        bookingsList.forEach((b, bi) => b.passengers.forEach((pp, pi) => {
            if (p.passport && norm(pp.passport) && norm(pp.passport) === norm(p.passport)) hits.push({ b: bi, p: pi, by: 'passport' });
            else if (p.dob && pp.dob === p.dob && norm(pp.name) === norm(p.name)) hits.push({ b: bi, p: pi, by: 'name+dob' });
        }));
        return hits;
    };
    return {
        byPassport: find({ passport: 'x1234567', name: 'ZZZ', dob: null }).length,
        byNameDob: find({ passport: null, name: 'jane roe', dob: '1992-05-05' }).length,
        noMatch: find({ passport: 'NOPE999', name: 'ZZZ', dob: null }).length
    };
})();
t('تطابق برقم الجواز', dupIndex.byPassport, 1);
t('تطابق بالاسم+تاريخ الميلاد', dupIndex.byNameDob, 1);
t('لا تطابق => لا دمج تلقائي', dupIndex.noMatch, 0);

console.log('\n=== 13) لغات مدعومة ===');
const multi = A.sanitizeResponse({
    documentType: 'Itinerary',
    languages: ['ar', 'en', 'fr'],
    passengers: [{ name: { value: 'محمد أحمد', confidence: 0.9 } }]
});
t('3 لغات في نفس المستند', multi.languages.join('+'), 'ar+en+fr');

console.log('\n============================================');
console.log('  نجح: ' + pass + '   |   فشل: ' + fail);
console.log('============================================');
process.exit(fail === 0 ? 0 : 1);