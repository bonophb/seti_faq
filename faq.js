        const SHEET_ID = '1H8VjQ4cSiOKzghHHUsna8KWBzVYm-YB-GPgj_haSr88';
        const PUBLISHED_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQYjGO3WyNoP4Pg3AJ8neCz4GYD1o9wVOjWnxvyIGpmImV3KnERKDG3Q_1_TdtQxWGwC22E8CbM6SWf/pub?output=csv';
        const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

        const rulebookLinks = {
            KO: {
                btnText: "공식 룰북",
                menuTitle: "공식 PDF 다운로드",
                base: { title: "본판 룰북", url: "https://filemanager.czechgames.com/storage/files/seti-search-for-extraterrestrial-intelligence/rules/SE%20rulebook%20KO%2010.pdf" },
                baseAlien: { title: "본판 외계종", url: "https://filemanager.czechgames.com/storage/files/seti-search-for-extraterrestrial-intelligence/other-downloads/alien-species/SE%20aliens%20KO%2006.pdf" },
                aid: { title: "요약표", url: "https://filemanager.czechgames.com/storage/files/seti-search-for-extraterrestrial-intelligence/other-downloads/player-aid/SE%20player%20aid%20KO%2005.pdf" },
                exp: { title: "확장 룰북", url: "https://filemanager.czechgames.com/storage/files/seti-space-agencies/rules/SE2%20rulebook%20KO%2003.pdf" },
                expAlien: { title: "확장 외계종", url: "https://filemanager.czechgames.com/storage/files/seti-space-agencies/other-downloads/alien-species/SE2%20aliens%20aid%20KO%2003.pdf" }
            },
            EN: {
                btnText: "Official Rulebooks",
                menuTitle: "Official PDF Downloads",
                base: { title: "Base Rulebook", url: "https://filemanager.czechgames.com/storage/files/seti-search-for-extraterrestrial-intelligence/rules/seti-rules-en.pdf" },
                baseAlien: { title: "Base Alien Species", url: "https://filemanager.czechgames.com/storage/files/seti-search-for-extraterrestrial-intelligence/other-downloads/alien-species/seti-alien-species-en.pdf" },
                aid: { title: "Player Aid", url: "https://filemanager.czechgames.com/storage/files/seti-search-for-extraterrestrial-intelligence/other-downloads/player-aid/seti-player-aid-en.pdf" },
                exp: { title: "Expansion Rulebook", url: "https://filemanager.czechgames.com/storage/files/seti-space-agencies/rules/SE2%20rulebook%20EN%2016.pdf" },
                expAlien: { title: "Expansion Alien Species", url: "https://filemanager.czechgames.com/storage/files/seti-space-agencies/other-downloads/alien-species/SE2%20aliens%20aid%20EN%2014.pdf" }
            }
        };

        const categoryMap = {
            '행동': 'Actions',
            '착륙': 'Land',
            '스캔': 'Scan',
            '데이터 분석': 'Analyze Data',
            '탐사선/궤도선/착륙선': 'Probes / Orbiters / Landers',
            '기술': 'Techs',
            '미션': 'Missions',
            '마일스톤': 'Milestones',
            '점수 타일': 'Gold Scoring Tiles',
            '외계종': 'Alien Species',
            '솔로 모드': 'Solo Game',
            '카드': 'Cards',
            '외계종 카드': 'Alien Cards',
            '기관': 'Organizations',
            '확장 규칙': 'Expansion Rules',
            '프로모': 'Promo'
        };

        let faqData = [];
        let currentLang = detectLanguage();
        let currentEdition = '전체';
        let currentCategory = '전체';
        
        let loadTimer = null;
        let isLoaded = false;
        let toastTimer = null;
        let searchDebounceTimer = null;

        const i18n = {
            KO: {
                title: "🛸 SETI 보드게임 FAQ",
                sub: "규칙, 에라타 및 카드 검색 시스템",
                all: "전체",
                base: "본판",
                exp: "확장",
                placeholder: "질문 제목, 답변 내용, 카드 번호(예: 15, #15, ET.1) 검색...",
                tip: "💡 팁: 15 또는 #15는 카드 15번, ET.1은 외계종 카드 1번만 검색합니다.",
                reloadText: "캐시 새로고침",
                alienRandomizer: "외계종 발견 랜더마이저",
                randomizer: "태양계 랜더마이저",
                bggBase: "BGG 본판 FAQ 원본",
                bggExp: "BGG 확장 FAQ 원본",
                copyLink: "링크 복사",
                noResult: "검색 조건에 맞는 FAQ가 없습니다.",
                loading: "FAQ 데이터를 불러오는 중입니다...",
                delayMsg: "데이터 로드가 지연되어 다른 경로로 다시 시도합니다...",
                reloadBtn: "지금 강력 새로고침"
            },
            EN: {
                title: "🛸 SETI Board Game FAQ",
                sub: "Rules, Errata & Card Search System",
                all: "All",
                base: "Base Game",
                exp: "Expansion",
                placeholder: "Search questions, answers, card # (e.g. 15, #15, ET.1)...",
                tip: "💡 Tip: 15 or #15 matches card 15 only; ET.1 matches alien card 1 only.",
                reloadText: "Clear Cache & Reload",
                alienRandomizer: "Alien Discovery Randomizer",
                randomizer: "Solar System Randomizer",
                bggBase: "BGG Base FAQ (Official)",
                bggExp: "BGG Expansion FAQ (Official)",
                copyLink: "Copy Link",
                noResult: "No FAQs match your search criteria.",
                loading: "Loading FAQ data...",
                delayMsg: "Loading delayed over 30s. Retrying another data source...",
                reloadBtn: "Force Reload Now"
            }
        };

        function showToast(msg, icon = '✨') {
            const toast = document.getElementById('toast');
            document.getElementById('toast-icon').textContent = icon;
            document.getElementById('toast-msg').textContent = msg;
            toast.classList.remove('hidden');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
        }

        function updateRulebookDropdown(lang) {
            const data = rulebookLinks[lang];
            document.getElementById('rulebook-btn-text').textContent = data.btnText;
            document.getElementById('rulebook-menu-title').textContent = data.menuTitle;

            document.getElementById('rb-link-base').href = data.base.url;
            document.getElementById('rb-text-base').textContent = data.base.title;

            document.getElementById('rb-link-base-alien').href = data.baseAlien.url;
            document.getElementById('rb-text-base-alien').textContent = data.baseAlien.title;

            document.getElementById('rb-link-aid').href = data.aid.url;
            document.getElementById('rb-text-aid').textContent = data.aid.title;

            document.getElementById('rb-link-exp').href = data.exp.url;
            document.getElementById('rb-text-exp').textContent = data.exp.title;

            document.getElementById('rb-link-exp-alien').href = data.expAlien.url;
            document.getElementById('rb-text-exp-alien').textContent = data.expAlien.title;
        }

        function toggleRulebookDropdown(e) {
            e.stopPropagation();
            const menu = document.getElementById('rulebookDropdownMenu');
            menu.classList.toggle('hidden');
            document.getElementById('rulebook-button').setAttribute('aria-expanded', String(!menu.classList.contains('hidden')));
            if (!menu.classList.contains('hidden')) menu.querySelector('a').focus();
        }

        window.addEventListener('click', (e) => {
            const container = document.getElementById('rulebookDropdownContainer');
            const menu = document.getElementById('rulebookDropdownMenu');
            if (container && !container.contains(e.target) && menu && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                document.getElementById('rulebook-button').setAttribute('aria-expanded', 'false');
            }
        });

        function setLanguage(lang) {
            const selectedCategory = faqData.find(item =>
                item.cat_ko === currentCategory || item.cat_en === currentCategory);
            lang = applyLanguagePreference(lang);
            if (currentCategory !== '전체' && selectedCategory) {
                currentCategory = lang === 'KO' ? selectedCategory.cat_ko : selectedCategory.cat_en;
            }
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`lang-${lang}`);
            if (activeBtn) activeBtn.classList.add('active');

            const t = i18n[lang];
            document.getElementById('header-title').textContent = t.title;
            document.getElementById('header-sub').textContent = t.sub;
            document.getElementById('searchInput').placeholder = t.placeholder;
            document.getElementById('search-tip').textContent = t.tip;
            document.getElementById('reload-btn-text').textContent = t.reloadText;
            document.getElementById('link-alien-randomizer').textContent = t.alienRandomizer;
            document.getElementById('link-randomizer').textContent = t.randomizer;
            document.getElementById('link-bgg-base').textContent = t.bggBase;
            document.getElementById('link-bgg-exp').textContent = t.bggExp;

            updateRulebookDropdown(lang);
            updateTabCounts();
            renderCategories();
            renderFAQs();
        }

        const FAQ_BACKUP_KEY = 'seti_faq_data_v1';

        function restoreFaqBackup() {
            try {
                const data = JSON.parse(localStorage.getItem(FAQ_BACKUP_KEY));
                const fields = ['edition', 'cat_ko', 'cat_en', 'q_ko', 'a_ko', 'q_en', 'a_en'];
                if (!Array.isArray(data) || !data.length ||
                    !data.every(item => item && Number.isInteger(item.id) &&
                        fields.every(field => typeof item[field] === 'string'))) return false;
                faqData = data;
                isLoaded = true;
                clearTimeout(loadTimer);
                setLanguage(currentLang);
                checkDeepLink();
                showToast(currentLang === 'KO'
                    ? '저장된 FAQ를 표시합니다. 최신 내용은 인터넷 연결 후 확인해 주세요.'
                    : 'Showing saved FAQs. Reconnect to check for updates.', '📂');
                return true;
            } catch (error) {
                return false;
            }
        }

        function startTimeoutTimer() {
            clearTimeout(loadTimer);
            loadTimer = setTimeout(() => {
                if (!isLoaded) {
                    if (restoreFaqBackup()) return;
                    const t = i18n[currentLang];
                    document.getElementById('faqList').innerHTML = 
                        `<div class="text-center py-12 text-amber-400 font-medium leading-relaxed">
                            ${t.delayMsg}
                            <br><button onclick="forceReload()" class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500 transition-colors">${t.reloadBtn}</button>
                         </div>`;
                    setTimeout(() => loadCSV(GVIZ_URL, true), 1000);
                }
            }, 30000);
        }

        async function forceReload() {
            try {
                if ('caches' in window) {
                    const names = await caches.keys();
                    await Promise.all(names.filter(name => name.startsWith('seti-faq-'))
                        .map(name => caches.delete(name)));
                }
            } catch (error) {}
            const url = new URL(window.location.href);
            url.searchParams.set('_t', Date.now());
            window.location.href = url.href;
        }

        function loadCSV(url, isFallback = false) {
            if (!isFallback) {
                isLoaded = false;
                startTimeoutTimer();
            }

            Papa.parse(url, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: function(results) {
                    const parsed = results.data.map((item, idx) => {
                        const cat_ko = item['카테고리 (KO)'] ? item['카테고리 (KO)'].trim() : (item['카테고리'] ? item['카테고리'].trim() : '기타');
                        const cat_en = item['카테고리 (EN)'] ? item['카테고리 (EN)'].trim() : (categoryMap[cat_ko] || cat_ko);
                        
                        let ed = item['구분'] ? item['구분'].trim() : '';
                        if (!ed) {
                            ed = (cat_ko.includes('확장') || cat_ko.includes('기관') || cat_ko.includes('프로모')) ? '확장' : '본판';
                        }
                        
                        const q_ko = item['질문 (KO)'] ? item['질문 (KO)'].trim() : (item['질문'] ? item['질문'].trim() : '');
                        const a_ko = item['답변 (KO)'] ? item['답변 (KO)'].trim() : (item['답변'] ? item['답변'].trim() : '');
                        const q_en = item['질문 (EN)'] ? item['질문 (EN)'].trim() : q_ko;
                        const a_en = item['답변 (EN)'] ? item['답변 (EN)'].trim() : a_ko;

                        return {
                            id: idx,
                            faqId: (item['ID'] || '').trim().toLowerCase(),
                            edition: ed,
                            cat_ko: cat_ko,
                            cat_en: cat_en,
                            q_ko: q_ko,
                            a_ko: a_ko,
                            q_en: q_en,
                            a_en: a_en
                        };
                    }).filter(item => item.q_ko !== '' || item.q_en !== '');

                    if (parsed.length > 0) {
                        isLoaded = true;
                        clearTimeout(loadTimer);
                        faqData = parsed;
                        try {
                            localStorage.setItem(FAQ_BACKUP_KEY, JSON.stringify(parsed));
                        } catch (error) {}
                        
                        setLanguage(currentLang);
                        checkDeepLink();
                    } else if (!isFallback) {
                        loadCSV(GVIZ_URL, true);
                    } else {
                        clearTimeout(loadTimer);
                        if (restoreFaqBackup()) return;
                        showError('FAQ 데이터를 읽지 못했습니다. 구글 시트 공유 설정을 확인해주세요.');
                    }
                },
                error: function(err) {
                    if (!isFallback) {
                        loadCSV(GVIZ_URL, true);
                    } else {
                        clearTimeout(loadTimer);
                        if (restoreFaqBackup()) return;
                        showError('데이터 로드에 실패했습니다. 아래 버튼을 눌러 강력 새로고침을 시도해보세요.<br><button onclick="forceReload()" class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-500">강력 새로고침</button>');
                    }
                }
            });
        }

        function showError(msg) {
            document.getElementById('faqList').innerHTML = `<div class="text-center py-12 text-red-400 font-medium">${msg}</div>`;
        }

        function updateTabCounts() {
            const t = i18n[currentLang];
            const baseCount = faqData.filter(d => d.edition === '본판').length;
            const expCount = faqData.filter(d => d.edition === '확장').length;
            
            document.getElementById('label-all').textContent = `${t.all} (${faqData.length})`;
            document.getElementById('label-base').textContent = `${t.base} (${baseCount})`;
            document.getElementById('label-exp').textContent = `${t.exp} (${expCount})`;
        }

        function setEdition(edition) {
            currentEdition = edition;
            currentCategory = '전체';
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`tab-${edition}`).classList.add('active');
            renderCategories();
            renderFAQs();
        }

        function renderCategories() {
            let availableData = faqData;
            if (currentEdition !== '전체') {
                availableData = faqData.filter(item => item.edition === currentEdition);
            }

            const isKO = currentLang === 'KO';
            const categories = ['전체', ...new Set(availableData.map(item => isKO ? item.cat_ko : item.cat_en))];
            const container = document.getElementById('categoryContainer');
            container.innerHTML = '';

            const tAll = i18n[currentLang].all;

            categories.forEach(cat => {
                const btn = document.createElement('button');
                btn.className = `category-btn px-4 py-2 rounded-full text-sm font-medium transition-colors ${cat === currentCategory ? 'active' : ''}`;
                btn.textContent = cat === '전체' ? tAll : cat;
                btn.setAttribute('aria-pressed', String(cat === currentCategory));
                btn.onclick = () => {
                    currentCategory = cat;
                    document.querySelectorAll('.category-btn').forEach(b => {
                        b.classList.remove('active');
                        b.setAttribute('aria-pressed', 'false');
                    });
                    btn.setAttribute('aria-pressed', 'true');
                    btn.classList.add('active');
                    renderFAQs();
                };
                container.appendChild(btn);
            });
        }

        function toggleEnOriginal(id) {
            const box = document.getElementById(`en-box-${id}`);
            if (box) {
                box.classList.toggle('hidden');
                document.getElementById(`en-toggle-${id}`).setAttribute('aria-expanded', String(!box.classList.contains('hidden')));
                
                if (!box.classList.contains('hidden')) {
                    const item = faqData.find(d => d.id === id);
                    if (item) {
                        trackEvent('view_en_original', {
                            faq_title: item.q_ko,
                            faq_category: item.cat_ko
                        });
                    }
                }
            }
        }

        // 고유 Slug 생성 엔진 (충돌 방지 정밀 매핑)
        // Permanent IDs from the sheet. Keep this migration map when rows are reordered.
        const LEGACY_FAQ_IDS = {
    "card-1": "seti-0055",
    "card-101": "seti-0082",
    "card-103": "seti-0083",
    "card-106": "seti-0084",
    "card-107": "seti-0085",
    "card-11": "seti-0057",
    "card-112": "seti-0086",
    "card-113": "seti-0087",
    "card-114": "seti-0088",
    "card-116": "seti-0089",
    "card-117": "seti-0090",
    "card-118": "seti-0091",
    "card-119": "seti-0092",
    "card-120": "seti-0093",
    "card-122": "seti-0094",
    "card-123": "seti-0095",
    "card-124": "seti-0096",
    "card-125": "seti-0097",
    "card-126": "seti-0098",
    "card-127": "seti-0099",
    "card-128": "seti-0100",
    "card-129": "seti-0101",
    "card-133": "seti-0102",
    "card-134": "seti-0103",
    "card-135": "seti-0104",
    "card-136": "seti-0105",
    "card-138": "seti-0106",
    "card-15": "seti-0058",
    "card-16": "seti-0059",
    "card-17": "seti-0060",
    "card-19": "seti-0061",
    "card-20": "seti-0062",
    "card-25": "seti-0063",
    "card-26": "seti-0064",
    "card-27": "seti-0065",
    "card-30": "seti-0066",
    "card-45": "seti-0067",
    "card-49": "seti-0068",
    "card-51": "seti-0069",
    "card-58": "seti-0070",
    "card-60": "seti-0071",
    "card-65": "seti-0072",
    "card-67": "seti-0073",
    "card-73": "seti-0074",
    "card-78": "seti-0075",
    "card-81": "seti-0076",
    "card-84": "seti-0077",
    "card-88": "seti-0078",
    "card-89": "seti-0079",
    "card-9": "seti-0056",
    "card-91": "seti-0080",
    "card-98": "seti-0081",
    "et-1": "seti-0107",
    "et-13": "seti-0110",
    "et-14": "seti-0111",
    "et-15": "seti-0112",
    "et-20": "seti-0113",
    "et-21": "seti-0114",
    "et-22": "seti-0115",
    "et-23": "seti-0116",
    "et-27": "seti-0117",
    "et-29": "seti-0118",
    "et-31": "seti-0119",
    "et-5": "seti-0108",
    "et-6": "seti-0109",
    "exp-card-10": "seti-0140",
    "exp-card-12": "seti-0141",
    "exp-card-13": "seti-0142",
    "exp-card-15": "seti-0143",
    "exp-card-16": "seti-0144",
    "exp-card-17": "seti-0145",
    "exp-card-18": "seti-0146",
    "exp-card-19": "seti-0147",
    "exp-card-2": "seti-0136",
    "exp-card-20": "seti-0148",
    "exp-card-22": "seti-0150",
    "exp-card-23": "seti-0151",
    "exp-card-26": "seti-0152",
    "exp-card-27": "seti-0153",
    "exp-card-28": "seti-0154",
    "exp-card-29": "seti-0155",
    "exp-card-32": "seti-0156",
    "exp-card-33": "seti-0157",
    "exp-card-34": "seti-0158",
    "exp-card-35": "seti-0159",
    "exp-card-37": "seti-0160",
    "exp-card-38": "seti-0161",
    "exp-card-42": "seti-0162",
    "exp-card-5": "seti-0137",
    "exp-card-7": "seti-0138",
    "exp-card-8": "seti-0139",
    "exp-et-1": "seti-0163",
    "exp-et-11": "seti-0166",
    "exp-et-14": "seti-0167",
    "exp-et-19": "seti-0168",
    "exp-et-3": "seti-0164",
    "exp-et-34": "seti-0169",
    "exp-et-9": "seti-0165",
    "faq-1": "seti-0001",
    "faq-10": "seti-0010",
    "faq-11": "seti-0011",
    "faq-12": "seti-0012",
    "faq-121": "seti-0121",
    "faq-122": "seti-0122",
    "faq-123": "seti-0123",
    "faq-124": "seti-0124",
    "faq-13": "seti-0013",
    "faq-14": "seti-0014",
    "faq-15": "seti-0015",
    "faq-16": "seti-0016",
    "faq-17": "seti-0017",
    "faq-18": "seti-0018",
    "faq-19": "seti-0019",
    "faq-2": "seti-0002",
    "faq-20": "seti-0020",
    "faq-21": "seti-0021",
    "faq-22": "seti-0022",
    "faq-23": "seti-0023",
    "faq-24": "seti-0024",
    "faq-25": "seti-0025",
    "faq-26": "seti-0026",
    "faq-27": "seti-0027",
    "faq-28": "seti-0028",
    "faq-29": "seti-0029",
    "faq-3": "seti-0003",
    "faq-30": "seti-0030",
    "faq-31": "seti-0031",
    "faq-32": "seti-0032",
    "faq-33": "seti-0033",
    "faq-34": "seti-0034",
    "faq-35": "seti-0035",
    "faq-36": "seti-0036",
    "faq-37": "seti-0037",
    "faq-38": "seti-0038",
    "faq-39": "seti-0039",
    "faq-4": "seti-0004",
    "faq-40": "seti-0040",
    "faq-41": "seti-0041",
    "faq-42": "seti-0042",
    "faq-43": "seti-0043",
    "faq-44": "seti-0044",
    "faq-45": "seti-0045",
    "faq-46": "seti-0046",
    "faq-47": "seti-0047",
    "faq-48": "seti-0048",
    "faq-49": "seti-0049",
    "faq-5": "seti-0005",
    "faq-50": "seti-0050",
    "faq-51": "seti-0051",
    "faq-52": "seti-0052",
    "faq-53": "seti-0053",
    "faq-54": "seti-0054",
    "faq-6": "seti-0006",
    "faq-7": "seti-0007",
    "faq-8": "seti-0008",
    "faq-9": "seti-0009",
    "org-1": "seti-0125",
    "org-10": "seti-0134",
    "org-11": "seti-0135",
    "org-2": "seti-0126",
    "org-21": "seti-0149",
    "org-3": "seti-0127",
    "org-4": "seti-0128",
    "org-5": "seti-0129",
    "org-6": "seti-0130",
    "org-7": "seti-0131",
    "org-8": "seti-0132",
    "org-9": "seti-0133",
    "promo-se-en-01": "seti-0120",
    "promo-se-en-03": "seti-0170"
};

        function findFaqByStableId(value) {
            if (!/^seti-\d{4,}$/.test(value || '')) return null;
            const matches = faqData.filter(item => item.faqId === value);
            return matches.length === 1 ? matches[0] : null;
        }

        function generateFaqSlug(item, index) {
            return findFaqByStableId(item.faqId) === item
                ? item.faqId : generateLegacyFaqSlug(item, index);
        }

        function resolveFaqLink(slug) {
            if (/^seti-/.test(slug)) return findFaqByStableId(slug);

            const mappedId = LEGACY_FAQ_IDS[slug];
            if (mappedId && faqData.some(item => item.faqId)) {
                return findFaqByStableId(mappedId);
            }
            // Support old cached CSVs and card aliases; never infer an ID from partial text.
            return faqData.find((item, index) =>
                (!item.faqId || !/^faq-\d+$/.test(slug)) &&
                generateLegacyFaqSlug(item, index) === slug) || null;
        }

        function generateLegacyFaqSlug(item, index) {
            const isExp = item.edition === '확장' || (item.cat_ko && item.cat_ko.includes('확장'));
            const str = ((item.q_en || '') + ' ' + (item.q_ko || '')).trim();
            const catKo = (item.cat_ko || '').toLowerCase();
            const catEn = (item.cat_en || '').toLowerCase();

            // 1. 프로모 카드 (#SE EN 01, #SE EN 03 등)
            if (catKo.includes('프로모') || catEn.includes('promo') || /#SE\s*EN/i.test(str)) {
                const seMatch = str.match(/#SE\s*EN\s*0*(\d+)/i);
                if (seMatch) {
                    const num = parseInt(seMatch[1], 10);
                    return `promo-se-en-${num < 10 ? '0' + num : num}`;
                }
            }

            // 2. 솔로 모드 행동 카드 (#S.15 ~ #S.19)
            if (catKo.includes('솔로') || catEn.includes('solo') || /#S\.\d+/i.test(str)) {
                const sMatch = str.match(/#S\.0*(\d+)/i);
                if (sMatch) {
                    return `solo-s-${parseInt(sMatch[1], 10)}`;
                }
            }

            // 3. 우주 기관 (#1 ~ #11) -> org-1 ~ org-11
            if (catKo.includes('기관') || catEn.includes('organization') || catEn.includes('agency') || catKo.includes('기구') || /#\d+\s*(orbital|fenwick|stratus|deep sky|turing|cosmos|sentinel|mission relay|xenolab|futurespan|helion)/i.test(str)) {
                const orgMatch = str.match(/#0*(\d+)/);
                if (orgMatch) {
                    return `org-${parseInt(orgMatch[1], 10)}`;
                }
            }

            // 4. 외계종 카드 (#ET.1 ~ #ET.40)
            if (catKo.includes('외계') || catEn.includes('alien') || /#ET\s*\.?\s*\d+/i.test(str)) {
                const etMatch = str.match(/#ET\s*\.?\s*0*(\d+)/i);
                if (etMatch) {
                    const etNum = parseInt(etMatch[1], 10);
                    return isExp ? `exp-et-${etNum}` : `et-${etNum}`;
                }
            }

            // 5. 일반 카드 (#1 ~ #138 등)
            const numMatch = str.match(/#0*(\d+)/);
            if (numMatch) {
                const cardNum = parseInt(numMatch[1], 10);
                return isExp ? `exp-card-${cardNum}` : `card-${cardNum}`;
            }

            // 6. 기타 일반 규칙 FAQ
            return `faq-${item.id !== undefined ? item.id + 1 : index + 1}`;
        }

        function copyFaqLink(slug, event, id) {
            if (event) event.stopPropagation();
            const url = `${window.location.origin}${window.location.pathname}#${slug}`;
            
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    showToast(currentLang === 'KO' ? "🔗 해당 FAQ 공유 링크가 복사되었습니다!" : "🔗 FAQ link copied to clipboard!", "🔗");
                }).catch(() => fallbackCopyText(url));
            } else {
                fallbackCopyText(url);
            }

            const item = faqData.find(d => d.id === id);
            trackEvent('faq_share', {
                faq_slug: slug,
                faq_title: item ? item.q_ko : slug,
                faq_edition: item ? item.edition : ''
            });
        }

        function fallbackCopyText(text) {
            const input = document.createElement('input');
            input.value = text;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast(currentLang === 'KO' ? "🔗 해당 FAQ 공유 링크가 복사되었습니다!" : "🔗 FAQ link copied to clipboard!", "🔗");
        }

        function checkDeepLink() {
            const rawHash = window.location.hash.replace('#', '').trim().toLowerCase();
            if (!rawHash || faqData.length === 0) return;

            const targetItem = resolveFaqLink(rawHash);

            if (targetItem) {
                document.getElementById('searchInput').value = '';
                currentEdition = targetItem.edition;
                currentCategory = '전체';
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                const activeTab = document.getElementById(`tab-${currentEdition}`);
                if (activeTab) activeTab.classList.add('active');

                renderCategories();
                renderFAQs();

                const targetId = targetItem.id;
                const answer = document.getElementById(`answer-${targetId}`);
                const icon = document.getElementById(`icon-${targetId}`);
                if (answer && answer.classList.contains('hidden')) {
                    answer.classList.remove('hidden');
                    if (icon) icon.textContent = '−';
                    document.getElementById(`faq-toggle-${targetId}`).setAttribute('aria-expanded', 'true');
                }

                setTimeout(() => {
                    const cardEl = document.getElementById(`faq-card-${targetId}`);
                    if (cardEl) {
                        document.getElementById(`faq-toggle-${targetId}`).focus({ preventScroll: true });
                        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        cardEl.classList.add('ring-2', 'ring-blue-500', 'shadow-[0_0_25px_rgba(59,130,246,0.6)]');
                        setTimeout(() => {
                            cardEl.classList.remove('ring-2', 'ring-blue-500', 'shadow-[0_0_25px_rgba(59,130,246,0.6)]');
                        }, 3500);
                    }
                }, 250);
            }
        }

        window.addEventListener('hashchange', checkDeepLink);

        // 카드 번호만 입력한 경우 일반 부분 검색 대신 번호 전체를 비교합니다.
        function getCardNumberPattern(query) {
            const match = query.match(/^#?\s*(?:(et)\s*\.?\s*)?(\d+)$/i);
            if (!match) return null;

            const number = match[2].replace(/^0+(?=\d)/, '');
            const prefix = match[1] ? '#\\s*et\\s*\\.?\\s*' : '#\\s*';
            return new RegExp(prefix + '0*' + number + '(?!\\d)', 'i');
        }

        function renderFAQs() {
            document.querySelectorAll('.tab-btn').forEach(button =>
                button.setAttribute('aria-pressed', String(button.id === 'tab-' + currentEdition)));
            const rawQuery = document.getElementById('searchInput').value.toLowerCase().trim();
            const cardNumberPattern = getCardNumberPattern(rawQuery);
            const listContainer = document.getElementById('faqList');
            const t = i18n[currentLang];
            
            const filtered = faqData.filter(item => {
                const matchesEdition = currentEdition === '전체' || item.edition === currentEdition;
                
                let matchesCategory = currentCategory === '전체';
                if (!matchesCategory) {
                    matchesCategory = (item.cat_ko === currentCategory || item.cat_en === currentCategory);
                }

                if (!matchesEdition || !matchesCategory) return false;
                if (!rawQuery) return true;

                const qKo = item.q_ko.toLowerCase();
                const aKo = item.a_ko.toLowerCase();
                const qEn = item.q_en.toLowerCase();
                const aEn = item.a_en.toLowerCase();

                if (cardNumberPattern) {
                    return cardNumberPattern.test(qKo) || cardNumberPattern.test(qEn);
                }

                return qKo.includes(rawQuery) || aKo.includes(rawQuery) ||
                    qEn.includes(rawQuery) || aEn.includes(rawQuery);
            });

            if (filtered.length === 0) {
                listContainer.innerHTML = `<div class="text-center py-12 text-gray-500">${t.noResult}</div>`;
                return;
            }

            listContainer.innerHTML = filtered.map((item, index) => {
                const badgeColor = item.edition === '확장' 
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50' 
                    : 'bg-blue-900/50 text-blue-300 border border-blue-700/50';
                
                const edLabel = currentLang === 'EN' ? (item.edition === '확장' ? 'Expansion' : 'Base') : item.edition;
                const catLabel = currentLang === 'EN' ? item.cat_en : item.cat_ko;
                const slug = generateFaqSlug(item, item.id);
                
                const displayQuestion = currentLang === 'EN' ? (item.q_en || item.q_ko) : (item.q_ko || item.q_en);
                const displayAnswer = formatFaqAnswer(currentLang === 'EN' ? (item.a_en || item.a_ko) : (item.a_ko || item.a_en));

                return `
                <div class="faq-item rounded-2xl overflow-hidden" id="faq-card-${item.id}">
                    <button id="faq-toggle-${item.id}" aria-expanded="false" aria-controls="answer-${item.id}" onclick="toggleFAQ(${item.id})" class="w-full text-left p-5 flex justify-between items-center focus:outline-none cursor-pointer">
                        <div>
                            <div class="flex gap-2 items-center mb-2.5">
                                <span class="text-xs px-2.5 py-1 rounded-md font-semibold ${badgeColor}">${escapeHtml(edLabel)}</span>
                                <span class="text-xs px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 font-medium border border-gray-700/40">${escapeHtml(catLabel)}</span>
                            </div>
                            <h3 class="text-lg font-semibold text-white leading-snug">${escapeHtml(displayQuestion)}</h3>
                        </div>
                        <span id="icon-${item.id}" class="text-gray-400 text-xl ml-4 font-bold">+</span>
                    </button>

                    <!-- 답변 영역 -->
                    <div id="answer-${item.id}" class="hidden px-5 pb-5 pt-1 bg-[#0d1117]/50 border-t border-[#21262d]">
                        <!-- 독립된 답변 블록 카드 -->
                        <div class="p-4 rounded-xl bg-[#161b22] border border-[#30363d] text-sm text-gray-200 leading-relaxed shadow-inner">
                            ${displayAnswer}
                        </div>

                        <!-- 영어 원문 보기 블록 (토글 시 노출) -->
                        ${currentLang === 'KO' && item.a_en && item.a_en !== item.a_ko ? `
                            <div id="en-box-${item.id}" class="hidden mt-3 p-4 rounded-xl bg-[#161b22] border border-blue-900/50 text-xs sm:text-sm text-gray-300 leading-relaxed space-y-2">
                                <div class="font-bold text-blue-300 border-b border-[#30363d] pb-2 flex items-center gap-1.5">
                                    <span>🇺🇸</span> <span>${escapeHtml(item.q_en)}</span>
                                </div>
                                <div>${formatFaqAnswer(item.a_en)}</div>
                            </div>
                        ` : ''}

                        <!-- 하단 단일 액션 버튼 바 -->
                        <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                ${currentLang === 'KO' && item.a_en && item.a_en !== item.a_ko ? `
                                    <button id="en-toggle-${item.id}" aria-expanded="false" aria-controls="en-box-${item.id}" onclick="toggleEnOriginal(${item.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#58a6ff] text-xs font-medium text-gray-200 hover:text-white transition-all shadow-sm focus:outline-none cursor-pointer">
                                        <span>🇺🇸</span>
                                        <span>영어 원문 보기</span>
                                    </button>
                                ` : ''}
                            </div>
                            <div>
                                <button onclick="copyFaqLink('${slug}', event, ${item.id})" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-blue-500 text-xs font-medium text-gray-300 hover:text-white transition-all shadow-sm focus:outline-none cursor-pointer">
                                    <span>🔗</span>
                                    <span>${t.copyLink}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            }).join('');
        }

        function toggleFAQ(id) {
            const answer = document.getElementById(`answer-${id}`);
            const icon = document.getElementById(`icon-${id}`);
            
            if (answer) {
                if (answer.classList.contains('hidden')) {
                    answer.classList.remove('hidden');
                    if (icon) icon.textContent = '−';

                    const item = faqData.find(d => d.id === id);
                    if (item) {
                        trackEvent('faq_open', {
                            faq_title: item.q_ko,
                            faq_category: item.cat_ko,
                            faq_edition: item.edition,
                            language: currentLang
                        });
                    }
                } else {
                    answer.classList.add('hidden');
                    if (icon) icon.textContent = '+';
                    document.getElementById(`faq-toggle-${id}`).setAttribute('aria-expanded', 'false');
                }
            }
        }

        document.getElementById('searchInput').addEventListener('input', () => {
            renderFAQs();

            const query = document.getElementById('searchInput').value.trim();
            clearTimeout(searchDebounceTimer);
            if (query.length >= 2) {
                searchDebounceTimer = setTimeout(() => {
                    trackEvent('search', {
                        search_term: query
                    });
                }, 800);
            }
        });

        setLanguage(currentLang);
        loadCSV(PUBLISHED_URL);

document.getElementById('rulebookDropdownContainer').addEventListener('keydown', event => {
    if (event.key === 'Escape') {
        document.getElementById('rulebookDropdownMenu').classList.add('hidden');
        const button = document.getElementById('rulebook-button');
        button.setAttribute('aria-expanded', 'false');
        button.focus();
        event.preventDefault();
    }
});
