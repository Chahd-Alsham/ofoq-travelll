// ==========================================================================
// OFOQ TRAVEL - FULL SYSTEM CORE LOGIC & ENGINE (PDF EXPORT OPTIMIZED FOR A4)
// ==========================================================================

let currentBooking = {
    id: null,
    tripType: 'one-way',
    status: 'مؤكد / CONFIRMED',
    pnr: '',
    ticketNumber: '',
    reference: '',
    bookingDate: new Date().toISOString().split('T')[0],
    passengers: [],
    flights: [],
    price: '',
    currency: 'DZD',
    checkedBaggage: '',
    cabinBaggage: '',
    notes: ''
};

let appSettings = {
    companyNameAr: 'أفق للطيران',
    companyNameEn: 'OFOQ TRAVEL',
    phone: '+213 550 00 00 00',
    email: 'contact@ofoqtravel.com',
    address: 'الجزائر / الرياض',
    whatsapp: '+213 550 00 00 00',
    website: 'www.ofoqtravel.com',
    footerText: 'شكرًا لاختياركم أفق للطيران، نتمنى لكم رحلة سعيدة وآمنة. Thank you for choosing Ofoq Travel.',
    instructions: "⚠ يرجى الحضور إلى المطار قبل الرحلة الدولية بـ 3 ساعات.\n⚠ تأكد من صلاحية جواز السفر لمدة لا تقل عن 6 أشهر.\n⚠ تأكد من التأشيرات والمستندات المطلوبة لدولة الوجهة.\n⚠ تحقق من وزن الأمتعة وTerminal المحدد في التذكرة.",
    logoBase64: ''
};

let defaultAirlines = [
    { code: 'QR', name: 'Qatar Airways', logo: '🇶🇦' },
    { code: 'TK', name: 'Turkish Airlines', logo: '🇹🇷' },
    { code: 'PC', name: 'Pegasus Airlines', logo: '🇹🇷' },
    { code: 'AH', name: 'Air Algérie', logo: '🇩🇿' },
    { code: 'AT', name: 'Royal Air Maroc', logo: '🇲🇦' },
    { code: 'MS', name: 'EgyptAir', logo: '🇪🇬' },
    { code: 'SV', name: 'Saudia', logo: '🇸🇦' },
    { code: 'EK', name: 'Emirates', logo: '🇦🇪' },
    { code: 'EY', name: 'Etihad Airways', logo: '🇦🇪' },
    { code: 'XY', name: 'Flynas', logo: '🇸🇦' },
    { code: 'F3', name: 'Flyadeal', logo: '🇸🇦' },
    { code: 'TU', name: 'Tunisair', logo: '🇹🇳' },
    { code: 'BJ', name: 'Nouvelair', logo: '🇹🇳' },
    { code: 'AF', name: 'Air France', logo: '🇫🇷' },
    { code: 'LH', name: 'Lufthansa', logo: '🇩🇪' },
    { code: 'BA', name: 'British Airways', logo: '🇬🇧' },
    { code: 'KL', name: 'KLM', logo: '🇳🇱' },
    { code: 'IB', name: 'Iberia', logo: '🇪🇸' },
    { code: 'AZ', name: 'ITA Airways', logo: '🇮🇹' },
    { code: 'FR', name: 'Ryanair', logo: '🇮🇪' },
    { code: 'W6', name: 'Wizz Air', logo: '🇭🇺' }
];

let defaultAirports = [
    { iata: 'ALG', city: 'Algiers', airport: 'Houari Boumediene Airport', country: 'Algeria' },
    { iata: 'ORN', city: 'Oran', airport: 'Ahmed Ben Bella Airport', country: 'Algeria' },
    { iata: 'CZL', city: 'Constantine', airport: 'Mohamed Boudiaf Airport', country: 'Algeria' },
    { iata: 'IST', city: 'Istanbul', airport: 'Istanbul Airport', country: 'Turkey' },
    { iata: 'SAW', city: 'Istanbul', airport: 'Sabiha Gökçen Airport', country: 'Turkey' },
    { iata: 'RUH', city: 'Riyadh', airport: 'King Khalid International Airport', country: 'Saudi Arabia' },
    { iata: 'JED', city: 'Jeddah', airport: 'King Abdulaziz International Airport', country: 'Saudi Arabia' },
    { iata: 'MED', city: 'Madinah', airport: 'Prince Mohammad bin Abdulaziz Airport', country: 'Saudi Arabia' },
    { iata: 'DOH', city: 'Doha', airport: 'Hamad International Airport', country: 'Qatar' },
    { iata: 'DXB', city: 'Dubai', airport: 'Dubai International Airport', country: 'UAE' },
    { iata: 'CAI', city: 'Cairo', airport: 'Cairo International Airport', country: 'Egypt' },
    { iata: 'CMN', city: 'Casablanca', airport: 'Mohammed V International Airport', country: 'Morocco' },
    { iata: 'TUN', city: 'Tunis', airport: 'Tunis–Carthage International Airport', country: 'Tunisia' },
    { iata: 'CDG', city: 'Paris', airport: 'Charles de Gaulle Airport', country: 'France' },
    { iata: 'LHR', city: 'London', airport: 'Heathrow Airport', country: 'UK' }
];

let AIRLINES_DATABASE = [];
let AIRPORTS_DATABASE = [];
let newAirlineLogoBase64 = '';

function loadDatabases() {
    const savedAirlines = localStorage.getItem('ofoq_airlines');
    const savedAirports = localStorage.getItem('ofoq_airports');
    AIRLINES_DATABASE = savedAirlines ? JSON.parse(savedAirlines) : [...defaultAirlines];
    AIRPORTS_DATABASE = savedAirports ? JSON.parse(savedAirports) : [...defaultAirports];
}

const TRANSLATIONS = {
    en: {
        pnr: "BOOKING REFERENCE (PNR)",
        status: "BOOKING STATUS",
        ticketNo: "TICKET NUMBER",
        issueDate: "ISSUE DATE",
        passengers: "PASSENGER DETAILS",
        passengerName: "PASSENGER NAME",
        type: "TYPE",
        passport: "PASSPORT NO.",
        birthDate: "DATE OF BIRTH",
        itinerary: "FLIGHT ITINERARY",
        outbound: "OUTBOUND FLIGHT",
        inbound: "RETURN FLIGHT",
        transitFlight: "TRANSIT FLIGHT",
        flight: "FLIGHT",
        departure: "DEPARTURE",
        arrival: "ARRIVAL",
        terminal: "TERMINAL",
        transit: "TRANSIT / CONNECTION",
        transitWait: "Waiting Time",
        totalFare: "TOTAL FARE AMOUNT",
        travelNotice: "IMPORTANT TRAVEL INFORMATION",
        class: "CLASS",
        seat: "SEAT"
    },
    fr: {
        pnr: "RÉFÉRENCE DE RÉSERVATION (PNR)",
        status: "STATUT DE RÉSERVATION",
        ticketNo: "NUMÉRO DE BILLET",
        issueDate: "DATE D'ÉMISSION",
        passengers: "DÉTAILS DES PASSAGERS",
        passengerName: "NOM DU PASSAGER",
        type: "TYPE",
        passport: "N° DE PASSEPORT",
        birthDate: "DATE DE NAISSANCE",
        itinerary: "ITINÉRAIRE DE VOL",
        outbound: "VOL ALLER",
        inbound: "VOL RETOUR",
        transitFlight: "VOL DE CORRESPONDANCE",
        flight: "VOL",
        departure: "DÉPART",
        arrival: "ARRIVÉE",
        terminal: "TERMINAL",
        transit: "ESCALE / CORRESPONDANCE",
        transitWait: "Temps d'attente",
        totalFare: "MONTANT TOTAL DU BILLET",
        travelNotice: "INFORMATIONS IMPORTANTES DE VOYAGE",
        class: "CLASSE",
        seat: "SIÈGE"
    },
    ar: {
        pnr: "رمز الحجز (PNR)",
        status: "حالة الحجز",
        ticketNo: "رقم التذكرة الإلكترونية",
        issueDate: "تاريخ الإصدار",
        passengers: "بيانات المسافرين",
        passengerName: "اسم المسافر",
        type: "النوع",
        passport: "رقم الجواز",
        birthDate: "تاريخ الميلاد",
        itinerary: "خط سير الرحلة",
        outbound: "رحلة الذهاب",
        inbound: "رحلة العودة",
        transitFlight: "رحلة ترانزيت",
        flight: "رقم الرحلة",
        departure: "المغادرة",
        arrival: "الوصول",
        terminal: "المبنى Terminal",
        transit: "ترانزيت / انتظار",
        transitWait: "وقت الانتظار",
        totalFare: "السعر الإجمالي",
        travelNotice: "تعليمات ومعلومات السفر الهامة",
        class: "الدرجة",
        seat: "المقعد"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadDatabases();
    loadSampleDataIfEmpty();
    renderDashboard();
    renderHistoryTable();
    createNewBooking(false);
});

function switchTab(tabId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.page-view').forEach(view => view.classList.remove('active'));

    const activeNav = document.querySelector(`.nav-btn[onclick="switchTab('${tabId}')"]`);
    if (activeNav) activeNav.classList.add('active');

    const targetView = document.getElementById(`view-${tabId}`);
    if (targetView) targetView.classList.add('active');

    if (tabId === 'history') {
        renderHistoryTable();
    } else if (tabId === 'dashboard') {
        renderDashboard();
    } else if (tabId === 'airlines') {
        renderAirlinesTable();
    }

    const titles = {
        'dashboard': 'لوحة التحكم الرئيسيّة',
        'new-booking': 'إنشاء / تعديل حجز سفر',
        'history': 'سجل الحجوزات المنشأة',
        'airlines': 'إدارة شركات الطيران',
        'settings': 'إعدادات الشركة والهوية'
    };
    document.getElementById('pageTitle').innerText = titles[tabId] || 'أفق للطيران';
}

function switchMobileTab(pane) {
    document.getElementById('btnFormTab').classList.toggle('active', pane === 'form');
    document.getElementById('btnPreviewTab').classList.toggle('active', pane === 'preview');
    
    document.getElementById('paneForm').style.display = pane === 'form' ? 'flex' : 'none';
    document.getElementById('panePreview').style.display = pane === 'preview' ? 'block' : 'none';
}

function createNewBooking(switchToTab = true) {
    currentBooking = {
        id: 'OFOQ-' + Math.floor(100000 + Math.random() * 900000),
        tripType: 'one-way',
        status: 'مؤكد / CONFIRMED',
        pnr: '',
        ticketNumber: '',
        reference: '',
        bookingDate: new Date().toISOString().split('T')[0],
        passengers: [],
        flights: [],
        price: '',
        currency: 'DZD',
        checkedBaggage: '1x 23 kg',
        cabinBaggage: '1x 8 kg',
        notes: ''
    };

    document.getElementById('tripType').value = 'one-way';
    document.getElementById('bookingStatus').value = 'مؤكد / CONFIRMED';
    document.getElementById('pnrCode').value = '';
    document.getElementById('ticketNumber').value = '';
    document.getElementById('bookingReference').value = currentBooking.id;
    document.getElementById('bookingDate').value = currentBooking.bookingDate;
    document.getElementById('fareAmount').value = '';
    document.getElementById('fareCurrency').value = 'DZD';
    document.getElementById('checkedBaggage').value = '1x 23 kg';
    document.getElementById('cabinBaggage').value = '1x 8 kg';
    document.getElementById('bookingNotes').value = '';

    document.getElementById('passengersList').innerHTML = '';
    document.getElementById('flightsList').innerHTML = '';
    
    addPassengerInput();
    addFlightInput();

    updatePreview();
    if (switchToTab) switchTab('new-booking');
}

function resetForm() {
    if (confirm('هل أنت متأكد من إفراغ النموذج؟')) {
        createNewBooking(false);
    }
}

function handleTripTypeChange() {
    const type = document.getElementById('tripType').value;
    currentBooking.tripType = type;
    const flightsContainer = document.getElementById('flightsList');
    const currentFlightCards = flightsContainer.querySelectorAll('.dynamic-item-card');

    if (type === 'round-trip' && currentFlightCards.length < 2) {
        addFlightInput();
    }
}

function handleFlightDirectionChange(selectElem) {
    const card = selectElem.closest('.flight-item');
    const transitGroup = card.querySelector('.transit-wait-group');
    if (selectElem.value === 'transit') {
        transitGroup.style.display = 'flex';
    } else {
        transitGroup.style.display = 'none';
    }
    updatePreview();
}

function addPassengerInput(data = {}) {
    const container = document.getElementById('passengersList');
    const div = document.createElement('div');
    div.className = 'dynamic-item-card passenger-item';
    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removePassengerInput(this)"><i class="fa-solid fa-xmark"></i></button>
        <div class="form-row flex-3">
            <div class="form-group">
                <label>نوع المسافر</label>
                <select class="pass-type" onchange="updatePreview()">
                    <option value="Adult" ${data.type === 'Adult' ? 'selected' : ''}>بالغ (Adult)</option>
                    <option value="Child" ${data.type === 'Child' ? 'selected' : ''}>طفل (Child)</option>
                    <option value="Infant" ${data.type === 'Infant' ? 'selected' : ''}>رضيع (Infant)</option>
                </select>
            </div>
            <div class="form-group">
                <label>اللقب Title</label>
                <select class="pass-title" onchange="updatePreview()">
                    <option value="MR" ${data.title === 'MR' ? 'selected' : ''}>السيد (MR)</option>
                    <option value="MRS" ${data.title === 'MRS' ? 'selected' : ''}>السيدة (MRS)</option>
                    <option value="MS" ${data.title === 'MS' ? 'selected' : ''}>الآنسة (MS)</option>
                    <option value="MSTR" ${data.title === 'MSTR' ? 'selected' : ''}>الطفل (MSTR)</option>
                </select>
            </div>
            <div class="form-group">
                <label>الاسم الكامل Full Name</label>
                <input type="text" class="pass-name upper" placeholder="مثال: MOHAMED ARKADAN" value="${data.name || ''}" oninput="updatePreview()">
            </div>
        </div>
        <div class="form-row flex-2">
            <div class="form-group">
                <label>رقم جواز السفر Passport No.</label>
                <input type="text" class="pass-passport upper" placeholder="مثال: A29384019" value="${data.passport || ''}" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label>تاريخ الميلاد Date of Birth</label>
                <input type="date" class="pass-birthdate" value="${data.birthDate || ''}" onchange="updatePreview()">
            </div>
        </div>
    `;
    container.appendChild(div);
    updatePreview();
}

function removePassengerInput(btn) {
    const container = document.getElementById('passengersList');
    if (container.children.length > 1) {
        btn.closest('.dynamic-item-card').remove();
        updatePreview();
    } else {
        showToast('يجب إبقاء مسافر واحد على الأقل');
    }
}

function addFlightInput(data = {}) {
    const container = document.getElementById('flightsList');
    const div = document.createElement('div');
    div.className = 'dynamic-item-card flight-item';
    
    const flightDir = data.direction || 'outbound';
    const isTransit = flightDir === 'transit';

    div.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeFlightInput(this)"><i class="fa-solid fa-xmark"></i></button>
        <div class="form-row flex-3">
            <div class="form-group">
                <label>نوع الرحلة (اتجاهها)</label>
                <select class="flight-direction" onchange="handleFlightDirectionChange(this)">
                    <option value="outbound" ${flightDir === 'outbound' ? 'selected' : ''}>ذهاب (Outbound)</option>
                    <option value="inbound" ${flightDir === 'inbound' ? 'selected' : ''}>عودة (Inbound)</option>
                    <option value="transit" ${flightDir === 'transit' ? 'selected' : ''}>ترانزيت (Transit)</option>
                </select>
            </div>
            <div class="form-group">
                <label style="display:flex; justify-content:space-between; align-items:center;">
                    <span>شركة الطيران Airline</span>
                    <button type="button" class="btn-add-inline" onclick="openAirlineModal()" title="إضافة شركة طيران جديدة"><i class="fa-solid fa-plus"></i></button>
                </label>
                <input type="text" class="flight-airline" list="airlinesList" placeholder="بحث باسم الشركة أو IATA" value="${data.airline || ''}" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label>رقم الرحلة Flight No.</label>
                <input type="text" class="flight-no upper" placeholder="مثال: TK653" value="${data.flightNo || ''}" oninput="updatePreview()">
            </div>
        </div>
        <div class="form-row flex-2 transit-wait-group" style="display: ${isTransit ? 'flex' : 'none'};">
            <div class="form-group" style="grid-column: span 2;">
                <label><i class="fa-solid fa-clock"></i> وقت الانتظار اليدوي (Transit Waiting Time)</label>
                <input type="text" class="flight-transit-wait" placeholder="مثال: 02h 45m في مطار اسطنبول" value="${data.transitWait || ''}" oninput="updatePreview()">
            </div>
        </div>
        <div class="form-row flex-3">
            <div class="form-group">
                <label>درجة السفر Class</label>
                <input type="text" class="flight-class" placeholder="مثال: Economy (Y)" value="${data.bookingClass || 'Economy'}" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label style="display:flex; justify-content:space-between; align-items:center;">
                    <span>مطار المغادرة</span>
                    <button type="button" class="btn-add-inline" onclick="openAirportModal()" title="إضافة مطار جديد"><i class="fa-solid fa-plus"></i></button>
                </label>
                <input type="text" class="flight-dep-airport" list="airportsList" placeholder="مثال: ALG - Algiers" value="${data.depAirport || ''}" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label style="display:flex; justify-content:space-between; align-items:center;">
                    <span>مطار الوصول</span>
                    <button type="button" class="btn-add-inline" onclick="openAirportModal()" title="إضافة مطار جديد"><i class="fa-solid fa-plus"></i></button>
                </label>
                <input type="text" class="flight-arr-airport" list="airportsList" placeholder="مثال: IST - Istanbul" value="${data.arrAirport || ''}" oninput="updatePreview()">
            </div>
        </div>
        <div class="form-row flex-2">
            <div class="form-group">
                <label>تاريخ ووقت المغادرة</label>
                <div style="display:flex; gap:6px;">
                    <input type="date" class="flight-dep-date" value="${data.depDate || ''}" onchange="updatePreview()">
                    <input type="time" class="flight-dep-time" value="${data.depTime || ''}" onchange="updatePreview()">
                </div>
            </div>
            <div class="form-group">
                <label>تاريخ ووقت الوصول</label>
                <div style="display:flex; gap:6px;">
                    <input type="date" class="flight-arr-date" value="${data.arrDate || ''}" onchange="updatePreview()">
                    <input type="time" class="flight-arr-time" value="${data.arrTime || ''}" onchange="updatePreview()">
                </div>
            </div>
        </div>
        <div class="form-row flex-2">
            <div class="form-group">
                <label>Terminal المغادرة</label>
                <input type="text" class="flight-dep-terminal" placeholder="مثال: Terminal 1" value="${data.depTerminal || ''}" oninput="updatePreview()">
            </div>
            <div class="form-group">
                <label>رقم المقعد (اختياري)</label>
                <input type="text" class="flight-seat" placeholder="مثال: 14A" value="${data.seat || ''}" oninput="updatePreview()">
            </div>
        </div>
    `;
    container.appendChild(div);
    initDatalists();
    updatePreview();
}

function removeFlightInput(btn) {
    const container = document.getElementById('flightsList');
    if (container.children.length > 1) {
        btn.closest('.dynamic-item-card').remove();
        updatePreview();
    } else {
        showToast('يجب إبقاء رحلة واحدة على الأقل');
    }
}

function initDatalists() {
    let dlA = document.getElementById('airlinesList');
    if (!dlA) {
        dlA = document.createElement('datalist');
        dlA.id = 'airlinesList';
        document.body.appendChild(dlA);
    }
    dlA.innerHTML = AIRLINES_DATABASE.map(a => `<option value="${a.code} - ${a.name}">`).join('');

    let dlP = document.getElementById('airportsList');
    if (!dlP) {
        dlP = document.createElement('datalist');
        dlP.id = 'airportsList';
        document.body.appendChild(dlP);
    }
    dlP.innerHTML = AIRPORTS_DATABASE.map(p => `<option value="${p.iata} - ${p.city} (${p.airport})">`).join('');
}

function renderAirlinesTable() {
    const tbody = document.getElementById('airlinesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    AIRLINES_DATABASE.forEach((airline, idx) => {
        let logoHtml = airline.logo || '✈';
        if (airline.logo && (airline.logo.startsWith('data:image') || airline.logo.startsWith('http'))) {
            logoHtml = `<img src="${airline.logo}" alt="Logo" style="max-height: 30px; max-width: 30px; object-fit: contain;">`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><div style="width: 36px; height: 36px; display:flex; align-items:center; justify-content:center; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px;">${logoHtml}</div></td>
            <td><strong class="font-mono">${airline.code}</strong></td>
            <td>${airline.name}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="openEditAirlineModal('${airline.code}')" title="تعديل"><i class="fa-solid fa-pen"></i> تعديل</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openAirlineModal() {
    document.getElementById('airlineModalTitle').innerHTML = `<i class="fa-solid fa-plane"></i> إضافة شركة طيران جديدة`;
    document.getElementById('editAirlineOriginalCode').value = '';
    document.getElementById('newAirlineCode').value = '';
    document.getElementById('newAirlineName').value = '';
    document.getElementById('newAirlineLogo').value = '✈';
    document.getElementById('newAirlineLogoFile').value = '';
    document.getElementById('newAirlineLogoPreview').innerHTML = '';
    newAirlineLogoBase64 = '';
    document.getElementById('airlineModal').classList.add('active');
}

function openEditAirlineModal(code) {
    const airline = AIRLINES_DATABASE.find(a => a.code === code);
    if (!airline) return;

    document.getElementById('airlineModalTitle').innerHTML = `<i class="fa-solid fa-pen"></i> تعديل بيانات شركة الطيران: ${airline.name}`;
    document.getElementById('editAirlineOriginalCode').value = airline.code;
    document.getElementById('newAirlineCode').value = airline.code;
    document.getElementById('newAirlineName').value = airline.name;
    document.getElementById('newAirlineLogo').value = (airline.logo && !airline.logo.startsWith('data:image')) ? airline.logo : '';
    document.getElementById('newAirlineLogoFile').value = '';
    
    newAirlineLogoBase64 = '';
    if (airline.logo && airline.logo.startsWith('data:image')) {
        document.getElementById('newAirlineLogoPreview').innerHTML = `<img src="${airline.logo}" alt="Logo Preview" style="max-height: 50px; margin-top: 5px;">`;
    } else {
        document.getElementById('newAirlineLogoPreview').innerHTML = '';
    }

    document.getElementById('airlineModal').classList.add('active');
}

function handleNewAirlineLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        newAirlineLogoBase64 = evt.target.result;
        document.getElementById('newAirlineLogoPreview').innerHTML = `<img src="${newAirlineLogoBase64}" alt="Logo Preview" style="max-height: 50px; margin-top: 5px;">`;
        showToast('تم تحميل شعار شركة الطيران بنجاح');
    };
    reader.readAsDataURL(file);
}

function saveNewAirline() {
    const originalCode = document.getElementById('editAirlineOriginalCode').value.trim().toUpperCase();
    const code = document.getElementById('newAirlineCode').value.trim().toUpperCase();
    const name = document.getElementById('newAirlineName').value.trim();
    let logoInput = document.getElementById('newAirlineLogo').value.trim();

    if (!code || !name) {
        showToast('يرجى إدخال رمز الاسم والشركة بشكل صحيح');
        return;
    }

    if (originalCode) {
        const index = AIRLINES_DATABASE.findIndex(a => a.code === originalCode);
        if (index >= 0) {
            let finalLogo = AIRLINES_DATABASE[index].logo;
            if (newAirlineLogoBase64) {
                finalLogo = newAirlineLogoBase64;
            } else if (logoInput) {
                finalLogo = logoInput;
            }
            AIRLINES_DATABASE[index] = { code, name, logo: finalLogo };
        }
    } else {
        let logo = logoInput || '✈';
        if (newAirlineLogoBase64) {
            logo = newAirlineLogoBase64;
        }
        AIRLINES_DATABASE.push({ code, name, logo });
    }

    localStorage.setItem('ofoq_airlines', JSON.stringify(AIRLINES_DATABASE));
    initDatalists();
    renderAirlinesTable();
    closeModal('airlineModal');
    showToast(`تم حفظ شركة الطيران (${name}) بنجاح ✓`);
}

function openAirportModal() {
    document.getElementById('newAirportIata').value = '';
    document.getElementById('newAirportCity').value = '';
    document.getElementById('newAirportName').value = '';
    document.getElementById('newAirportCountry').value = '';
    document.getElementById('airportModal').classList.add('active');
}

function saveNewAirport() {
    const iata = document.getElementById('newAirportIata').value.trim().toUpperCase();
    const city = document.getElementById('newAirportCity').value.trim();
    const airport = document.getElementById('newAirportName').value.trim();
    const country = document.getElementById('newAirportCountry').value.trim();

    if (!iata || !city) {
        showToast('يرجى إدخال رمز المطار والمدينة');
        return;
    }

    AIRPORTS_DATABASE.push({ iata, city, airport: airport || city, country: country || '' });
    localStorage.setItem('ofoq_airports', JSON.stringify(AIRPORTS_DATABASE));
    initDatalists();
    closeModal('airportModal');
    showToast(`تم حفظ المطار (${iata} - ${city}) بنجاح ✓`);
}

function updatePreview() {
    const lang = document.getElementById('pdfLanguage').value || 'en';
    const t = TRANSLATIONS[lang];

    currentBooking.pnr = document.getElementById('pnrCode').value.toUpperCase();
    currentBooking.ticketNumber = document.getElementById('ticketNumber').value;
    currentBooking.status = document.getElementById('bookingStatus').value;
    currentBooking.bookingDate = document.getElementById('bookingDate').value;
    currentBooking.price = document.getElementById('fareAmount').value;
    currentBooking.currency = document.getElementById('fareCurrency').value;
    currentBooking.checkedBaggage = document.getElementById('checkedBaggage').value;
    currentBooking.cabinBaggage = document.getElementById('cabinBaggage').value;

    document.getElementById('docCheckedBaggage').innerText = currentBooking.checkedBaggage || '1x 23 kg';
    document.getElementById('docCabinBaggage').innerText = currentBooking.cabinBaggage || '1x 8 kg';

    document.getElementById('lblPNR').innerText = t.pnr;
    document.getElementById('docPNR').innerText = currentBooking.pnr || '-------';
    document.getElementById('lblStatus').innerText = t.status;
    document.getElementById('docStatus').innerText = currentBooking.status;

    const boxTicket = document.getElementById('boxTicketNo');
    if (currentBooking.ticketNumber) {
        boxTicket.style.display = 'flex';
        document.getElementById('lblTicketNo').innerText = t.ticketNo;
        document.getElementById('docTicketNo').innerText = currentBooking.ticketNumber;
    } else {
        boxTicket.style.display = 'none';
    }

    const boxIssue = document.getElementById('boxIssueDate');
    if (currentBooking.bookingDate) {
        boxIssue.style.display = 'flex';
        document.getElementById('lblIssueDate').innerText = t.issueDate;
        document.getElementById('docIssueDate').innerText = formatDateDisplay(currentBooking.bookingDate);
    } else {
        boxIssue.style.display = 'none';
    }

    document.getElementById('secTitlePassengers').innerHTML = `<i class="fa-solid fa-users"></i> ${t.passengers}`;
    document.getElementById('thPassName').innerText = t.passengerName;
    document.getElementById('thPassType').innerText = t.type;
    document.getElementById('thPassport').innerText = t.passport;
    document.getElementById('thBirthDate').innerText = t.birthDate;

    const passCards = document.querySelectorAll('.passenger-item');
    const passBody = document.getElementById('docPassengersBody');
    passBody.innerHTML = '';

    currentBooking.passengers = [];
    passCards.forEach(card => {
        const type = card.querySelector('.pass-type').value;
        const title = card.querySelector('.pass-title').value;
        const name = card.querySelector('.pass-name').value.toUpperCase();
        const passport = card.querySelector('.pass-passport').value.toUpperCase();
        const birthDate = card.querySelector('.pass-birthdate').value;

        if (name || passport) {
            currentBooking.passengers.push({ type, title, name, passport, birthDate });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${title} ${name || 'N/A'}</strong></td>
                <td>${type}</td>
                <td>${passport || 'N/A'}</td>
                <td>${birthDate ? formatDateDisplay(birthDate) : 'N/A'}</td>
            `;
            passBody.appendChild(tr);
        }
    });

    if (currentBooking.passengers.length === 0) {
        passBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#94A3B8;">No passenger data entered</td></tr>`;
    }

    document.getElementById('secTitleFlightItinerary').innerHTML = `<i class="fa-solid fa-plane"></i> ${t.itinerary}`;
    const flightCards = document.querySelectorAll('.flight-item');
    const flightsContainer = document.getElementById('docFlightsContainer');
    flightsContainer.innerHTML = '';

    currentBooking.flights = [];

    flightCards.forEach((card, idx) => {
        const direction = card.querySelector('.flight-direction').value;
        const airlineVal = card.querySelector('.flight-airline').value;
        const flightNo = card.querySelector('.flight-no').value.toUpperCase();
        const bClass = card.querySelector('.flight-class').value;
        const depAirport = card.querySelector('.flight-dep-airport').value;
        const depDate = card.querySelector('.flight-dep-date').value;
        const depTime = card.querySelector('.flight-dep-time').value;
        const arrAirport = card.querySelector('.flight-arr-airport').value;
        const arrDate = card.querySelector('.flight-arr-date').value;
        const arrTime = card.querySelector('.flight-arr-time').value;
        const depTerm = card.querySelector('.flight-dep-terminal').value;
        const seat = card.querySelector('.flight-seat').value;
        const transitWait = card.querySelector('.flight-transit-wait').value;

        const depCode = extractIataCode(depAirport);
        const arrCode = extractIataCode(arrAirport);

        const flightObj = {
            direction, airline: airlineVal, flightNo, bClass, depAirport, depCode, depDate, depTime,
            arrAirport, arrCode, arrDate, arrTime, depTerm, seat, transitWait
        };
        currentBooking.flights.push(flightObj);

        if (direction === 'transit') {
            const transitDiv = document.createElement('div');
            transitDiv.className = 'doc-transit-card transit-highlight';
            transitDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div class="transit-icon-badge"><i class="fa-solid fa-plane-circle-check"></i></div>
                    <div>
                        <span><strong>${t.transit}:</strong> ${t.transitWait}: <strong>${transitWait || 'غير محدد'}</strong></span>
                    </div>
                </div>
                <strong><i class="fa-solid fa-exchange-alt"></i> تحويل طائرة</strong>
            `;
            flightsContainer.appendChild(transitDiv);
        }

        const isOutbound = direction === 'outbound';
        const isInbound = direction === 'inbound';
        const cardDiv = document.createElement('div');
        
        let cardClass = 'doc-flight-card outbound';
        if (isInbound) cardClass = 'doc-flight-card inbound';
        if (direction === 'transit') cardClass = 'doc-flight-card transit-card-style';

        cardDiv.className = cardClass;
        cardDiv.innerHTML = `
            <div class="flight-card-header">
                <div class="airline-info">
                    <div class="airline-logo-box">${extractAirlineLogo(airlineVal)}</div>
                    <div>
                        <div class="airline-name">${airlineVal || 'Airline'}</div>
                        <span class="text-sm">${direction === 'transit' ? t.transitFlight : (isOutbound ? t.outbound : t.inbound)}</span>
                    </div>
                </div>
                <div class="flight-num-badge">${t.flight} ${flightNo || '---'}</div>
            </div>
            <div class="flight-route-grid">
                <div class="route-point">
                    <div class="airport-code">${depCode}</div>
                    <div class="city-name">${extractCityName(depAirport)}</div>
                    <div class="flight-time-big">${depTime || '--:--'}</div>
                    <div class="flight-date-str">${formatDateDisplay(depDate)}</div>
                    ${depTerm ? `<span class="terminal-tag">${t.terminal} ${depTerm}</span>` : ''}
                </div>
                <div class="route-center">
                    <i class="fa-solid ${direction === 'transit' ? 'fa-plane-circle-exclamation' : (isOutbound ? 'fa-plane-departure' : 'fa-plane-arrival')} plane-path-icon"></i>
                </div>
                <div class="route-point destination">
                    <div class="airport-code">${arrCode}</div>
                    <div class="city-name">${extractCityName(arrAirport)}</div>
                    <div class="flight-time-big">${arrTime || '--:--'}</div>
                    <div class="flight-date-str">${formatDateDisplay(arrDate)}</div>
                </div>
            </div>
            <div class="flight-extras-footer">
                ${bClass ? `<span><strong>${t.class}:</strong> ${bClass}</span>` : ''}
                ${seat ? `<span><strong>${t.seat}:</strong> ${seat}</span>` : ''}
            </div>
        `;
        flightsContainer.appendChild(cardDiv);
    });

    const priceBand = document.getElementById('docPriceBand');
    if (currentBooking.price) {
        priceBand.style.display = 'flex';
        document.getElementById('lblTotalFare').innerText = t.totalFare;
        document.getElementById('docPriceVal').innerText = `${Number(currentBooking.price).toLocaleString()} ${currentBooking.currency}`;
    } else {
        priceBand.style.display = 'none';
    }

    document.getElementById('lblNoticeTitle').innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${t.travelNotice}`;
    const instrList = document.getElementById('docInstructionsList');
    instrList.innerHTML = '';
    const instructionsText = typeof appSettings.instructions === 'string' ? appSettings.instructions : (Array.isArray(appSettings.instructions) ? appSettings.instructions.join('\n') : '');
    const lines = instructionsText.split('\n');
    lines.forEach(line => {
        if (line.trim()) {
            const li = document.createElement('li');
            li.innerText = line;
            instrList.appendChild(li);
        }
    });
}

function extractIataCode(str) {
    if (!str) return '---';
    const match = str.match(/\b[A-Z]{3}\b/);
    return match ? match[0] : str.substring(0, 3).toUpperCase();
}

function extractCityName(str) {
    if (!str) return 'Destination';
    return str.split('-')[1] || str.split('(')[0] || str;
}

function extractAirlineLogo(str) {
    if (!str) return '✈';
    const cleanStr = str.trim();
    const found = AIRLINES_DATABASE.find(a => 
        cleanStr.toUpperCase().includes(a.code) || 
        cleanStr.toLowerCase().includes(a.name.toLowerCase()) ||
        a.code === cleanStr.toUpperCase()
    );
    if (found && found.logo) {
        if (found.logo.startsWith('data:image') || found.logo.startsWith('http')) {
            return `<img src="${found.logo}" alt="Logo" style="width:100%;height:100%;object-fit:contain;border-radius:4px;">`;
        }
        return found.logo;
    }
    const match = cleanStr.match(/^[A-Z0-9]{2}/);
    return match ? match[0] : '✈';
}

function formatDateDisplay(dateStr) {
    if (!dateStr) return '---';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getStoredBookings() {
    return JSON.parse(localStorage.getItem('ofoq_bookings') || '[]');
}

function saveBookingToStorage(booking) {
    let bookings = getStoredBookings();
    const index = bookings.findIndex(b => b.id === booking.id);
    if (index >= 0) {
        bookings[index] = booking;
    } else {
        bookings.unshift(booking);
    }
    localStorage.setItem('ofoq_bookings', JSON.stringify(bookings));
}

function deleteBooking(id) {
    if (confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟')) {
        let bookings = getStoredBookings().filter(b => b.id !== id);
        localStorage.setItem('ofoq_bookings', JSON.stringify(bookings));
        showToast('تم حذف الحجز بنجاح');
        renderDashboard();
        renderHistoryTable();
    }
}

function saveCurrentBooking() {
    updatePreview();
    if (!currentBooking.pnr && currentBooking.passengers.length === 0) {
        showToast('يرجى إدخال رمز PNR أو اسم المسافر للحفظ');
        return;
    }
    saveBookingToStorage(currentBooking);
    showToast('تم حفظ الحجز في التخزين المحلي بنجاح ✓');
    renderDashboard();
    renderHistoryTable();
}

function loadBookingForEdit(id) {
    const booking = getStoredBookings().find(b => b.id === id);
    if (!booking) return;

    currentBooking = JSON.parse(JSON.stringify(booking));

    document.getElementById('tripType').value = currentBooking.tripType || 'one-way';
    document.getElementById('bookingStatus').value = currentBooking.status || 'مؤكد / CONFIRMED';
    document.getElementById('pnrCode').value = currentBooking.pnr || '';
    document.getElementById('ticketNumber').value = currentBooking.ticketNumber || '';
    document.getElementById('bookingReference').value = currentBooking.id;
    document.getElementById('bookingDate').value = currentBooking.bookingDate || '';
    document.getElementById('fareAmount').value = currentBooking.price || '';
    document.getElementById('fareCurrency').value = currentBooking.currency || 'DZD';
    document.getElementById('checkedBaggage').value = currentBooking.checkedBaggage || '1x 23 kg';
    document.getElementById('cabinBaggage').value = currentBooking.cabinBaggage || '1x 8 kg';

    const passContainer = document.getElementById('passengersList');
    passContainer.innerHTML = '';
    (currentBooking.passengers || []).forEach(p => addPassengerInput(p));
    if (currentBooking.passengers.length === 0) addPassengerInput();

    const flightContainer = document.getElementById('flightsList');
    flightContainer.innerHTML = '';
    (currentBooking.flights || []).forEach(f => addFlightInput(f));
    if (currentBooking.flights.length === 0) addFlightInput();

    updatePreview();
    switchTab('new-booking');
    showToast('تم تحميل بيانات الحجز للتعديل');
}

function cloneBooking(id) {
    const booking = getStoredBookings().find(b => b.id === id);
    if (!booking) return;
    loadBookingForEdit(id);
    currentBooking.id = 'OFOQ-' + Math.floor(100000 + Math.random() * 900000);
    currentBooking.pnr = currentBooking.pnr + '-COPY';
    document.getElementById('pnrCode').value = currentBooking.pnr;
    document.getElementById('bookingReference').value = currentBooking.id;
    updatePreview();
    showToast('تم نسخ الحجز كمسودة جديدة');
}

function renderDashboard() {
    const bookings = getStoredBookings() || [];
    
    document.getElementById('statTotal').innerText = bookings.length;
    document.getElementById('statConfirmed').innerText = bookings.filter(b => (b.status || '').includes('CONFIRMED')).length;
    document.getElementById('statPending').innerText = bookings.filter(b => (b.status || '').includes('HOLD')).length;

    const recentBody = document.getElementById('dashRecentBookings');
    recentBody.innerHTML = '';

    bookings.slice(0, 5).forEach(b => {
        const passName = b.passengers && b.passengers[0] ? `${b.passengers[0].title || ''} ${b.passengers[0].name || ''}`.trim() : 'N/A';
        const route = b.flights && b.flights.length > 0 ? `${b.flights[0].depCode || '---'} → ${b.flights[b.flights.length - 1].arrCode || '---'}` : '---';
        const depDate = b.flights && b.flights[0] && b.flights[0].depDate ? formatDateDisplay(b.flights[0].depDate) : '---';
        const status = b.status || 'UNKNOWN';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong class="font-mono">${b.pnr || '---'}</strong></td>
            <td>${passName}</td>
            <td>${route}</td>
            <td>${depDate}</td>
            <td><span class="status-badge ${status.includes('CONFIRMED') ? 'status-confirmed' : 'status-pending'}">${status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="loadBookingForEdit('${b.id}')"><i class="fa-solid fa-pen"></i></button>
            </td>
        `;
        recentBody.appendChild(tr);
    });
}

function renderHistoryTable() {
    const bookings = getStoredBookings() || [];
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    bookings.forEach((b, idx) => {
        const passName = b.passengers && b.passengers[0] ? `${b.passengers[0].title || ''} ${b.passengers[0].name || ''}`.trim() : 'N/A';
        const route = b.flights && b.flights.length > 0 ? `${b.flights[0].depCode || '---'} → ${b.flights[b.flights.length - 1].arrCode || '---'}` : '---';
        const depDate = b.flights && b.flights[0] && b.flights[0].depDate ? formatDateDisplay(b.flights[0].depDate) : '---';
        const price = b.price ? `${b.price} ${b.currency || ''}`.trim() : '---';
        const status = b.status || 'UNKNOWN';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td><strong class="font-mono">${b.pnr || '---'}</strong></td>
            <td>${passName}</td>
            <td>${route}</td>
            <td>${depDate}</td>
            <td><span class="status-badge ${status.includes('CONFIRMED') ? 'status-confirmed' : 'status-pending'}">${status}</span></td>
            <td>${price}</td>
            <td>
                <button class="btn btn-sm btn-outline" onclick="loadBookingForEdit('${b.id}')" title="تعديل"><i class="fa-solid fa-pen"></i> تعديل</button>
                <button class="btn btn-sm btn-outline" onclick="cloneBooking('${b.id}')" title="نسخ"><i class="fa-solid fa-copy"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteBooking('${b.id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function filterHistory() {
    const q = document.getElementById('historySearchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#historyTableBody tr');
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
    });
}

// دالة تصدير الـ PDF محسنة لصفحات A4 والتوزيع التلقائي دون قص أو صفحات فارغة
function triggerPDFExport() {
    updatePreview();
    const element = document.getElementById('printSheet');
    
    let primaryPassenger = 'Itinerary';
    if (currentBooking.passengers && currentBooking.passengers.length > 0 && currentBooking.passengers[0].name) {
        primaryPassenger = currentBooking.passengers[0].name.trim();
    }
    const cleanFilename = primaryPassenger.replace(/[\/\\?%*:|"<>]/g, '_') + '.pdf';

    const opt = {
        margin: [8, 8, 8, 8],
        filename: cleanFilename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    showToast('جاري إنشاء وتحميل ملف الـ PDF متوافق مع مقاس A4...');
    html2pdf().set(opt).from(element).save().then(() => {
        showToast('تم تصدير ملف PDF بنجاح ✓');
    });
}

function quickImportModal() {
    document.getElementById('importModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function processOCRFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const statusDiv = document.getElementById('ocrStatus');
    statusDiv.innerText = 'جاري قراءة ومعالجة المستند بواسطة OCR... (يرجى الانتظار)';

    Tesseract.recognize(file, 'eng', { logger: m => console.log(m) }).then(({ data: { text } }) => {
        document.getElementById('importRawText').value = text;
        statusDiv.innerText = 'تمت قراءة المستند بنجاح! يمكنك الضغط على "تفكيك واستخراج البيانات".';
        showToast('تم إجراء الـ OCR بنجاح');
    }).catch(err => {
        statusDiv.innerText = 'حدث خطأ أثناء الـ OCR. يمكنك لصق النص يدوياً.';
    });
}

function executeTextImport() {
    const rawText = document.getElementById('importRawText').value;
    if (!rawText.trim()) {
        showToast('يرجى لصق نص أو رفع مستند أولاً');
        return;
    }
    parseBookingText(rawText);
    closeModal('importModal');
    switchTab('new-booking');
    showToast('تم اكتشاف البيانات تلقائياً، يرجى مراجعتها وتأكيد الحفظ ✓');
}

function parseBookingText(text) {
    createNewBooking(false);
    const pnrMatch = text.match(/\b(PNR|REF|BOOKING REF|CONFIRMATION):\s*([A-Z0-9]{6})\b/i) || text.match(/\b([A-Z0-9]{6})\b/);
    if (pnrMatch) {
        document.getElementById('pnrCode').value = pnrMatch[2] || pnrMatch[1];
    }
    const ticketMatch = text.match(/\b(TICKET|TKT|ETKT):\s*([0-9]{3}[-\s]?[0-9]{10})\b/i);
    if (ticketMatch) {
        document.getElementById('ticketNumber').value = ticketMatch[2];
    }
    const passMatches = text.match(/\b(MR|MRS|MS|MSTR)\/\s*([A-Z\s]+)\b/g);
    if (passMatches && passMatches.length > 0) {
        document.getElementById('passengersList').innerHTML = '';
        passMatches.forEach(pm => {
            const parts = pm.split('/');
            addPassengerInput({
                title: parts[0].trim(),
                name: parts[1] ? parts[1].trim() : ''
            });
        });
    }
    updatePreview();
}

function loadSettings() {
    const saved = localStorage.getItem('ofoq_settings');
    if (saved) {
        appSettings = JSON.parse(saved);
    }
    applySettingsUI();
}

function applySettingsUI() {
    document.getElementById('cfgCompanyNameAr').value = appSettings.companyNameAr;
    document.getElementById('cfgCompanyNameEn').value = appSettings.companyNameEn;
    document.getElementById('cfgPhone').value = appSettings.phone;
    document.getElementById('cfgEmail').value = appSettings.email;
    document.getElementById('cfgAddress').value = appSettings.address;
    document.getElementById('cfgWhatsapp').value = appSettings.whatsapp;
    document.getElementById('cfgWebsite').value = appSettings.website;
    document.getElementById('cfgFooterText').value = appSettings.footerText;
    document.getElementById('cfgInstructions').value = appSettings.instructions;

    document.getElementById('docAgencyName').innerText = appSettings.companyNameAr;
    document.getElementById('docAgencySubName').innerText = appSettings.companyNameEn;
    document.getElementById('renderPhone').innerHTML = `<i class="fa-solid fa-phone"></i> <span>${appSettings.phone}</span>`;
    document.getElementById('renderEmail').innerHTML = `<i class="fa-solid fa-envelope"></i> <span>${appSettings.email}</span>`;
    document.getElementById('renderAddress').innerHTML = `<i class="fa-solid fa-location-dot"></i> <span>${appSettings.address}</span>`;
    document.getElementById('docFooterText').innerText = appSettings.footerText;

    if (appSettings.logoBase64) {
        const imgHtml = `<img src="${appSettings.logoBase64}" alt="Logo">`;
        document.getElementById('docLogoDynamic').innerHTML = imgHtml;
        document.getElementById('sidebarLogoContainer').innerHTML = imgHtml;
        document.getElementById('cfgLogoPreview').innerHTML = imgHtml;
    }
}

function saveSettings() {
    appSettings.companyNameAr = document.getElementById('cfgCompanyNameAr').value;
    appSettings.companyNameEn = document.getElementById('cfgCompanyNameEn').value;
    appSettings.phone = document.getElementById('cfgPhone').value;
    appSettings.email = document.getElementById('cfgEmail').value;
    appSettings.address = document.getElementById('cfgAddress').value;
    appSettings.whatsapp = document.getElementById('cfgWhatsapp').value;
    appSettings.website = document.getElementById('cfgWebsite').value;
    appSettings.footerText = document.getElementById('cfgFooterText').value;
    appSettings.instructions = document.getElementById('cfgInstructions').value;

    localStorage.setItem('ofoq_settings', JSON.stringify(appSettings));
    applySettingsUI();
    updatePreview();
    showToast('تم حفظ الإعدادات بنجاح ✓');
}

function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        appSettings.logoBase64 = evt.target.result;
        applySettingsUI();
        updatePreview();
        showToast('تم تحميل وتحديث الشعار بنجاح');
    };
    reader.readAsDataURL(file);
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
}

function loadSampleDataIfEmpty() {
    const existing = getStoredBookings();
    if (existing.length === 0) {
        const sampleBooking = {
            id: 'OFOQ-784920',
            tripType: 'round-trip',
            status: 'مؤكد / CONFIRMED',
            pnr: 'ABC123',
            ticketNumber: '072-2401928301',
            reference: 'OFOQ-784920',
            bookingDate: '2026-08-25',
            price: '125000',
            currency: 'DZD',
            checkedBaggage: '2x 23 kg',
            cabinBaggage: '1x 8 kg',
            notes: 'حقائب مسجلة شاملة',
            passengers: [
                { title: 'MR', name: 'MOHAMED ARKADAN', type: 'Adult', passport: 'A29384019', birthDate: '1995-05-12' }
            ],
            flights: [
                {
                    direction: 'outbound', airline: 'Turkish Airlines', flightNo: 'TK653', bookingClass: 'Economy (Y)',
                    depAirport: 'ALG - Algiers', depCode: 'ALG', depDate: '2026-08-25', depTime: '18:00', depTerm: 'Terminal 1',
                    arrAirport: 'IST - Istanbul', arrCode: 'IST', arrDate: '2026-08-26', arrTime: '00:15', seat: '14A'
                }
            ]
        };
        saveBookingToStorage(sampleBooking);
    }
}