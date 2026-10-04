/* ============================================================================
   ai-doc-schema.js — مخطط حقول المستندات + قاموس المسميات (عربي/إنجليزي/فرنسي)
   ----------------------------------------------------------------------------
   مصدر الحقيقة الوحيد (Single Source of Truth) للحقول التي يستطيع الذكاء
   الاصطناعي استخراجها. مصدرها الحقيقي هو نموذج الحجز الموجود في script.js
   (workingPassengers / workingFlights) — لا يوجد هنا أي حقل مخترع.

   يُستخدم في ثلاثة أماكن:
     1) بناء الـ prompt الذي يُرسل للذكاء الاصطناعي (يدفعه لاستخدام نفس الحقول)
     2) مُدخل واجهة المراجعة
     3) التحقق النهائي قبل الكتابة في النموذج (fail-closed)
   ========================================================================== */
(function (global) {
    'use strict';

    /* القيم المسموحة — مطابقة حرفياً لقيم <select> في index.html */
    const ENUMS = {
        paxType: ['Adult', 'Child', 'Infant'],
        gender: ['Male', 'Female'],
        mainTripType: ['One Way', 'Round Trip', 'Multi City'],
        bookingStatus: ['Confirmed', 'On Hold', 'Cancelled'],
        flightType: ['Outbound', 'Transit', 'Return'],
        travelClass: ['Economy', 'Premium Eco', 'Business', 'First']
    };

    const F = {};

    /* ============================ 1) حقول الحجز ============================ */
    F.bookingPnr = {
        group: 'booking', format: 'text',
        label: { ar: 'رمز الحجز PNR', en: 'Booking Reference (PNR)', fr: 'Référence de réservation (PNR)' },
        aliases: ['pnr', 'booking reference', 'booking ref', 'reservation code', 'record locator',
            'locator', 'confirmation number', 'reference', 'booking number',
            'رمز الحجز', 'الرمز المرجعي للحجز', 'كود الحجز', 'رقم الحجز', 'مرجع الحجز',
            'référence de réservation', 'code de réservation', 'numéro de réservation']
    };
    F.ticketNumber = {
        group: 'booking', format: 'text',
        label: { ar: 'رقم التذكرة', en: 'Ticket Number', fr: 'Numéro de billet' },
        aliases: ['ticket number', 'ticket no', 'e-ticket', 'eticket', 'ticket',
            'document number', 'electrical ticket number',
            'رقم التذكرة', 'التذكرة رقم', 'رقم تذكرة',
            'numéro de billet', 'n° billet', 'numero billet']
    };
    F.bookingReference = {
        group: 'booking', format: 'text',
        label: { ar: 'رقم الحجز المرجعي', en: 'Internal Booking Reference', fr: 'Référence interne' },
        aliases: ['internal reference', 'agency reference', 'booking id', 'local reference',
            'reference interne', 'référence agence']
    };
    F.bookingDate = {
        group: 'booking', format: 'date',
        label: { ar: 'تاريخ الحجز', en: 'Booking Date', fr: 'Date de réservation' },
        aliases: ['booking date', 'date of booking', 'issue date', 'issued on', 'issued', 'booked on',
            'date de réservation', "date d'émission", 'date emission',
            'تاريخ الحجز', 'تاريخ اصدار الحجز', 'تاريخ إصدار الحجز']
    };
    F.mainTripType = {
        group: 'booking', format: 'enum', enum: ENUMS.mainTripType,
        label: { ar: 'نوع الرحلة الرئيسي', en: 'Main Trip Type', fr: 'Type de voyage' },
        aliases: ['trip type', 'journey type', 'type of trip', 'type de voyage', 'نوع الرحلة', 'نوع الرحلة الرئيسي']
    };
    F.bookingStatus = {
        group: 'booking', format: 'enum', enum: ENUMS.bookingStatus,
        label: { ar: 'حالة الحجز', en: 'Booking Status', fr: 'Statut de la réservation' },
        aliases: ['status', 'booking status', 'statut', 'statut de réservation', 'الحالة', 'حالة الحجز']
    };

    /* =========================== 2) حقول المسافر =========================== */
    F.name = {
        group: 'passenger', format: 'text',
        label: { ar: 'الاسم الكامل', en: 'Full Name', fr: 'Nom complet' },
        aliases: ['passenger name', 'full name', 'name', 'surname', 'given name', 'family name',
            'nom et prénom', 'nom', 'prénom', 'prenom',
            'اسم المسافر', 'الاسم الكامل', 'الاسم', 'اللقب', 'اسم', 'الاسم واللقب']
    };
    F.passport = {
        group: 'passenger', format: 'text',
        label: { ar: 'رقم جواز السفر', en: 'Passport Number', fr: 'Numéro de passeport' },
        aliases: ['passport no', 'passport number', 'passport n°', 'passport no.', 'document no',
            'n° de passeport', 'numéro de passeport', 'numero de passeport', 'no de passeport',
            'رقم الجواز', 'رقم جواز السفر', 'رقم جواز', 'جواز السفر', 'رقم وثيقة السفر']
    };
    F.dob = {
        group: 'passenger', format: 'date',
        label: { ar: 'تاريخ الميلاد', en: 'Date of Birth', fr: 'Date de naissance' },
        aliases: ['dob', 'date of birth', 'birth date', 'born on', 'birthday',
            'date de naissance', 'né le', 'ne le', 'naissance',
            'تاريخ الميلاد', 'تاريخ الولادة', 'تاريخ ميلاد', 'الميلاد']
    };
    F.gender = {
        group: 'passenger', format: 'enum', enum: ENUMS.gender,
        label: { ar: 'الجنس', en: 'Gender', fr: 'Sexe' },
        aliases: ['gender', 'sex', 'sexe', 'الجنس', 'النوع']
    };
    F.type = {
        group: 'passenger', format: 'enum', enum: ENUMS.paxType,
        label: { ar: 'نوع المسافر', en: 'Passenger Type', fr: 'Type de passager' },
        aliases: ['passenger type', 'pax type', 'adult', 'child', 'infant', 'baby',
            'type de passager', 'adulte', 'enfant', 'bébé',
            'نوع المسافر', 'بالغ', 'طفل', 'رضيع', 'طفل رضيع']
    };

    /* =========================== 3) حقول الرحلة =========================== */
    F.flightType = {
        group: 'flight', format: 'enum', enum: ENUMS.flightType,
        label: { ar: 'نوع الرحلة الفرعي', en: 'Flight Segment Type', fr: 'Type de segment' },
        aliases: ['segment', 'leg', 'flight type', 'type de vol', 'type de segment', 'نوع الرحلة الفرعي', 'مرحلة الرحلة']
    };
    F.airline = {
        group: 'flight', format: 'text',
        label: { ar: 'شركة الطيران', en: 'Airline', fr: 'Compagnie aérienne' },
        aliases: ['airline', 'carrier', 'operating carrier', 'marketing carrier', 'airline name',
            'compagnie aérienne', 'compagnie', 'transporteur', 'nom de la compagnie',
            'شركة الطيران', 'شركة طيران', 'الناقل', 'الناقل الجوي']
    };
    F.flightNo = {
        group: 'flight', format: 'text',
        label: { ar: 'رقم الرحلة', en: 'Flight Number', fr: 'Numéro de vol' },
        aliases: ['flight no', 'flight number', 'flight', 'flt', 'no de vol', 'n° de vol', 'numero de vol',
            'رقم الرحلة', 'رقم الرحلة المنفذة']
    };
    F.depCity = {
        group: 'flight', format: 'text',
        label: { ar: 'مدينة المغادرة', en: 'Departure City', fr: 'Ville de départ' },
        aliases: ['departure city', 'from city', 'origin city', 'departure', 'origin', 'from',
            'ville de départ', 'depart', 'de',
            'مدينة المغادرة', 'مدينة 출발', 'من', 'مدينة السفر']
    };
    F.depAirport = {
        group: 'flight', format: 'text',
        label: { ar: 'مطار المغادرة', en: 'Departure Airport', fr: 'Aéroport de départ' },
        aliases: ['departure airport', 'from airport', 'origin airport', 'departure airport (iata)',
            'aéroport de départ', 'aeroport de depart',
            'مطار المغادرة', 'مطار السفر', 'مطار خروج']
    };
    F.depDate = {
        group: 'flight', format: 'date',
        label: { ar: 'تاريخ المغادرة', en: 'Departure Date', fr: 'Date de départ' },
        aliases: ['departure date', 'date of departure', 'dep date', 'travel date', 'outbound date',
            'date de départ', 'date de departure', 'departure',
            'تاريخ المغادرة', 'تاريخ السفر', 'تاريخ الرحلة', 'تاريخ الذهاب']
    };
    F.depTime = {
        group: 'flight', format: 'time',
        label: { ar: 'وقت المغادرة', en: 'Departure Time', fr: 'Heure de départ' },
        aliases: ['departure time', 'dep time', 'scheduled departure', 'sched dep', 'std', 'etd',
            'heure de départ', 'heure de depart', 'heure',
            'وقت المغادرة', 'ساعة المغادرة', 'وقت الرحلة', 'وقت السفر']
    };
    F.depTerminal = {
        group: 'flight', format: 'text',
        label: { ar: 'Terminal المغادرة', en: 'Departure Terminal', fr: 'Terminal de départ' },
        aliases: ['terminal', 'terminal de départ', 'dep terminal', 'terminal المغادرة', 'مبنى المغادرة']
    };

    F.arrCity = {
        group: 'flight', format: 'text',
        label: { ar: 'مدينة الوصول', en: 'Arrival City', fr: "Ville d'arrivée" },
        aliases: ['arrival city', 'to city', 'destination city', 'arrival', 'destination', 'to',
            "ville d'arrivée", 'ville arrivee', 'vers', 'à',
            'مدينة الوصول', 'الوجهة', 'إلى']
    };
    F.arrAirport = {
        group: 'flight', format: 'text',
        label: { ar: 'مطار الوصول', en: 'Arrival Airport', fr: "Aéroport d'arrivée" },
        aliases: ['arrival airport', 'to airport', 'destination airport',
            "aéroport d'arrivée", 'aeroport darrivee', 'مطار الوصول', 'مطار الوجهة']
    };
    F.arrDate = {
        group: 'flight', format: 'date',
        label: { ar: 'تاريخ الوصول', en: 'Arrival Date', fr: "Date d'arrivée" },
        aliases: ['arrival date', 'date of arrival', 'arr date', 'arrival',
            "date d'arrivée", 'date darrivee', 'تاريخ الوصول']
    };
    F.arrTime = {
        group: 'flight', format: 'time',
        label: { ar: 'وقت الوصول', en: 'Arrival Time', fr: "Heure d'arrivée" },
        aliases: ['arrival time', 'arr time', 'scheduled arrival', 'sched arr', 'sta', 'eta',
            "heure d'arrivée", 'وقت الوصول', 'ساعة الوصول']
    };
    F.arrTerminal = {
        group: 'flight', format: 'text',
        label: { ar: 'Terminal الوصول', en: 'Arrival Terminal', fr: "Terminal d'arrivée" },
        aliases: ['arrival terminal', "terminal d'arrivée", 'terminal الوصول', 'مبنى الوصول']
    };
    F.bagChecked = {
        group: 'flight', format: 'text',
        label: { ar: 'الأمتعة المسجلة', en: 'Checked Baggage', fr: 'Bagages en soute' },
        aliases: ['checked baggage', 'checked bag', 'hold baggage', 'hold', 'baggage allowance',
            'bagages en soute', 'bagage', 'الأمتعة المسجلة', 'أمتعة الشحن', 'الوزن المسموح']
    };
    F.bagCabin = {
        group: 'flight', format: 'text',
        label: { ar: 'الأمتعة المحمولة', en: 'Cabin Baggage', fr: 'Bagages cabine' },
        aliases: ['cabin baggage', 'cabin bag', 'hand baggage', 'hand luggage', 'bagages cabine', 'الأمتعة المحمولة', 'حقيبة اليد']
    };
    F.travelClass = {
        group: 'flight', format: 'enum', enum: ENUMS.travelClass,
        label: { ar: 'درجة السفر', en: 'Travel Class', fr: 'Classe de voyage' },
        aliases: ['class', 'cabin', 'cabin class', 'booking class', 'fare class', 'service',
            'classe', 'classe de cabine', 'درجة السفر', 'درجة', 'الدرجة', 'الدرجة السياحية']
    };
    F.seat = {
        group: 'flight', format: 'text',
        label: { ar: 'رقم المقعد', en: 'Seat', fr: 'Siège' },
        aliases: ['seat', 'seat no', 'seat number', 'siège', 'siege', 'المقعد', 'رقم المقعد']
    };
    F.transitWaiting = {
        group: 'flight', format: 'text',
        label: { ar: 'مدة انتظار الترانزيت', en: 'Transit Waiting Time', fr: "Durée d'escale" },
        aliases: ['transit time', 'layover', 'connecting time', 'connection time', "durée d'escale",
            'مدة الانتظار', 'مدة الترانزيت', 'مدة التوقف']
    };

    const GROUP_FIELDS = {
        booking: ['bookingPnr', 'ticketNumber', 'bookingReference', 'bookingDate', 'mainTripType', 'bookingStatus'],
        passenger: ['name', 'passport', 'dob', 'gender', 'type'],
        flight: ['flightType', 'airline', 'flightNo', 'depCity', 'depAirport', 'depDate', 'depTime', 'depTerminal',
            'arrCity', 'arrAirport', 'arrDate', 'arrTime', 'arrTerminal', 'bagChecked', 'bagCabin',
            'travelClass', 'seat', 'transitWaiting']
    };

    /* =====================================================================
       4) أدوات التوحيد (Normalization)
       ------------------------------------------------------------------
       الهدف: تحويل كل صيغ التاريخ/الوقت مهما كانت اللغة أو التنسيق
       إلى الصيغة التي يستخدمها البرنامج أصلاً:
         - input[type=date]  =>  YYYY-MM-DD
         - input[type=time]  =>  HH:MM (24h)
       ===================================================================== */

    /* جداول شهور بالعربية / الفرنسية / الإنجليزية */
    const MONTHS = {
        ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
        fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
    };

    /* الأرقام العربية-الهندية ٠١٢٣٤٥٦٧٨٩ → 0123456789 */
    function normalizeDigits(s) {
        if (s === null || s === undefined) return s;
        return String(s)
            .replace(/[\u0660-\u0669]/g, d => String(d.charCodeAt(0) - 0x0660))
            .replace(/[\u06F0-\u06F9]/g, d => String(d.charCodeAt(0) - 0x06F0))
            .replace(/\u200E|\u200F|\u202A|\u202B|\u202C|\u202D|\u202E/g, '')
            .replace(/[–—―]/g, '-')
            .replace(/[   ]/g, ' ');
    }

    function pad2(n) { return String(n).padStart(2, '0'); }

    function validYmd(y, m, d) {
        y = parseInt(y, 10); m = parseInt(m, 10); d = parseInt(d, 10);
        if (!y || !m || !d) return null;
        if (y < 1900 || y > 2200) return null;
        if (m < 1 || m > 12) return null;
        if (d < 1 || d > 31) return null;
        const dt = new Date(Date.UTC(y, m - 1, d));
        if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
        return `${y}-${pad2(m)}-${pad2(d)}`;
    }

    function monthIndexFromWord(word) {
        if (!word) return -1;
        const w = normalizeDigits(word).toLowerCase().replace(/[^a-z؀-ۿ]/g, '');
        for (const lang of ['en', 'fr', 'ar']) {
            for (let i = 0; i < 12; i++) {
                const full = MONTHS[lang][i];
                if (w === full || (w.length >= 3 && full.indexOf(w) === 0)) return i + 1;
                /*uzzLat:صيغة مختصرة.fr: janv., mars, août */
                const short = full.slice(0, 3);
                if (w === short) return i + 1;
            }
        }
        return -1;
    }

    /* يحوّل أي تاريخ إلى YYYY-MM-DD أو null (لا تخمين أبداً) */
    function normalizeDate(input) {
        if (input === null || input === undefined) return null;
        let s = normalizeDigits(String(input)).trim();
        if (!s) return null;
        s = s.replace(/\s+/g, ' ');

        /* 1) ISO جاهز: 1985-06-14 (مع أو بدون وقت) */
        let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
        if (m) return validYmd(m[1], m[2], m[3]);

        /* 2) DD/MM/YYYY أو MM/DD/YYYY — نترجمها أولاً ثم نحدّد بالسياق */
        m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
        if (m) {
            let a = +m[1], b = +m[2], y = +m[3];
            if (y < 100) y += y < 60 ? 2000 : 1900;
            /* إذا أحدهما > 12 فالأول هو اليوم */
            if (a > 12 && b <= 12) return validYmd(y, b, a);
            if (b > 12 && a <= 12) return validYmd(y, a, b);
            /* غموض: نعتمد.day-first (الشائع في DZ/FR) — يُعاد التصحيح بالمراجعة */
            return validYmd(y, b, a) || validYmd(y, a, b);
        }

        /* 3) DD-Mon-YYYY / Mon DD, YYYY (en + fr) */
        m = s.match(/^(\d{1,2})[\s\-./]+([A-Za-zÀ-ÿ؀-ۿ]+)[\s\-./,]+(\d{4})/);
        if (m) {
            const mi = monthIndexFromWord(m[2]);
            if (mi > 0) return validYmd(m[3], mi, m[1]);
        }
        m = s.match(/^([A-Za-zÀ-ÿ؀-ۿ]+)[\s\-./]+(\d{1,2})[\s\-./,]+(\d{4})/);
        if (m) {
            const mi = monthIndexFromWord(m[1]);
            if (mi > 0) return validYmd(m[3], mi, m[2]);
        }
        /* 4) 14 جوان 1985 (شهور جزائرية/مغربية) */
        m = s.match(/^(\d{1,2})\s+([؀-ۿ]+)\s+(\d{4})/);
        if (m) {
            const word = normalizeDigits(m[2]).trim();
            let mi = monthIndexFromWord(word);
            if (mi <= 0) {
                const extra = { 'جوان': 6, 'جويلية': 7, 'أوت': 8, 'جوانية': 6, 'جويلية': 7 };
                mi = extra[word] || 0;
            }
            if (mi > 0) return validYmd(m[3], mi, m[1]);
        }
        return null;
    }

    /* يحوّل أي وقت إلى HH:MM (24 ساعة) أو null */
    function normalizeTime(input) {
        if (input === null || input === undefined) return null;
        const s = normalizeDigits(String(input)).trim();
        if (!s) return null;

        /* 1) hh:mm am/pm  — يجب فحصها قبل HH:MM المجرّد */
        const meridiem = s.match(/^(\d{1,2})(?:[:.](\d{2}))?\s*([ap]\.?m\.?)\b/i);
        if (meridiem) {
            let h = +meridiem[1], mi = +(meridiem[2] || 0);
            const isPm = /^p/i.test(meridiem[3]);
            if (isPm && h < 12) h += 12;
            if (!isPm && h === 12) h = 0;
            if (h >= 0 && h <= 23 && mi >= 0 && mi <= 59) return `${pad2(h)}:${pad2(mi)}`;
            return null;
        }
        /* 2) HH:MM أو HH:MM:SS */
        let m = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
        if (m) {
            let h = +m[1], mi = +m[2];
            if (h === 24 && mi === 0) h = 0;
            if (h >= 0 && h <= 23 && mi >= 0 && mi <= 59) return `${pad2(h)}:${pad2(mi)}`;
        }
        /* 3) حقل واحد = ساعة بدون دقائق */
        m = s.match(/^(\d{1,2})$/);
        if (m) {
            const h = +m[1];
            if (h >= 0 && h <= 23) return `${pad2(h)}:00`;
        }
        return null;
    }

    /* =====================================================================
       5) تنظيف القيم النصية وربط المرادفات بالحقول
       ===================================================================== */

    /* يحذف المحارف التي لا تخدم الحقل (عناصر OCR الشائعة) */
    function cleanText(v) {
        if (v === null || v === undefined) return null;
        let s = normalizeDigits(String(v)).replace(/\s+/g, ' ').trim();
        s = s.replace(/^[\s:.\-–—#*]+/, '').replace(/[\s:.\-–—]+$/, '');
        if (!s) return null;
        if (/^(n\/?a|null|undefined|unknown|inconnu|incconnu|غير معروف|غير متوفر|غير محدد|-{1,3})$/i.test(s)) return null;
        return s;
    }

    /* رقم جواز / PNR / تذكرة: نحافظ على الحروف والأرقام كما هي.
       أي قيمة لا تحتوي حرفاً أو رقماً تُعتبر غير موجودة (لا تخمين). */
    function cleanCode(v) {
        if (v === null || v === undefined) return null;
        let s = normalizeDigits(String(v)).toUpperCase().trim();
        s = s.replace(/^[\s:.\-–—#*?]+/, '').replace(/[\s:.\-–—?]+$/, '');
        s = s.replace(/[\s\-–—/.]/g, '');
        if (!s) return null;
        if (/^(NA|NULL|NONE|UNKNOWN|INCONNU|NC|ND)$/.test(s)) return null;
        /* لا حروف ولا أرقام => بيانات مشوّهة من OCR، تُسقط */
        if (!/[A-Z0-9\u0600-\u06FF]/.test(s)) return null;
        return s;
    }

    /* رقم رحلة: AH1010 / AH 1010 / 1010 — توحيد الشكل دون تغيير القيمة */
    function cleanFlightNo(v) {
        const raw = cleanCode(v);
        if (!raw) return null;
        const m = raw.match(/^([A-Z]{2}|[A-Z]\d|\d[A-Z])?(\d{1,4}[A-Z]?)$/);
        if (!m) return raw.length <= 12 ? raw : null;
        return ((m[1] || '') + (m[2] || '')).slice(0, 10);
    }

    /* جداول المطابقة مع القيم المسموحة — تحترم اللغات الثلاث */
    const ENUM_ALIASES = {
        paxType: {
            Adult: ['adult', 'adulte', 'adults', 'بالغ', 'راشد'],
            Child: ['child', 'enfant', 'children', 'child passenger', 'طفل', 'أطفال'],
            Infant: ['infant', 'baby', 'bébé', 'bebe', 'newborn', 'رضيع', 'طفل رضيع']
        },
        gender: {
            Male: ['male', 'm', 'man', 'masculin', 'homme', 'h', 'ذكر'],
            Female: ['female', 'f', 'woman', 'féminin', 'feminin', 'femme', 'أنثى', 'انثى']
        },
        mainTripType: {
            'One Way': ['one way', 'one-way', 'oneway', 'aller simple', 'simple', 'ذهاب فقط', 'ذهاب'],
            'Round Trip': ['round trip', 'roundtrip', 'return', 'aller-retour', 'aller retour', 'ذهاب وعودة', 'ذهاب و عوده'],
            'Multi City': ['multi city', 'multicity', 'multi-city', 'multi-cities', 'villes multiples', 'مدن متعددة', 'عدة مدن']
        },
        bookingStatus: {
            'Confirmed': ['confirmed', 'confirmé', 'confirme', 'ticketé', 'ticketed', 'مؤكد', 'مؤكدة'],
            'On Hold': ['on hold', 'hold', 'option', 'en attente', 'معلق', 'قيد الانتظار'],
            'Cancelled': ['cancelled', 'canceled', 'annulé', 'annule', 'ملغي', 'ملغى']
        },
        flightType: {
            Outbound: ['outbound', 'out', 'going', 'départ', 'depart', 'ذهاب', 'رحلة الذهاب'],
            Transit: ['transit', 'connection', 'via', 'escale', 'ترانزيت', 'توقف'],
            Return: ['return', 'inbound', 'retour', 'عودة', 'رحلة العودة']
        },
        travelClass: {
            Economy: ['economy', 'eco', 'y', 'economique', 'économique', 'tourist', 'سياحية', 'اقتصادية', 'الدرجة الاقتصادية'],
            'Premium Eco': ['premium economy', 'premium eco', 'premium', 'اقتصادية ممتازة', 'سياحية ممتازة'],
            Business: ['business', 'c', 'affaires', 'أعمال', 'رجال الأعمال', 'بزنس'],
            First: ['first', 'f', 'première', 'premiere', 'première classe', 'الأولى', 'الدرجة الأولى']
        }
    };

    function normalizeEnum(enumName, v) {
        const s = cleanText(v);
        if (!s) return null;
        const table = ENUM_ALIASES[enumName] || {};
        const key = s.toLowerCase().replace(/\s+/g, ' ').trim();
        for (const canonical in table) {
            for (const alias of table[canonical]) if (alias === key) return canonical;
        }
        /* مطابقة جزئية احتياطية (مثل "First Class premium") */
        for (const canonical in table) {
            for (const alias of table[canonical]) {
                if (alias.length >= 4 && key.indexOf(alias) >= 0) return canonical;
            }
        }
        for (const a of (ENUMS[enumName] || [])) if (a.toLowerCase() === key) return a;
        return null;
    }

    /* يوحّد قيمة حقل واحد حسب نوعه. يعيد null إذا تعذّر — لا تخمين أبداً. */
    function normalizeFieldValue(key, v) {
        const def = F[key];
        if (!def) return null;
        if (def.format === 'date') return normalizeDate(v);
        if (def.format === 'time') return normalizeTime(v);
        if (def.format === 'enum') {
            const enumName = (key === 'type') ? 'paxType' : key;
            return normalizeEnum(enumName, v);
        }
        if (def.format === 'number') {
            const n = parseFloat(normalizeDigits(String(v)).replace(/[^0-9.\-]/g, ''));
            return isFinite(n) ? n : null;
        }
        if (['passport', 'bookingPnr', 'ticketNumber', 'bookingReference'].indexOf(key) >= 0) return cleanCode(v);
        if (key === 'flightNo') return cleanFlightNo(v);
        if (['seat', 'depTerminal', 'arrTerminal'].indexOf(key) >= 0) return cleanCode(v);
        return cleanText(v);
    }

    /* =====================================================================
       6) عقد JSON الموحّد (Single JSON Contract)
       ------------------------------------------------------------------
       هذا هو الشكل الوحيد الذي يقبله البرنامج. أي حقل خارج هذه القائمة
       يُتجاهل بصمت (fail-closed) — لا حقول مخترعة.
       ===================================================================== */

    /* وثيقة نتيجة التحليل بعد التنظيف (تُستهلك من ai-doc-ui) */
    function emptyField() { return { value: null, confidence: 0, raw: null, source: null, needsReview: false, rejected: null }; }

    /* يبني مخطط JSON ليُرسل في تعليمات النموذج */
    function buildJsonSchemaForPrompt() {
        const fieldList = keys => keys.map(k => ({
            field: k,
            type: F[k].format === 'enum' ? 'enum' : F[k].format === 'date' ? 'date' : F[k].format === 'time' ? 'time' : 'string',
            allowed: F[k].enum ? F[k].enum.slice() : undefined,
            meaning: { ar: F[k].label.ar, en: F[k].label.en, fr: F[k].label.fr }
        }));
        return {
            documentType: ['Passport', 'National ID', 'Flight Ticket', 'Boarding Pass',
                'Booking Confirmation', 'Itinerary', 'Visa', 'Invoice', 'Unknown'],
            languages: ['ar', 'en', 'fr'],
            booking: fieldList(GROUP_FIELDS.booking),
            passengers: { note: 'one entry per person found in the document', fields: fieldList(GROUP_FIELDS.passenger) },
            flights: { note: 'one entry per flight segment, in document order', fields: fieldList(GROUP_FIELDS.flight) }
        };
    }

    /* تحقق نهائي من قيمة واحدة — تُستدعى عند الاعتماد */
    function validateBeforeWrite(key, value) {
        const def = F[key];
        if (!def) return { ok: false, reason: 'unknown_field' };
        if (value === null || value === undefined || value === '') return { ok: true, value: null };
        const v = normalizeFieldValue(key, value);
        if (v === null) return { ok: true, value: null };  // تعذّر التوحيد => يُترك فارغاً (لا تخمين)
        if (def.format === 'enum' && (def.enum || []).indexOf(v) < 0) return { ok: true, value: null };
        return { ok: true, value: v };
    }

    /* تسمية الحقل للعرض بلغة الواجهة الحالية */
    function labelOf(key, lang) {
        const def = F[key];
        if (!def) return key;
        return def.label[lang] || def.label.en || key;
    }

    /* نصيحة ذكية موجزة تُحقن في الـ prompt لشرح معنى كل حقل بمثال */
    function aliasDigest(lang) {
        return GROUP_FIELDS.booking.concat(GROUP_FIELDS.passenger, GROUP_FIELDS.flight)
            .map(k => `${k} (= ${F[k].label[lang] || F[k].label.en}: ${F[k].aliases.slice(0, 8).join(' / ')})`)
            .join('\n');
    }

    global.AiDocSchema = {
        FIELDS: F,
        GROUP_FIELDS: GROUP_FIELDS,
        ENUMS: ENUMS,
        normalizeDigits: normalizeDigits,
        normalizeDate: normalizeDate,
        normalizeTime: normalizeTime,
        cleanText: cleanText,
        cleanCode: cleanCode,
        cleanFlightNo: cleanFlightNo,
        normalizeEnum: normalizeEnum,
        normalizeFieldValue: normalizeFieldValue,
        emptyField: emptyField,
        buildJsonSchemaForPrompt: buildJsonSchemaForPrompt,
        validateBeforeWrite: validateBeforeWrite,
        labelOf: labelOf,
        aliasDigest: aliasDigest
    };
})(typeof window !== 'undefined' ? window : globalThis);