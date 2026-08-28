(() => {
    'use strict';

    const VALID_LANGUAGES = ['en', 'es'];
    const VALID_THEMES = ['light', 'dark'];
    const sectionTabs = [...document.querySelectorAll('.section-tabs [role="tab"]')];
    const sectionPanels = [...document.querySelectorAll('.section-panel')];
    const demoTabs = [...document.querySelectorAll('.demo-tab-btn')];
    const demoPanels = [...document.querySelectorAll('.demo-panel')];
    const themeToggle = document.getElementById('theme-toggle');
    const themeColor = document.querySelector('meta[name="theme-color"]');

    function readPreference(key, fallback) {
        try {
            return localStorage.getItem(key) || fallback;
        } catch (error) {
            return fallback;
        }
    }

    function savePreference(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (error) {
            // Preferences remain available for the current session when storage is blocked.
        }
    }

    let currentLanguage = readPreference('language', 'en');
    if (!VALID_LANGUAGES.includes(currentLanguage)) currentLanguage = 'en';

    function currentTranslations() {
        return translations[currentLanguage] || translations.en;
    }

    function applyTranslations() {
        const dictionary = currentTranslations();

        document.querySelectorAll('[data-i18n]').forEach((element) => {
            const value = dictionary[element.dataset.i18n];
            if (typeof value === 'string') element.textContent = value;
        });

        document.documentElement.lang = currentLanguage;
        updateLanguageButtons();
        updateThemeButton();
    }

    function updateLanguageButtons() {
        document.querySelectorAll('.lang-btn').forEach((button) => {
            const isActive = button.dataset.lang === currentLanguage;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    }

    function demoTargetOrigin() {
        return window.location.protocol === 'file:' ? '*' : window.location.origin;
    }

    function notifyDemoFrames() {
        ['robotics-iframe', 'shape-iframe'].forEach((id) => {
            const frame = document.getElementById(id);
            frame?.contentWindow?.postMessage(
                { type: 'setLanguage', language: currentLanguage },
                demoTargetOrigin()
            );
        });
    }

    function setLanguage(language) {
        if (!VALID_LANGUAGES.includes(language)) return;

        currentLanguage = language;
        savePreference('language', language);
        applyTranslations();

        const locoVideo = document.getElementById('locoVerseVideo');
        const videoId = language === 'es' ? '0rMbIkIO2SI' : 'gARHGLxpAdU';
        const nextSource = `https://www.youtube.com/embed/${videoId}`;
        if (locoVideo && locoVideo.src !== nextSource) locoVideo.src = nextSource;

        notifyDemoFrames();
    }

    function updateThemeButton() {
        if (!themeToggle) return;

        const theme = document.documentElement.dataset.theme;
        const darkModeActive = theme === 'dark';
        const label = currentTranslations()[darkModeActive ? 'themeToLight' : 'themeToDark'];
        themeToggle.setAttribute('aria-label', label);
        themeToggle.setAttribute('title', label);
        themeToggle.setAttribute('aria-pressed', String(darkModeActive));
        if (themeColor) themeColor.content = darkModeActive ? '#101715' : '#f3f7f4';
    }

    function setTheme(theme, persist = true) {
        if (!VALID_THEMES.includes(theme)) return;
        document.documentElement.dataset.theme = theme;
        if (persist) savePreference('theme', theme);
        updateThemeButton();
    }

    function sectionSlug(panelId) {
        return panelId.replace(/^panel-/, '');
    }

    function panelIdFromHash() {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        if (!hash) return null;

        const candidate = hash.startsWith('panel-') ? hash : `panel-${hash}`;
        return sectionPanels.some((panel) => panel.id === candidate) ? candidate : null;
    }

    function activateSection(targetId, options = {}) {
        const { updateHistory = true, scroll = false } = options;
        const targetPanel = document.getElementById(targetId);
        const targetTab = sectionTabs.find((tab) => tab.dataset.target === targetId);
        if (!targetPanel || !targetTab) return;

        sectionTabs.forEach((tab) => {
            const isActive = tab === targetTab;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
        });

        sectionPanels.forEach((panel) => {
            const isActive = panel === targetPanel;
            panel.classList.toggle('active', isActive);
            panel.hidden = !isActive;
            panel.setAttribute('aria-hidden', String(!isActive));
        });

        if (updateHistory) {
            const nextHash = `#${sectionSlug(targetId)}`;
            if (window.location.hash !== nextHash) history.pushState({ panel: targetId }, '', nextHash);
        }

        if (scroll) targetPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function handleSectionKeydown(event) {
        const currentIndex = sectionTabs.indexOf(event.currentTarget);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % sectionTabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + sectionTabs.length) % sectionTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = sectionTabs.length - 1;
        if (nextIndex === currentIndex) return;

        event.preventDefault();
        sectionTabs[nextIndex].focus();
        activateSection(sectionTabs[nextIndex].dataset.target, { scroll: false });
    }

    function activateDemo(targetId) {
        const targetPanel = document.getElementById(targetId);
        const targetTab = demoTabs.find((tab) => tab.dataset.target === targetId);
        if (!targetPanel || !targetTab) return;

        demoTabs.forEach((tab) => {
            const isActive = tab === targetTab;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
            tab.tabIndex = isActive ? 0 : -1;
        });

        demoPanels.forEach((panel) => {
            const isActive = panel === targetPanel;
            panel.classList.toggle('active', isActive);
            panel.hidden = !isActive;
        });
    }

    function handleDemoKeydown(event) {
        const currentIndex = demoTabs.indexOf(event.currentTarget);
        let nextIndex = currentIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % demoTabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + demoTabs.length) % demoTabs.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = demoTabs.length - 1;
        if (nextIndex === currentIndex) return;

        event.preventDefault();
        demoTabs[nextIndex].focus();
        activateDemo(demoTabs[nextIndex].dataset.target);
    }

    function setAccordionState(item, expanded) {
        const button = item.querySelector('.dissemination-header');
        const content = item.querySelector('.dissemination-content');
        item.classList.toggle('expanded', expanded);
        button?.setAttribute('aria-expanded', String(expanded));
        if (content) content.hidden = !expanded;
    }

    function initializeNavigation() {
        sectionTabs.forEach((tab) => {
            tab.addEventListener('click', () => activateSection(tab.dataset.target, { scroll: true }));
            tab.addEventListener('keydown', handleSectionKeydown);
        });

        activateSection(panelIdFromHash() || 'panel-news', { updateHistory: false, scroll: false });

        window.addEventListener('popstate', () => {
            activateSection(panelIdFromHash() || 'panel-news', { updateHistory: false, scroll: false });
        });

        document.querySelector('.inline-tab-link')?.addEventListener('click', () => {
            activateSection('panel-dissemination', { scroll: true });
            const firstItem = document.querySelector('#panel-dissemination .dissemination-item');
            if (firstItem) setAccordionState(firstItem, true);
        });
    }

    function initializeDemoTabs() {
        demoTabs.forEach((tab, index) => {
            const targetId = tab.dataset.target;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', targetId);
            tab.setAttribute('aria-selected', String(index === 0));
            tab.tabIndex = index === 0 ? 0 : -1;
            tab.addEventListener('click', () => activateDemo(targetId));
            tab.addEventListener('keydown', handleDemoKeydown);
        });

        document.querySelectorAll('.demo-tabs').forEach((tabList) => {
            tabList.setAttribute('aria-label', 'Interactive demos');
        });

        demoPanels.forEach((panel, index) => {
            panel.setAttribute('role', 'tabpanel');
            panel.hidden = index !== 0;
        });
    }

    function initializeAccordions() {
        document.querySelectorAll('.dissemination-item').forEach((item, index) => {
            const button = item.querySelector('.dissemination-header');
            const content = item.querySelector('.dissemination-content');
            if (!button || !content) return;

            const contentId = `dissemination-content-${index + 1}`;
            content.id = contentId;
            button.setAttribute('aria-controls', contentId);
            setAccordionState(item, false);
            button.addEventListener('click', () => setAccordionState(item, !item.classList.contains('expanded')));
        });
    }

    function initializePreferences() {
        document.querySelectorAll('.lang-btn').forEach((button) => {
            button.addEventListener('click', () => setLanguage(button.dataset.lang));
        });

        themeToggle?.addEventListener('click', () => {
            const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
            setTheme(nextTheme);
        });

        const colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
        colorScheme.addEventListener?.('change', (event) => {
            if (!readPreference('theme', '')) setTheme(event.matches ? 'dark' : 'light', false);
        });
    }

    function initializeMedia() {
        ['robotics-iframe', 'shape-iframe'].forEach((id) => {
            document.getElementById(id)?.addEventListener('load', notifyDemoFrames);
        });
    }

    function initializeFooter() {
        const year = document.getElementById('current-year');
        if (year) year.textContent = new Date().getFullYear();

        document.querySelector('.back-to-top')?.addEventListener('click', (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initialize() {
        initializePreferences();
        initializeNavigation();
        initializeDemoTabs();
        initializeAccordions();
        initializeMedia();
        initializeFooter();
        applyTranslations();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
