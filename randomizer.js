        const ALIEN_SPECIES = [
            // 본판 (5종)
            { id: 'mascamites', ko: '마스카마이트', en: 'MASCAMITES', exp: false, color: '#a28817' },
            { id: 'anomalies', ko: '어노말리', en: 'ANOMALIES', exp: false, color: '#004c66' },
            { id: 'oumuamua', ko: '오우무아무아', en: '‘OUMUAMUA', exp: false, color: '#313469' },
            { id: 'centaurians', ko: '센타우리안', en: 'CENTAURIANS', exp: false, color: '#004c3f' },
            { id: 'exertians', ko: '엑설티안', en: 'EXERTIANS', exp: false, color: '#bd0306' },
            // 확장 (3종)
            { id: 'arkhos', ko: '아르코스', en: 'ARKHOS', exp: true, color: '#8f0334' },
            { id: 'glyphids', ko: '글리피즈', en: 'GLYPHIDS', exp: true, color: '#0c5f11' },
            { id: 'amoeba', ko: '아메바', en: 'AMOEBA', exp: true, color: '#b7007e' }
        ];

        let currentLang = detectLanguage();
        let appState = {
            step: 'mode',
            mode: null,
            banned: [],
            leftWinner: null,
            rightWinner: null
        };

        function loadState() {
            const saved = localStorage.getItem('seti_randomizer_state');
            if (saved) {
                try {
                    appState = JSON.parse(saved);
                } catch(e) {}
            }
            const savedLang = localStorage.getItem('seti_randomizer_lang');
            if (savedLang) currentLang = savedLang;
        }

        function saveState() {
            localStorage.setItem('seti_randomizer_state', JSON.stringify(appState));
            localStorage.setItem('seti_randomizer_lang', currentLang);
        }

        const i18n = {
            KO: {
                title: "👾 외계종 발견 랜더마이저",
                sub: "본판 및 확장 외계종 추첨 돌림판 시스템",
                faq: "SETI FAQ",
                reset: "초기화",
                step1Title: "1단계: 게임 모드를 선택하세요",
                step1Desc: "플레이할 게임 버전에 따라 외계종 풀이 결정됩니다.",
                modeBaseTitle: "본판만 진행 (5종)",
                modeBaseDesc: "마스카마이트, 어노말리, 오우무아무아, 센타우리안, 엑설티안",
                modeExpTitle: "본판 + 확장 포함 (8종)",
                modeExpDesc: "본판 5종 + 아르코스, 글리피즈, 아메바",
                step2Title: "2단계: 제외(밴)할 외계종 선택",
                step2Desc: "제외할 외계종을 클릭하여 비활성화하세요. (최소 2종 필수 잔여)",
                btnBackMode: "← 모드 재선택",
                btnConfirmBan: "외계종 추첨 단계로 이동 →",
                step3Title: "3단계: 왼쪽 및 오른쪽 외계종 발견 추첨",
                step3Desc: "각 슬롯의 버튼을 눌러 돌림판으로 외계종을 무작위 추첨하세요.",
                leftSlot: "왼쪽 외계종",
                rightSlot: "오른쪽 외계종",
                empty: "미선택 상태",
                spinLeft: "왼쪽 외계종 추첨하기",
                spinRight: "오른쪽 외계종 추첨하기",
                backBan: "← 제외(밴) 목록 다시 수정하기",
                bannedTag: "제외됨 (Banned)",
                spinStart: "추첨 시작",
                spinStop: "🛑 멈추기",
                wheelTitleLeft: "왼쪽 외계종 돌림판 추첨",
                wheelTitleRight: "오른쪽 외계종 돌림판 추첨",
                warnMin: "최소 2개의 외계종은 남아있어야 합니다!",
                toastWin: "외계종이 당첨되었습니다!"
            },
            EN: {
                title: "👾 Alien Discovery Randomizer",
                sub: "Base & Expansion Alien Discovery Wheel",
                faq: "SETI FAQ",
                reset: "Reset",
                step1Title: "Step 1: Select Game Mode",
                step1Desc: "Choose the alien species pool based on your game setup.",
                modeBaseTitle: "Base Game Only (5 Species)",
                modeBaseDesc: "MASCAMITES, ANOMALIES, ‘OUMUAMUA, CENTAURIANS, EXERTIANS",
                modeExpTitle: "Base + Expansion (8 Species)",
                modeExpDesc: "Base 5 Species + ARKHOS, GLYPHIDS, AMOEBA",
                step2Title: "Step 2: Select Banned Species",
                step2Desc: "Click to exclude unwanted species. (At least 2 species must remain)",
                btnBackMode: "← Select Mode",
                btnConfirmBan: "Proceed to Discovery Slots →",
                step3Title: "Step 3: Discover Left & Right Aliens",
                step3Desc: "Spin the wheel for each slot to discover alien species.",
                leftSlot: "Left Alien Species",
                rightSlot: "Right Alien Species",
                empty: "Not Selected",
                spinLeft: "Spin Left Alien",
                spinRight: "Spin Right Alien",
                backBan: "← Modify Banned Species",
                bannedTag: "Banned",
                spinStart: "Start Spin",
                spinStop: "🛑 STOP",
                wheelTitleLeft: "Left Alien Species Wheel",
                wheelTitleRight: "Right Alien Species Wheel",
                warnMin: "At least 2 alien species must remain!",
                toastWin: "Alien Species Discovered!"
            }
        };

        function setLanguage(lang) {
            currentLang = lang;
            document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`lang-${lang}`);
            if (activeBtn) activeBtn.classList.add('active');

            const t = i18n[lang];
            document.getElementById('header-title').textContent = t.title;
            document.getElementById('header-sub').textContent = t.sub;
            document.getElementById('nav-faq').textContent = t.faq;
            document.getElementById('nav-reset').textContent = t.reset;

            document.getElementById('title-step1').textContent = t.step1Title;
            document.getElementById('desc-step1').textContent = t.step1Desc;
            document.getElementById('mode-base-title').textContent = t.modeBaseTitle;
            document.getElementById('mode-base-desc').textContent = t.modeBaseDesc;
            document.getElementById('mode-exp-title').textContent = t.modeExpTitle;
            document.getElementById('mode-exp-desc').textContent = t.modeExpDesc;

            document.getElementById('title-step2').textContent = t.step2Title;
            document.getElementById('desc-step2').textContent = t.step2Desc;
            document.getElementById('btn-back-mode').textContent = t.btnBackMode;
            document.getElementById('btn-confirm-ban').textContent = t.btnConfirmBan;

            document.getElementById('title-step3').textContent = t.step3Title;
            document.getElementById('desc-step3').textContent = t.step3Desc;
            document.getElementById('label-left-slot').textContent = t.leftSlot;
            document.getElementById('label-right-slot').textContent = t.rightSlot;
            document.getElementById('text-btn-spin-left').textContent = t.spinLeft;
            document.getElementById('text-btn-spin-right').textContent = t.spinRight;
            document.getElementById('btn-back-ban').textContent = t.backBan;

            saveState();
            renderUI();
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').textContent = msg;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 2500);
        }

        function selectMode(mode) {
            appState.mode = mode;
            appState.banned = [];
            appState.leftWinner = null;
            appState.rightWinner = null;
            goToStep('ban');

            // GA4 이벤트: 게임 모드 선택 추적 (본판만 vs 본판+확장)
            trackEvent('randomizer_select_mode', {
                game_mode: mode,
                game_mode_label: mode === 'EXP' ? '본판+확장' : '본판만'
            });
        }

        function goToStep(step) {
            appState.step = step;
            saveState();
            renderUI();
        }

        function toggleBan(id) {
            const currentPool = ALIEN_SPECIES.filter(s => appState.mode === 'EXP' || !s.exp);
            const isCurrentlyBanned = appState.banned.includes(id);

            if (!isCurrentlyBanned) {
                const remainingCount = currentPool.length - (appState.banned.length + 1);
                if (remainingCount < 2) {
                    showToast(i18n[currentLang].warnMin);
                    return;
                }
                appState.banned.push(id);
            } else {
                appState.banned = appState.banned.filter(bId => bId !== id);
            }

            appState.leftWinner = null;
            appState.rightWinner = null;
            saveState();
            renderBanGrid();
        }

        function confirmBanSelection() {
            goToStep('slots');

            // GA4 이벤트: 밴 설정 완료 추적
            trackEvent('randomizer_confirm_ban', {
                game_mode: appState.mode,
                banned_count: appState.banned.length,
                banned_list: appState.banned.join(',')
            });
        }

        function resetAll() {
            trackEvent('randomizer_reset', {
                previous_mode: appState.mode
            });

            appState = {
                step: 'mode',
                mode: null,
                banned: [],
                leftWinner: null,
                rightWinner: null
            };
            saveState();
            renderUI();
        }

        function renderBanGrid() {
            const grid = document.getElementById('ban-grid');
            grid.innerHTML = '';

            const available = ALIEN_SPECIES.filter(s => appState.mode === 'EXP' || !s.exp);

            available.forEach(item => {
                const isBanned = appState.banned.includes(item.id);
                const name = currentLang === 'KO' ? item.ko : item.en;
                
                const card = document.createElement('div');
                card.className = `alien-card p-4 rounded-xl border text-center cursor-pointer transition-all ${isBanned ? 'bg-[#0d1117] border-red-900/60 opacity-40 grayscale' : 'glass-card hover:border-[#58a6ff]'}`;
                card.onclick = () => toggleBan(item.id);

                card.innerHTML = `
                    <div class="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-xs shadow-md" style="background-color: ${item.color}">
                        ${item.id[0].toUpperCase()}
                    </div>
                    <div class="text-sm font-bold text-white ${isBanned ? 'line-through text-gray-500' : ''}">${name}</div>
                    ${item.exp ? `<span class="text-[10px] text-purple-400 font-semibold mt-1 inline-block">[${currentLang === 'KO' ? '확장' : 'EXP'}]</span>` : ''}
                    ${isBanned ? `<div class="text-[10px] text-red-400 font-bold mt-1">${i18n[currentLang].bannedTag}</div>` : ''}
                `;
                grid.appendChild(card);
            });
        }

        function renderSlots() {
            const t = i18n[currentLang];

            // 왼쪽 슬롯
            const leftResult = document.getElementById('left-result');
            const btnSpinLeft = document.getElementById('btn-spin-left');
            if (appState.leftWinner) {
                const sp = ALIEN_SPECIES.find(s => s.id === appState.leftWinner);
                const name = currentLang === 'KO' ? sp.ko : sp.en;
                leftResult.innerHTML = `
                    <div class="p-4 rounded-xl border shadow-lg transition-all" style="border-color: ${sp.color}; background-color: ${sp.color}25;">
                        <div class="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-xs shadow" style="background-color: ${sp.color};">
                            ${sp.id[0].toUpperCase()}
                        </div>
                        <div class="text-2xl font-black text-white drop-shadow">${name}</div>
                        <div class="text-xs text-gray-300 mt-1 font-medium">${sp.en}</div>
                    </div>
                `;
                btnSpinLeft.classList.add('hidden');
            } else {
                leftResult.innerHTML = `<span class="text-gray-500 text-sm">${t.empty}</span>`;
                btnSpinLeft.classList.remove('hidden');
            }

            // 오른쪽 슬롯
            const rightResult = document.getElementById('right-result');
            const btnSpinRight = document.getElementById('btn-spin-right');
            if (appState.rightWinner) {
                const sp = ALIEN_SPECIES.find(s => s.id === appState.rightWinner);
                const name = currentLang === 'KO' ? sp.ko : sp.en;
                rightResult.innerHTML = `
                    <div class="p-4 rounded-xl border shadow-lg transition-all" style="border-color: ${sp.color}; background-color: ${sp.color}25;">
                        <div class="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center font-bold text-white text-xs shadow" style="background-color: ${sp.color};">
                            ${sp.id[0].toUpperCase()}
                        </div>
                        <div class="text-2xl font-black text-white drop-shadow">${name}</div>
                        <div class="text-xs text-gray-300 mt-1 font-medium">${sp.en}</div>
                    </div>
                `;
                btnSpinRight.classList.add('hidden');
            } else {
                rightResult.innerHTML = `<span class="text-gray-500 text-sm">${t.empty}</span>`;
                btnSpinRight.classList.remove('hidden');
            }
        }

        function renderUI() {
            document.getElementById('step-mode').classList.toggle('hidden', appState.step !== 'mode');
            document.getElementById('step-ban').classList.toggle('hidden', appState.step !== 'ban');
            document.getElementById('step-slots').classList.toggle('hidden', appState.step !== 'slots');

            if (appState.step === 'ban') renderBanGrid();
            if (appState.step === 'slots') renderSlots();
        }

        // 룰렛 돌림판 엔진
        let currentSlotTarget = null;
        let wheelCandidates = [];
        let currentRotation = 0;
        let isSpinning = false;
        let isStopping = false;
        let animationFrameId = null;
        let stopStartTime = 0;
        let startRotationAtStop = 0;
        let targetFinalRotation = 0;
        let stopDuration = 3800;

        function openWheelModal(slot) {
            currentSlotTarget = slot;
            const t = i18n[currentLang];
            document.getElementById('wheel-modal-title').textContent = slot === 'LEFT' ? t.wheelTitleLeft : t.wheelTitleRight;

            const oppositeWinner = slot === 'LEFT' ? appState.rightWinner : appState.leftWinner;
            wheelCandidates = ALIEN_SPECIES.filter(s => {
                const matchesMode = appState.mode === 'EXP' || !s.exp;
                const notBanned = !appState.banned.includes(s.id);
                const notOpposite = s.id !== oppositeWinner;
                return matchesMode && notBanned && notOpposite;
            });

            isSpinning = false;
            isStopping = false;
            currentRotation = 0;
            updateSpinButtonState();
            
            document.getElementById('wheelModal').classList.remove('hidden');
            drawWheel(0);
        }

        function closeWheelModal() {
            if (isSpinning && !isStopping) return;
            cancelAnimationFrame(animationFrameId);
            document.getElementById('wheelModal').classList.add('hidden');
        }

        function updateSpinButtonState() {
            const btn = document.getElementById('btn-spin-action');
            const label = document.getElementById('btn-spin-label');
            const t = i18n[currentLang];

            if (!isSpinning) {
                btn.className = "w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-lg transition-all cursor-pointer";
                label.textContent = t.spinStart;
                btn.disabled = false;
            } else if (isSpinning && !isStopping) {
                btn.className = "w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base shadow-lg transition-all animate-pulse cursor-pointer";
                label.textContent = t.spinStop;
                btn.disabled = false;
            } else {
                btn.className = "w-full py-3.5 rounded-xl bg-gray-700 text-gray-400 font-bold text-base opacity-75 cursor-not-allowed";
                label.textContent = currentLang === 'KO' ? "감속 중..." : "Slowing down...";
                btn.disabled = true;
            }
        }

        function handleSpinAction() {
            if (!isSpinning) {
                isSpinning = true;
                isStopping = false;
                updateSpinButtonState();
                requestAnimationFrame(animateInfiniteSpin);
            } else if (isSpinning && !isStopping) {
                isStopping = true;
                stopStartTime = performance.now();
                startRotationAtStop = currentRotation;
                updateSpinButtonState();

                const winnerIndex = Math.floor(Math.random() * wheelCandidates.length);
                const winner = wheelCandidates[winnerIndex];

                const sliceAngle = (Math.PI * 2) / wheelCandidates.length;
                const winnerCenterAngle = (winnerIndex + 0.5) * sliceAngle;
                
                const fullRotations = Math.PI * 2 * 4;
                const currentMod = currentRotation % (Math.PI * 2);
                let targetMod = (Math.PI * 1.5 - winnerCenterAngle) % (Math.PI * 2);
                if (targetMod < 0) targetMod += Math.PI * 2;

                let delta = targetMod - currentMod;
                if (delta < 0) delta += Math.PI * 2;

                const safeJitter = (Math.random() - 0.5) * (sliceAngle * 0.5);
                targetFinalRotation = currentRotation + fullRotations + delta + safeJitter;

                requestAnimationFrame((t) => animateDeceleration(t, winner));
            }
        }

        function animateInfiniteSpin() {
            if (!isSpinning || isStopping) return;
            currentRotation += 0.35;
            drawWheel(currentRotation);
            animationFrameId = requestAnimationFrame(animateInfiniteSpin);
        }

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function animateDeceleration(timestamp, winner) {
            const elapsed = timestamp - stopStartTime;
            const progress = Math.min(elapsed / stopDuration, 1);
            const ease = easeOutCubic(progress);

            currentRotation = startRotationAtStop + (targetFinalRotation - startRotationAtStop) * ease;
            drawWheel(currentRotation);

            if (progress < 1) {
                animationFrameId = requestAnimationFrame((t) => animateDeceleration(t, winner));
            } else {
                isSpinning = false;
                isStopping = false;
                
                if (currentSlotTarget === 'LEFT') {
                    appState.leftWinner = winner.id;
                } else {
                    appState.rightWinner = winner.id;
                }
                saveState();

                // GA4 맞춤 이벤트: 외계종 당첨 추적
                trackEvent('randomizer_alien_discovered', {
                    slot_position: currentSlotTarget,
                    slot_label: currentSlotTarget === 'LEFT' ? '왼쪽 외계종' : '오른쪽 외계종',
                    alien_name_ko: winner.ko,
                    alien_name_en: winner.en,
                    alien_id: winner.id,
                    game_mode: appState.mode,
                    is_expansion: winner.exp ? '확장 외계종' : '본판 외계종'
                });

                setTimeout(() => {
                    closeWheelModal();
                    renderSlots();
                }, 800);
            }
        }

        function drawWheel(rotation) {
            const canvas = document.getElementById('wheelCanvas');
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            const center = width / 2;
            const radius = center - 20;

            ctx.clearRect(0, 0, width, height);

            const numSlices = wheelCandidates.length;
            if (numSlices === 0) return;
            const sliceAngle = (Math.PI * 2) / numSlices;

            ctx.save();
            ctx.translate(center, center);
            ctx.rotate(rotation);

            for (let i = 0; i < numSlices; i++) {
                const item = wheelCandidates[i];
                const angleStart = i * sliceAngle;
                const angleEnd = (i + 1) * sliceAngle;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, radius, angleStart, angleEnd);
                ctx.closePath();
                ctx.fillStyle = item.color;
                ctx.fill();

                ctx.strokeStyle = '#0d1117';
                ctx.lineWidth = 6;
                ctx.stroke();

                ctx.save();
                ctx.rotate(angleStart + sliceAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 26px system-ui, sans-serif';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
                ctx.shadowBlur = 6;
                
                const label = currentLang === 'KO' ? item.ko : item.en;
                ctx.fillText(label, radius - 30, 8);
                ctx.restore();
            }

            ctx.beginPath();
            ctx.arc(0, 0, 36, 0, Math.PI * 2);
            ctx.fillStyle = '#0d1117';
            ctx.fill();
            ctx.strokeStyle = '#58a6ff';
            ctx.lineWidth = 6;
            ctx.stroke();

            ctx.restore();
        }

        loadState();
        setLanguage(currentLang);
