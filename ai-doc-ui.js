/* ============================================================================
   ai-doc-ui.js — واجهة قسم "الذكاء الاصطناعي لتحليل مستندات المسافرين"
   ----------------------------------------------------------------------------
   ⚠️ هذا الملف لا يلمس أي قسم قائم في البرنامج. هو وحدة مستقلة (Module):
      - يقرأ من قسم الذكاء الاصطناعي فقط
      - عند الاعتماد يكتب في حقول النموذج الموجودة أصلاً عبر دوال script.js
      - لا يعيد بناء المسافرين أو الرحلات أو نظام PDF أو الطباعة

   التسلسل:  رفع مستند → تحليل → مراجعة → اعتماد وإضافة
   ========================================================================== */
(function (global) {
    'use strict';

    const S = global.AiDocSchema;
    const A = global.AiDocService;

    /* ------------------------------------------------------------------
       1) نصوص الوحدة (3 لغات) — مستقلة عن translations في script.js
       ------------------------------------------------------------------ */
    const T = {
        ar: {
            nav: 'الذكاء الاصطناعي',
            title: 'الذكاء الاصطناعي لتحليل مستندات المسافرين',
            subtitle: 'ارفق مستند المسافر ليتم تحليله واستخراج بياناته تلقائياً',
            pickFile: 'إرفاق PDF أو صورة',
            pickCamera: 'تصوير المستند',
            dropHint: 'اسحب الملف هنا أو اضغط للاختيار',
            formats: 'PDF · JPG · JPEG · PNG — حتى 20 ميغابايت',
            analyze: 'تحليل المستند',
            analyzing: 'جاري تحليل المستند بالذكاء الاصطناعي...',
            stage_preparing: 'تجهيز الملف...',
            stage_uploading: 'إرسال الملف للخدمة...',
            stage_analyzing: 'قراءة المستند وفهم محتواه...',
            stage_finalizing: 'تنظيم النتائج...',
            stage_retrying: 'إعادة المحاولة...',
            docType: 'نوع المستند',
            languages: 'لغات المستند',
            bookingInfo: 'معلومات الحجز',
            passengers: 'بيانات المسافر',
            flights: 'معلومات الرحلات',
            noValue: 'غير موجود في المستند',
            confidence: 'الثقة',
            high: 'ثقة عالية',
            medium: 'تحتاج مراجعة',
            low: 'غير مؤكدة',
            approve: 'اعتماد وإضافة',
            addAll: 'إضافة الجميع',
            restart: 'تحليل مستند آخر',
            back: 'رجوع',
            tabDoc: 'المستند',
            tabData: 'البيانات',
            duplicateTitle: 'يبدو أن هذا المسافر موجود مسبقاً',
            duplicateUpdate: 'تحديث المسافر الحالي',
            duplicateNew: 'إنشاء مسافر جديد',
            duplicateText: 'وجدنا مسافراً بنفس ',
            matchedBy: 'مطابقة بواسطة',
            warnUnknownType: 'لم يتم التعرف على نوع المستند — راجع النتائج قبل الاعتماد.',
            warnLowQuality: 'جودة المستند منخفضة — تحقّق من القيم المعلّمة.',
            warnAmbigPnr: 'تعارض في رمز الحجز — تأكد من الفرق بين PNR ورقم التذكرة.',
            logTitle: 'سجل التحليل',
            logEmpty: 'لا توجد عمليات تحليل بعد.',
            settings: 'إعدادات الخدمة',
            endpoint: 'عنوان خدمة الذكاء الاصطناعي',
            saveSettings: 'حفظ',
            statusOk: 'متصلة بـ Gemini',
            noKey: 'لم يُدخل مفتاح Gemini',
            statusDown: 'الخدمة غير متاحة',
            noFile: 'اختر ملفاً أولاً',
            done: 'تمت الإضافة بنجاح'
        },
        en: {
            nav: 'AI',
            title: 'AI Traveller Document Analysis',
            subtitle: 'Attach a traveller document to extract data automatically',
            pickFile: 'Attach PDF or image',
            pickCamera: 'Take a photo',
            dropHint: 'Drop the file here or tap to choose',
            formats: 'PDF · JPG · JPEG · PNG — up to 20 MB',
            analyze: 'Analyse document',
            analyzing: 'Analysing document with AI...',
            stage_preparing: 'Preparing file...',
            stage_uploading: 'Uploading to service...',
            stage_analyzing: 'Reading and understanding the document...',
            stage_finalizing: 'Structuring results...',
            stage_retrying: 'Retrying...',
            docType: 'Document type',
            languages: 'Document languages',
            bookingInfo: 'Booking information',
            passengers: 'Passenger data',
            flights: 'Flight information',
            noValue: 'Not found in document',
            confidence: 'Confidence',
            high: 'High confidence',
            medium: 'Needs review',
            low: 'Uncertain',
            approve: 'Approve and add',
            addAll: 'Add all',
            restart: 'Analyse another document',
            back: 'Back',
            tabDoc: 'Document',
            tabData: 'Data',
            duplicateTitle: 'This passenger seems to already exist',
            duplicateUpdate: 'Update current passenger',
            duplicateNew: 'Create new passenger',
            duplicateText: 'Found a passenger with the same ',
            matchedBy: 'matched by',
            warnUnknownType: 'Document type not recognised — review results before approving.',
            warnLowQuality: 'Low document quality — check the highlighted fields.',
            warnAmbigPnr: 'Booking reference conflict — verify PNR vs ticket number.',
            logTitle: 'Analysis log',
            logEmpty: 'No analysis operations yet.',
            settings: 'Service settings',
            endpoint: 'AI service endpoint',
            saveSettings: 'Save',
            statusOk: 'Connected to Gemini',
            noKey: 'No Gemini key set',
            statusDown: 'Service unavailable',
            noFile: 'Choose a file first',
            done: 'Added successfully'
        },
        fr: {
            nav: 'IA',
            title: 'IA — Analyse des documents voyageurs',
            subtitle: 'Joignez un document pour extraire les données automatiquement',
            pickFile: 'Joindre PDF ou image',
            pickCamera: 'Prendre une photo',
            dropHint: 'Déposez le fichier ici ou appuyez pour choisir',
            formats: 'PDF · JPG · JPEG · PNG — jusqu\'à 20 Mo',
            analyze: 'Analyser le document',
            analyzing: 'Analyse du document par IA...',
            stage_preparing: 'Préparation du fichier...',
            stage_uploading: 'Envoi du fichier au service...',
            stage_analyzing: 'Lecture et compréhension du document...',
            stage_finalizing: 'Structuration des résultats...',
            stage_retrying: 'Nouvelle tentative...',
            docType: 'Type de document',
            languages: 'Langues du document',
            bookingInfo: 'Informations de réservation',
            passengers: 'Données passager',
            flights: 'Informations de vol',
            noValue: 'Absent du document',
            confidence: 'Confiance',
            high: 'Confiance élevée',
            medium: 'À vérifier',
            low: 'Incertain',
            approve: 'Valider et ajouter',
            addAll: 'Tout ajouter',
            restart: 'Analyser un autre document',
            back: 'Retour',
            tabDoc: 'Document',
            tabData: 'Données',
            duplicateTitle: 'Ce passager semble déjà exister',
            duplicateUpdate: 'Mettre à jour le passager actuel',
            duplicateNew: 'Créer un nouveau passager',
            duplicateText: 'Passager trouvé avec le même ',
            matchedBy: 'correspondance par',
            warnUnknownType: 'Type de document non reconnu — vérifiez avant de valider.',
            warnLowQuality: 'Qualité faible du document — contrôlez les champs signalés.',
            warnAmbigPnr: 'Conflit de référence — vérifiez PNR vs numéro de billet.',
            logTitle: 'Journal d\'analyse',
            logEmpty: 'Aucune analyse effectuée.',
            settings: 'Paramètres du service',
            endpoint: 'Point d\'accès du service IA',
            saveSettings: 'Enregistrer',
            statusOk: 'Connecté à Gemini',
            noKey: 'Aucune clé Gemini',
            statusDown: 'Service indisponible',
            noFile: 'Choisissez d\'abord un fichier',
            done: 'Ajouté avec succès'
        }
    };

    function t(key) {
        const lang = (typeof currentLang !== 'undefined' && T[currentLang]) ? currentLang : 'ar';
        return T[lang][key] || T.en[key] || key;
    }

    /* رؤوس الأعمدة الثابتة للجداول */
    const COL = { ar: { field: 'الحقل', value: 'القيمة', conf: 'الحالة' }, en: { field: 'Field', value: 'Value', conf: 'Status' }, fr: { field: 'Champ', value: 'Valeur', conf: 'Statut' } };
    function col(key) {
        const lang = (typeof currentLang !== 'undefined' && COL[currentLang]) ? currentLang : 'ar';
        return COL[lang][key];
    }

    /* ------------------------------------------------------------------
       2) جسر آمن مع برنامج الحجز (script.js)
       ------------------------------------------------------------------
       نصل إلى workingPassengers / workingFlights عبر نطاقاتcriptorsAvaliable
       لأنهما مُعرَّفان بـ let على المستوى العام (script كلاسيكي).
       لا نُنشئ أي حقل جديد ولا نغيّر شكل الكائنات.
       ------------------------------------------------------------------ */
    const app = {
        get passengers() { return (typeof workingPassengers !== 'undefined') ? workingPassengers : []; },
        set passengers(v) { if (typeof workingPassengers !== 'undefined') workingPassengers = v; },
        get flights() { return (typeof workingFlights !== 'undefined') ? workingFlights : []; },
        set flights(v) { if (typeof workingFlights !== 'undefined') workingFlights = v; },
        bookings() { return (typeof bookingsList !== 'undefined') ? bookingsList : []; },
        renderPassengers() { if (typeof renderPassengersForm === 'function') renderPassengersForm(); },
        renderFlights() { if (typeof renderFlightsForm === 'function') renderFlightsForm(); },
        refresh() { if (typeof updateLivePreview === 'function') updateLivePreview(); },
        saveDraft() { if (typeof saveDraftBooking === 'function') { try { saveDraftBooking(); } catch (e) { } } },
        gotoBooking() { if (typeof switchSection === 'function') switchSection('section-new-booking'); },
        setField: function (id, value) {
            const el = document.getElementById(id);
            if (el && value !== null && value !== undefined) el.value = value;
        }
    };

    /* ------------------------------------------------------------------
       3) حالة الوحدة (لا تُخزَّن أي بيانات حساسة)
       ------------------------------------------------------------------ */
    const state = {
        file: null,          /* مرجع الملف — للعرض فقط، لا يُحفظ */
        fileUrl: null,       /* objectURL للمعاينة — يُحرَّر فوراً */
        result: null,        /* نتيجة نظيفة */
        step: 'upload',
        dupMode: 'create',   /* create | update */
        dupTargets: []       /* {bookingIndex, passengerIndex, by} */
    };

    function releaseFileUrl() {
        if (state.fileUrl) {
            try { URL.revokeObjectURL(state.fileUrl); } catch (e) { }
            state.fileUrl = null;
        }
    }

    /* ------------------------------------------------------------------
       4) منع التكرار (المتطلّب #16)
       الأولوية: 1) رقم الجواز  2) الاسم + تاريخ الميلاد
       لا ندمج تلقائياً أبداً — نعرض للمستخدم ويقرّر.
       ------------------------------------------------------------------ */
    function normKey(v) {
        return String(v || '').toUpperCase().replace(/[^A-Z0-9\u0600-\u06FF]/g, '');
    }

    function findDuplicates(passenger) {
        const name = passenger.name && passenger.name.value;
        const passport = passenger.passport && passenger.passport.value;
        const dob = passenger.dob && passenger.dob.value;
        const hits = [];
        const seen = {};
        app.bookings().forEach((b, bi) => {
            (b.passengers || []).forEach((p, pi) => {
                let by = null;
                if (passport && normKey(p.passport) && normKey(p.passport) === normKey(passport)) by = 'passport';
                else if (dob && p.dob && name && p.dob === dob && normKey(p.name) === normKey(name)) by = 'name_dob';
                if (by) {
                    const key = bi + ':' + pi;
                    if (!seen[key]) { seen[key] = true; hits.push({ bookingIndex: bi, passengerIndex: pi, by: by, booking: b }); }
                }
            });
        });
        return hits;
    }

    function findDuplicatesInWorking() {
        const hits = [];
        app.passengers.forEach((p, i) => {
            if (p.passport || p.dob) {
                const f = findDuplicates({ name: { value: p.name }, passport: { value: p.passport }, dob: { value: p.dob } });
                f.forEach(h => hits.push(h));
            }
        });
        return hits;
    }

    /* ------------------------------------------------------------------
       5) العرض: مستوى الثقة كأيقونة فقط (بلا أرقام تقنية)
       ------------------------------------------------------------------ */
    function confLevel(f) {
        if (!f || f.value === null || f.value === undefined || f.value === '') return 'empty';
        if (f.needsReview) return f.confidence >= A.CONFIDENCE.medium ? 'medium' : 'low';
        return 'high';
    }
    const CONF_ICON = { high: '🟢', medium: '🟡', low: '🔴', empty: '⚪' };
    function confText(f) {
        const l = confLevel(f);
        return l === 'high' ? t('high') : l === 'medium' ? t('medium') : l === 'low' ? t('low') : t('noValue');
    }

    function esc(s) {
        return String(s === null || s === undefined ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    /* يبني صفاً قابلاً للتحرير داخل جدول المراجعة */
    function renderRow(group, key, rowId) {
        const f = group[key];
        const lvl = confLevel(f);
        const val = f && f.value !== null && f.value !== undefined ? String(f.value) : '';
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        const isEnum = S.FIELDS[key] && S.FIELDS[key].enum;
        const isDate = S.FIELDS[key] && S.FIELDS[key].format === 'date';
        const isTime = S.FIELDS[key] && S.FIELDS[key].format === 'time';

        let control;
        if (isEnum) {
            control = '<select class="ai-edit" data-row="' + rowId + '" data-key="' + key + '">' +
                '<option value="">—</option>' +
                S.FIELDS[key].enum.map(o => '<option value="' + esc(o) + '"' + (o === val ? ' selected' : '') + '>' + esc(o) + '</option>').join('') +
                '</select>';
        } else if (isDate) {
            control = '<input type="date" class="ai-edit" data-row="' + rowId + '" data-key="' + key + '" value="' + esc(val) + '">';
        } else if (isTime) {
            control = '<input type="time" class="ai-edit" data-row="' + rowId + '" data-key="' + key + '" value="' + esc(val) + '">';
        } else {
            control = '<input type="text" class="ai-edit" data-row="' + rowId + '" data-key="' + key + '" value="' + esc(val) + '" placeholder="' + esc(t('noValue')) + '">';
        }

        return '<tr class="ai-row ai-lvl-' + lvl + '">' +
            '<td class="ai-row-label">' + esc(S.labelOf(key, lang)) + '</td>' +
            '<td class="ai-row-value">' + control + '</td>' +
            '<td class="ai-row-conf"><span title="' + esc(confText(f)) + '">' + CONF_ICON[lvl] + '</span>' +
            '<small class="ai-row-src">' + (f && f.source ? esc(String(f.source).slice(0, 60)) : '') + '</small></td>' +
            '</tr>';
    }

    function renderGroupTable(group, keys, rowId) {
        const rows = keys.map(k => renderRow(group, k, rowId)).join('');
        return '<table class="ai-table"><thead><tr>' +
            '<th>' + esc(col('field')) + '</th>' +
            '<th>' + esc(col('value')) + '</th>' +
            '<th>' + esc(col('conf')) + '</th>' +
            '</tr></thead><tbody>' + rows + '</tbody></table>';
    }

    /* ------------------------------------------------------------------
       6) بناء شاشة المراجعة
       ------------------------------------------------------------------ */
    function docTypeBadge(r) {
        const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
        const map = {
            'Passport': { ar: 'جواز سفر', en: 'Passport', fr: 'Passeport' },
            'National ID': { ar: 'بطاقة هوية', en: 'National ID', fr: 'Carte d\'identité' },
            'Flight Ticket': { ar: 'تذكرة طيران', en: 'Flight Ticket', fr: 'Billet d\'avion' },
            'Boarding Pass': { ar: 'بطاقة صعود', en: 'Boarding Pass', fr: 'Carte d\'embarquement' },
            'Booking Confirmation': { ar: 'تأكيد حجز', en: 'Booking Confirmation', fr: 'Confirmation de réservation' },
            'Itinerary': { ar: 'برنامج سفر', en: 'Itinerary', fr: 'Itinéraire' },
            'Visa': { ar: 'تأشيرة', en: 'Visa', fr: 'Visa' },
            'Invoice': { ar: 'فاتورة', en: 'Invoice', fr: 'Facture' },
            'Unknown': { ar: 'غير معروف', en: 'Unknown', fr: 'Inconnu' }
        };
        const e = map[r.documentType] || map.Unknown;
        return e[lang] || e.en;
    }

    const LANG_FLAG = { ar: 'العربية', en: 'English', fr: 'Français' };

    function buildReviewHtml(r) {
        let html = '';

        /* ترويسة: نوع المستند + اللغات + التحذيرات */
        html += '<div class="ai-review-head">';
        html += '<span class="ai-badge"><i class="fa-solid fa-file-lines"></i> ' + esc(docTypeBadge(r)) + '</span>';
        if (r.languages && r.languages.length) {
            html += '<span class="ai-badge ai-badge-lang"><i class="fa-solid fa-language"></i> ' +
                r.languages.map(l => esc(LANG_FLAG[l] || l)).join(' · ') + '</span>';
        }
        if (r.quality && (r.quality.blurry || r.quality.rotated || !r.quality.legible)) {
            html += '<span class="ai-badge ai-badge-warn"><i class="fa-solid fa-triangle-exclamation"></i></span>';
        }
        html += '</div>';

        if (r.warnings && r.warnings.length) {
            html += '<div class="ai-alerts">';
            if (r.warnings.indexOf('doc_type_unknown') >= 0) html += '<div class="ai-alert">' + esc(t('warnUnknownType')) + '</div>';
            if (r.warnings.indexOf('low_quality') >= 0) html += '<div class="ai-alert">' + esc(t('warnLowQuality')) + '</div>';
            if (r.warnings.indexOf('ambiguous_pnr') >= 0) html += '<div class="ai-alert">' + esc(t('warnAmbigPnr')) + '</div>';
            html += '</div>';
        }

        /* بيانات الحجز */
        if (S.GROUP_FIELDS.booking.some(k => r.booking[k] && r.booking[k].value)) {
            html += '<h4 class="ai-sub-title">' + esc(t('bookingInfo')) + '</h4>';
            html += renderGroupTable(r.booking, S.GROUP_FIELDS.booking, 'booking');
        }

        /* المسافرون */
        html += '<h4 class="ai-sub-title">' + esc(t('passengers')) + '</h4>';
        if (!r.passengers.length) {
            html += '<p class="ai-empty">' + esc(t('noValue')) + '</p>';
        } else {
            r.passengers.forEach((p, i) => {
                const dup = findDuplicates(p);
                html += '<div class="ai-card" data-passenger="' + i + '">';
                html += '<div class="ai-card-head"><span>' + esc(t('passengers')) + ' #' + (i + 1) + '</span>';
                if (dup.length) {
                    html += '<span class="ai-badge ai-badge-warn"><i class="fa-solid fa-user-check"></i> ' + esc(t('duplicateTitle')) + '</span>';
                }
                html += '<label class="ai-pick"><input type="checkbox" class="ai-pick-pax" data-i="' + i + '" checked> ' +
                    '<span>' + esc(t('approve')) + '</span></label></div>';
                if (dup.length) {
                    const byLabel = dup[0].by === 'passport'
                        ? S.labelOf('passport', (typeof currentLang !== 'undefined') ? currentLang : 'ar')
                        : S.labelOf('name', (typeof currentLang !== 'undefined') ? currentLang : 'ar');
                    html += '<div class="ai-dup-box"><i class="fa-solid fa-circle-info"></i> ' +
                        esc(t('duplicateText')) + esc(byLabel) + ' — ' + esc(t('matchedBy')) + ' ' + esc(dup[0].by) +
                        '<div class="ai-dup-actions">' +
                        '<button type="button" class="btn btn-sm ai-dup-btn" data-dup="update" data-i="' + i + '">' + esc(t('duplicateUpdate')) + '</button>' +
                        '<button type="button" class="btn btn-sm btn-outline ai-dup-btn" data-dup="create" data-i="' + i + '">' + esc(t('duplicateNew')) + '</button>' +
                        '</div></div>';
                }
                html += renderGroupTable(p, S.GROUP_FIELDS.passenger, 'p' + i);
                html += '</div>';
            });
            html += '<div class="ai-bulk"><button type="button" class="btn btn-sm btn-outline" id="aiAddAllPax">' +
                '<i class="fa-solid fa-users"></i> ' + esc(t('addAll')) + '</button></div>';
        }

        /* الرحلات */
        html += '<h4 class="ai-sub-title">' + esc(t('flights')) + '</h4>';
        if (!r.flights.length) {
            html += '<p class="ai-empty">' + esc(t('noValue')) + '</p>';
        } else {
            r.flights.forEach((f, i) => {
                html += '<div class="ai-card"><div class="ai-card-head"><span>' + esc(t('flights')) + ' #' + (i + 1) + '</span>' +
                    '<label class="ai-pick"><input type="checkbox" class="ai-pick-flt" data-i="' + i + '" checked><span>' + esc(t('approve')) + '</span></label></div>' +
                    renderGroupTable(f, S.GROUP_FIELDS.flight, 'f' + i) + '</div>';
            });
        }
        return html;
    }

    /* ------------------------------------------------------------------
       7) الاعتماد: كتابة البيانات في الحقول الموجودة فعلاً
       ------------------------------------------------------------------
       نستخدم البنية نفسها التي يستخدمها script.js تماماً:
         passenger = { name, type, gender, passport, dob }
         flight    = { type, airline, flightNo, dep*, arr*, bag*, travelClass, seat, ... }
       لا حقل جديد، لا تخمين، وتحقق نهائي قبل كل كتابة.
       ------------------------------------------------------------------ */
    function readEdited(rowId) {
        const root = document.getElementById('aiDataPane');
        if (!root) return {};
        const out = {};
        root.querySelectorAll('.ai-edit[data-row="' + rowId + '"]').forEach(inp => {
            out[inp.getAttribute('data-key')] = inp.value;
        });
        return out;
    }

    function buildPassengerFrom(edits) {
        const p = { name: '', type: 'Adult', gender: 'Male', passport: '', dob: '' };
        S.GROUP_FIELDS.passenger.forEach(k => {
            const raw = edits[k];
            if (raw === undefined || raw === null || raw === '') return;
            const v = S.validateBeforeWrite(k, raw);
            if (v.ok && v.value !== null && v.value !== '') p[k] = v.value;
        });
        /* قيم افتراضية لل absence فقط — ليست تخميناً لبيانات مستخرجة */
        return p;
    }

    function getSelectedPax() {
        const out = [];
        document.querySelectorAll('#aiDataPane .ai-pick-pax').forEach(cb => {
            if (cb.checked) out.push(parseInt(cb.getAttribute('data-i'), 10));
        });
        return out;
    }
    function getSelectedFlights() {
        const out = [];
        document.querySelectorAll('#aiDataPane .ai-pick-flt').forEach(cb => {
            if (cb.checked) out.push(parseInt(cb.getAttribute('data-i'), 10));
        });
        return out;
    }

    function buildFlightFrom(edits, index, selectedCount) {
        const f = {
            type: 'Outbound', airline: '', flightNo: '', depCity: '', depAirport: '',
            depDate: '', depTime: '', depTerminal: '', arrCity: '', arrAirport: '',
            arrDate: '', arrTime: '', arrTerminal: '', bagChecked: '', bagCabin: '',
            travelClass: 'Economy', seat: '', transitWaiting: ''
        };
        S.GROUP_FIELDS.flight.forEach(k => {
            const raw = edits[k];
            if (raw === undefined || raw === null || raw === '') return;
            const v = S.validateBeforeWrite(k, raw);
            if (v.ok && v.value !== null && v.value !== '') f[k] = v.value;
        });
        /* قاعدة بنيوية فقط: عند اختيار رحلتين، الأخيرة عودة إن لم يحدد الذكاء ذلك.
           هذه ليست بيانات مخترجة بل اشتقاق من البنية فقط. */
        if (selectedCount >= 2 && index === selectedCount - 1 && f.type === 'Outbound') f.type = 'Return';
        return f;
    }

    function findWorkingIndexByDup(dup) {
        const list = app.passengers;
        if (dup.passengerIndex >= 0 && list[dup.passengerIndex]) return dup.passengerIndex;
        const ref = dup.booking && dup.booking.passengers ? dup.booking.passengers[dup.passengerIndex] : null;
        if (!ref) return -1;
        for (let i = 0; i < list.length; i++) {
            if (dup.by === 'passport' && normKey(list[i].passport) === normKey(ref.passport)) return i;
            if (dup.by === 'name_dob' && normKey(list[i].name) === normKey(ref.name) && list[i].dob === ref.dob) return i;
        }
        return -1;
    }

    function approve() {
        const r = state.result;
        if (!r) return;

        /* 1) حقول الحجز — نملأ الفراغ فقط، لا نطمس بيانات موجودة */
        let filled = 0;
        S.GROUP_FIELDS.booking.forEach(k => {
            const el = document.getElementById(k);
            if (!el) return;
            if (String(el.value || '').trim()) return;          /* لا نطمس بيانات موجودة */
            const raw = r.booking[k] && r.booking[k].value;
            if (raw === null || raw === undefined || raw === '') return;
            const v = S.validateBeforeWrite(k, raw);
            if (v.ok && v.value !== null && v.value !== '') { el.value = v.value; filled++; }
        });

        /* 2) المسافرون */
        const paxIdx = getSelectedPax();
        const newPax = paxIdx.map(i => buildPassengerFrom(readEdited('p' + i)))
            .filter(p => p.name || p.passport);

        if (state.dupMode === 'update' && newPax.length) {
            const workingDup = findDuplicatesInWorking();
            if (workingDup.length) {
                const idx = findWorkingIndexByDup(workingDup[0]);
                if (idx >= 0) {
                    const list = app.passengers.slice();
                    list[idx] = Object.assign({}, list[idx], newPax[0]);   /* تحديث السجل الحالي */
                    app.passengers = list;
                    newPax.splice(0, 1);
                }
            }
        }
        if (newPax.length) app.passengers = app.passengers.concat(newPax);

        /* 3) الرحلات */
        const fltIdx = getSelectedFlights();
        const newFlt = fltIdx.map((i, k) => buildFlightFrom(readEdited('f' + i), k, fltIdx.length))
            .filter(f => f.flightNo || f.airline || f.depAirport || f.arrAirport);
        if (newFlt.length) app.flights = app.flights.concat(newFlt);

        /* 4) تحديث الواجهة + حفظ المسودة */
        app.renderPassengers();
        app.renderFlights();
        app.refresh();
        app.saveDraft();

        /* 5) سجل التحليل — بدون أي بيانات حساسة */
        logAnalysis({ ok: true, docType: r.documentType, passengers: newPax.length, flights: newFlt.length, filled: filled });

        /* 6) تنظيف الملف من الذاكرة (خصوصية) */
        releaseFileUrl();
        state.file = null;
        state.result = null;

        app.gotoBooking();
        try { alert(t('done')); } catch (e) { }
    }

    /* ------------------------------------------------------------------
       8) سجل التحليل (المتطلّب #28)
       ⚠️ لا نخزّن صورة الجواز ولا الـ PDF ولا أي قيمة مستخرجة.
          فقط: التاريخ + نوع المستند + الأعداد + الحالة.
       ------------------------------------------------------------------ */
    const LOG_KEY = 'aiAnalysisLog';
    const LOG_MAX = 25;

    function readLog() {
        try { const v = JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); return Array.isArray(v) ? v : []; }
        catch (e) { return []; }
    }
    function writeLog(list) {
        try { localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, LOG_MAX))); } catch (e) { }
    }
    function logAnalysis(entry) {
        const list = readLog();
        list.unshift({
            ts: new Date().toISOString(),
            ok: !!entry.ok,
            docType: entry.docType || 'Unknown',
            pax: entry.passengers || 0,
            flt: entry.flights || 0,
            err: entry.err || null
        });
        writeLog(list);
        renderLog();
    }
    function renderLog() {
        const box = document.getElementById('aiLogList');
        if (!box) return;
        const list = readLog();
        if (!list.length) { box.innerHTML = '<li class="ai-log-empty">' + esc(t('logEmpty')) + '</li>'; return; }
        box.innerHTML = list.map(e => {
            const d = new Date(e.ts);
            const when = isNaN(d.getTime()) ? e.ts : d.toLocaleString();
            return '<li class="ai-log-item ' + (e.ok ? 'ok' : 'bad') + '">' +
                '<span class="ai-log-dot"></span>' +
                '<span class="ai-log-when">' + esc(when) + '</span>' +
                '<span class="ai-log-type">' + esc(docTypeBadge({ documentType: e.docType })) + '</span>' +
                '<span class="ai-log-count">' + e.pax + ' / ' + e.flt + '</span>' +
                (e.err ? '<span class="ai-log-err">' + esc(e.err) + '</span>' : '') +
                '</li>';
        }).join('');
    }

    /* سبب محدد لكل رمز فشل — بدل رسالة عامة تُربك المستخدم */
    const CONNECT_FAIL = {
        invalid_api_key: {
            ar: 'المفتاح غير صالح أو منتهي — Google رفضه. أنشئ مفتاحاً جديداً من aistudio.google.com/apikey',
            en: 'Key invalid or expired — Google rejected it. Create a new one at aistudio.google.com/apikey',
            fr: 'Clé invalide ou expirée — Google l\'a refusée. Créez-en une nouvelle sur aistudio.google.com/apikey'
        },
        access_denied: {
            ar: 'المفتاح صحيح لكن الصلاحية غير مفعّلة. فعّل «Generative Language API» في مشروع Google Cloud.',
            en: 'Key is valid but access is not enabled. Turn on the "Generative Language API" in your Google Cloud project.',
            fr: 'Clé valide mais accès non activé. Activez l\'API « Generative Language » dans votre projet Google Cloud.'
        },
        rate_limited: {
            ar: 'تجاوزت حصة Gemini المجانية. انتظر قليلاً أو فعّل الفوترة في مشروعك.',
            en: 'Gemini free-tier quota exceeded. Wait a little, or enable billing on your project.',
            fr: 'Quota Gemini gratuit dépassé. Patientez ou activez la facturation.'
        },
        model_not_found: {
            ar: 'النموذج غير متاح. حدّث البرنامج ليجرّب نموذجاً أحدث، أو فعّل «Generative Language API» في مشروعك.',
            en: 'Model unavailable. Update the app to try a newer model, or enable the "Generative Language API" in your project.',
            fr: 'Modèle indisponible. Mettez l\'application à jour ou activez l\'API « Generative Language ».'
        },
        invalid_request: {
            ar: 'رفض Google الطلب نفسه (لا علاقة له بالإنترنت).',
            en: 'Google rejected the request itself (not an internet problem).',
            fr: 'Google a rejeté la requête (ce n\'est pas un problème Internet).'
        },
        unreachable: {
            ar: 'تعذّر الوصول إلى generativelanguage.googleapis.com — قد يمنع الشبكة ذلك.',
            en: 'Could not reach generativelanguage.googleapis.com — your network may block it.',
            fr: 'Impossible de joindre generativelanguage.googleapis.com — le réseau le bloque peut-être.'
        },
        offline: {
            ar: 'لا يوجد اتصال بالإنترنت.',
            en: 'No internet connection.',
            fr: 'Pas de connexion Internet.'
        }
    };

    function connectFailText(code) {
        const lang = (typeof currentLang !== 'undefined' && currentLang) ? currentLang : 'ar';
        const e = CONNECT_FAIL[code];
        if (!e) {
            return (code ? (lang === 'en' ? 'Error: ' + code : lang === 'fr' ? 'Erreur : ' + code : 'خطأ: ' + code) : '');
        }
        return e[lang] || e.en || e.ar;
    }

    /* ------------------------------------------------------------------
       9) رسائل الأخطاء (المتطلّب #26 — لا Crash أبداً)
       ------------------------------------------------------------------ */
    const ERR_TEXT = {
        offline: { ar: 'لا يوجد اتصال بالإنترنت، لا يمكن تحليل المستند حالياً.', en: 'No internet connection, the document cannot be analysed right now.', fr: 'Pas de connexion Internet, le document ne peut pas être analysé.' },
        timeout: { ar: 'انتهت مهلة التحليل. حاول مرة أخرى.', en: 'Analysis timed out. Please try again.', fr: 'Délai d\'analyse dépassé. Réessayez.' },
        unauthorized: { ar: 'مفتاح Gemini غير صالح. افتح «إعدادات الخدمة» وأدخل مفتاحاً صحيحاً.', en: 'Invalid Gemini key. Open "Service settings" and enter a valid key.', fr: 'Clé Gemini invalide. Vérifiez les paramètres du service.' },
        invalid_api_key: { ar: 'مفتاح Gemini غير صالح أو منتهي. افتح «إعدادات الخدمة» وأدخل مفتاحاً صحيحاً.', en: 'Invalid or expired Gemini key. Open "Service settings" and enter a valid key.', fr: 'Clé Gemini invalide ou expirée. Vérifiez les paramètres.' },
        invalid_request: { ar: 'رفض Google الطلب. تأكد من صحة المفتاح ثم أعد المحاولة.', en: 'Google rejected the request. Check your key and try again.', fr: 'Google a rejeté la requête. Vérifiez la clé.' },
        invalid_document: { ar: 'Google لم يستطع قراءة هذا الملف. جرّب صورة أوضح أو PDF نصياً (غير ممسوح ضوئياً).', en: 'Google could not read this file. Try a clearer image or a text-based (not scanned) PDF.', fr: 'Google n\'a pas pu lire ce fichier. Essayez une image plus nette ou un PDF texte.' },
        access_denied: { ar: 'المفتاح صحيح لكن الصلاحية غير مفعّلة. فعّل «Generative Language API» في مشروع Google Cloud.', en: 'Key is valid but access is not enabled. Turn on the "Generative Language API" in your Google Cloud project.', fr: 'Clé valide mais accès non activé. Activez l\'API Generative Language.' },
        unreachable: { ar: 'تعذّر الوصول إلى Google Gemini. قد تمنع الشبكة ذلك.', en: 'Could not reach Google Gemini. Your network may block it.', fr: 'Impossible de joindre Google Gemini. Le réseau le bloque peut-être.' },
        model_not_found: { ar: 'اسم النموذج غير متاح. غيّر النموذج في الإعدادات.', en: 'Model not available. Change the model in settings.', fr: 'Modèle indisponible. Changez le modèle dans les paramètres.' },
        no_api_key: { ar: 'لم يُدخل مفتاح Gemini. افتح «إعدادات الخدمة» والصقه، أو ضعه في ai-doc-service.js.', en: 'No Gemini key. Open "Service settings" and paste it, or put it in ai-doc-service.js.', fr: 'Aucune clé Gemini. Ouvrez « Paramètres du service ».' },
        rate_limited: { ar: 'تم تجاوز حد الاستخدام المجاني لـ Gemini. حاول بعد قليل.', en: 'Gemini free-tier limit reached. Try again shortly.', fr: 'Limite du forfait gratuit Gemini atteinte. Réessayez bientôt.' },
        bad_request: { ar: 'الملف غير صالح أو فارغ.', en: 'Invalid or empty file.', fr: 'Fichier invalide ou vide.' },
        too_large: { ar: 'حجم الملف أكبر من الحد المسموح (20 ميغابايت).', en: 'File is larger than the allowed limit (20 MB).', fr: 'Fichier trop volumineux (limite 20 Mo).' },
        unsupported_type: { ar: 'صيغة الملف غير مدعومة. المسموح: PDF أو JPG أو PNG.', en: 'Unsupported file type. Allowed: PDF, JPG, PNG.', fr: 'Type de fichier non pris en charge. Autorisés : PDF, JPG, PNG.' },
        provider_error: {
            ar: 'Gemini واجه خطأ مؤقت أثناء قراءة المستند. أعد المحاولة؛ إن تكرر، جرّب ملفاً أصغر أو فعّل الفوترة في مشروع Google Cloud.',
            en: 'Gemini hit a temporary error reading the document. Try again; if it persists, use a smaller file or enable billing on your Google Cloud project.',
            fr: 'Gemini a rencontré une erreur temporaire. Réessayez ; sinon, utilisez un fichier plus petit ou activez la facturation.'
        },
        invalid_json: { ar: 'رد غير صالح من Gemini. لم يتم حفظ أي بيانات.', en: 'Invalid response from Gemini. Nothing was saved.', fr: 'Réponse invalide de Gemini. Rien n\'a été enregistré.' },
        empty_result: { ar: 'لم يتم العثور على بيانات قابلة للاستخدام في هذا المستند.', en: 'No usable data found in this document.', fr: 'Aucune donnée exploitable trouvée dans ce document.' },
        read_failed: { ar: 'تعذّر قراءة الملف.', en: 'Could not read the file.', fr: 'Impossible de lire le fichier.' },
        unknown: { ar: 'حدث خطأ غير متوقع. لم يتم فقدان أي بيانات.', en: 'Unexpected error. No data was lost.', fr: 'Erreur inattendue. Aucune donnée perdue.' }
    };

    /* رسائل توضيحية — المفتاح غير موجود غالباً */
    const HINT = {
        network_hint: {
            ar: 'تعذّر الاتصال بـ Google Gemini. تأكد من وجود الإنترنت ومن صحة المفتاح.',
            en: 'Could not reach Google Gemini. Check your internet and the API key.',
            fr: 'Impossible de joindre Google Gemini. Vérifiez Internet et la clé.'
        }
    };

    function hintText(key) {
        const lang = (typeof currentLang !== 'undefined' && HINT[key] && HINT[key][currentLang]) ? currentLang : 'ar';
        const e = HINT[key] || HINT.network_hint;
        return e[lang] || e.en || e.ar;
    }
    function errText(code) {
        const lang = (typeof currentLang !== 'undefined' && ERR_TEXT[code] && ERR_TEXT[code][currentLang]) ? currentLang : 'ar';
        const e = ERR_TEXT[code] || ERR_TEXT.unknown;
        return e[lang] || e.en || e.ar;
    }

    function showError(code) {
        const box = document.getElementById('aiErrorBox');
        if (!box) return;
        box.innerHTML = '<div class="ai-error"><i class="fa-solid fa-circle-exclamation"></i> <span>' + esc(errText(code)) + '</span></div>';
        box.hidden = false;
        /* الملف محفوظ في الحالة — لا نفقده (المتطلّب #23) */
    }
    function clearError() {
        const box = document.getElementById('aiErrorBox');
        if (box) { box.hidden = true; box.innerHTML = ''; }
    }

    /* ------------------------------------------------------------------
       10) التنقّل بين الخطوات + عرض المستند
       ------------------------------------------------------------------ */
    function showStep(step) {
        state.step = step;
        ['aiStepUpload', 'aiStepProgress', 'aiStepReview'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.hidden = (id !== 'aiStep' + step.charAt(0).toUpperCase() + step.slice(1));
        });
    }

    function updateProgress(p) {
        const bar = document.getElementById('aiProgressBar');
        const label = document.getElementById('aiProgressLabel');
        if (bar) bar.style.width = (p.pct || 0) + '%';
        if (label) {
            const key = 'stage_' + p.stage;
            label.textContent = (T[(typeof currentLang !== 'undefined') ? currentLang : 'ar'] && T[(typeof currentLang !== 'undefined') ? currentLang : 'ar'][key])
                ? t(key) : t('analyzing');
        }
    }

    function renderDocPreview() {
        const pane = document.getElementById('aiDocPane');
        if (!pane) return;
        if (!state.fileUrl) { pane.innerHTML = '<div class="ai-doc-empty"><i class="fa-regular fa-file"></i></div>'; return; }
        const isPdf = state.file && /pdf$/i.test(state.file.name || '') ||
            (state.file && String(state.file.type || '').indexOf('pdf') >= 0);
        if (isPdf) {
            pane.innerHTML = '<iframe class="ai-doc-frame" src="' + state.fileUrl + '#toolbar=0"></iframe>';
        } else {
            pane.innerHTML = '<img class="ai-doc-img" alt="document" src="' + state.fileUrl + '">';
        }
    }

    function renderResult(r) {
        state.result = r;
        state.dupMode = 'create';
        state.dupTargets = [];
        const data = document.getElementById('aiDataPane');
        if (data) data.innerHTML = buildReviewHtml(r);
        renderDocPreview();
        showStep('review');
    }

    /* ------------------------------------------------------------------
       11) اختيار الملف + تشغيل التحليل
       ------------------------------------------------------------------ */
    function acceptFile(file) {
        clearError();
        if (!file) return;
        let type;
        try { type = A.validateFile(file); }
        catch (e) { showError(e.code); logAnalysis({ ok: false, err: e.code }); return; }

        releaseFileUrl();
        state.file = file;
        state.fileUrl = URL.createObjectURL(file);

        const chip = document.getElementById('aiFileChip');
        if (chip) {
            chip.hidden = false;
            chip.innerHTML = '<i class="fa-solid fa-file-lines"></i> <span class="ai-file-name">' + esc(file.name || '') + '</span>' +
                '<span class="ai-file-size">' + (file.size / 1024).toFixed(0) + ' KB</span>' +
                '<button type="button" class="ai-file-clear" id="aiFileClear"><i class="fa-solid fa-xmark"></i></button>';
            const clear = document.getElementById('aiFileClear');
            if (clear) clear.addEventListener('click', function () {
                releaseFileUrl(); state.file = null; chip.hidden = true;
                const btn = document.getElementById('aiAnalyzeBtn'); if (btn) btn.disabled = true;
            });
        }
        const btn = document.getElementById('aiAnalyzeBtn');
        if (btn) btn.disabled = false;
    }

    async function runAnalyze() {
        if (!state.file) { showError('no_file'); return; }
        clearError();
        showStep('progress');
        updateProgress({ stage: 'preparing', pct: 5 });

        const btn = document.getElementById('aiAnalyzeBtn');
        if (btn) btn.disabled = true;

        try {
            const lang = (typeof currentLang !== 'undefined') ? currentLang : 'ar';
            const result = await A.analyze(state.file, { uiLang: lang, onProgress: updateProgress });
            logAnalysis({ ok: true, docType: result.documentType, passengers: result.passengers.length, flights: result.flights.length });
            renderResult(result);
        } catch (e) {
            const code = (e && e.code) ? e.code : 'unknown';
            showError(code);
            logAnalysis({ ok: false, err: code });
            showStep('upload');                    /* نبقى في البداية، الملف محفوظ */
            updateProgress({ stage: 'preparing', pct: 0 });
        } finally {
            if (btn) btn.disabled = !state.file;
        }
    }

    function resetAll() {
        releaseFileUrl();
        state.file = null; state.result = null; state.dupMode = 'create';
        const chip = document.getElementById('aiFileChip'); if (chip) { chip.hidden = true; chip.innerHTML = ''; }
        const data = document.getElementById('aiDataPane'); if (data) data.innerHTML = '';
        const input = document.getElementById('aiFileInput'); if (input) input.value = '';
        const cam = document.getElementById('aiCameraInput'); if (cam) cam.value = '';
        const btn = document.getElementById('aiAnalyzeBtn'); if (btn) btn.disabled = true;
        clearError();
        showStep('upload');
    }

    /* التبديل بين "المستند" و"البيانات" على الجوال.
       ملاحظة مهمة: حالة التبويب يجب أن تكون محددة دائماً، وإلا اختفت اللوحتان
       معاً على الشاشات الصغيرة (لأن CSS يخفي كل منهما بدون صنف صريح). */
    function setMobileTab(which) {
        const root = document.getElementById('aiSplit');
        if (!root) return;
        const doc = which === 'doc';
        root.classList.toggle('ai-show-doc', doc);
        root.classList.toggle('ai-show-data', !doc);
        const td = document.getElementById('aiTabDoc');
        const tx = document.getElementById('aiTabData');
        if (td) td.classList.toggle('active', doc);
        if (tx) tx.classList.toggle('active', !doc);
    }

    /* ------------------------------------------------------------------
       12) الإقلاع وربط الأحداث
       ------------------------------------------------------------------ */
    function onLangChange() {
        const set = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
        set('aiTitle', t('title'));
        set('aiSubtitle', t('subtitle'));
        const pf = document.getElementById('aiPickFile'); if (pf) pf.innerHTML = '<i class="fa-solid fa-paperclip"></i> ' + esc(t('pickFile'));
        const pc = document.getElementById('aiPickCamera'); if (pc) pc.innerHTML = '<i class="fa-solid fa-camera"></i> ' + esc(t('pickCamera'));
        set('aiDropHint', t('dropHint'));
        set('aiFormats', t('formats'));
        const an = document.getElementById('aiAnalyzeBtn'); if (an) an.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> ' + esc(t('analyze'));
        set('aiLogTitle', t('logTitle'));
        set('aiTabDoc', t('tabDoc'));
        set('aiTabData', t('tabData'));
        const ap = document.getElementById('aiApproveBtn'); if (ap) ap.innerHTML = '<i class="fa-solid fa-check"></i> ' + esc(t('approve'));
        const rs = document.getElementById('aiRestartBtn'); if (rs) rs.textContent = t('restart');
        const bk = document.getElementById('aiBackBtn'); if (bk) bk.textContent = t('back');
        if (state.result) renderResult(state.result);
        renderLog();
    }

    function bindFileAndTabs() {
        const fileInput = document.getElementById('aiFileInput');
        if (fileInput) fileInput.addEventListener('change', e => acceptFile(e.target.files && e.target.files[0]));
        const camInput = document.getElementById('aiCameraInput');
        if (camInput) camInput.addEventListener('change', e => acceptFile(e.target.files && e.target.files[0]));

        const pick = document.getElementById('aiPickFile');
        if (pick) pick.addEventListener('click', () => fileInput && fileInput.click());
        const cam = document.getElementById('aiPickCamera');
        if (cam) cam.addEventListener('click', () => camInput && camInput.click());

        /* السحب والإفلات */
        const dz = document.getElementById('aiDropzone');
        if (dz) {
            ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('ai-drag'); }));
            ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('ai-drag'); }));
            dz.addEventListener('drop', e => {
                const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) acceptFile(f);
            });
            dz.addEventListener('click', e => {
                if (e.target === dz || (e.target.classList && e.target.classList.contains('ai-drop-inner'))) fileInput && fileInput.click();
            });
        }

        const analyze = document.getElementById('aiAnalyzeBtn');
        if (analyze) analyze.addEventListener('click', runAnalyze);
        const approveBtn = document.getElementById('aiApproveBtn');
        if (approveBtn) approveBtn.addEventListener('click', approve);
        const restart = document.getElementById('aiRestartBtn');
        if (restart) restart.addEventListener('click', resetAll);
        const back = document.getElementById('aiBackBtn');
        if (back) back.addEventListener('click', resetAll);

        const tabDoc = document.getElementById('aiTabDoc');
        const tabData = document.getElementById('aiTabData');
        if (tabDoc) tabDoc.addEventListener('click', () => setMobileTab('doc'));
        if (tabData) tabData.addEventListener('click', () => setMobileTab('data'));
    }

    function bindResultActions() {
        const pane = document.getElementById('aiDataPane');
        if (!pane) return;
        pane.addEventListener('click', e => {
            const dupBtn = e.target.closest && e.target.closest('.ai-dup-btn');
            if (dupBtn) {
                state.dupMode = dupBtn.getAttribute('data-dup');
                pane.querySelectorAll('.ai-dup-box').forEach(b => b.classList.remove('ai-dup-active'));
                const box = dupBtn.closest('.ai-dup-box'); if (box) box.classList.add('ai-dup-active');
                return;
            }
            if (e.target.closest && e.target.closest('#aiAddAllPax')) {
                pane.querySelectorAll('.ai-pick-pax').forEach(cb => { cb.checked = true; });
                pane.querySelectorAll('.ai-pick-flt').forEach(cb => { cb.checked = true; });
            }
        });
    }

    /* إعدادات المفتاح (البديل عن إعداد عنوان الخدمة) */
    /* إعدادات المفتاح — مع تغذية راجعة واضحة عند الحفظ */
    function bindSettings() {
        const saveCfg = document.getElementById('aiSaveSettings');
        if (!saveCfg) return;
        saveCfg.addEventListener('click', async () => {
            const inp = document.getElementById('aiApiKey');
            const msg = document.getElementById('aiSaveMsg');
            const say = (txt, ok) => {
                if (!msg) return;
                msg.hidden = false;
                msg.textContent = txt;
                msg.className = 'ai-note ' + (ok ? 'ai-note-ok' : 'ai-note-err');
            };
            const v = inp ? String(inp.value || '').trim() : '';
            const prev = A.getConfig().apiKey;

            /* لا نفترض أي صيغة أو بداية ثابتة للمفتاح.
               يُقبل أي نص غير فارغ؛ الصلاحية يتحقق منها Google نفسه. */
            if (!v && !hasStoredKey()) {
                say('مفتاح Gemini مطلوب — الصقه في الحقل ثم اضغط حفظ.', false);
                return;
            }

            try {
                if (!v) {
                    if (hasStoredKey()) {
                        const clearIt = 'مسح المفتاح المحفوظ والعودة للمفتاح المدمج في البرنامج؟';
                        if (!confirm(clearIt)) return;
                        A.configure({ apiKey: A.GEMINI_BUILTIN_KEY || prev });
                        try { await databaseSet(A.SETTINGS_KEY, { apiKey: A.GEMINI_BUILTIN_KEY || prev }); } catch (e) { }
                        try { await idbPut(A.SETTINGS_KEY, { apiKey: A.GEMINI_BUILTIN_KEY || prev }); } catch (e) { }
                        try { localStorage.setItem('ofoq_ai_apikey', A.GEMINI_BUILTIN_KEY || ''); } catch (e) { }
                        say('تم المسح — عاد المفتاح المدمج.', true);
                    } else {
                        say('الحقل فارغ — لم يتغيّر شيء.', false);
                        return;
                    }
                } else {
                    A.configure({ apiKey: v });
                    const saved = await persistApiKey(v);
                    if (!saved) {
                        say('تعذّر الحفظ الدائم — تحقّق من صلاحيات التخزين في المتصفح.', false);
                        return;
                    }
                    say('تم حفظ المفتاح بنجاح ✓', true);
                }
            } catch (e) {
                say('فشل الحفظ: ' + ((e && e.message) || 'خطأ غير معروف'), false);
                return;
            }

            if (inp) inp.value = '';
            await checkServiceStatus();
            const st = document.getElementById('aiStatus');
            if (st) {
                const ok = st.className.indexOf('ok') >= 0;
                if (ok) {
                    say('تم الحفظ والاتصال بـ Gemini يعمل ✓', true);
                } else {
                    /* نعرض السبب الحقيقي من Google بدل «تحقق من الإنترنت» */
                    say('تم الحفظ. لكن: ' + st.textContent, false);
                }
            }
        });
    }

    /* ------------------------------------------------------------------
       حفظ دائم لمفتاح Gemini
       ------------------------------------------------------------------
       المشكلة السابقة: databaseSet() يعمل فقط إذا كانت قاعدة البيانات جاهزة،
       وإلا يتجاهل الحفظ بصمت فيضيع المفتاح عند إغلاق المتصفح.

       الحل: ثلاث طبقات مع انتظار جاهزية القاعدة:
         1) databaseSet  (SQLite على Android / Electron)  — المصدر الأساسي
         2) IndexedDB مباشرة                            — احتياطي للمتصفح
         3) localStorage                                 — احتياطي أخير
       لا يُطبع المفتاح في أي log ولا رسالة.
       ------------------------------------------------------------------ */
    const AI_IDB_NAME = 'ofoq_travel_web';
    const AI_IDB_STORE = 'app_state';

    /* ينتظر جاهزية قاعدة البرنامج (حتى 5 ثوانٍ) ثم يتابع بالاحتياط.
       databaseGet يُرجع null فوراً إن لم تكن القاعدة جاهزة، لذا نعيد المحاولة. */
    async function waitForDatabase() {
        const start = Date.now();
        while (Date.now() - start < 5000) {
            if (typeof databaseGet !== 'function') return false;
            try {
                await databaseGet('__ai_probe__');
                return true;
            } catch (e) { /* لم تجهز بعد — ننتظر قليلاً ونعيد المحاولة */ }
            await new Promise(function (r) { setTimeout(r, 150); });
        }
        return false;
    }

    function openAiIdb() {
        return new Promise(function (resolve, reject) {
            if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
            const req = indexedDB.open(AI_IDB_NAME, 1);
            req.onupgradeneeded = function () {
                const db = req.result;
                if (!db.objectStoreNames.contains(AI_IDB_STORE)) {
                    db.createObjectStore(AI_IDB_STORE, { keyPath: 'key' });
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error || new Error('idb_error')); };
        });
    }

    async function idbPut(key, value) {
        const db = await openAiIdb();
        try {
            await new Promise(function (resolve, reject) {
                const tx = db.transaction(AI_IDB_STORE, 'readwrite');
                tx.objectStore(AI_IDB_STORE).put({ key: key, value: JSON.stringify(value) });
                tx.oncomplete = resolve;
                tx.onerror = function () { reject(tx.error); };
                tx.onabort = function () { reject(tx.error); };
            });
        } finally { db.close(); }
    }

    async function idbGet(key) {
        const db = await openAiIdb();
        try {
            const row = await new Promise(function (resolve, reject) {
                const tx = db.transaction(AI_IDB_STORE, 'readonly');
                const r = tx.objectStore(AI_IDB_STORE).get(key);
                r.onsuccess = function () { resolve(r.result); };
                r.onerror = function () { reject(r.error); };
            });
            return row && row.value ? JSON.parse(row.value) : null;
        } finally { db.close(); }
    }

    /* يحفظ المفتاح في كل الطبقات. يُرجع true إذا نجح أي منها. */
    async function persistApiKey(key) {
        const payload = { apiKey: String(key || '').trim(), savedAt: Date.now() };
        let ok = false;

        /* 1) قاعدة البرنامج (Android / Electron) */
        try {
            await waitForDatabase();
            if (typeof databaseSet === 'function') {
                await databaseSet(A.SETTINGS_KEY, { apiKey: payload.apiKey });
                ok = true;
            }
        } catch (e) { /* ننتقل للاحتياط */ }

        /* 2) IndexedDB — يضمن بقاء المفتاح بعد إغلاق المتصفح */
        try { await idbPut(A.SETTINGS_KEY, payload); ok = true; } catch (e) { }

        /* 3) localStorage — احتياطي أخير */
        try {
            localStorage.setItem('ofoq_ai_apikey', payload.apiKey);
            ok = true;
        } catch (e) { }

        return ok;
    }

    /* يقرأ المفتاح المحفوظ من أي طبقة تتوفر. */
    async function loadApiKey() {
        /* 1) IndexedDB أولاً (الأسرع في المتصفح) */
        try {
            const v = await idbGet(A.SETTINGS_KEY);
            if (v && v.apiKey) return v.apiKey;
        } catch (e) { }
        /* 2) localStorage */
        try {
            const v = localStorage.getItem('ofoq_ai_apikey');
            if (v) return v;
        } catch (e) { }
        /* 3) قاعدة البرنامج (Android / Electron) */
        try {
            await waitForDatabase();
            if (typeof databaseGet === 'function') {
                const s = await databaseGet(A.SETTINGS_KEY);
                if (s && s.apiKey) return s.apiKey;
            }
        } catch (e) { }
        return '';
    }

    /* هل هناك مفتاح محفوظ في قاعدة البيانات (بديل عن المدمج)؟ */
    function hasStoredKey() {
        const stored = A.getConfig().apiKey;
        const builtin = A.GEMINI_BUILTIN_KEY;
        /* المفتاح المدمج قد يكون فارغاً — في هذه الحالة أي قيمة محفوظة هي بديل. */
        return !!stored && stored !== builtin;
    }

    async function checkServiceStatus() {
        const el = document.getElementById('aiStatus');
        if (!el) return;
        if (!A.hasApiKey()) {
            el.className = 'ai-status down';
            el.textContent = t('noKey');
            return;
        }
        el.className = 'ai-status checking';
        const h = await A.checkConnection();
        if (h.ok) {
            el.className = 'ai-status ok';
            el.textContent = t('statusOk') + ' · ' + h.model;
        } else {
            el.className = 'ai-status down';
            el.textContent = t('statusDown') + ' — ' + connectFailText(h.code);
        }
    }

    function init() {
        if (!document.getElementById('section-ai')) return;   /* القسم غير موجود => لا شيء */
        try {
            bindFileAndTabs();
            bindResultActions();
            bindSettings();
            setMobileTab('doc');        /* حالة تبويب محددة دائماً (الهاتف) */
            onLangChange();
            showStep('upload');
            checkServiceStatus();
            /* تحميل المفتاح المحفوظ (يقيناً بعد إغلاق المتصفح) */
            loadApiKey()
                .then(function (k) {
                    if (k) { A.configure({ apiKey: k }); checkServiceStatus(); }
                })
                .catch(function () { });
        } catch (e) {
            /* أي خطأ هنا يجب ألا يمنع إقلاع البرنامج (المتطلّب #26) */
            try { console.warn('[ai] init failed', e && e.message); } catch (x) { }
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    global.AiDocUI = {
        t: t, state: state, approve: approve, analyze: runAnalyze,
        findDuplicates: findDuplicates, logAnalysis: logAnalysis, onLangChange: onLangChange
    };
})(typeof window !== 'undefined' ? window : globalThis);