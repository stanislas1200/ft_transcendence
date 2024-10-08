function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function keyDown(event) {
	keyState[event.key] = true;
}
function keyUp(event) {
	keyState[event.key] = false;
}

function closeWebSocket() {
	socket.close();
	window.removeEventListener('popstate', closeWebSocket);
	socket = null;
	isGameLoopRunning = false
}

function connect() {
	window.addEventListener('popstate', closeWebSocket);

	socket.addEventListener('open', function (event) {
		console.log('WebSocket is open now.');
	});

	socket.addEventListener('message', function (event) {
		let serverMessage = JSON.parse(event.data);

		if (serverMessage.error)
			return;

		players = serverMessage.players;
	});

	socket.addEventListener('error', function (event) {
		// console.log('Error: ', event);
	});


	document.removeEventListener('keydown', keyDown)
	document.removeEventListener('keyup', keyUp)
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
}

async function drawWaitingState() {
	c.clearRect(0, 0, 800, 650);

	c.font = "40px monospace";
	c.textAlign = 'center';
	c.textBaseline = 'middle';

	pulseScale += pulseDirection;
	if (pulseScale >= 1.1 || pulseScale <= 0.9) pulseDirection = -pulseDirection;
	c.save();
	c.scale(pulseScale, pulseScale);

	let text = 'waiting player' + '.'.repeat(dotCount);
	c.fillText(text, 800 / 2 / pulseScale, 600 / 2 / pulseScale);

	c.restore();

	dotCount = (dotCount + 1) % 4;

	drawNS()
	await sleep(500)
}

async function draw() {
	if (game_state.state == 'waiting')
		return await drawWaitingState();
    if (players) {
        players.forEach((player, index) => {
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

async function gameLoop() {
	try {
		if (isGameLoopRunning) {
			await draw();
			end = await drawEnd();
			if (end == 1)
			{
				cancelAnimationFrame(animFrame);
				game_state.scores = null;
				game_state.usernames = null;
				return;
			}
			animFrame = requestAnimationFrame(gameLoop);
		}
	} catch (error) {
		console.log(error)
	}
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
	offScreenC = document.createElement('canvas');
	offScreenC.width = c.width = 800;
	offScreenC.height = c.height = 600;
	offc = offScreenC.getContext('2d');
	obstaclesDrawn = false;
	c.font = "60px monospace"
	connect();
	if (!isGameLoopRunning) {
		isGameLoopRunning = true;
		gameLoop();
	}
}