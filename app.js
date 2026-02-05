// i18n Functions
let currentLanguage = localStorage.getItem('language') || 'en';

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    applyTranslations();
    updateLanguageButtons();

    // Update LoCo CORP video based on language
    const locoVideo = document.getElementById('locoVerseVideo');
    if (locoVideo) {
        locoVideo.src = lang === 'es'
            ? 'https://www.youtube.com/embed/0rMbIkIO2SI'
            : 'https://www.youtube.com/embed/gARHGLxpAdU';
    }

    // Notify iframes of language change
    const roboticsIframe = document.getElementById('robotics-iframe');
    const shapeIframe = document.getElementById('shape-iframe');
    if (roboticsIframe && roboticsIframe.contentWindow) {
        roboticsIframe.contentWindow.postMessage({ type: 'setLanguage', language: lang }, '*');
    }
    if (shapeIframe && shapeIframe.contentWindow) {
        shapeIframe.contentWindow.postMessage({ type: 'setLanguage', language: lang }, '*');
    }
}

function applyTranslations() {
    const t = translations[currentLanguage];
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    document.documentElement.lang = currentLanguage;
}

function updateLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLanguage);
    });
}

// Initialize i18n on page load
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    updateLanguageButtons();

    // Attach language button listeners
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setLanguage(btn.getAttribute('data-lang'));
        });
    });

    // Sync demo iframes language on load
    const roboticsIframe = document.getElementById('robotics-iframe');
    const shapeIframe = document.getElementById('shape-iframe');
    [roboticsIframe, shapeIframe].forEach(iframe => {
        if (iframe) {
            iframe.addEventListener('load', () => {
                iframe.contentWindow?.postMessage({ type: 'setLanguage', language: currentLanguage }, '*');
            });
        }
    });
});

// Section Navigation
const sectionTabButtons = document.querySelectorAll('.section-tab-btn');
const sectionPanels = document.querySelectorAll('.section-panel');

sectionTabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');

        sectionTabButtons.forEach(btn => btn.classList.remove('active'));
        sectionPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// Demo Navigation
const demoTabButtons = document.querySelectorAll('.demo-tab-btn');
const demoPanels = document.querySelectorAll('.demo-panel');

demoTabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');

        demoTabButtons.forEach(btn => btn.classList.remove('active'));
        demoPanels.forEach(panel => panel.classList.remove('active'));

        button.classList.add('active');
        const targetPanel = document.getElementById(targetId);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

function openDisseminationFromResearch() {
    const disseminationTab = document.querySelector('[data-target="panel-dissemination"]');
    if (disseminationTab) {
        disseminationTab.click();
    }

    setTimeout(() => {
        const disseminationPanel = document.getElementById('panel-dissemination');
        if (disseminationPanel) {
            const firstItem = disseminationPanel.querySelector('.dissemination-item');
            if (firstItem) {
                firstItem.classList.add('expanded');
            }
            disseminationPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 50);
}

// Dissemination Item Toggle
function toggleDisseminationItem(button) {
    const item = button.closest('.dissemination-item');
    item.classList.toggle('expanded');
}
