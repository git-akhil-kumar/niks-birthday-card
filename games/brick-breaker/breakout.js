// Brick Breaker Game
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

let breakout = {
    canvas: null,
    ctx: null,
    paddleX: 0,
    ballX: 400,
    ballY: 300,
    ballDX: 3,
    ballDY: -3,
    bricks: [],
    score: 0,
    lives: 3,
    gameRunning: false,
    gameInterval: null,
    keyHandler: null,
    keyUpHandler: null,
    mouseHandler: null,
    touchHandler: null,
    keyLeft: false,
    keyRight: false,
    paddleSpeed: 10
};

function initBreakout() {
    breakout.score = 0;
    breakout.lives = 3;
    breakout.gameRunning = true;
    
    breakout.canvas = document.getElementById('breakoutCanvas');
    if (!breakout.canvas) return;
    const existingOverlay = document.querySelector('.game-over-breakout');
    if (existingOverlay) existingOverlay.remove();
    
    breakout.ctx = breakout.canvas.getContext('2d');
    breakout.canvas.width = 800;
    breakout.canvas.height = 600;
    
    breakout.ballX = breakout.canvas.width / 2;
    breakout.ballY = breakout.canvas.height / 2;
    breakout.paddleX = (breakout.canvas.width - 120) / 2;
    
    initBreakoutBricks();
    
    setupBreakoutControls();
    updateBreakoutUI();
    breakoutGameLoop();
}

function initBreakoutBricks() {
    breakout.bricks = [];
    const rows = 5;
    const cols = 10;
    const brickWidth = 70;
    const brickHeight = 20;
    const padding = 5;
    const offsetTop = 60;
    const offsetLeft = 50;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            breakout.bricks.push({
                x: offsetLeft + c * (brickWidth + padding),
                y: offsetTop + r * (brickHeight + padding),
                width: brickWidth,
                height: brickHeight,
                visible: true,
                color: `hsl(${(r * 360) / rows}, 70%, 50%)`
            });
        }
    }
}

function setupBreakoutControls() {
    // Store handlers so we can clean them up on close
    breakout.keyHandler = (e) => {
        const modal = document.getElementById('breakoutModal');
        if (!modal || !modal.classList.contains('active')) return;
        if (e.key === 'ArrowLeft') { breakout.keyLeft = true; e.preventDefault(); }
        if (e.key === 'ArrowRight') { breakout.keyRight = true; e.preventDefault(); }
    };
    document.addEventListener('keydown', breakout.keyHandler);
    breakout.keyUpHandler = (e) => {
        if (e.key === 'ArrowLeft') breakout.keyLeft = false;
        if (e.key === 'ArrowRight') breakout.keyRight = false;
    };
    document.addEventListener('keyup', breakout.keyUpHandler);

    breakout.mouseHandler = (e) => {
        const rect = breakout.canvas.getBoundingClientRect();
        breakout.paddleX = e.clientX - rect.left - 60;
        breakout.paddleX = Math.max(0, Math.min(breakout.canvas.width - 120, breakout.paddleX));
    };
    breakout.canvas.addEventListener('mousemove', breakout.mouseHandler);

    // Touch controls for mobile
    breakout.touchHandler = (e) => {
        const modal = document.getElementById('breakoutModal');
        if (!modal || !modal.classList.contains('active')) return;
        e.preventDefault();
        const rect = breakout.canvas.getBoundingClientRect();
        const touch = e.touches && e.touches.length > 0 ? e.touches[0] : (e.changedTouches && e.changedTouches.length > 0 ? e.changedTouches[0] : null);
        if (!touch) return;
        breakout.paddleX = touch.clientX - rect.left - 60;
        breakout.paddleX = Math.max(0, Math.min(breakout.canvas.width - 120, breakout.paddleX));
    };
    breakout.canvas.addEventListener('touchmove', breakout.touchHandler, { passive: false });
    breakout.canvas.addEventListener('touchstart', breakout.touchHandler, { passive: false });
}

function cleanupBreakoutControls() {
    if (breakout.keyHandler) {
        document.removeEventListener('keydown', breakout.keyHandler);
        breakout.keyHandler = null;
    }
    if (breakout.keyUpHandler) {
        document.removeEventListener('keyup', breakout.keyUpHandler);
        breakout.keyUpHandler = null;
    }
    if (breakout.canvas && breakout.mouseHandler) {
        breakout.canvas.removeEventListener('mousemove', breakout.mouseHandler);
        breakout.mouseHandler = null;
    }
    if (breakout.canvas && breakout.touchHandler) {
        breakout.canvas.removeEventListener('touchmove', breakout.touchHandler);
        breakout.canvas.removeEventListener('touchstart', breakout.touchHandler);
        breakout.touchHandler = null;
    }
}

function breakoutGameLoop() {
    if (!breakout.gameRunning) return;
    try {
        clearBreakoutCanvas();
        updateBreakoutPaddle();
        drawBreakoutBricks();
        drawBreakoutPaddle();
        moveBreakoutBall();
        drawBreakoutBall();
        breakout.gameInterval = requestAnimationFrame(breakoutGameLoop);
    } catch (err) {
        console.error('Breakout error:', err);
        breakout.gameRunning = false;
        if (breakout.gameInterval) cancelAnimationFrame(breakout.gameInterval);
        showBreakoutError(err);
    }
}

function updateBreakoutPaddle() {
    if (breakout.keyLeft) {
        breakout.paddleX = Math.max(0, breakout.paddleX - breakout.paddleSpeed);
    }
    if (breakout.keyRight) {
        breakout.paddleX = Math.min(breakout.canvas.width - 120, breakout.paddleX + breakout.paddleSpeed);
    }
}

function clearBreakoutCanvas() {
    breakout.ctx.fillStyle = '#001122';
    breakout.ctx.fillRect(0, 0, breakout.canvas.width, breakout.canvas.height);
}

function drawBreakoutBricks() {
    let allDestroyed = true;
    breakout.bricks.forEach((brick, index) => {
        if (brick.visible) {
            allDestroyed = false;
            breakout.ctx.fillStyle = brick.color;
            breakout.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            breakout.ctx.strokeStyle = '#fff';
            breakout.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
    });
    
    if (allDestroyed) {
        breakout.gameRunning = false;
        showBreakoutWin();
    }
}

function drawBreakoutPaddle() {
    breakout.ctx.fillStyle = '#fff';
    breakout.ctx.fillRect(breakout.paddleX, breakout.canvas.height - 30, 120, 20);
}

function drawBreakoutBall() {
    breakout.ctx.beginPath();
    breakout.ctx.arc(breakout.ballX, breakout.ballY, 10, 0, Math.PI * 2);
    breakout.ctx.fillStyle = '#fff';
    breakout.ctx.fill();
    breakout.ctx.closePath();
}

function moveBreakoutBall() {
    breakout.ballX += breakout.ballDX;
    breakout.ballY += breakout.ballDY;
    
    // Wall collision
    if (breakout.ballX <= 10 || breakout.ballX >= breakout.canvas.width - 10) {
        breakout.ballDX = -breakout.ballDX;
    }
    if (breakout.ballY <= 10) {
        breakout.ballDY = -breakout.ballDY;
    }
    
    // Paddle collision
    if (breakout.ballY >= breakout.canvas.height - 40 &&
        breakout.ballX >= breakout.paddleX &&
        breakout.ballX <= breakout.paddleX + 120 &&
        breakout.ballDY > 0) {
        breakout.ballDY = -breakout.ballDY;
        // Add angle based on paddle hit position
        const hitPos = (breakout.ballX - breakout.paddleX) / 120;
        breakout.ballDX = (hitPos - 0.5) * 6;
    }
    
    // Ball lost
    if (breakout.ballY > breakout.canvas.height) {
        breakout.lives--;
        updateBreakoutUI();
        
        if (breakout.lives <= 0) {
            breakout.gameRunning = false;
            showBreakoutGameOver();
            return;
        }
        
        // Reset ball
        breakout.ballX = breakout.canvas.width / 2;
        breakout.ballY = breakout.canvas.height / 2;
        breakout.ballDX = 3;
        breakout.ballDY = -3;
    }
    
    // Brick collision
    breakout.bricks.forEach((brick, index) => {
        if (brick.visible &&
            breakout.ballX + 10 > brick.x &&
            breakout.ballX - 10 < brick.x + brick.width &&
            breakout.ballY + 10 > brick.y &&
            breakout.ballY - 10 < brick.y + brick.height) {
            brick.visible = false;
            breakout.ballDY = -breakout.ballDY;
            breakout.score += 10;
            updateBreakoutUI();
        }
    });
}

function updateBreakoutUI() {
    const scoreEl = document.getElementById('breakoutScore');
    const livesEl = document.getElementById('breakoutLives');
    
    if (scoreEl) scoreEl.textContent = breakout.score;
    if (livesEl) livesEl.textContent = breakout.lives;
}

function showBreakoutWin() {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-breakout';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>🎉 You Win! 🎉</h2>
            <p>Final Score: ${breakout.score}</p>
            <button class="play-again-btn" onclick="restartBreakout()">Play Again</button>
        </div>
    `;
    
    document.querySelector('.breakout-container').appendChild(overlay);
}

function showBreakoutGameOver() {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-breakout';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>Game Over!</h2>
            <p>Final Score: ${breakout.score}</p>
            <button class="play-again-btn" onclick="restartBreakout()">Play Again</button>
        </div>
    `;
    
    document.querySelector('.breakout-container').appendChild(overlay);
}

function showBreakoutError(err) {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-breakout';
    const content = document.createElement('div');
    content.className = 'game-over-content';
    const h2 = document.createElement('h2');
    h2.textContent = 'Oops! Crash';
    const p = document.createElement('p');
    p.textContent = (err && err.message) ? escapeHtml(err.message) : 'Unexpected error';
    const btn = document.createElement('button');
    btn.className = 'play-again-btn';
    btn.textContent = 'Restart';
    btn.onclick = restartBreakout;
    content.appendChild(h2);
    content.appendChild(p);
    content.appendChild(btn);
    overlay.appendChild(content);
    document.querySelector('.breakout-container').appendChild(overlay);
}

function restartBreakout() {
    if (breakout.gameInterval) {
        cancelAnimationFrame(breakout.gameInterval);
    }
    const overlay = document.querySelector('.game-over-breakout');
    if (overlay) overlay.remove();
    initBreakout();
}

window.initBreakout = initBreakout;
window.restartBreakout = restartBreakout;
window.cleanupBreakoutControls = cleanupBreakoutControls;

