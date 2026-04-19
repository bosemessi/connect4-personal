let peer = null;
let conn = null;
let myPlayerId = 1; // Default to 1 (Host is 1, Guest is 2)

// Called by app.js when the Host clicks "Host a Game"
function hostGame(gameId) {
    peer = new Peer(gameId); 
    
    peer.on('open', (id) => {
        console.log('Hosting game on network with ID:', id);
    });

    peer.on('connection', (connection) => {
        conn = connection;
        setupConnectionListeners();
        
        conn.on('open', () => {
            console.log('Guest connected! Waiting for host approval...');
            // NEW: Instead of startGame(), we show the approval popup!
            document.getElementById('approval-box').classList.remove('hidden');
        });
    });
}

// Called by app.js when a Guest loads the page with an ?invite= URL
function joinGame(hostId) {
    // Guest gets a random Peer ID, they don't need a specific one
    peer = new Peer(); 
    
    peer.on('open', () => {
        console.log('Attempting to connect to host:', hostId);
        // Connect to the Host's specific ID
        conn = peer.connect(hostId);
        
        conn.on('open', () => {
            console.log('Successfully connected to Host!');
            setupConnectionListeners();
            myPlayerId = 2; // Guest plays as Yellow
        });
    });
}

function setupConnectionListeners() {
    conn.on('data', (data) => {
        if (data.type === 'start_game') {
            showScreen(document.getElementById('game-screen'));
            initGame();
        } else if (data.type === 'move') {
            processOpponentMove(data.column);
        } else if (data.type === 'denied') {
            // NEW: If the host denies entry, tell the guest and close connection
            document.querySelector('#guest-view .status-message').innerText = "The Host denied your entry.";
            conn.close();
        }
    });
}

// Tells the opponent which column we just clicked
function sendNetworkMove(col) {
    if (conn && conn.open) {
        conn.send({ type: 'move', column: col });
    }
}

// The Host fires this to sync both screens to the Arena
function startGame() {
    if (conn && conn.open) {
        conn.send({ type: 'start_game' });
        showScreen(document.getElementById('game-screen'));
        initGame();
    }
}