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
	let token = getCookie('token');
	let userId = getCookie('userId');
	console.log(token);
	let wsUrl = `wss://localhost:8001/ws/pong/${partyId}/${token}/${userId}`;
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

		// Update ball position and direction
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
		}

		if (direction && socket) {
			console.log(direction)
			var sessionId = getCookie('sessionid');
			var token = getCookie('token');
			socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', player: 'p1', direction: direction, token: token }));
		}
	});
}
connect();
c = document.getElementById('pongCanvas').getContext('2d')
c.fillStyle = "#FFF"
c.font = "60px monospace"
w = s = 1
p = q = s1 = s2 = 0
name1 = name2 = null
p1 = p2 = p3 = p4 = 250
x = 400; y = 300
r = 5; v = 3
mode = "ffa"
function draw() {

	// c.clearRect(0, 0, 800, 600)
	c.fillStyle = "rgb(0 0 0 / 20%)";
	c.fillRect(0, 0, 800, 600);
	c.fillStyle = "#8791ed";
	for (i = 5; i < 600; i += 20)c.fillRect(400, i, 4, 10)
	c.fillStyle = "#FFFFFF";
	c.fillText(name1, 0, 60)
	c.fillText(name2, 800 - c.measureText(name2).width, 60)
	c.fillText(s1 + " " + s2 , 350, 60)
	c.fillRect(40, p1 - 100/2, 10, 100)
	c.fillRect(800 - 40 - 10, p2 - 100/2, 10, 100)
	if (mode == "team") {
		c.fillRect(40, p3 - 100/2, 10, 100)
		c.fillRect(800 - 40 - 10, p4 - 100/2, 10, 100)
	}
	else if (mode == "ffa") {
		c.fillRect(p3 - 100/2, 40, 100, 10)
		c.fillRect(p4 - 100/2, 600 - 40, 100, 10)
	}
	// c.fillRect(x, y, 10, 10)
	
	// c.fillStyle = "#e24091";
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