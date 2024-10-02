function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

let partyId = localStorage.getItem('gameId');
localStorage.removeItem('gameId');
let userId = getCookie('userId');
let wsUrl = `wss://localhost:8001/ws/pong/${partyId}/${userId}`;
wsUrl = wsUrl.replace('localhost', window.location.hostname);
let socket = new WebSocket(wsUrl);
const keyState = {};

function connect() {
	let sessionId = getCookie('sessionid');
	console.log(sessionId)

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

		if (serverMessage.error) {
			console.error('Error:', serverMessage.error);
			return;
		}

		if (serverMessage.message === 'Setup') {
			obstacles = serverMessage.setting.obstacles
			offc.fillStyle = "white";
			if (obstacles) {
				obstacles.forEach((obstacle) => {
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
		game_state = serverMessage;
	});

	socket.addEventListener('close', function (event) {
		console.log('WebSocket is closed now.');
	});

	socket.addEventListener('error', function (event) {
		console.log('Error: ', event);
	});

	document.addEventListener('keydown', function (event) {
		keyState[event.key] = true;
	});
	
	document.addEventListener('keyup', function (event) {
		keyState[event.key] = false;
	});
}

connect();
c = document.getElementById('pongCanvas').getContext('2d')
offScreenC = document.createElement('canvas');
offScreenC.width = c.width = 800;
offScreenC.height = c.height = 600;
offc = offScreenC.getContext('2d');
obstaclesDrawn = false;
c.font = "60px monospace"

game_state = {
	ball: {
		x: 400,
		y: 300,
		r: 5
	},
	mode: "ffa",
	obstacles: [],
	usernames: null,
	positions: null,
	scores: null
}

function updatePlayers() {
	var direction
	if (keyState["ArrowUp"]) {
		direction = "up";
	} else if (keyState["ArrowDown"]) {
		direction = "down";
	} else if (keyState["ArrowLeft"]) {
		direction = "up";
	} else if (keyState["ArrowRight"]) {
		direction = "down";
	}

	if (direction && socket) {
		var sessionId = getCookie('sessionid');
		socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', player: 'p1', direction: direction }));
	}
}

function drawPlayers() {
	colors = ['#7e3047', '#498d14', '#a891d5', 'white']
	c.fillStyle = colors[0]
	if (game_state.positions) {
		c.fillRect(40, game_state.positions[0] - 100/2, 10, 100)
		c.fillStyle = colors[1]
		c.fillRect(800 - 40 - 10, game_state.positions[1] - 100/2, 10, 100)
		if (game_state.mode == "team") {
			c.fillStyle = colors[2]
			c.fillRect(40, game_state.positions[2] - 100/2, 10, 100)
			c.fillStyle = colors[3]
			c.fillRect(800 - 40 - 10, game_state.positions[3] - 100/2, 10, 100)
		}
		else if (game_state.mode == "ffa" && usernames[2]) {
			c.fillStyle = colors[2]
			c.fillRect(game_state.positions[2] - 100/2, 40, 100, 10)
			c.fillStyle = colors[3]
			c.fillRect(game_state.positions[3] - 100/2, 600 - 40, 100, 10)
		}
	}
}

function drawNS() {
	c.font = "20px monospace";
	if (game_state.usernames) {
		spaceB = c.width / game_state.usernames.length
		colors = ['#7e3047', '#498d14', '#a891d5', 'white']
		c.textBaseline = "middle"
		c.fillStyle = 'white'
		c.fillRect(0, 600, 800, 2)
		if (game_state.mode == "team") {
			c.fillText('Team 1: ', spaceB * 0, 625, 100)
			c.fillText(game_state.scores[0], spaceB * 0 + c.measureText('Team 1: '), 625)
			c.fillText('Team 2: ', spaceB * c.width / 2, 625, 100)
			c.fillText(game_state.scores[2], spaceB * c.width / 2 + c.measureText('Team 2: '), 625) // TODO : username
		}
		else
			game_state.usernames.forEach((player, index) => {
				c.fillStyle = colors[index]
				c.fillText(player, spaceB * index, 625, 100)
				c.fillStyle = 'white'
				c.fillText(': ' + game_state.scores[index], spaceB * index + Math.min(c.measureText(player).width, 100), 625)
			})
	}
}

function draw() {

	// c.clearRect(0, 0, 800, 600)
	c.fillStyle = "rgb(0 0 0 / 20%)";
	c.fillRect(0, 0, 800, 650);
	c.fillStyle = "#8791ed";
	for (i = 5; i < 600; i += 20)c.fillRect(400, i, 4, 10)
	drawPlayers()
	drawNS()
	c.fillStyle = "#FFFFFF";
	// draw obstacles
	if (obstaclesDrawn) {
		c.drawImage(offScreenC, 0, 0); // TODO : optimise
		// obstaclesDrawn = false;
	}
	
    c.beginPath();
    c.moveTo(game_state.x, game_state.y);
    c.arc(game_state.x, game_state.y, 5, 0, Math.PI * 2, true);
    c.stroke();
    c.fill()
}

function gameLoop() {
	draw();
	updatePlayers()
	if (game_state.scores) {
		if (game_state.scores[0] > 10)
		{
			c.fillText("Team 1 won", 800/2, 600/2)
			return
		}
		else if (game_state.scores[1] > 10)
		{
			c.fillText("Team 2 won", 800/2, 600/2)
			return
		}
	}
	requestAnimationFrame(gameLoop);
}

gameLoop();