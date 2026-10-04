/* ==========================================================================
   android-compat.js — طبقة التوافق مع Android (تطبيق WebView / Capacitor)
   --------------------------------------------------------------------------
   ⚠️ هذا الملف لا يغيّر شيئاً في المتصفح ولا في التصميم:
      كل دالة فيه تخرج فوراً إذا لم نكن داخل تطبيق Android أصلي.
      لا يوجد أي تعديل على CSS أو HTML أو منطق البرنامج أو قالب PDF.

   ما يعالجه:
     1) زر الرجوع في أندرويد  (Modal ← القائمة الجانبية ← القسم السابق ← خروج)
     2) لوحة المفاتيح          (إبقاء الحقل الحالي ظاهراً فوق الكيبورد)
     3) Safe Area               (لا شيء هنا — Capacitor SystemBars يتكفّل بها أصلياً)
     4) window.open            (روابط مثل Gmail داخل WebView لا تُفتح إطلاقاً)
     5) window.print           (WebView لا يطبع؛ نستعمل نفس مسار PDF والمشاركة)
     6) حفظ البيانات           (حفظ فوري قبل إغلاق التطبيق/إخفاءه)
     7) أخطاء غير متوقعة       (تسجيل فقط — بدون شاشة بيضاء)
     8) مؤشر "جاري إنشاء PDF"  (منع التجمّد أثناء إنشاء الملف)
   ========================================================================== */
(function () {
    'use strict';

    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    /* ------------------------------------------------------------------
       1) كشف المنصة وإضافات Capacitor
       ------------------------------------------------------------------ */
    function getCap() { return window.Capacitor || null; }

    function getPlatform() {
        const c = getCap();
        if (!c) return 'web';
        try {
            if (typeof c.getPlatform === 'function') return c.getPlatform();
        } catch (e) { /* تجاهل */ }
        return c.platform || 'web';
    }

    function isNative() {
        const p = getPlatform();
        return p === 'android' || p === 'ios';
    }

    /* إضافة متاحة فعلاً؟ نستخدم isPluginAvailable لتجنّب وكيل وهمي
       (Capacitor.Plugins[name] يُرجع كائناً حتى لو لم تكن الإضافة مثبّتة). */
    function getPlugin(name) {
        const c = getCap();
        if (!c) return null;
        try {
            if (typeof c.isPluginAvailable === 'function' && !c.isPluginAvailable(name)) return null;
        } catch (e) { /* تجاهل */ }
        try {
            if (c.Plugins && c.Plugins[name]) return c.Plugins[name];
        } catch (e) { /* تجاهل */ }
        if (window[name]) return window[name];
        return null;
    }
/* ------------------------------------------------------------------
       2) زر الرجوع
       ------------------------------------------------------------------ */
    function initBackButton() {
        if (!isNative()) return;
        const App = getPlugin('App');
        if (!App || typeof App.addListener !== 'function') return;

        let sections = [];
        let current = null;
        let suppress = false;
        const history = [];

        function collectSections() {
            sections = Array.prototype.slice.call(document.querySelectorAll('.app-section'));
        }

        function activate(id) {
            const sec = document.getElementById(id);
            if (!sec) return;
            try {
                if (typeof window.switchSection === 'function') {
                    window.switchSection(id);
                    return;
                }
            } catch (e) { /* نكمل يدوياً */ }
            sections.forEach(function (s) { s.classList.remove('active'); });
            sec.classList.add('active');
        }

        function highlightNav(id) {
            try {
                document.querySelectorAll('.nav-item').forEach(function (n) {
                    const on = n.getAttribute('data-target') === id;
                    if (on) n.classList.add('active');
                    else n.classList.remove('active');
                });
            } catch (e) { /* تجاهل */ }
        }

        function closeTopOverlay() {
            /* 1) أي Modal مفتوح */
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                modal.classList.remove('active');
                try {
                    if (modal.id === 'airlineModal' && typeof window.closeAirlineModalFunc === 'function') {
                        window.closeAirlineModalFunc();
                    }
                } catch (e) { /* تجاهل */ }
                return true;
            }
            /* 2) القائمة الجانبية على الهاتف */
            const sidebar = document.getElementById('sidebar');
            if (sidebar && sidebar.classList.contains('mobile-open')) {
                sidebar.classList.remove('mobile-open');
                return true;
            }
            return false;
        }

        function onBack() {
            if (closeTopOverlay()) return;

            /* 3) الرجوع إلى القسم السابق */
            if (history.length) {
                const prev = history.pop();
                suppress = true;
                activate(prev);
                highlightNav(prev);
                current = document.getElementById(prev);
                setTimeout(function () {
                    suppress = false;
                    try { window.scrollTo(0, 0); } catch (e) { /* تجاهل */ }
                }, 0);
                return;
            }

            /* 4) في الصفحة الرئيسية ➜ خروج طبيعي */
            try { App.exitApp(); } catch (e) { /* تجاهل */ }
        }

        try {
            App.addListener('backButton', onBack);
        } catch (e) { return; }

        /* مراقبة تغيّر القسم لبناء سجل الرجوع دون لمس script.js */
        function startObserver() {
            collectSections();
            current = sections.filter(function (s) { return s.classList.contains('active'); })[0] || null;
            try {
                const obs = new MutationObserver(function (records) {
                    records.forEach(function (r) {
                        const el = r.target;
                        if (!el.classList.contains('active')) return;
                        if (!el.id) return;
                        if (suppress) { current = el; return; }
                        if (current && current.id === el.id) return;
                        if (current && current.id) {
                            history.push(current.id);
                            if (history.length > 40) history.shift();
                        }
                        current = el;
                    });
                });
                sections.forEach(function (s) {
                    obs.observe(s, { attributes: true, attributeFilter: ['class'] });
                });
            } catch (e) { /* تجاهل */ }
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () { setTimeout(startObserver, 0); });
        } else {
            setTimeout(startObserver, 0);
        }
/* ------------------------------------------------------------------
       3) لوحة المفاتيح — إبقاء الحقل الحالي ظاهراً
       ------------------------------------------------------------------ */
    function initKeyboard() {
        if (!isNative()) return;
        const vv = window.visualViewport;

        function isField(el) {
            if (!el || !el.tagName) return false;
            const t = el.tagName.toUpperCase();
            if (t !== 'INPUT' && t !== 'TEXTAREA' && t !== 'SELECT') return false;
            const type = (el.getAttribute('type') || '').toLowerCase();
            return ['button', 'submit', 'reset', 'checkbox', 'radio', 'file', 'range'].indexOf(type) === -1;
        }

        function ensureVisible(el) {
            if (!el || !el.getBoundingClientRect) return;
            try {
                const r = el.getBoundingClientRect();
                if (!r.height) return;
                const top = vv ? vv.offsetTop : 0;
                const bottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
                const margin = 16;
                if (r.bottom > bottom - margin) {
                    window.scrollBy(0, r.bottom - bottom + margin + 24);
                } else if (r.top < top + margin) {
                    window.scrollBy(0, r.top - top - margin);
                }
            } catch (e) { /* تجاهل */ }
        }

        document.addEventListener('focusin', function (e) {
            if (!isField(e.target)) return;
            /* ننتظر حتى تظهر لوحة المفاتيح فعلياً ثم نحرّك مرتين للتأكد */
            setTimeout(function () { ensureVisible(e.target); }, 280);
            setTimeout(function () { ensureVisible(e.target); }, 700);
        }, true);

        if (vv && typeof vv.addEventListener === 'function') {
            let pending = null;
            vv.addEventListener('resize', function () {
                const ae = document.activeElement;
                if (!isField(ae)) return;
                if (pending) cancelAnimationFrame(pending);
                pending = requestAnimationFrame(function () { ensureVisible(ae); });
            });
        }
    }

    /* ------------------------------------------------------------------
       4) window.open — لا يعمل داخل WebView
         (يُستخدم في زر "إرسال بريد" لفتح Gmail)
       ------------------------------------------------------------------ */
    function initExternalLinks() {
        if (!isNative()) return;
        const Browser = getPlugin('Browser');
        const originalOpen = window.open.bind(window);

        window.open = function (url, target, features) {
            try {
                if (typeof url === 'string' && /^https?:\/\//i.test(url)) {
                    if (Browser && typeof Browser.open === 'function') {
                        Promise.resolve(Browser.open({ url: url })).catch(function () {
                            try { window.location.href = url; } catch (e) { /* تجاهل */ }
                        });
                    } else {
                        window.location.href = url;
                    }
                    /* كائن وهمي حتى لا يظنّ الكود أن النافذة فشلت */
                    return { closed: false, focus: function () { }, close: function () { } };
                }
            } catch (e) { /* نكمل للسلوك الأصلي */ }
            return originalOpen(url, target, features);
        };
    }

    /* ------------------------------------------------------------------
       5) window.print — غير مدعوم في WebView
         نستعمل نفس مسار PDF الموجود أصلاً (بدون تغيير أي منطق)
       ------------------------------------------------------------------ */
    function initPrint() {
        if (!isNative()) return;
        try {
            window.print = function () {
                try {
                    if (typeof window.exportBookingToPDF === 'function') {
                        window.exportBookingToPDF();
                        return;
                    }
                } catch (e) { /* تجاهل */ }
                alert('الطباعة غير مدعومة على هذا الجهاز. استخدم زر "تصدير PDF" للمشاركة.');
            };
        } catch (e) { /* تجاهل */ }
    }
    }
/* ------------------------------------------------------------------
       6) حفظ البيانات — ضمان عدم ضياع المسودّة عند الإغلاق القسري
       ------------------------------------------------------------------ */
    function initPersistence() {
        if (!isNative()) return;

        function flush() {
            try {
                if (typeof window.saveDraftBooking === 'function') {
                    const r = window.saveDraftBooking();
                    if (r && typeof r.catch === 'function') r.catch(function () { });
                }
            } catch (e) { /* تجاهل */ }
        }

        document.addEventListener('visibilitychange', function () {
            if (document.visibilityState === 'hidden') flush();
        });
        window.addEventListener('pagehide', flush);
        window.addEventListener('beforeunload', flush);
    }

    /* ------------------------------------------------------------------
       7) منع الشاشة البيضاء من أخطاء غير متوقعة (تسجيل فقط)
       ------------------------------------------------------------------ */
    function initErrorGuards() {
        window.addEventListener('error', function (e) {
            try {
                console.error('[ofoq] runtime error:', e && e.message, e && e.filename, e && e.lineno);
            } catch (x) { /* تجاهل */ }
        }, true);

        window.addEventListener('unhandledrejection', function (e) {
            try {
                console.error('[ofoq] unhandled promise rejection:', e && e.reason);
            } catch (x) { /* تجاهل */ }
        });
    }

    /* ------------------------------------------------------------------
       8) مؤشر "جاري إنشاء ملف PDF..." — يظهر فقط على أندرويد
          (تُستدعى من exportBookingToPDF في script.js)
       ------------------------------------------------------------------ */
    window.showPdfBusy = function () {
        if (!isNative() || document.getElementById('ofoqPdfBusy')) return null;
        try {
            const box = document.createElement('div');
            box.id = 'ofoqPdfBusy';
            box.setAttribute('dir', 'rtl');
            box.setAttribute('role', 'status');
            box.textContent = 'جاري إنشاء ملف PDF...';
            box.style.cssText = [
                'position:fixed', 'inset:0', 'z-index:2147483000',
                'display:flex', 'align-items:center', 'justify-content:center',
                'background:rgba(10,25,47,0.45)',
                'color:#fff', 'font-family:Cairo,Inter,sans-serif',
                'font-size:17px', 'font-weight:600',
                'padding:24px', 'text-align:center', 'line-height:1.9'
            ].join(';');
            document.body.appendChild(box);

            let hidden = false;
            return {
                hide: function () {
                    if (hidden) return;
                    hidden = true;
                    try { if (box.parentNode) box.parentNode.removeChild(box); } catch (e) { }
                }
            };
        } catch (e) {
            return null;
        }
    };

    /* ------------------------------------------------------------------
       التشغيل
       ------------------------------------------------------------------ */
    function boot() {
        try { initBackButton(); } catch (e) { console.error('[ofoq] backButton init failed', e); }
        try { initKeyboard(); } catch (e) { console.error('[ofoq] keyboard init failed', e); }
        try { initExternalLinks(); } catch (e) { console.error('[ofoq] links init failed', e); }
        try { initPrint(); } catch (e) { console.error('[ofoq] print init failed', e); }
        try { initPersistence(); } catch (e) { console.error('[ofoq] persistence init failed', e); }
        try { initErrorGuards(); } catch (e) { }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }

    window.__ofoqAndroidCompat = { isNative: isNative, getPlatform: getPlatform, getPlugin: getPlugin };
})();