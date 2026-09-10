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
    const userLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    return userLang.startsWith('ko') ? 'KO' : 'EN';
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.log('SW registration error:', err));
    });
}
