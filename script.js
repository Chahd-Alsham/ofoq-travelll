/* ==========================================
   StageLight Pro - Core JavaScript Engine
   ================ ========================== */

// State Management & LocalStorage Keys
const STORAGE_KEY_PROJECTS = 'stagelight_projects_v1';
const STORAGE_KEY_WAREHOUSE = 'stagelight_warehouse_v1';
const STORAGE_KEY_LANG = 'stagelight_lang_v1';

let state = {
    language: localStorage.getItem(STORAGE_KEY_LANG) || 'ar',
    warehouse: JSON.parse(localStorage.getItem(STORAGE_KEY_WAREHOUSE)) || [
        { id: 'eq_1', name: 'Shark Beam 450', brand: 'Light Sky', model: '450W', type: 'Beam', qty: 21, notes: 'Main moving heads' },
        { id: 'eq_2', name: 'Titan Tube', brand: 'Astera', model: 'Titan', type: 'LED Tube', qty: 16, notes: 'Wireless IP65' },
        { id: 'eq_3', name: 'RGBWAUV PAR', brand: 'Generic', model: 'PAR', type: 'PAR', qty: 33, notes: 'Wash lighting' },
        { id: 'eq_4', name: 'Blinder', brand: 'Showtec', model: '2-Lite', type: 'Blinder', qty: 8, notes: 'Audience light' },
        { id: 'eq_5', name: 'DMX Cable 5pin', brand: 'ProCab', model: '10m', type: 'Cable', qty: 50, notes: 'Data links' }
    ],
    projects: JSON.parse(localStorage.getItem(STORAGE_KEY_PROJECTS)) || [
        {
            id: 'proj_1',
            name: 'Riyadh Music Festival 2026',
            client: 'General Entertainment Authority',
            venue: 'Boulevard World Stage A',
            eventDate: '2026-11-15',
            eventTime: '20:00',
            setupDate: '2026-11-13',
            notes: 'Main outdoor concert production setup.',
            currentVersionId: 'v_1_1',
            versions: [
                {
                    id: 'v_1_1',
                    name: 'Version 1 - Initial Draft',
                    date: '2026-09-20',
                    notes: 'Initial preliminary design layout',
                    equipment: [
                        { warehouseId: 'eq_1', requiredQty: 18, notes: 'Main Truss' },
                        { warehouseId: 'eq_2', requiredQty: 12, notes: 'Stage framing' },
                        { warehouseId: 'eq_3', requiredQty: 24, notes: 'Floor wash' }
                    ]
                }
            ]
        }
    ],
    activeTab: 'projects', // 'projects', 'warehouse', 'project-detail'
    currentProjectId: null,
    currentVersionId: null
};

// Translations Dictionary
const i18n = {
    ar: {
        appTitle: 'StageLight Pro',
        appSubtitle: 'إدارة مشاريع ومعدات الإضاءة',
        tabProjects: 'المشاريع',
        tabWarehouse: 'مستودع المعدات',
        projectsTitle: 'مشاريع الإضاءة',
        projectsSubtitle: 'إدارة وتنظيم كافة الفعاليات والعروض الحية',
        addProjectBtn: 'إضافة مشروع جديد',
        warehouseTitle: 'مستودع المعدات الرئيسي',
        warehouseSubtitle: 'إدارة الأجهزة والمعدات المتوفرة لديك فعلياً',
        addEquipmentBtn: 'إضافة معدة للمستودع',
        searchProjectsPlaceholder: 'البحث في المشاريع (الاسم، المكان)...',
        searchWarehousePlaceholder: 'ابحث بالاسم، الموديل، الشركة أو النوع...',
        allTypes: 'جميع الأنواع',
        thEquipment: 'المعدة / الجهاز',
        thBrand: 'الشركة',
        thModel: 'الموديل',
        thType: 'النوع',
        thAvailable: 'متوفر',
        thNotes: 'ملاحظات',
        thActions: 'الإجراءات',
        thRequired: 'المطلوب',
        thWarehouseAvailable: 'المستودع',
        thShortage: 'النقص',
        thStatus: 'الحالة',
        backToProjects: 'العودة للمشاريع',
        editProject: 'تعديل المشروع',
        printSheet: 'طباعة / PDF',
        duplicateProject: 'نسخ المشروع',
        lblVenue: 'المكان:',
        lblEventDate: 'التاريخ:',
        lblEventTime: 'الوقت:',
        totalProjectEquip: 'إجمالي معدات المشروع',
        newVersionBtn: '+ نسخة جديدة (Version)',
        addEquipToProject: '+ إضافة معدات للنسخة',
        editVersion: 'تعديل النسخة',
        deleteVersion: 'حذف النسخة',
        modalAddProject: 'إضافة مشروع جديد',
        modalEditProject: 'تعديل المشروع',
        modalAddEquip: 'إضافة معدة للمستودع',
        modalEditEquip: 'تعديل المعدة',
        modalAddProjEquip: 'إضافة معدة للمشروع من المستودع',
        modalNewVersion: 'إنشاء نسخة جديدة (Version)',
        modalEditVersion: 'تعديل معلومات النسخة',
        lblProjectName: 'اسم المشروع *',
        lblClientName: 'اسم العميل (اختياري)',
        lblClient: 'العميل',
        lblSetupDate: 'تاريخ التركيب',
        lblNotes: 'ملاحظات',
        lblEquipName: 'اسم الجهاز / المعدة *',
        lblBrand: 'الشركة المصنعة (Brand)',
        lblModel: 'الموديل',
        lblType: 'النوع *',
        lblQuantity: 'الكمية المتوفرة *',
        lblSelectEquip: 'اختر المعدة *',
        lblAvailableInWarehouse: 'الكمية المتوفرة في المستودع:',
        lblRequiredQty: 'الكمية المطلوبة للمشروع *',
        lblProjectEquipNotes: 'ملاحظات خاصة بالمشروع (اختياري)',
        lblVersionName: 'اسم النسخة / الوصف *',
        btnCancel: 'إلغاء',
        btnSaveProject: 'حفظ المشروع',
        btnSaveEquip: 'حفظ المعدة',
        btnSave: 'حفظ',
        btnAdd: 'إضافة',
        btnCreate: 'إنشاء',
        statusFull: 'متوفر بالكامل',
        statusPartial: 'متوفر جزئياً',
        statusNone: 'غير متوفر',
        confirmDeleteProject: 'هل أنت متأكد من حذف هذا المشروع؟',
        confirmDeleteEquip: 'هل أنت متأكد من حذف هذه المعدة من المستودع؟',
        confirmDeleteVersion: 'هل أنت متأكد من حذف هذه النسخة؟',
        exportBackup: 'تصدير النسخة الاحتياطية',
        importBackup: 'استعادة نسخة احتياطية'
    },
    en: {
        appTitle: 'StageLight Pro',
        appSubtitle: 'Event Lighting Management',
        tabProjects: 'Projects',
        tabWarehouse: 'Warehouse',
        projectsTitle: 'Lighting Projects',
        projectsSubtitle: 'Manage and organize all live shows and events',
        addProjectBtn: 'Add New Project',
        warehouseTitle: 'Master Equipment Warehouse',
        warehouseSubtitle: 'Manage your owned gear and inventory',
        addEquipmentBtn: 'Add Equipment',
        searchProjectsPlaceholder: 'Search projects by name, venue...',
        searchWarehousePlaceholder: 'Search by name, model, brand or type...',
        allTypes: 'All Types',
        thEquipment: 'Equipment',
        thBrand: 'Brand',
        thModel: 'Model',
        thType: 'Type',
        thAvailable: 'Available',
        thNotes: 'Notes',
        thActions: 'Actions',
        thRequired: 'Required',
        thWarehouseAvailable: 'Warehouse',
        thShortage: 'Shortage',
        thStatus: 'Status',
        backToProjects: 'Back to Projects',
        editProject: 'Edit Project',
        printSheet: 'Print / PDF',
        duplicateProject: 'Duplicate',
        lblVenue: 'Venue:',
        lblEventDate: 'Date:',
        lblEventTime: 'Time:',
        totalProjectEquip: 'Total Project Equipment',
        newVersionBtn: '+ New Version',
        addEquipToProject: '+ Add Equipment to Version',
        editVersion: 'Edit Version',
        deleteVersion: 'Delete Version',
        modalAddProject: 'Add New Project',
        modalEditProject: 'Edit Project',
        modalAddEquip: 'Add Equipment to Warehouse',
        modalEditEquip: 'Edit Equipment',
        modalAddProjEquip: 'Add Equipment from Warehouse',
        modalNewVersion: 'Create New Version',
        modalEditVersion: 'Edit Version Info',
        lblProjectName: 'Project Name *',
        lblClientName: 'Client Name (Optional)',
        lblClient: 'Client',
        lblSetupDate: 'Setup Date',
        lblNotes: 'Notes',
        lblEquipName: 'Equipment Name *',
        lblBrand: 'Brand',
        lblModel: 'Model',
        lblType: 'Type *',
        lblQuantity: 'Available Quantity *',
        lblSelectEquip: 'Select Equipment *',
        lblAvailableInWarehouse: 'Available in Warehouse:',
        lblRequiredQty: 'Required Quantity *',
        lblProjectEquipNotes: 'Project-specific Notes (Optional)',
        lblVersionName: 'Version Name / Description *',
        btnCancel: 'Cancel',
        btnSaveProject: 'Save Project',
        btnSaveEquip: 'Save Equipment',
        btnSave: 'Save',
        btnAdd: 'Add',
        btnCreate: 'Create',
        statusFull: 'Fully Available',
        statusPartial: 'Partially Available',
        statusNone: 'Not Available',
        confirmDeleteProject: 'Are you sure you want to delete this project?',
        confirmDeleteEquip: 'Are you sure you want to delete this equipment?',
        confirmDeleteVersion: 'Are you sure you want to delete this version?',
        exportBackup: 'Export Backup',
        importBackup: 'Import Backup'
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    applyLanguage();
    renderProjects();
    renderWarehouse();
    populateWarehouseTypeFilter();
    initDataMenu();
});

/* ==========================================
   DATA MENU (iOS-safe: click based, NOT hover)
   ========================================== */
function initDataMenu() {
    document.addEventListener('click', (e) => {
        const wrapper = document.getElementById('dataMenuWrapper');
        if (!wrapper) return;
        // أغلق القائمة عند النقر خارجها
        if (!wrapper.contains(e.target)) closeDataMenu();
    });

    // أغلق القائمة عند الضغط على Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDataMenu();
    });

    // إعادة ضبط الحالة عند تدوير الشاشة أو تغيّر حجم النافذة
    window.addEventListener('resize', closeDataMenu);
    window.addEventListener('orientationchange', () => {
        setTimeout(closeDataMenu, 150);
    });
}

function toggleDataMenu(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    const menu = document.getElementById('dataMenu');
    if (!menu) return;
    const isHidden = menu.classList.contains('hidden');
    if (isHidden) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
    syncDataMenuA11y();
}

function closeDataMenu() {
    const menu = document.getElementById('dataMenu');
    if (menu) menu.classList.add('hidden');
    syncDataMenuA11y();
}

function syncDataMenuA11y() {
    const menu = document.getElementById('dataMenu');
    const btn = document.getElementById('dataMenuBtn');
    if (!menu || !btn) return;
    btn.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
}

// Save State to LocalStorage
function persistData() {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(state.projects));
    localStorage.setItem(STORAGE_KEY_WAREHOUSE, JSON.stringify(state.warehouse));
    localStorage.setItem(STORAGE_KEY_LANG, state.language);
}

// Language Toggle & Application
function toggleLanguage() {
    state.language = state.language === 'ar' ? 'en' : 'ar';
    persistData();
    applyLanguage();
}

function applyLanguage() {
    const root = document.getElementById('htmlRoot');
    root.setAttribute('lang', state.language);
    root.setAttribute('dir', state.language === 'ar' ? 'rtl' : 'ltr');
    document.getElementById('langBtnText').innerText = state.language === 'ar' ? 'EN' : 'عربي';

    // Update all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[state.language][key]) {
            el.innerText = i18n[state.language][key];
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (i18n[state.language][key]) {
            el.placeholder = i18n[state.language][key];
        }
    });

    if (state.activeTab === 'projects') renderProjects();
    if (state.activeTab === 'warehouse') renderWarehouse();
    if (state.activeTab === 'project-detail') renderProjectDetailView();
}

// Navigation Tabs Switcher
function switchTab(tabName) {
    state.activeTab = tabName;
    // إعادة التمرير لأعلى عند تبديل التبويب (مهم على الجوال بعد فتح نافذة من أسفل)
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.getElementById('tab-content-projects').classList.add('hidden');
    document.getElementById('tab-content-warehouse').classList.add('hidden');
    document.getElementById('tab-content-project-detail').classList.add('hidden');

    // Desktop nav active styling
    document.getElementById('nav-projects').className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800";
    document.getElementById('nav-warehouse').className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800";

    // Mobile nav active styling
    document.getElementById('mobile-nav-projects').className = "flex-1 py-2 text-center text-xs font-semibold text-slate-400 border-b-2 border-transparent";
    document.getElementById('mobile-nav-warehouse').className = "flex-1 py-2 text-center text-xs font-semibold text-slate-400 border-b-2 border-transparent";

    if (tabName === 'projects') {
        document.getElementById('tab-content-projects').classList.remove('hidden');
        document.getElementById('nav-projects').className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-brand-600 text-white shadow";
        document.getElementById('mobile-nav-projects').className = "flex-1 py-2 text-center text-xs font-semibold text-brand-400 border-b-2 border-brand-500";
        renderProjects();
    } else if (tabName === 'warehouse') {
        document.getElementById('tab-content-warehouse').classList.remove('hidden');
        document.getElementById('nav-warehouse').className = "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 bg-brand-600 text-white shadow";
        document.getElementById('mobile-nav-warehouse').className = "flex-1 py-2 text-center text-xs font-semibold text-brand-400 border-b-2 border-brand-500";
        renderWarehouse();
    } else if (tabName === 'project-detail') {
        document.getElementById('tab-content-project-detail').classList.remove('hidden');
        renderProjectDetailView();
    }
}

// Modal Controllers
function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
    // منع تمرير الصفحة خلف النافذة على الجوال (يمنع الانزلاق عند اللمس)
    document.body.classList.add('modal-open');
    if (modalId === 'projectModal') {
        document.getElementById('projectForm').reset();
        document.getElementById('projectId').value = '';
        document.getElementById('projectModalTitle').innerText = i18n[state.language].modalAddProject;
    }
    if (modalId === 'equipmentModal') {
        document.getElementById('equipmentForm').reset();
        document.getElementById('equipId').value = '';
        document.getElementById('equipmentModalTitle').innerText = i18n[state.language].modalAddEquip;
    }
    if (modalId === 'addProjectEquipModal') {
        document.getElementById('addProjectEquipForm').reset();
        populateWarehouseSelectForProject();
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    // فك قفل تمرير الخلفية فقط إذا لم تبقَ أي نافذة مفتوحة
    const anyOpen = document.querySelector('.modal-backdrop:not(.hidden)');
    if (!anyOpen) document.body.classList.remove('modal-open');
}

/* ==========================================
   1. WAREHOUSE MANAGEMENT
   ========================================== */
function renderWarehouse() {
    const query = document.getElementById('warehouseSearchInput').value.toLowerCase();
    const typeFilter = document.getElementById('warehouseTypeFilter').value;
    const tbody = document.getElementById('warehouseTableBody');
    tbody.innerHTML = '';

    const filtered = state.warehouse.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(query) || 
                             item.brand.toLowerCase().includes(query) || 
                             item.model.toLowerCase().includes(query) || 
                             item.type.toLowerCase().includes(query);
        const matchesType = !typeFilter || item.type === typeFilter;
        return matchesQuery && matchesType;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-500">لا توجد معدات مطابقة للبحث</td></tr>`;
        return;
    }

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-950/40 transition";
        tr.innerHTML = `
            <td class="p-4 font-bold text-white">${item.name}</td>
            <td class="p-4 text-slate-300">${item.brand || '—'}</td>
            <td class="p-4 text-slate-300">${item.model || '—'}</td>
            <td class="p-4"><span class="px-2 py-1 rounded-md bg-slate-800 text-xs text-brand-400 font-semibold">${item.type}</span></td>
            <td class="p-4 font-black text-brand-400 text-base">${item.qty}</td>
            <td class="p-4 text-slate-400 text-xs">${item.notes || '—'}</td>
            <td class="p-4 text-center">
                <div class="flex items-center justify-center space-x-2 space-x-reverse">
                    <button onclick="editEquipment('${item.id}')" class="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="تعديل"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteEquipment('${item.id}')" class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition" title="حذف"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openEquipmentModal() {
    openModal('equipmentModal');
}

function saveEquipment(event) {
    event.preventDefault();
    const id = document.getElementById('equipId').value;
    const name = document.getElementById('eqName').value.trim();
    const brand = document.getElementById('eqBrand').value.trim();
    const model = document.getElementById('eqModel').value.trim();
    const type = document.getElementById('eqType').value.trim();
    const qty = parseInt(document.getElementById('eqQty').value) || 0;
    const notes = document.getElementById('eqNotes').value.trim();

    if (id) {
        const item = state.warehouse.find(e => e.id === id);
        if (item) {
            item.name = name;
            item.brand = brand;
            item.model = model;
            item.type = type;
            item.qty = qty;
            item.notes = notes;
        }
    } else {
        const newItem = {
            id: 'eq_' + Date.now(),
            name, brand, model, type, qty, notes
        };
        state.warehouse.push(newItem);
    }

    persistData();
    closeModal('equipmentModal');
    renderWarehouse();
    populateWarehouseTypeFilter();
}

function editEquipment(id) {
    const item = state.warehouse.find(e => e.id === id);
    if (!item) return;
    openModal('equipmentModal');
    document.getElementById('equipmentModalTitle').innerText = i18n[state.language].modalEditEquip;
    document.getElementById('equipId').value = item.id;
    document.getElementById('eqName').value = item.name;
    document.getElementById('eqBrand').value = item.brand;
    document.getElementById('eqModel').value = item.model;
    document.getElementById('eqType').value = item.type;
    document.getElementById('eqQty').value = item.qty;
    document.getElementById('eqNotes').value = item.notes;
}

function deleteEquipment(id) {
    if (confirm(i18n[state.language].confirmDeleteEquip)) {
        state.warehouse = state.warehouse.filter(e => e.id !== id);
        persistData();
        renderWarehouse();
        populateWarehouseTypeFilter();
    }
}

function populateWarehouseTypeFilter() {
    const select = document.getElementById('warehouseTypeFilter');
    const currentVal = select.value;
    const types = [...new Set(state.warehouse.map(e => e.type))];
    
    select.innerHTML = `<option value="">${i18n[state.language].allTypes}</option>`;
    types.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.innerText = t;
        if (t === currentVal) opt.selected = true;
        select.appendChild(opt);
    });
}


/* ==========================================
   2. PROJECTS MANAGEMENT
   ========================================== */
function renderProjects() {
    const query = document.getElementById('projectSearchInput').value.toLowerCase();
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    const filtered = state.projects.filter(p => 
        p.name.toLowerCase().includes(query) || p.venue.toLowerCase().includes(query) || (p.client && p.client.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-span-full py-12 text-center text-slate-500">لا توجد مشاريع حالياً. اضغط على "إضافة مشروع جديد" للبدء.</div>`;
        return;
    }

    filtered.forEach(proj => {
        const currentVersion = proj.versions.find(v => v.id === proj.currentVersionId) || proj.versions[0];
        const totalEquipQty = currentVersion ? currentVersion.equipment.reduce((sum, item) => sum + item.requiredQty, 0) : 0;
        const equipTypesCount = currentVersion ? currentVersion.equipment.length : 0;

        const card = document.createElement('div');
        card.className = "bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-brand-500/50 transition flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start mb-3">
                    <span class="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 font-bold border border-brand-500/20">${currentVersion ? currentVersion.name : 'V1'}</span>
                    <span class="text-xs text-slate-400"><i class="fa-solid fa-calendar ml-1 text-brand-400"></i>${proj.eventDate}</span>
                </div>
                <h3 onclick="openProjectDetail('${proj.id}')" class="text-xl font-bold text-white hover:text-brand-400 cursor-pointer transition mb-1">${proj.name}</h3>
                <p class="text-xs text-slate-400 mb-4"><i class="fa-solid fa-location-dot ml-1 text-brand-400"></i>${proj.venue}</p>
                
                <div class="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-4 text-xs">
                    <div><span class="text-slate-500 block">أنواع المعدات:</span><strong class="text-slate-200 text-sm">${equipTypesCount}</strong></div>
                    <div><span class="text-slate-500 block">إجمالي الكمية:</span><strong class="text-brand-400 text-sm">${totalEquipQty}</strong></div>
                </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-slate-800/80 gap-2">
                <button onclick="openProjectDetail('${proj.id}')" class="flex-1 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow transition flex items-center justify-center space-x-1 space-x-reverse">
                    <i class="fa-solid fa-folder-open"></i><span>فتح</span>
                </button>
                <button onclick="editProject('${proj.id}')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="تعديل"><i class="fa-solid fa-pen text-xs"></i></button>
                <button onclick="duplicateProject('${proj.id}')" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition" title="نسخ المشروع"><i class="fa-solid fa-copy text-xs"></i></button>
                <button onclick="deleteProject('${proj.id}')" class="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition" title="حذف"><i class="fa-solid fa-trash text-xs"></i></button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function saveProject(event) {
    event.preventDefault();
    const id = document.getElementById('projectId').value;
    const name = document.getElementById('projName').value.trim();
    const client = document.getElementById('projClient').value.trim();
    const venue = document.getElementById('projVenue').value.trim();
    const eventDate = document.getElementById('projDate').value;
    const eventTime = document.getElementById('projTime').value;
    const setupDate = document.getElementById('projSetupDate').value;
    const notes = document.getElementById('projNotes').value.trim();

    if (id) {
        const proj = state.projects.find(p => p.id === id);
        if (proj) {
            proj.name = name;
            proj.client = client;
            proj.venue = venue;
            proj.eventDate = eventDate;
            proj.eventTime = eventTime;
            proj.setupDate = setupDate;
            proj.notes = notes;
            persistData();
            closeModal('projectModal');
            if (state.activeTab === 'project-detail' && state.currentProjectId === id) {
                renderProjectDetailView();
            } else {
                renderProjects();
            }
        }
    } else {
        const newProjId = 'proj_' + Date.now();
        const firstVersionId = 'v_' + Date.now();
        const newProj = {
            id: newProjId,
            name, client, venue, eventDate, eventTime, setupDate, notes,
            currentVersionId: firstVersionId,
            versions: [
                {
                    id: firstVersionId,
                    name: 'Version 1 - Initial',
                    date: new Date().toISOString().split('T')[0],
                    notes: 'Initial setup',
                    equipment: []
                }
            ]
        };
        state.projects.push(newProj);
        persistData();
        closeModal('projectModal');
        openProjectDetail(newProjId);
    }
}

function editProject(id) {
    const proj = state.projects.find(p => p.id === id);
    if (!proj) return;
    openModal('projectModal');
    document.getElementById('projectModalTitle').innerText = i18n[state.language].modalEditProject;
    document.getElementById('projectId').value = proj.id;
    document.getElementById('projName').value = proj.name;
    document.getElementById('projClient').value = proj.client || '';
    document.getElementById('projVenue').value = proj.venue;
    document.getElementById('projDate').value = proj.eventDate;
    document.getElementById('projTime').value = proj.eventTime || '';
    document.getElementById('projSetupDate').value = proj.setupDate || '';
    document.getElementById('projNotes').value = proj.notes || '';
}

function openProjectModalForEdit() {
    if (state.currentProjectId) {
        editProject(state.currentProjectId);
    }
}

function deleteProject(id) {
    if (confirm(i18n[state.language].confirmDeleteProject)) {
        state.projects = state.projects.filter(p => p.id !== id);
        persistData();
        if (state.currentProjectId === id) {
            switchTab('projects');
        } else {
            renderProjects();
        }
    }
}

function duplicateProject(id) {
    const proj = state.projects.find(p => p.id === id);
    if (!proj) return;
    const newId = 'proj_' + Date.now();
    const cloned = JSON.parse(JSON.stringify(proj));
    cloned.id = newId;
    cloned.name = proj.name + ' (Copy)';
    state.projects.push(cloned);
    persistData();
    renderProjects();
}


/* ==========================================
   3. PROJECT DETAIL & VERSIONS VIEW
   ========================================== */
function openProjectDetail(projId) {
    state.currentProjectId = projId;
    const proj = state.projects.find(p => p.id === projId);
    if (!proj) return;
    if (!proj.currentVersionId && proj.versions.length > 0) {
        proj.currentVersionId = proj.versions[0].id;
    }
    state.currentVersionId = proj.currentVersionId;
    switchTab('project-detail');
}

function renderProjectDetailView() {
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;

    // Header Info
    document.getElementById('detailProjectName').innerText = proj.name;
    const clientBadge = document.getElementById('detailClientBadge');
    if (proj.client) {
        clientBadge.innerText = proj.client;
        clientBadge.classList.remove('hidden');
    } else {
        clientBadge.classList.add('hidden');
    }
    document.getElementById('detailProjectNotes').innerText = proj.notes || '';
    document.getElementById('detailVenue').innerText = proj.venue;
    document.getElementById('detailEventDate').innerText = proj.eventDate;
    document.getElementById('detailEventTime').innerText = proj.eventTime || '—';

    // Versions Tabs
    const versionsContainer = document.getElementById('versionsTabsContainer');
    versionsContainer.innerHTML = '';
    proj.versions.forEach(v => {
        const isActive = v.id === state.currentVersionId;
        const btn = document.createElement('button');
        btn.onclick = () => {
            state.currentVersionId = v.id;
            proj.currentVersionId = v.id;
            persistData();
            renderProjectDetailView();
        };
        btn.className = `px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${isActive ? 'bg-brand-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`;
        btn.innerText = v.name;
        versionsContainer.appendChild(btn);
    });

    // Current Version Details
    const currentVersion = proj.versions.find(v => v.id === state.currentVersionId) || proj.versions[0];
    if (currentVersion) {
        state.currentVersionId = currentVersion.id;
        document.getElementById('currentVersionTitle').innerText = currentVersion.name;
        document.getElementById('currentVersionNotes').innerText = currentVersion.notes || '';

        // Render Equipment Table
        const tbody = document.getElementById('projectEquipmentTableBody');
        tbody.innerHTML = '';
        let totalQty = 0;

        if (currentVersion.equipment.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" class="p-8 text-center text-slate-500">لا توجد معدات مضافة لهذه النسخة. اضغط على "إضافة معدات للنسخة".</td></tr>`;
        } else {
            currentVersion.equipment.forEach((item, index) => {
                const warehouseItem = state.warehouse.find(w => w.id === item.warehouseId);
                const warehouseQty = warehouseItem ? warehouseItem.qty : 0;
                const shortage = Math.max(0, item.requiredQty - warehouseQty);
                totalQty += item.requiredQty;

                let statusBadge = '';
                if (shortage === 0) {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">متوفر بالكامل</span>`;
                } else if (item.requiredQty > shortage) {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">متوفر جزئياً</span>`;
                } else {
                    statusBadge = `<span class="px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold">غير متوفر</span>`;
                }

                const tr = document.createElement('tr');
                tr.className = "hover:bg-slate-950/40 transition";
                tr.innerHTML = `
                    <td class="p-4 font-bold text-white">${warehouseItem ? warehouseItem.name : 'معدة محذوفة'}</td>
                    <td class="p-4 text-slate-300">${warehouseItem ? warehouseItem.brand : '—'}</td>
                    <td class="p-4 text-slate-300">${warehouseItem ? warehouseItem.model : '—'}</td>
                    <td class="p-4"><span class="px-2 py-1 rounded-md bg-slate-800 text-xs text-brand-400 font-semibold">${warehouseItem ? warehouseItem.type : '—'}</span></td>
                    <td class="p-4 font-black text-brand-400 text-base">
                        <input type="number" min="1" value="${item.requiredQty}" onchange="updateProjectEquipQty('${currentVersion.id}', '${item.warehouseId}', this.value)" class="w-20 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-center text-white focus:outline-none focus:border-brand-500">
                    </td>
                    <td class="p-4 font-bold text-slate-200">${warehouseQty}</td>
                    <td class="p-4 font-bold ${shortage > 0 ? 'text-red-400' : 'text-slate-500'}">${shortage > 0 ? '+' + shortage : '0'}</td>
                    <td class="p-4">${statusBadge}</td>
                    <td class="p-4">
                        <input type="text" value="${item.notes || ''}" onchange="updateProjectEquipNotes('${currentVersion.id}', '${item.warehouseId}', this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-brand-500" placeholder="ملاحظة...">
                    </td>
                    <td class="p-4 text-center">
                        <button onclick="removeEquipmentFromProject('${currentVersion.id}', '${item.warehouseId}')" class="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition" title="حذف"><i class="fa-solid fa-trash text-xs"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        document.getElementById('detailTotalQty').innerText = totalQty;
        document.getElementById('detailTypesCount').innerText = `${currentVersion.equipment.length} أنواع معدات`;
    }
}

// Add Equipment to Project Flow
function openAddProjectEquipModal() {
    openModal('addProjectEquipModal');
}

function populateWarehouseSelectForProject() {
    const select = document.getElementById('selectWarehouseItem');
    select.innerHTML = '';
    state.warehouse.forEach(item => {
        const opt = document.createElement('option');
        opt.value = item.id;
        opt.setAttribute('data-qty', item.qty);
        opt.innerText = `${item.name} (${item.brand} - ${item.type}) [متوفر: ${item.qty}]`;
        select.appendChild(opt);
    });
    onWarehouseItemSelected();
}

function onWarehouseItemSelected() {
    const select = document.getElementById('selectWarehouseItem');
    const selectedOpt = select.options[select.selectedIndex];
    if (selectedOpt) {
        const availableQty = parseInt(selectedOpt.getAttribute('data-qty')) || 0;
        document.getElementById('modalAvailableQtyDisplay').innerText = availableQty;
        const reqInput = document.getElementById('projEquipReqQty');
        reqInput.max = availableQty * 5; // Allow warning but don't hard block input
        checkQuantityWarning();
    }
}

function checkQuantityWarning() {
    const select = document.getElementById('selectWarehouseItem');
    const selectedOpt = select.options[select.selectedIndex];
    if (!selectedOpt) return;
    const availableQty = parseInt(selectedOpt.getAttribute('data-qty')) || 0;
    const requestedQty = parseInt(document.getElementById('projEquipReqQty').value) || 0;
    const warningMsg = document.getElementById('quantityWarningMsg');

    if (requestedQty > availableQty) {
        const shortage = requestedQty - availableQty;
        warningMsg.innerText = `تنبيه: الكمية المطلوبة (${requestedQty}) أكبر من المتوفر في المستودع (${availableQty}). النقص: ${shortage}`;
        warningMsg.classList.remove('hidden');
    } else {
        warningMsg.classList.add('hidden');
    }
}

function confirmAddEquipmentToProject(event) {
    event.preventDefault();
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    const currentVersion = proj.versions.find(v => v.id === state.currentVersionId);
    if (!currentVersion) return;

    const warehouseId = document.getElementById('selectWarehouseItem').value;
    const requiredQty = parseInt(document.getElementById('projEquipReqQty').value) || 0;
    const notes = document.getElementById('projEquipNotes').value.trim();

    // Check if equipment already exists in this version
    const existing = currentVersion.equipment.find(e => e.warehouseId === warehouseId);
    if (existing) {
        existing.requiredQty += requiredQty;
        if (notes) existing.notes = notes;
    } else {
        currentVersion.equipment.push({ warehouseId, requiredQty, notes });
    }

    persistData();
    closeModal('addProjectEquipModal');
    renderProjectDetailView();
}

function updateProjectEquipQty(versionId, warehouseId, newQty) {
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    const version = proj.versions.find(v => v.id === versionId);
    if (!version) return;
    const item = version.equipment.find(e => e.warehouseId === warehouseId);
    if (item) {
        item.requiredQty = Math.max(1, parseInt(newQty) || 1);
        persistData();
        renderProjectDetailView();
    }
}

function updateProjectEquipNotes(versionId, warehouseId, newNotes) {
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    const version = proj.versions.find(v => v.id === versionId);
    if (!version) return;
    const item = version.equipment.find(e => e.warehouseId === warehouseId);
    if (item) {
        item.notes = newNotes;
        persistData();
    }
}

function removeEquipmentFromProject(versionId, warehouseId) {
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    const version = proj.versions.find(v => v.id === versionId);
    if (!version) return;
    version.equipment = version.equipment.filter(e => e.warehouseId !== warehouseId);
    persistData();
    renderProjectDetailView();
}

// Versions Management
function openNewVersionModal() {
    document.getElementById('newVersionNameInput').value = `Version ${(state.projects.find(p => p.id === state.currentProjectId)?.versions.length || 0) + 1}`;
    document.getElementById('newVersionNotesInput').value = '';
    openModal('newVersionModal');
}

function createNewVersion(event) {
    event.preventDefault();
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;

    const name = document.getElementById('newVersionNameInput').value.trim();
    const notes = document.getElementById('newVersionNotesInput').value.trim();
    const newVersionId = 'v_' + Date.now();

    // Deep clone equipment from current version as starting point
    const currentVersion = proj.versions.find(v => v.id === state.currentVersionId) || proj.versions[proj.versions.length - 1];
    const clonedEquip = currentVersion ? JSON.parse(JSON.stringify(currentVersion.equipment)) : [];

    const newVersion = {
        id: newVersionId,
        name,
        date: new Date().toISOString().split('T')[0],
        notes,
        equipment: clonedEquip
    };

    proj.versions.push(newVersion);
    proj.currentVersionId = newVersionId;
    state.currentVersionId = newVersionId;
    persistData();
    closeModal('newVersionModal');
    renderProjectDetailView();
}

function editCurrentVersionMeta() {
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    const version = proj.versions.find(v => v.id === state.currentVersionId);
    if (!version) return;

    document.getElementById('editVersionNameInput').value = version.name;
    document.getElementById('editVersionNotesInput').value = version.notes || '';
    openModal('editVersionModal');
}

function saveEditedVersionMeta(event) {
    event.preventDefault();
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    const version = proj.versions.find(v => v.id === state.currentVersionId);
    if (!version) return;

    version.name = document.getElementById('editVersionNameInput').value.trim();
    version.notes = document.getElementById('editVersionNotesInput').value.trim();
    persistData();
    closeModal('editVersionModal');
    renderProjectDetailView();
}

function deleteCurrentVersion() {
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    if (proj.versions.length <= 1) {
        alert('لا يمكن حذف النسخة الوحيدة المتبقية في المشروع.');
        return;
    }
    if (confirm(i18n[state.language].confirmDeleteVersion)) {
        proj.versions = proj.versions.filter(v => v.id !== state.currentVersionId);
        proj.currentVersionId = proj.versions[0].id;
        state.currentVersionId = proj.currentVersionId;
        persistData();
        renderProjectDetailView();
    }
}


/* ==========================================
   4. PROFESSIONAL A4 PRINT & PDF ENGINE
   ========================================== */
function printCurrentVersion() {
    const proj = state.projects.find(p => p.id === state.currentProjectId);
    if (!proj) return;
    const version = proj.versions.find(v => v.id === state.currentVersionId);
    if (!version) return;

    const printArea = document.getElementById('printArea');
    if (!printArea) return;

    let rowsHTML = '';
    let totalReq = 0;

    version.equipment.forEach((item, idx) => {
        const wh = state.warehouse.find(w => w.id === item.warehouseId);
        const whQty = wh ? wh.qty : 0;
        const shortage = Math.max(0, item.requiredQty - whQty);
        totalReq += item.requiredQty;

        rowsHTML += `
            <tr style="border-bottom: 1px solid #edf2f7; transition: background 0.2s;">
                <td style="padding: 12px 10px; text-align: center; font-weight: 700; color: #4a5568;">${idx + 1}</td>
                <td style="padding: 12px 10px; font-weight: 700; color: #1a202c;">${wh ? wh.name : '—'}</td>
                <td style="padding: 12px 10px; color: #4a5568;">${wh ? wh.brand : '—'}</td>
                <td style="padding: 12px 10px; color: #4a5568;">${wh ? wh.model : '—'}</td>
                <td style="padding: 12px 10px; color: #4a5568;">${wh ? wh.type : '—'}</td>
                <td style="padding: 12px 10px; text-align: center; font-weight: 800; color: #2f855a;">${item.requiredQty}</td>
                <td style="padding: 12px 10px; text-align: center; color: #4a5568; font-weight: 600;">${whQty}</td>
                <td style="padding: 12px 10px; text-align: center; color: ${shortage > 0 ? '#e53e3e' : '#718096'}; font-weight: 800;">
                    ${shortage > 0 ? `+${shortage}` : '0'}
                </td>
                <td style="padding: 12px 10px; color: #718096; font-size: 11px;">${item.notes || '—'}</td>
            </tr>
        `;
    });

    const isRtl = state.language === 'ar';

    printArea.innerHTML = `
        <div style="font-family: 'Cairo', 'Inter', sans-serif; padding: 30px; color: #1a202c; direction: ${isRtl ? 'rtl' : 'ltr'}; background: #ffffff;">
            
            <!-- Header احترافي وفاخر -->
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #1a202c; padding-bottom: 20px; margin-bottom: 25px;">
                <div>
                    <h1 style="font-size: 22px; font-weight: 900; margin: 0; color: #1a202c; letter-spacing: 0.5px;">STAGE LIGHTING SPECIFICATION</h1>
                    <p style="font-size: 11px; color: #718096; margin: 4px 0 0 0; font-weight: 600;">StageLight Pro — Professional Event Equipment Sheet</p>
                </div>
                <div style="text-align: ${isRtl ? 'left' : 'right'};">
                    <h2 style="font-size: 15px; font-weight: 800; margin: 0; color: #2f855a;">${proj.name}</h2>
                    <p style="font-size: 11px; color: #4a5568; margin: 3px 0;">Version: <strong>${version.name}</strong></p>
                    <p style="font-size: 11px; color: #718096; margin: 0;">Date: ${new Date().toISOString().split('T')[0]}</p>
                </div>
            </div>

            <!-- Project Info Grid (بطاقة معلومات المشروع الأنيقة) -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; background: #fdfbf7; border: 1px solid #e2d9c5; padding: 15px; border-radius: 8px; margin-bottom: 25px; font-size: 12px;">
                <div><strong style="color: #4a5568;">Client:</strong> <span style="color: #1a202c; font-weight: 600;">${proj.client || '—'}</span></div>
                <div><strong style="color: #4a5568;">Venue:</strong> <span style="color: #1a202c; font-weight: 600;">${proj.venue || '—'}</span></div>
                <div><strong style="color: #4a5568;">Event Date:</strong> <span style="color: #1a202c; font-weight: 600;">${proj.eventDate} (${proj.eventTime || '—'})</span></div>
                <div><strong style="color: #4a5568;">Setup Date:</strong> <span style="color: #1a202c; font-weight: 600;">${proj.setupDate || '—'}</span></div>
                <div><strong style="color: #4a5568;">Total Types:</strong> <span style="color: #1a202c; font-weight: 600;">${version.equipment.length}</span></div>
                <div><strong style="color: #4a5568;">Total Quantity:</strong> <span style="color: #1a202c; font-weight: 600;">${totalReq}</span></div>
            </div>

            <!-- Equipment Table (جدول المعدات الاحترافي) -->
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 25px;">
                <thead>
                    <tr style="background: #1a202c; color: #ffffff; text-align: ${isRtl ? 'right' : 'left'};">
                        <th style="padding: 12px 10px; text-align: center; border-top-right-radius: 6px; border-bottom-right-radius: ${isRtl ? '6px' : '0'}; border-top-left-radius: ${isRtl ? '0' : '6px'};">#</th>
                        <th style="padding: 12px 10px;">Equipment</th>
                        <th style="padding: 12px 10px;">Brand</th>
                        <th style="padding: 12px 10px;">Model</th>
                        <th style="padding: 12px 10px;">Type</th>
                        <th style="padding: 12px 10px; text-align: center;">Required</th>
                        <th style="padding: 12px 10px; text-align: center;">Warehouse</th>
                        <th style="padding: 12px 10px; text-align: center;">Shortage</th>
                        <th style="padding: 12px 10px; border-top-left-radius: 6px; border-bottom-left-radius: ${isRtl ? '0' : '6px'}; border-top-right-radius: ${isRtl ? '6px' : '0'};">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML}
                </tbody>
            </table>

            <!-- Notes Section (قسم الملاحظات إن وُجد) -->
            ${version.notes || proj.notes ? `
                <div style="margin-bottom: 25px; padding: 12px 15px; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 11px; border-left: 4px solid #c5a059;">
                    <strong style="color: #1a202c;">Notes:</strong> <span style="color: #4a5568;">${version.notes || proj.notes}</span>
                </div>
            ` : ''}

            <!-- Footer (تذييل الصفحة ومنطقة التوقيعات أو الاعتماد) -->
            <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #a0aec0; border-top: 1px solid #e2e8f0; padding-top: 15px;">
                <span>StageLight Pro Enterprise System</span>
                <span>Generated automatically via system</span>
            </div>
        </div>
    `;

    window.print();
}
/* ==========================================
   5. BACKUP & RESTORE
   ========================================== */
function exportBackup() {
    closeDataMenu();
    const backupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        warehouse: state.warehouse,
        projects: state.projects,
        language: state.language
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `StageLightPro_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
}

function importBackup(event) {
    closeDataMenu();
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.warehouse && parsed.projects) {
                state.warehouse = parsed.warehouse;
                state.projects = parsed.projects;
                if (parsed.language) state.language = parsed.language;
                persistData();
                applyLanguage();
                renderProjects();
                renderWarehouse();
                alert('تم استعادة البيانات بنجاح!');
            } else {
                alert('ملف النسخة الاحتياطية غير صالح.');
            }
        } catch (err) {
            alert('حدث خطأ أثناء قراءة ملف النسخة الاحتياطية.');
        }
    };
    reader.readAsText(file);
}