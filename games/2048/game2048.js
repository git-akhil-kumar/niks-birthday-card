// 2048 Game - Pure JavaScript
let game2048 = {
    grid: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    size: 4,
    inputLocked: false,
    touchStartX: 0,
    touchStartY: 0,
    mergedCells: new Set(),
    newCell: null,
    prevGrid: null,
    prevScore: 0,
    canUndo: false
};

function init2048() {
    game2048.score = 0;
    game2048.gameOver = false;
    game2048.grid = Array(game2048.size).fill(null).map(() => Array(game2048.size).fill(0));
    game2048.mergedCells = new Set();
    game2048.newCell = null;
    game2048.prevGrid = null;
    game2048.prevScore = 0;
    game2048.canUndo = false;
    
    loadBestScore();
    addRandomTile();
    addRandomTile();
    render2048();
    update2048Score();
}

function loadBestScore() {
    const saved = localStorage.getItem('2048-best');
    if (saved) game2048.bestScore = parseInt(saved);
}

function saveBestScore() {
    localStorage.setItem('2048-best', game2048.bestScore);
}

function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < game2048.size; i++) {
        for (let j = 0; j < game2048.size; j++) {
            if (game2048.grid[i][j] === 0) {
                emptyCells.push({row: i, col: j});
            }
        }
    }
    
    if (emptyCells.length === 0) return false;
    
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    game2048.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
    game2048.newCell = { row: randomCell.row, col: randomCell.col };
    return true;
}

function render2048() {
    const container = document.getElementById('game2048Area');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < game2048.size; i++) {
        for (let j = 0; j < game2048.size; j++) {
            const tile = document.createElement('div');
            tile.className = 'tile-2048';
            const value = game2048.grid[i][j];
            
            if (value !== 0) {
                tile.textContent = value;
                tile.className += ` tile-${value}`;
                const key = `${i}-${j}`;
                if (game2048.mergedCells.has(key)) {
                    tile.className += ' tile-merged';
                } else if (game2048.newCell && game2048.newCell.row === i && game2048.newCell.col === j) {
                    tile.className += ' tile-new';
                }
            }
            
            container.appendChild(tile);
        }
    }
}

function update2048Score() {
    const scoreEl = document.getElementById('score2048');
    const bestEl = document.getElementById('best2048');
    
    if (scoreEl) scoreEl.textContent = game2048.score;
    if (bestEl) bestEl.textContent = game2048.bestScore;
}

function move2048(direction) {
    if (game2048.gameOver) return;
    if (game2048.inputLocked) return;
    game2048.inputLocked = true;
    game2048.mergedCells = new Set();
    game2048.newCell = null;
    // Save state for undo
    game2048.prevGrid = game2048.grid.map(row => [...row]);
    game2048.prevScore = game2048.score;
    
    let moved = false;
    const oldGrid = game2048.grid.map(row => [...row]);
    
    switch(direction) {
        case 'up':
            moved = moveUp2048();
            break;
        case 'down':
            moved = moveDown2048();
            break;
        case 'left':
            moved = moveLeft2048();
            break;
        case 'right':
            moved = moveRight2048();
            break;
    }
    
    if (moved) {
        addRandomTile();
        render2048();
        update2048Score();
        game2048.canUndo = true;
        
        if (checkGameOver2048()) {
            game2048.gameOver = true;
            show2048GameOver();
        }
    }
    // Small throttle to avoid multiple moves from one gesture
    setTimeout(() => { game2048.inputLocked = false; }, 80);
}

function undo2048() {
    const modal = document.getElementById('game2048Modal');
    if (!modal || !modal.classList.contains('active')) return;
    if (!game2048.canUndo || !game2048.prevGrid) return;
    game2048.grid = game2048.prevGrid.map(row => [...row]);
    game2048.score = game2048.prevScore;
    game2048.mergedCells = new Set();
    game2048.newCell = null;
    game2048.gameOver = false;
    game2048.canUndo = false;
    render2048();
    update2048Score();
}

function moveLeft2048() {
    let moved = false;
    for (let i = 0; i < game2048.size; i++) {
        const row = game2048.grid[i].filter(val => val !== 0);
        const newRow = [];
        const mergeFlags = [];
        let j = 0;
        
        while (j < row.length) {
            if (j < row.length - 1 && row[j] === row[j + 1]) {
                newRow.push(row[j] * 2);
                mergeFlags.push(true);
                game2048.score += row[j] * 2;
                j += 2;
            } else {
                newRow.push(row[j]);
                mergeFlags.push(false);
                j++;
            }
        }
        
        while (newRow.length < game2048.size) {
            newRow.push(0);
            mergeFlags.push(false);
        }
        
        if (JSON.stringify(newRow) !== JSON.stringify(game2048.grid[i])) {
            moved = true;
        }
        
        game2048.grid[i] = newRow;
        // Record merged positions
        for (let c = 0; c < mergeFlags.length; c++) {
            if (mergeFlags[c]) game2048.mergedCells.add(`${i}-${c}`);
        }
    }
    return moved;
}

function moveRight2048() {
    let moved = false;
    for (let i = 0; i < game2048.size; i++) {
        let row = [...game2048.grid[i]];
        row = row.filter(val => val !== 0);
        row.reverse();
        const newRow = [];
        const mergeFlags = [];
        let j = 0;
        
        while (j < row.length) {
            if (j < row.length - 1 && row[j] === row[j + 1]) {
                newRow.push(row[j] * 2);
                mergeFlags.push(true);
                game2048.score += row[j] * 2;
                j += 2;
            } else {
                newRow.push(row[j]);
                mergeFlags.push(false);
                j++;
            }
        }
        
        while (newRow.length < game2048.size) {
            newRow.push(0);
            mergeFlags.push(false);
        }
        
        newRow.reverse();
        mergeFlags.reverse();
        
        if (JSON.stringify(newRow) !== JSON.stringify(game2048.grid[i])) {
            moved = true;
        }
        
        game2048.grid[i] = newRow;
        for (let c = 0; c < mergeFlags.length; c++) {
            if (mergeFlags[c]) game2048.mergedCells.add(`${i}-${c}`);
        }
    }
    return moved;
}

function moveUp2048() {
    let moved = false;
    for (let j = 0; j < game2048.size; j++) {
        const col = [];
        for (let i = 0; i < game2048.size; i++) {
            if (game2048.grid[i][j] !== 0) col.push(game2048.grid[i][j]);
        }
        
        const newCol = [];
        const mergeFlags = [];
        let i = 0;
        while (i < col.length) {
            if (i < col.length - 1 && col[i] === col[i + 1]) {
                newCol.push(col[i] * 2);
                mergeFlags.push(true);
                game2048.score += col[i] * 2;
                i += 2;
            } else {
                newCol.push(col[i]);
                mergeFlags.push(false);
                i++;
            }
        }
        
        while (newCol.length < game2048.size) {
            newCol.push(0);
            mergeFlags.push(false);
        }
        
        for (let i = 0; i < game2048.size; i++) {
            if (game2048.grid[i][j] !== newCol[i]) moved = true;
            game2048.grid[i][j] = newCol[i];
            if (mergeFlags[i]) game2048.mergedCells.add(`${i}-${j}`);
        }
    }
    return moved;
}

function moveDown2048() {
    let moved = false;
    for (let j = 0; j < game2048.size; j++) {
        const col = [];
        for (let i = 0; i < game2048.size; i++) {
            if (game2048.grid[i][j] !== 0) col.push(game2048.grid[i][j]);
        }
        col.reverse();
        
        const newCol = [];
        const mergeFlags = [];
        let i = 0;
        while (i < col.length) {
            if (i < col.length - 1 && col[i] === col[i + 1]) {
                newCol.push(col[i] * 2);
                mergeFlags.push(true);
                game2048.score += col[i] * 2;
                i += 2;
            } else {
                newCol.push(col[i]);
                mergeFlags.push(false);
                i++;
            }
        }
        
        while (newCol.length < game2048.size) {
            newCol.push(0);
            mergeFlags.push(false);
        }
        
        newCol.reverse();
        mergeFlags.reverse();
        
        for (let i = 0; i < game2048.size; i++) {
            if (game2048.grid[i][j] !== newCol[i]) moved = true;
            game2048.grid[i][j] = newCol[i];
            if (mergeFlags[i]) game2048.mergedCells.add(`${i}-${j}`);
        }
    }
    return moved;
}

function checkGameOver2048() {
    for (let i = 0; i < game2048.size; i++) {
        for (let j = 0; j < game2048.size; j++) {
            if (game2048.grid[i][j] === 0) return false;
            if (j < game2048.size - 1 && game2048.grid[i][j] === game2048.grid[i][j + 1]) return false;
            if (i < game2048.size - 1 && game2048.grid[i][j] === game2048.grid[i + 1][j]) return false;
        }
    }
    return true;
}

function show2048GameOver() {
    if (game2048.score > game2048.bestScore) {
        game2048.bestScore = game2048.score;
        saveBestScore();
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'game-over-2048';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>Game Over!</h2>
            <p>Final Score: ${game2048.score}</p>
            ${game2048.score === game2048.bestScore ? '<p class="new-best">🏆 New Best Score!</p>' : ''}
            <button class="play-again-btn" onclick="init2048(); document.querySelector('.game-over-2048').remove();">Play Again</button>
        </div>
    `;
    
    document.querySelector('.game2048-container').appendChild(overlay);
}

function handle2048KeyPress(e) {
    const modal = document.getElementById('game2048Modal');
    if (!modal || !modal.classList.contains('active')) return;
    switch(e.key) {
        case 'ArrowUp':
            move2048('up');
            break;
        case 'ArrowDown':
            move2048('down');
            break;
        case 'ArrowLeft':
            move2048('left');
            break;
        case 'ArrowRight':
            move2048('right');
            break;
    }
}

// Setup keyboard controls
document.addEventListener('DOMContentLoaded', () => {
    // Listen on document so arrows work without focusing the modal
    document.addEventListener('keydown', handle2048KeyPress);

    // Touch controls (swipe)
    const area = document.getElementById('game2048Area');
    if (area) {
        area.addEventListener('touchstart', (e) => {
            const modal = document.getElementById('game2048Modal');
            if (!modal || !modal.classList.contains('active')) return;
            if (!e.touches || e.touches.length === 0) return;
            game2048.touchStartX = e.touches[0].clientX;
            game2048.touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        area.addEventListener('touchend', (e) => {
            const modal = document.getElementById('game2048Modal');
            if (!modal || !modal.classList.contains('active')) return;
            if (!e.changedTouches || e.changedTouches.length === 0) return;
            const dx = e.changedTouches[0].clientX - game2048.touchStartX;
            const dy = e.changedTouches[0].clientY - game2048.touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const minSwipe = 20;
            if (absDx < minSwipe && absDy < minSwipe) return;
            if (absDx > absDy) {
                move2048(dx > 0 ? 'right' : 'left');
            } else {
                move2048(dy > 0 ? 'down' : 'up');
            }
            e.preventDefault();
        }, { passive: false });
    }
});

window.init2048 = init2048;
window.undo2048 = undo2048;

