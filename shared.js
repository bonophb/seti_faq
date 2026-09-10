// Shared setup for both SETI pages. Loaded before page-specific scripts.
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-D8WD3NKS7N');

function trackEvent(eventName, params = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, params);
    }
}

function detectLanguage() {
    const saved = readPreference('seti_language') || readPreference('seti_randomizer_lang');
    if (['KO', 'EN'].includes(saved)) return saved;
    const userLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return userLang.startsWith('ko') ? 'KO' : 'EN';
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('SW registration error:', err));
    });
}

const LANGUAGE_KEY = 'seti_language';
function readPreference(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
}
function writePreference(key, value) {
    try { localStorage.setItem(key, value); return true; } catch (error) { return false; }
}
function applyLanguagePreference(lang) {
    if (!['KO', 'EN'].includes(lang)) lang = detectLanguage();
    writePreference(LANGUAGE_KEY, lang);
    document.documentElement.lang = lang === 'KO' ? 'ko' : 'en';
    document.querySelectorAll('.lang-btn').forEach(button =>
        button.setAttribute('aria-pressed', String(button.id === 'lang-' + lang)));
    return lang;
}
window.addEventListener('storage', event => {
    if (event.key === LANGUAGE_KEY && ['KO', 'EN'].includes(event.newValue) &&
        typeof setLanguage === 'function') setLanguage(event.newValue);
});

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char =>
        ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
}

// Rebuild an inert fragment from allowed elements. No source attributes are copied.
function formatFaqAnswer(value) {
    const source = document.createElement('template');
    source.innerHTML = String(value ?? '').replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
    const output = document.createElement('div');
    const allowed = new Set(['B','STRONG','EM','I','U','S','BR','P','UL','OL','LI','CODE','PRE','BLOCKQUOTE','A']);
    const blocked = new Set(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','TEMPLATE','SVG','MATH','IMG','VIDEO','AUDIO','LINK','META','BASE']);
    function copy(node, parent) {
        if (node.nodeType === 3) { parent.appendChild(document.createTextNode(node.textContent)); return; }
        if (node.nodeType !== 1 || blocked.has(node.tagName)) return;
        let destination = parent;
        if (allowed.has(node.tagName) && node.namespaceURI === 'http://www.w3.org/1999/xhtml') {
            destination = document.createElement(node.tagName.toLowerCase());
            if (node.tagName === 'A') {
                try {
                    const url = new URL(node.getAttribute('href'));
                    if (['https:', 'http:'].includes(url.protocol)) {
                        destination.setAttribute('href', url.href);
                        destination.setAttribute('rel', 'noopener noreferrer');
                    }
                } catch (error) {}
            }
            parent.appendChild(destination);
        }
        Array.from(node.childNodes).forEach(child => copy(child, destination));
    }
    Array.from(source.content.childNodes).forEach(node => copy(node, output));
    return output.innerHTML;
}
