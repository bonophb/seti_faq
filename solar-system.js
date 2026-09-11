'use strict';
(() => {
    // Keep cumulative angles so crossing 360° never reverses the animation.
    const angles = [0, 0, 0];
    const wheels = [1, 2, 3].map(n => document.getElementById(`wheel${n}`));
    const status = document.getElementById('status');
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
