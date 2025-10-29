// 2048 Game - Pure JavaScript
let game2048 = {
    grid: [],
    score: 0,
    bestScore: 0,
    gameOver: false,
    size: 4
};

function init2048() {
    game2048.score = 0;
    game2048.gameOver = false;
    game2048.grid = Array(game2048.size).fill(null).map(() => Array(game2048.size).fill(0));
    
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
        
        if (checkGameOver2048()) {
            game2048.gameOver = true;
            show2048GameOver();
        }
    }
}

function moveLeft2048() {
    let moved = false;
    for (let i = 0; i < game2048.size; i++) {
        const row = game2048.grid[i].filter(val => val !== 0);
        const newRow = [];
        let j = 0;
        
        while (j < row.length) {
            if (j < row.length - 1 && row[j] === row[j + 1]) {
                newRow.push(row[j] * 2);
                game2048.score += row[j] * 2;
                j += 2;
            } else {
                newRow.push(row[j]);
                j++;
            }
        }
        
        while (newRow.length < game2048.size) {
            newRow.push(0);
        }
        
        if (JSON.stringify(newRow) !== JSON.stringify(game2048.grid[i])) {
            moved = true;
        }
        
        game2048.grid[i] = newRow;
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
        let j = 0;
        
        while (j < row.length) {
            if (j < row.length - 1 && row[j] === row[j + 1]) {
                newRow.push(row[j] * 2);
                game2048.score += row[j] * 2;
                j += 2;
            } else {
                newRow.push(row[j]);
                j++;
            }
        }
        
        while (newRow.length < game2048.size) {
            newRow.push(0);
        }
        
        newRow.reverse();
        
        if (JSON.stringify(newRow) !== JSON.stringify(game2048.grid[i])) {
            moved = true;
        }
        
        game2048.grid[i] = newRow;
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
        let i = 0;
        while (i < col.length) {
            if (i < col.length - 1 && col[i] === col[i + 1]) {
                newCol.push(col[i] * 2);
                game2048.score += col[i] * 2;
                i += 2;
            } else {
                newCol.push(col[i]);
                i++;
            }
        }
        
        while (newCol.length < game2048.size) {
            newCol.push(0);
        }
        
        for (let i = 0; i < game2048.size; i++) {
            if (game2048.grid[i][j] !== newCol[i]) moved = true;
            game2048.grid[i][j] = newCol[i];
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
        let i = 0;
        while (i < col.length) {
            if (i < col.length - 1 && col[i] === col[i + 1]) {
                newCol.push(col[i] * 2);
                game2048.score += col[i] * 2;
                i += 2;
            } else {
                newCol.push(col[i]);
                i++;
            }
        }
        
        while (newCol.length < game2048.size) {
            newCol.push(0);
        }
        
        newCol.reverse();
        
        for (let i = 0; i < game2048.size; i++) {
            if (game2048.grid[i][j] !== newCol[i]) moved = true;
            game2048.grid[i][j] = newCol[i];
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
    const modal = document.getElementById('game2048Modal');
    if (modal) {
        modal.addEventListener('keydown', handle2048KeyPress);
    }
});

window.init2048 = init2048;

