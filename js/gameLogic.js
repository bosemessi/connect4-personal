const ROWS = 6;
const COLS = 7;
let boardState = []; // The 2D array map
let currentPlayer = 1; // 1 = Red, 2 = Yellow
let isGameActive = false;

// Prepares a fresh game
function initGame() {
    // Create an empty 6x7 grid filled with 0s
    boardState = Array(ROWS).fill().map(() => Array(COLS).fill(0));
    currentPlayer = 1;
    isGameActive = true;
    updateTurnIndicator();
    createBoardUI(); // Tell the UI to draw the board
}

// Handles the math when you click a column
// 1. Handles the math when YOU click a column
function handleColumnClick(col) {
    if (!isGameActive) return;
    
    // Security check - Is it actually your turn?
    if (currentPlayer !== myPlayerId) {
        console.log("Not your turn!");
        return; 
    }
    
    // Process your move and broadcast it
    if (processMove(col, currentPlayer)) {
        sendNetworkMove(col); // Send to opponent via network.js
    }
}

// 2. Handles the math when the OPPONENT'S move arrives over the internet
function processOpponentMove(col) {
    // Process their move using the current player (which is them)
    processMove(col, currentPlayer);
}

// 3. The core gravity and win logic (Shared by both functions above)
function processMove(col, player) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (boardState[row][col] === 0) {
            
            boardState[row][col] = player;
            dropTokenUI(row, col, player);
            
            const winningCells = checkWin(row, col, player);
            if (winningCells) {
                isGameActive = false;
                
                // Make the text clear on who won based on your screen
                if (player === myPlayerId) {
                    document.getElementById('turn-indicator').innerText = "You Win!";
                } else {
                    document.getElementById('turn-indicator').innerText = "Opponent Wins!";
                }
                
                highlightWinningTokens(winningCells); 
                return true; // Move was successful
            }
            
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            updateTurnIndicator();
            return true; // Move was successful
        }
    }
    return false; // Column was full
}

// Checks 4 directions and returns the winning coordinates
function checkWin(row, col, player) {
    const directions = [
        [[0, 1], [0, -1]],  // Horizontal
        [[1, 0], [-1, 0]],  // Vertical
        [[1, 1], [-1, -1]], // Diagonal \
        [[1, -1], [-1, 1]]  // Diagonal /
    ];

    for (let dir of directions) {
        // Start an array with the token that was just dropped
        let winningCells = [{ r: row, c: col }]; 
        
        for (let split of dir) {
            let r = row + split[0];
            let c = col + split[1];
            // Keep walking in this direction while we see matching player pieces
            while (r >= 0 && r < ROWS && c >= 0 && c < COLS && boardState[r][c] === player) {
                winningCells.push({ r: r, c: c }); // Save this token's location
                r += split[0];
                c += split[1];
            }
        }
        // If we found 4 or more connected, return their exact locations!
        if (winningCells.length >= 4) return winningCells; 
    }
    return null; // No win yet
}