const boardContainer = document.getElementById('board');
let tokensLayer;

function createBoardUI() {
    boardContainer.innerHTML = ''; // Clear out the "Waiting to start..." text
    
    // 1. Create token layer (sits behind)
    tokensLayer = document.createElement('div');
    tokensLayer.id = 'tokens-layer';
    boardContainer.appendChild(tokensLayer);

    // 2. Create columns container (sits in front)
    const columnsContainer = document.createElement('div');
    columnsContainer.className = 'board-columns';

    // 3. Generate the 7 columns and 6 rows
    for (let c = 0; c < COLS; c++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'column';
        
        // Add 6 cells (holes) to this column
        for (let r = 0; r < ROWS; r++) {
            const cellDiv = document.createElement('div');
            cellDiv.className = 'cell';
            colDiv.appendChild(cellDiv);
        }

        // Listen for clicks on the entire column
        colDiv.addEventListener('click', () => handleColumnClick(c));
        columnsContainer.appendChild(colDiv);
    }

    boardContainer.appendChild(columnsContainer);
}

function dropTokenUI(row, col, player) {
    const token = document.createElement('div');
    token.className = `token player${player}`;
    
    // NEW: Give the token a unique ID based on its grid position
    token.id = `token-${row}-${col}`; 
    
    token.style.left = `${(col * 60) + 5}px`; 
    tokensLayer.appendChild(token);
    token.offsetHeight; 
    token.style.top = `${(row * 60) + 5}px`; 
}

// NEW: The cinematic ending effect
function highlightWinningTokens(winningCells) {
    // 1. Dim all tokens on the board
    document.querySelectorAll('.token').forEach(t => t.classList.add('dimmed'));
    
    // 2. Find the winning tokens, un-dim them, and make them pulse
    winningCells.forEach(cell => {
        const winningToken = document.getElementById(`token-${cell.r}-${cell.c}`);
        if (winningToken) {
            winningToken.classList.remove('dimmed');
            winningToken.classList.add('winner-pulse');
        }
    });
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    
    // Update text to say "Your Turn" or "Opponent's Turn"
    if (currentPlayer === myPlayerId) {
        indicator.innerText = "Your Turn";
    } else {
        indicator.innerText = "Opponent's Turn";
    }
    
    // Uses the pastel colors we set up earlier
    indicator.style.color = currentPlayer === 1 ? '#ff9ea6' : '#fced8f';
}