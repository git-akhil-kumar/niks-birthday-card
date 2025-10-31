// Flappy Bird-style Game
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

let flappy = {
    canvas: null,
    ctx: null,
    width: 400,
    height: 600,
    bird: { x: 80, y: 300, r: 12, vy: 0 },
    gravity: 0.42,
    flap: -8.5,
    pipes: [],
    pipeGap: 180,
    pipeWidth: 60,
    pipeTimer: 0,
    pipeInterval: 1500,
    speed: 2.2,
    score: 0,
    best: 0,
    running: false,
    rafId: null,
    keyHandler: null,
    tapHandler: null
};

function initFlappy() {
    flappy.canvas = document.getElementById('flappyCanvas');
    if (!flappy.canvas) return;
    const existingOverlay = document.querySelector('.flappy-overlay');
    if (existingOverlay) existingOverlay.remove();
    flappy.ctx = flappy.canvas.getContext('2d');
    flappy.canvas.width = flappy.width;
    flappy.canvas.height = flappy.height;
    flappy.bird.x = 80;
    flappy.bird.y = flappy.height / 2;
    flappy.bird.vy = 0;
    flappy.pipes = [];
    flappy.pipeTimer = 0;
    flappy.pipeInterval = 1500;
    flappy.pipeGap = 180;
    flappy.speed = 2.2;
    flappy.score = 0;
    loadFlappyBest();
    setupFlappyControls();
    updateFlappyUI();
    flappy.running = true;
    flappyLoop();
}

function setupFlappyControls() {
    flappy.keyHandler = (e) => {
        const modal = document.getElementById('flappyModal');
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === ' ' || e.key === 'ArrowUp') {
            e.preventDefault();
            flapBird();
        }
    };
    document.addEventListener('keydown', flappy.keyHandler);

    flappy.tapHandler = (e) => {
        const modal = document.getElementById('flappyModal');
        if (!modal || !modal.classList.contains('active')) return;
        e.preventDefault();
        flapBird();
    };
    flappy.canvas.addEventListener('touchstart', flappy.tapHandler, { passive: false });
    flappy.canvas.addEventListener('mousedown', flappy.tapHandler);
}

function cleanupFlappyControls() {
    if (flappy.keyHandler) {
        document.removeEventListener('keydown', flappy.keyHandler);
        flappy.keyHandler = null;
    }
    if (flappy.canvas && flappy.tapHandler) {
        flappy.canvas.removeEventListener('touchstart', flappy.tapHandler);
        flappy.canvas.removeEventListener('mousedown', flappy.tapHandler);
        flappy.tapHandler = null;
    }
}

function flapBird() {
    flappy.bird.vy = flappy.flap;
}

function spawnPipe() {
    const margin = 50;
    const maxTop = flappy.height - margin - flappy.pipeGap - margin;
    const top = margin + Math.random() * maxTop;
    flappy.pipes.push({ x: flappy.width + 20, top: top, passed: false });
}

function updateFlappy(dt) {
    // Bird physics
    flappy.bird.vy += flappy.gravity;
    flappy.bird.y += flappy.bird.vy;

    // Ground/ceiling
    if (flappy.bird.y - flappy.bird.r < 0) {
        flappy.bird.y = flappy.bird.r;
        flappy.bird.vy = 0;
    }
    if (flappy.bird.y + flappy.bird.r > flappy.height - 40) {
        flappy.bird.y = flappy.height - 40 - flappy.bird.r;
        gameOverFlappy();
        return;
    }

    // Pipes
    flappy.pipeTimer += dt;
    if (flappy.pipeTimer >= flappy.pipeInterval) {
        flappy.pipeTimer = 0;
        spawnPipe();
        // Gentle difficulty ramp
        flappy.speed = Math.min(4.2, flappy.speed + 0.03);
        flappy.pipeGap = Math.max(150, flappy.pipeGap - 0.5);
        flappy.pipeInterval = Math.max(1100, flappy.pipeInterval - 6);
    }
    for (let p of flappy.pipes) {
        p.x -= flappy.speed;
        // Score when passed
        if (!p.passed && p.x + flappy.pipeWidth < flappy.bird.x - flappy.bird.r) {
            p.passed = true;
            flappy.score += 1;
            updateFlappyUI();
        }
    }
    flappy.pipes = flappy.pipes.filter(p => p.x + flappy.pipeWidth > -20);
    if (flappy.pipes.length > 200) {
        flappy.pipes = flappy.pipes.slice(-200);
    }

    // Collision
    for (let p of flappy.pipes) {
        const bird = flappy.bird;
        // Top pipe rect: (p.x, 0, pipeWidth, p.top - pipeGap/2)
        const gapTop = p.top - flappy.pipeGap / 2;
        const gapBottom = p.top + flappy.pipeGap / 2;
        const inPipeX = bird.x + bird.r > p.x && bird.x - bird.r < p.x + flappy.pipeWidth;
        if (inPipeX) {
            if (bird.y - bird.r < gapTop || bird.y + bird.r > gapBottom) {
                gameOverFlappy();
                return;
            }
        }
    }
}

function drawFlappy() {
    const ctx = flappy.ctx;
    ctx.clearRect(0, 0, flappy.width, flappy.height);
    // Sky
    const g = ctx.createLinearGradient(0, 0, 0, flappy.height);
    g.addColorStop(0, '#74ebd5');
    g.addColorStop(1, '#acb6e5');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, flappy.width, flappy.height);

    // Ground
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, flappy.height - 40, flappy.width, 40);

    // Pipes
    ctx.fillStyle = '#2ecc71';
    for (let p of flappy.pipes) {
        const gapTop = p.top - flappy.pipeGap / 2;
        const gapBottom = p.top + flappy.pipeGap / 2;
        // Top
        ctx.fillRect(p.x, 0, flappy.pipeWidth, gapTop);
        // Bottom
        ctx.fillRect(p.x, gapBottom, flappy.pipeWidth, flappy.height - 40 - gapBottom);
    }

    // Bird
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(flappy.bird.x, flappy.bird.y, flappy.bird.r, 0, Math.PI * 2);
    ctx.fill();
}

let lastTsf = 0;
function flappyLoop(ts) {
    if (!flappy.running) return;
    if (!lastTsf) lastTsf = ts || performance.now();
    const now = ts || performance.now();
    const dt = now - lastTsf;
    lastTsf = now;
    try {
        updateFlappy(dt);
        drawFlappy();
        flappy.rafId = requestAnimationFrame(flappyLoop);
    } catch (err) {
        console.error('Flappy error:', err);
        flappy.running = false;
        if (flappy.rafId) cancelAnimationFrame(flappy.rafId);
        cleanupFlappyControls();
        showFlappyErrorOverlay(err);
    }
}

function updateFlappyUI() {
    const s = document.getElementById('flappyScore');
    const b = document.getElementById('flappyBest');
    if (s) s.textContent = flappy.score;
    if (b) b.textContent = flappy.best;
}

function loadFlappyBest() {
    const saved = localStorage.getItem('flappy-best');
    if (saved) flappy.best = parseInt(saved);
}

function saveFlappyBest() {
    localStorage.setItem('flappy-best', flappy.best);
}

function showFlappyOverlay() {
    const container = document.querySelector('.flappy-container');
    if (!container) return;
    const overlay = document.createElement('div');
    overlay.className = 'flappy-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>Game Over!</h2>
            <p>Score: ${flappy.score} | Best: ${flappy.best}</p>
            <button class="play-again-btn" onclick="restartFlappy()">Play Again</button>
        </div>
    `;
    container.appendChild(overlay);
}

function showFlappyErrorOverlay(err) {
    const container = document.querySelector('.flappy-container');
    if (!container) return;
    const overlay = document.createElement('div');
    overlay.className = 'flappy-overlay';
    const content = document.createElement('div');
    content.className = 'game-over-content';
    const h2 = document.createElement('h2');
    h2.textContent = 'Oops! Crash';
    const p = document.createElement('p');
    p.textContent = (err && err.message) ? escapeHtml(err.message) : 'Unexpected error';
    const btn = document.createElement('button');
    btn.className = 'play-again-btn';
    btn.textContent = 'Restart';
    btn.onclick = restartFlappy;
    content.appendChild(h2);
    content.appendChild(p);
    content.appendChild(btn);
    overlay.appendChild(content);
    container.appendChild(overlay);
}

function gameOverFlappy() {
    flappy.running = false;
    if (flappy.rafId) cancelAnimationFrame(flappy.rafId);
    if (flappy.score > flappy.best) {
        flappy.best = flappy.score;
        saveFlappyBest();
    }
    showFlappyOverlay();
}

function restartFlappy() {
    const overlay = document.querySelector('.flappy-overlay');
    if (overlay) overlay.remove();
    lastTsf = 0;
    initFlappy();
}

window.initFlappy = initFlappy;
window.restartFlappy = restartFlappy;
window.cleanupFlappyControls = cleanupFlappyControls;

