function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function connect() {
	let sessionId = getCookie('sessionid');
	console.log(sessionId)
	let partyId = localStorage.getItem('gameId');
	localStorage.removeItem('gameId');
	let userId = getCookie('userId');
	let wsUrl = `wss://localhost:8001/ws/pong/${partyId}/${userId}`;
	wsUrl = wsUrl.replace('localhost', window.location.hostname);

	let socket = new WebSocket(wsUrl);
	
	function closeWebSocket() {
		socket.close();
		window.removeEventListener('popstate', closeWebSocket);
	}

	window.addEventListener('popstate', closeWebSocket);

	socket.addEventListener('open', function (event) {
		console.log('WebSocket is open now.');
	});

	socket.addEventListener('message', function (event) {
		console.log('Message from server: ', event.data);
		let serverMessage = JSON.parse(event.data);

		// checl error
		if (serverMessage.error) {
			console.error('Error:', serverMessage.error);
			return;
		}

		if (serverMessage.message === 'Setup') {
			obstacles = serverMessage.setting.obstacles
			offc.fillStyle = "#e24091";
			if (obstacles) {
				obstacles.forEach((obstacle) => {
					// draw using vertices
					let vertices = obstacle.vertices;
					offc.beginPath();
					offc.moveTo(vertices[0].x, vertices[0].y);
					for (i = 1; i < vertices.length; i++) {
						offc.lineTo(vertices[i].x, vertices[i].y);
					}
					offc.closePath();
					offc.fill();
					offc.stroke();
				})
				obstaclesDrawn = true;
			}
		}

		// Update ball position and direction
		usernames = serverMessage.usernames
		scores = serverMessage.scores
		positions = serverMessage.positions
		x = serverMessage.x;
		y = serverMessage.y;
		name1 = serverMessage.usernames[0];
		name2 = serverMessage.usernames[1];
		p1 = serverMessage.positions[0]; // Assuming player 0 is the player on the left
		p2 = serverMessage.positions[1]; // Assuming player 1 is the player on the right
		p3 = serverMessage.positions[2];
		p4 = serverMessage.positions[3];
		s1 = serverMessage.scores[0];
		s2 = serverMessage.scores[1];
		mode = serverMessage.gameMode;
	});

	socket.addEventListener('close', function (event) {
		console.log('WebSocket is closed now.');
	});

	socket.addEventListener('error', function (event) {
		console.log('Error: ', event);
	});


	document.addEventListener('keydown', function (event) {
		var direction;
		if (event.key === "ArrowUp") {
			direction = "up";
		} else if (event.key === "ArrowDown") {
			direction = "down";
		} else if (event.key === "ArrowLeft") {
			direction = "up";
		} else if (event.key === "ArrowRight") { // todo : decompte
			direction = "down";
		}

		if (direction && socket) {
			console.log(direction)
			var sessionId = getCookie('sessionid');
			var token = getCookie('token');
			socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', player: 'p1', direction: direction }));
		}
	});
}
connect();
c = document.getElementById('pongCanvas').getContext('2d')
offScreenC = document.createElement('canvas');
offScreenC.width = c.width = 800; // Match main canvas dimensions
offScreenC.height = c.height = 600;
offc = offScreenC.getContext('2d');
obstaclesDrawn = false;

c.font = "60px monospace"
w = s = 1
p = q = s1 = s2 = 0
x = 400; y = 300
r = 5; v = 3
mode = "ffa"
obstacles = []
usernames = null
positions = null

function drawPlayers() {
	colors = ['green', 'red', 'yellow', 'white']
	c.fillStyle = colors[0]
	if (positions) {
		c.fillRect(40, positions[0] - 100/2, 10, 100)
		c.fillStyle = colors[1]
		c.fillRect(800 - 40 - 10, positions[1] - 100/2, 10, 100)
		if (mode == "team") {
			c.fillStyle = colors[2]
			c.fillRect(40, positions[2] - 100/2, 10, 100)
			c.fillStyle = colors[3]
			c.fillRect(800 - 40 - 10, positions[3] - 100/2, 10, 100)
		}
		else if (mode == "ffa") {
			c.fillStyle = colors[2]
			c.fillRect(positions[2] - 100/2, 40, 100, 10)
			c.fillStyle = colors[3]
			c.fillRect(positions[3] - 100/2, 600 - 40, 100, 10)
		}
	}
}

function drawNS() {
	c.font = "20px monospace";
	if (usernames) {
		spaceB = c.width / usernames.length
		colors = ['green', 'red', 'yellow', 'white']
		usernames.forEach((player, index) => {
			c.fillStyle = colors[index]
			c.fillText(player + ':', spaceB * index, 100)
			c.fillText(scores[index], spaceB * index + c.measureText(player).width + 10, 100)
		})
	}
	
}

function draw() {

	// c.clearRect(0, 0, 800, 600)
	c.fillStyle = "rgb(0 0 0 / 20%)";
	c.fillRect(0, 0, 800, 600);
	c.fillStyle = "#8791ed";
	for (i = 5; i < 600; i += 20)c.fillRect(400, i, 4, 10)
	drawPlayers()
	drawNS()
	c.fillStyle = "#FFFFFF";
	// draw obstacles
	if (obstaclesDrawn)
	{
		c.drawImage(offScreenC, 0, 0); // TODO : optimise
		// obstaclesDrawn = false;
	}
	
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, r, 0, Math.PI * 2, true); // Left eye
    c.stroke();
    c.fill()
}

function gameLoop() {
	draw();
	requestAnimationFrame(gameLoop);
}

gameLoop();