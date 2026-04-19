// DOM Elements - Screens
const landingScreen = document.getElementById('landing-screen');
const lobbyScreen = document.getElementById('lobby-screen');
const gameScreen = document.getElementById('game-screen');

// DOM Elements - Lobby specific
const hostView = document.getElementById('host-view');
const guestView = document.getElementById('guest-view');
const inviteLinkInput = document.getElementById('invite-link');
const btnHostGame = document.getElementById('btn-host-game');
const btnCopyLink = document.getElementById('btn-copy-link');

// Helper function to switch visible screens
function showScreen(screenElement) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screenElement.classList.add('active');
}

// Helper function to generate a random room ID
function generateGameId() {
    return Math.random().toString(36).substring(2, 10); // Generates a random 8-character string
}

// ---------------------------------------------------------
// INITIALIZATION & URL ROUTING
// ---------------------------------------------------------
function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');

    if (inviteCode) {
        // SCENARIO 1: A guest clicked an invite link
        console.log("Invite code found. Joining as Guest...");
        showScreen(lobbyScreen);
        guestView.style.display = 'block';
        
        // Next phase: We will trigger network.js here to knock on the host's door
        joinGame(inviteCode); 
    } else {
        // SCENARIO 2: No invite link. Normal visitor.
        console.log("No invite code. Showing Landing Page...");
        showScreen(landingScreen);
    }
}

// ---------------------------------------------------------
// EVENT LISTENERS
// ---------------------------------------------------------

// Host clicks "Host a Game"
btnHostGame.addEventListener('click', () => {
    const gameId = generateGameId();
    
    // Construct the URL to share (dynamically gets your current domain/path)
    const baseUrl = window.location.origin + window.location.pathname;
    const shareableLink = `${baseUrl}?invite=${gameId}`;
    
    // Populate the UI
    inviteLinkInput.value = shareableLink;
    
    // Switch to Lobby (Host View)
    showScreen(lobbyScreen);
    hostView.style.display = 'block';

    // Next phase: We will trigger network.js here to open the PeerJS connection
    hostGame(gameId); 
});

// Host clicks "Copy Link"
btnCopyLink.addEventListener('click', () => {
    inviteLinkInput.select();
    document.execCommand('copy');
    btnCopyLink.innerText = "Copied!";
    setTimeout(() => btnCopyLink.innerText = "Copy Link", 2000);
});

// ---------------------------------------------------------
// GATEKEEPER BUTTONS
// ---------------------------------------------------------

const btnAccept = document.getElementById('btn-accept');
const btnDeny = document.getElementById('btn-deny');
const approvalBox = document.getElementById('approval-box');

// Host clicks "Let them in"
btnAccept.addEventListener('click', () => {
    // Hide the popup
    approvalBox.classList.add('hidden');
    // Fire the network function we built earlier to start the game
    startGame(); 
});

// Host clicks "Deny"
btnDeny.addEventListener('click', () => {
    approvalBox.classList.add('hidden');
    
    // Send rejection message to guest and close our side of connection
    if (conn && conn.open) {
        conn.send({ type: 'denied' });
        setTimeout(() => {
            conn.close();
            conn = null;
        }, 500); // Small delay to ensure the message sends before closing
    }
    
    // Reset our status message to wait for the next person
    document.querySelector('#host-view .status-message').innerText = "Waiting for a different opponent...";
});

// Run init when the file loads
init();

// Temporarily bypass routing for Phase 2 testing
// showScreen(document.getElementById('game-screen'));
// initGame();