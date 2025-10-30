// Endless Runner - Smooth Canvas Game
let runner = {
    canvas: null,
    ctx: null,
    width: 800,
    height: 400,
    groundY: 340,
    player: { x: 80, y: 0, w: 40, h: 60, vy: 0, onGround: true, sliding: false, slideTimer: 0 },
    gravity: 0.7,
    jumpStrength: -12,
    obstacles: [],
    obstacleTimer: 0,
    obstacleInterval: 900,
    speed: 6,
    score: 0,
    highScore: 0,
    running: false,
    rafId: null,
    touchStartX: 0,
    touchStartY: 0,
    keyHandler: null,
    touchStartHandler: null,
    touchEndHandler: null,
    resizeHandler: null,
    playerImg: null,
    bgImg: null,
    bgOffset: 0,
    animTime: 0,
    animFrame: 0
};

function initRunner() {
    runner.canvas = document.getElementById('runnerCanvas');
    if (!runner.canvas) return;
    const existingOverlay = document.querySelector('.runner-overlay');
    if (existingOverlay) existingOverlay.remove();
    runner.ctx = runner.canvas.getContext('2d');
    setupRunnerResponsiveCanvas();
    runner.player.y = runner.groundY - runner.player.h;
    runner.player.vy = 0;
    runner.player.onGround = true;
    runner.player.sliding = false;
    runner.player.slideTimer = 0;
    runner.obstacles = [];
    runner.obstacleTimer = 0;
    runner.speed = 6;
    runner.score = 0;
    loadRunnerHighScore();
    setupRunnerControls();
    loadRunnerAssets();
    updateRunnerUI();
    runner.running = true;
    runnerLoop();
}

function loadRunnerAssets() {
    // Disable external player image – use canvas-drawn sprite so direction is correct
    runner.playerImg = null;
    runner.bgImg = new Image();
    runner.bgImg.src = '/static/runner-bg.png';
    runner.bgImg.onerror = () => { runner.bgImg = null; };
}

function setupRunnerResponsiveCanvas() {
    const container = runner.canvas.parentElement;
    const scaleWidth = container ? Math.min(820, container.clientWidth) : runner.width;
    const aspect = runner.width / runner.height;
    const targetWidth = Math.max(320, scaleWidth);
    const targetHeight = Math.round(targetWidth / aspect);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    runner.canvas.style.width = targetWidth + 'px';
    runner.canvas.style.height = targetHeight + 'px';
    runner.canvas.width = Math.round(targetWidth * dpr);
    runner.canvas.height = Math.round(targetHeight * dpr);
    runner.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Update logical sizes
    runner.width = targetWidth;
    runner.height = targetHeight;
    runner.groundY = Math.round(targetHeight * 0.85);
    if (runner.player) {
        runner.player.y = runner.groundY - runner.player.h;
    }
    // Add resize listener
    if (!runner.resizeHandler) {
        runner.resizeHandler = () => { setupRunnerResponsiveCanvas(); };
        window.addEventListener('resize', runner.resizeHandler);
    }
}

function setupRunnerControls() {
    runner.keyHandler = (e) => {
        const modal = document.getElementById('runnerModal');
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'ArrowUp' || e.key === ' ') { runnerJump(); }
        if (e.key === 'ArrowDown') { runnerSlide(); }
    };
    document.addEventListener('keydown', runner.keyHandler);

    runner.touchStartHandler = (e) => {
        const modal = document.getElementById('runnerModal');
        if (!modal || !modal.classList.contains('active')) return;
        e.preventDefault();
        const t = e.touches[0];
        runner.touchStartX = t.clientX;
        runner.touchStartY = t.clientY;
    };
    runner.touchEndHandler = (e) => {
        const modal = document.getElementById('runnerModal');
        if (!modal || !modal.classList.contains('active')) return;
        e.preventDefault();
        const t = e.changedTouches[0];
        const dx = t.clientX - runner.touchStartX;
        const dy = t.clientY - runner.touchStartY;
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        const minSwipe = 24;
        if (ay > ax && ay > minSwipe) {
            if (dy < 0) runnerJump(); else runnerSlide();
        } else if (ax < minSwipe && ay < minSwipe) {
            // tap -> jump
            runnerJump();
        }
    };
    runner.canvas.addEventListener('touchstart', runner.touchStartHandler, { passive: false });
    runner.canvas.addEventListener('touchend', runner.touchEndHandler, { passive: false });
}

function cleanupRunnerControls() {
    if (runner.keyHandler) {
        document.removeEventListener('keydown', runner.keyHandler);
        runner.keyHandler = null;
    }
    if (runner.canvas && runner.touchStartHandler) {
        runner.canvas.removeEventListener('touchstart', runner.touchStartHandler);
        runner.touchStartHandler = null;
    }
    if (runner.canvas && runner.touchEndHandler) {
        runner.canvas.removeEventListener('touchend', runner.touchEndHandler);
        runner.touchEndHandler = null;
    }
    if (runner.resizeHandler) {
        window.removeEventListener('resize', runner.resizeHandler);
        runner.resizeHandler = null;
    }
}

function runnerJump() {
    if (runner.player.onGround && !runner.player.sliding) {
        runner.player.vy = runner.jumpStrength;
        runner.player.onGround = false;
    }
}

function runnerSlide() {
    if (runner.player.onGround && !runner.player.sliding) {
        runner.player.sliding = true;
        runner.player.slideTimer = 220; // ms
    }
}

function spawnObstacle() {
    // Randomly tall or short obstacle
    const type = Math.random() < 0.5 ? 'low' : 'high';
    const width = type === 'low' ? 30 : 30;
    const height = type === 'low' ? 30 : 60;
    const y = runner.groundY - height;
    runner.obstacles.push({ x: runner.width + 20, y, w: width, h: height, type });
}

function updateRunner(dt) {
    // Player physics
    runner.player.vy += runner.gravity;
    runner.player.y += runner.player.vy;
    if (runner.player.y >= runner.groundY - runner.player.h) {
        runner.player.y = runner.groundY - runner.player.h;
        runner.player.vy = 0;
        runner.player.onGround = true;
    }
    // Slide shrink
    if (runner.player.sliding) {
        runner.player.slideTimer -= dt;
        runner.player.h = 38;
        if (runner.player.slideTimer <= 0) {
            runner.player.sliding = false;
            runner.player.h = 60;
            runner.player.y = runner.groundY - runner.player.h;
        }
    }

    // Obstacles
    runner.obstacleTimer += dt;
    if (runner.obstacleTimer >= runner.obstacleInterval) {
        runner.obstacleTimer = 0;
        spawnObstacle();
        // Gradually speed up and shorten interval
        runner.speed = Math.min(14, runner.speed + 0.15);
        runner.obstacleInterval = Math.max(520, runner.obstacleInterval - 12);
    }
    for (let i = 0; i < runner.obstacles.length; i++) {
        const ob = runner.obstacles[i];
        ob.x -= runner.speed;
    }
    // Remove off-screen
    runner.obstacles = runner.obstacles.filter(ob => ob.x + ob.w > -10);
    if (runner.obstacles.length > 200) {
        runner.obstacles = runner.obstacles.slice(-200);
    }

    // Background parallax scroll
    runner.bgOffset = (runner.bgOffset + runner.speed * 0.6) % runner.width;

    // Collision
    for (let ob of runner.obstacles) {
        const px = runner.player.x;
        const py = runner.player.y;
        const pw = runner.player.w;
        const ph = runner.player.h;
        if (px < ob.x + ob.w && px + pw > ob.x && py < ob.y + ob.h && py + ph > ob.y) {
            gameOverRunner();
            return;
        }
    }

    // Score
    runner.score += Math.floor(runner.speed * 0.6);
    updateRunnerUI();

    // Advance simple running animation (2-frame)
    runner.animTime += dt;
    if (runner.animTime > 120) { // ms per frame
        runner.animTime = 0;
        runner.animFrame = (runner.animFrame + 1) % 2;
    }
}

function drawRunner() {
    const ctx = runner.ctx;
    ctx.clearRect(0, 0, runner.canvas.width, runner.canvas.height);

    // Background image tiling with gradient fallback
    if (runner.bgImg && runner.bgImg.complete) {
        const img = runner.bgImg;
        const scale = runner.height / img.height;
        const drawW = Math.ceil(img.width * scale);
        let x = -runner.bgOffset;
        while (x < runner.width) {
            ctx.drawImage(img, 0, 0, img.width, img.height, Math.floor(x), 0, drawW, runner.height);
            x += drawW;
        }
    } else {
        const g = ctx.createLinearGradient(0, 0, 0, runner.height);
        g.addColorStop(0, '#1a2a6c');
        g.addColorStop(1, '#fdbb2d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, runner.width, runner.height);
    }

    // Ground
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, runner.groundY, runner.width, runner.height - runner.groundY);
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, runner.groundY);
    ctx.lineTo(runner.width, runner.groundY);
    ctx.stroke();

    // Player: draw a lightweight vector sprite facing right with simple leg animation
    drawRunnerSprite(ctx);

    // Obstacles
    ctx.fillStyle = '#27ae60';
    for (let ob of runner.obstacles) {
        ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
    }
}

function drawRunnerSprite(ctx) {
    const x = runner.player.x;
    const y = runner.player.y;
    const h = runner.player.h;

    // Use emoji runner facing right with subtle bobbing
    const bob = Math.sin((runner.animFrame + runner.animTime / 120) * Math.PI) * Math.min(4, h * 0.06);
    ctx.font = Math.floor(h * 0.9) + 'px sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText('🏃‍♂️', x, y - 6 + bob);

    // When sliding, draw a small ground dash to suggest slide
    if (runner.player.sliding) {
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y + h - 4);
        ctx.lineTo(x + h * 0.8, y + h - 4);
        ctx.stroke();
    }
}

let lastTs = 0;
function runnerLoop(ts) {
    if (!runner.running) return;
    if (!lastTs) lastTs = ts || performance.now();
    const now = ts || performance.now();
    const dt = now - lastTs;
    lastTs = now;

    try {
        updateRunner(dt);
        drawRunner();
        runner.rafId = requestAnimationFrame(runnerLoop);
    } catch (err) {
        console.error('Runner error:', err);
        runner.running = false;
        if (runner.rafId) cancelAnimationFrame(runner.rafId);
        cleanupRunnerControls();
        showRunnerErrorOverlay(err);
    }
}

function updateRunnerUI() {
    const scoreEl = document.getElementById('runnerScore');
    const bestEl = document.getElementById('runnerBest');
    if (scoreEl) scoreEl.textContent = runner.score;
    if (bestEl) bestEl.textContent = runner.highScore;
}

function loadRunnerHighScore() {
    const saved = localStorage.getItem('runner-best');
    if (saved) runner.highScore = parseInt(saved);
}

function saveRunnerHighScore() {
    localStorage.setItem('runner-best', runner.highScore);
}

function gameOverRunner() {
    runner.running = false;
    if (runner.rafId) cancelAnimationFrame(runner.rafId);
    if (runner.score > runner.highScore) {
        runner.highScore = runner.score;
        saveRunnerHighScore();
    }
    showRunnerOverlay();
}

function showRunnerOverlay() {
    const container = document.querySelector('.runner-container');
    if (!container) return;
    const overlay = document.createElement('div');
    overlay.className = 'runner-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>Game Over!</h2>
            <p>Score: ${runner.score} | Best: ${runner.highScore}</p>
            <button class="play-again-btn" onclick="restartRunner()">Play Again</button>
        </div>
    `;
    container.appendChild(overlay);
}

function showRunnerErrorOverlay(err) {
    const container = document.querySelector('.runner-container');
    if (!container) return;
    const overlay = document.createElement('div');
    overlay.className = 'runner-overlay';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>Oops! Crash</h2>
            <p>${(err && err.message) ? err.message : 'Unexpected error'}</p>
            <button class="play-again-btn" onclick="restartRunner()">Restart</button>
        </div>
    `;
    container.appendChild(overlay);
}

function restartRunner() {
    const overlay = document.querySelector('.runner-overlay');
    if (overlay) overlay.remove();
    lastTs = 0;
    initRunner();
}

window.initRunner = initRunner;
window.restartRunner = restartRunner;
window.cleanupRunnerControls = cleanupRunnerControls;

