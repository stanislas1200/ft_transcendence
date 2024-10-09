function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function updatePlayersTron() {
	var direction
	if (keyState["ArrowUp"]) {
		direction = "up";
	} else if (keyState["ArrowDown"]) {
		direction = "down";
	} else if (keyState["ArrowLeft"]) {
		direction = "left";
	} else if (keyState["ArrowRight"]) {
		direction = "right";
	}

	if (direction && socket && socket.readyState === WebSocket.OPEN) {
		var sessionId = getCookie('sessionid');
		socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', player: 'p1', direction: direction }));
	}
}

async function drawTron() {
	if (game_state.state == 'waiting')
		return await drawWaitingState();
    if (game_state.players) {
        game_state.players.forEach((player, index) => {
			console.log('draw')
            // Calculate x and y positions for each player
            const x = player['x']
            const y = player['y']

            // Set the fill color based on player data
            c.fillStyle = player['color'];

            // Draw the square
            c.fillRect(x, y, 5, 5);

            // Optionally, draw the player's name inside the square
            // c.fillStyle = 'white'; // Text color
            c.font = '14px Arial';
            c.textAlign = 'center';
            c.fillText(player.username, 100 * (index + 1), 100);
        });
    }
}

async function drawEndTron() {
	if (game_state.state === "finished") {
		winner = '';
		game_state.players.forEach((player, index) => {
			if (player.alive)
				winner = player.username;
		});
		
		c.fillStyle = 'black'
		c.fillRect(0, 0, 800, 650);
		page = "game"
		c.fillStyle = 'white'
		c.textAlign = 'center'
		c.fillText(winner + " won", 800/2, 600/2)

		c.fillText("Moving to " + page + " page", 800/2, 650/2)
		cancelAnimationFrame(animFrame);
		await sleep(2000);
		loadPage(page, 1)
		return 1
	}
	return 0
}

function loadTron() {
	let partyId = localStorage.getItem('gameId');
	// localStorage.removeItem('gameId');
	let userId = getCookie('userId');
	let wsUrl = `wss://localhost:8001/ws/pong/${partyId}/${userId}`;
	wsUrl = wsUrl.replace('localhost', window.location.hostname);
	if (socket)
		closeWebSocket()
	socket = new WebSocket(wsUrl);
	
	c = document.getElementById('pongCanvas').getContext('2d')
	c.font = "60px monospace"
	connect('tron');
	if (!isGameLoopRunning) {
		isGameLoopRunning = true;
		gameLoop('tron');
	}
}