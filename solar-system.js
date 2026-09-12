'use strict';
(() => {
    // Keep cumulative angles so crossing 360° never reverses the animation.
    const angles = [0, 0, 0];
    const wheels = [1, 2, 3].map(n => document.getElementById(`wheel${n}`));
    const status = document.getElementById('status');
    const copy = {
        KO: {
            title: '태양계 시뮬레이터', back: '← FAQ로 돌아가기',
            intro: ['원판별 버튼을 눌러 정방향(반시계) 또는 역방향(시계)으로 45°씩 회전할 수 있습니다.',
                '이 시뮬레이터의 사용은 다른 플레이어에게 치팅 행위로 간주될 수 있습니다. 반드시 함께 게임하는 모든 플레이어에게 사용해도 되는지 먼저 확인해 주세요.',
                '실제 게임 진행 중 원판이 회전할 때는 반드시 반시계 방향으로 회전합니다.'],
            forward: '정방향(반시계)', reverse: '역방향(시계)', disc: n => n + '번 원판',
            detail: n => Array.from({length:n},(_,i)=>i+1).join('·') + '번 원판 회전',
            nav: '페이지 및 언어 선택', controls: '원판별 회전 조작',
            board: '4개의 회전판과 중앙 태양으로 구성된 태양계', credits: '이미지: Czech Games Edition · SETI'
        },
        EN: {
            title: 'Solar System Simulator', back: '← Back to FAQ',
            intro: ['Use the disc controls to rotate 45° forward (counterclockwise) or backward (clockwise).',
                'Other players may consider using this simulator to be cheating. Please obtain permission from everyone playing before using it.',
                'During actual gameplay, discs always rotate counterclockwise.'],
            forward: 'Forward (CCW)', reverse: 'Reverse (CW)', disc: n => 'Disc ' + n,
            detail: n => 'Rotate ' + (n === 1 ? 'disc 1' : 'discs ' + Array.from({length:n},(_,i)=>i+1).join(' · ')),
            nav: 'Page and language selection', controls: 'Disc rotation controls',
            board: 'Solar system with four discs and a central sun', credits: 'Artwork: Czech Games Edition · SETI'
        }
    };
    function setLanguage(lang, persist = true) {
        if (!copy[lang]) return;
        const t = copy[lang];
        document.documentElement.lang = lang.toLowerCase();
        document.title = 'SETI · ' + t.title;
        document.querySelector('h1').textContent = t.title;
        document.getElementById('back-faq').textContent = t.back;
        document.querySelectorAll('.intro p').forEach((p,i) => {
            (p.querySelector('strong') || p).textContent = t.intro[i];
        });
        document.querySelector('.top-nav').setAttribute('aria-label', t.nav);
        document.querySelector('.controls').setAttribute('aria-label', t.controls);
        document.querySelector('.board').setAttribute('aria-label', t.board);
        document.querySelector('.credits').textContent = t.credits;
        document.querySelectorAll('.row').forEach((row,i) => {
            const label = row.querySelector('.label');
            label.firstChild.textContent = t.disc(i+1);
            label.querySelector('small').textContent = t.detail(i+1);
        });
        document.querySelectorAll('button[data-layer]').forEach(button => {
            const direction = button.dataset.direction === '-1' ? t.forward : t.reverse;
            button.textContent = direction;
            button.setAttribute('aria-label', t.disc(Number(button.dataset.layer)) + ' ' + direction + ' 45°');
        });
        ['KO','EN'].forEach(code => document.getElementById('lang-'+code).setAttribute('aria-pressed',String(code===lang)));
        if (persist) { try { localStorage.setItem('seti_language',lang); } catch {} }
    }
    let saved;
    try { saved = localStorage.getItem('seti_language') || localStorage.getItem('seti_randomizer_lang'); } catch {}
    setLanguage(copy[saved] ? saved : ((navigator.language || '').toLowerCase().startsWith('ko') ? 'KO' : 'EN'));
    ['KO','EN'].forEach(lang => document.getElementById('lang-'+lang).addEventListener('click',()=>setLanguage(lang)));
    window.addEventListener('storage',event => {
        if (event.key === 'seti_language' && copy[event.newValue]) setLanguage(event.newValue,false);
    });
    document.querySelectorAll('button[data-layer]').forEach(button => {
        button.addEventListener('click', () => {
            const layer = Number(button.dataset.layer);
            const direction = Number(button.dataset.direction);
            if (![1, 2, 3].includes(layer) || ![-1, 1].includes(direction)) return;
            for (let i = 0; i < layer; i++) {
                angles[i] += direction * 45;
                wheels[i].style.transform = `translate(-50%,-50%) rotate(${angles[i]}deg)`;
            }
            status.textContent = angles.map((angle, i) => `휠 ${i + 1}: ${((angle % 360) + 360) % 360}°`).join(' · ');
        });
    });
})();
