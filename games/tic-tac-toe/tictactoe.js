// Tic Tac Toe Game with AI
let tictactoe = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    gameActive: true,
    playerScore: 0,
    aiScore: 0,
    ties: 0
};

function initTicTacToe() {
    tictactoe.board = Array(9).fill('');
    tictactoe.currentPlayer = 'X';
    tictactoe.gameActive = true;
    
    loadTicTacToeScores();
    renderTicTacToe();
    updateTicTacToeScores();
}

function renderTicTacToe() {
    const container = document.getElementById('ticTacToeArea');
    if (!container) return;
    
    container.innerHTML = '';
    
    tictactoe.board.forEach((cell, index) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'ttt-cell';
        cellDiv.dataset.index = index;
        cellDiv.textContent = cell;
        cellDiv.addEventListener('click', () => handleTicTacToeClick(index));
        container.appendChild(cellDiv);
    });
}

function handleTicTacToeClick(index) {
    if (!tictactoe.gameActive || tictactoe.board[index] !== '') return;
    
    tictactoe.board[index] = 'X';
    renderTicTacToe();
    
    if (checkTicTacToeWinner('X')) {
        tictactoe.playerScore++;
        saveTicTacToeScores();
        showTicTacToeWin('X');
        return;
    }
    
    if (!tictactoe.board.includes('')) {
        showTicTacToeWin('tie');
        return;
    }
    
    setTimeout(() => {
        aiMoveTicTacToe();
        renderTicTacToe();
        
        if (checkTicTacToeWinner('O')) {
            tictactoe.aiScore++;
            saveTicTacToeScores();
            showTicTacToeWin('O');
        } else if (!tictactoe.board.includes('')) {
            tictactoe.ties++;
            saveTicTacToeScores();
            showTicTacToeWin('tie');
        }
    }, 500);
}

function aiMoveTicTacToe() {
    // Try to win
    for (let i = 0; i < 9; i++) {
        if (tictactoe.board[i] === '') {
            tictactoe.board[i] = 'O';
            if (checkTicTacToeWinner('O')) return;
            tictactoe.board[i] = '';
        }
    }
    
    // Block player
    for (let i = 0; i < 9; i++) {
        if (tictactoe.board[i] === '') {
            tictactoe.board[i] = 'X';
            if (checkTicTacToeWinner('X')) {
                tictactoe.board[i] = 'O';
                return;
            }
            tictactoe.board[i] = '';
        }
    }
    
    // Center
    if (tictactoe.board[4] === '') {
        tictactoe.board[4] = 'O';
        return;
    }
    
    // Corner
    const corners = [0, 2, 6, 8];
    for (let corner of corners) {
        if (tictactoe.board[corner] === '') {
            tictactoe.board[corner] = 'O';
            return;
        }
    }
    
    // Any available
    for (let i = 0; i < 9; i++) {
        if (tictactoe.board[i] === '') {
            tictactoe.board[i] = 'O';
            return;
        }
    }
}

function checkTicTacToeWinner(player) {
    const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    return lines.some(line => 
        line.every(index => tictactoe.board[index] === player)
    );
}

function showTicTacToeWin(winner) {
    tictactoe.gameActive = false;
    updateTicTacToeScores();
    
    let message = '';
    if (winner === 'X') {
        message = '🎉 You Win! 🎉';
    } else if (winner === 'O') {
        message = '🤖 AI Wins! 🤖';
    } else {
        message = "It's a Tie!";
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'game-over-ttt';
    overlay.innerHTML = `
        <div class="game-over-content">
            <h2>${message}</h2>
            <button class="play-again-btn" onclick="initTicTacToe(); document.querySelector('.game-over-ttt').remove();">Play Again</button>
        </div>
    `;
    
    document.querySelector('.ttt-container').appendChild(overlay);
}

function updateTicTacToeScores() {
    const playerEl = document.getElementById('playerScore');
    const aiEl = document.getElementById('aiScore');
    
    if (playerEl) playerEl.textContent = tictactoe.playerScore;
    if (aiEl) aiEl.textContent = tictactoe.aiScore;
}

function loadTicTacToeScores() {
    const saved = localStorage.getItem('ttt-scores');
    if (saved) {
        const scores = JSON.parse(saved);
        tictactoe.playerScore = scores.player || 0;
        tictactoe.aiScore = scores.ai || 0;
        tictactoe.ties = scores.ties || 0;
    }
}

function saveTicTacToeScores() {
    localStorage.setItem('ttt-scores', JSON.stringify({
        player: tictactoe.playerScore,
        ai: tictactoe.aiScore,
        ties: tictactoe.ties
    }));
}

window.initTicTacToe = initTicTacToe;

