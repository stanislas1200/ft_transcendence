function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

let isGameLoopRunning = false;
let socket = null;
const keyState = {};

function keyDown(event) {
	keyState[event.key] = true;
}
function keyUp(event) {
	keyState[event.key] = false;
}

function closeWebSocket() {
	window.removeEventListener('popstate', closeWebSocket);
	cancelAllAnimationFrames()
	socket.close();
	socket = null;
	isGameLoopRunning = false
}

let obstacles = null;

let game_state = {
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

function drawError(error) {
	cancelAllAnimationFrames();
	c.clearRect(0, 0, 800, 650);
	c.font = "30px monospace";
	c.textAlign = 'center';
	c.textBaseline = 'middle';
	c.fillStyle = 'red';
	c.fillText(error, 800 / 2, 600 / 2);
	c.fillText('Moving to game page', 800 / 2, 650 / 2);
	setTimeout(() => {
		loadPage('game', 1)
	}, 2000);
}

function connect(game) {
	// TODO : close connection if page left
	window.addEventListener('popstate', closeWebSocket);

	socket.addEventListener('open', function (event) {
		console.log('WebSocket is open now.');
	});

	socket.addEventListener('message', function (event) {
		let serverMessage = JSON.parse(event.data);

		if (serverMessage.error) {
			drawError(serverMessage.error);
			return;
		}

		if (game === 'pong') {
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
		}
		set = false
		if (!game_state.old_dx)
			set = true;
		else {
			old_dx = game_state.old_dx;
			old_dy = game_state.old_dy;
		}
		game_state = serverMessage;
		if (set) {
			game_state.old_dx = game_state.dx;
			game_state.old_dy = game_state.dx;
		}
		else{
			game_state.old_dx = old_dx;
			game_state.old_dy = old_dy;
		}
	});

	// socket.addEventListener('close', function (event) {
	// 	// window.removeEventListener('popstate', closeWebSocket);
	
	// 	// socket = null;
	// 	// isGameLoopRunning = false
	// 	console.log('WebSocket is closed now.');
	// });

	socket.addEventListener('error', function (event) {
		// console.log('Error: ', event);
	});


	document.removeEventListener('keydown', keyDown)
	document.removeEventListener('keyup', keyUp)
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
}

let c = null;
let offScreenC = null;
let offc = null;
let obstaclesDrawn = false;


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

	if (direction && socket && socket.readyState === WebSocket.OPEN) {
		var sessionId = getCookie('sessionid');
		socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', player: 'p1', direction: direction }));
	}
}

function drawPaddle() {
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
		c.textAlign = 'left'
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

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function drawEnd() {
	if (game_state.scores) {
		winner = ''
		if (game_state.winner)
			winner = game_state.winner[0].username;
		else return 0
		if (game_state.gameMode === "team") {
			if (game_state.scores[0] > 9)
			winner = 'Team 1';
			else if (game_state.scores[1] > 9)
			winner = 'Team 2';
		}
		
		c.fillStyle = 'black'
		c.fillRect(0, 0, 800, 650);
		drawNS()
		c.textAlign = 'center'
		c.fillText(winner + " won", 800/2, 600/2)

		if (game_state.tournament)
			page = "tournament"
		else 
			page = "game"

		c.fillText("Moving to " + page + " page", 800/2, 650/2)
		
		await sleep(2000);
		loadPage(page, 1)
		return 1
	}
	return 0
}

let dotCount = 0;
let pulseScale = 1;
let pulseDirection = 0.01;

async function drawWaitingState() {
	c.clearRect(0, 0, 800, 650);

	c.font = "40px monospace";
	c.textAlign = 'center';
	c.textBaseline = 'middle';

	pulseScale += pulseDirection;
	if (pulseScale >= 1.1 || pulseScale <= 0.9) pulseDirection = -pulseDirection;
	c.save();
	c.scale(pulseScale, pulseScale);
	
	c.fillStyle = 'white'
	let text = 'waiting player' + '.'.repeat(dotCount);
	c.fillText(text, 800 / 2 / pulseScale, 600 / 2 / pulseScale);

	c.restore();

	dotCount = (dotCount + 1) % 4;

	drawNS()
	await sleep(500)
	c.clearRect(0, 0, 800, 650);
}

async function draw() {
	if (game_state.state == 'waiting')
		return await drawWaitingState();
	c.textAlign = 'left'
	// c.clearRect(0, 0, 800, 600)
	c.fillStyle = "rgb(0 0 0 / 20%)";
	c.fillRect(0, 0, 800, 650);
	c.fillStyle = "#8791ed";
	for (i = 5; i < 600; i += 20)c.fillRect(400, i, 4, 10)
	drawPaddle()
	drawNS()
	c.fillStyle = "#FFFFFF";
	// if (game_state.state == 'waiting')
	// 	c.fillText('waiting player ...', 800/2, 600/2)
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

function detectHit() {
	if (game_state.dx != game_state.old_dx || game_state.dy != game_state.old_dy) {
		game_state.old_dx = game_state.dx
		game_state.old_dy = game_state.dy
		hitSound.currentTime = 0;
		hitSound.play();
	}
}

let lastTimestamp = 0;
async function gameLoop(game, timestamp) {
	try {
		if (isGameLoopRunning) {
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

			if ( game == 'pong') {
				await draw();
				detectHit();
				updatePlayers();
				end = await drawEnd();
			}
			else if (game == 'gam') {
				await drawGam(deltaTime);
				// updatePlayersGam();
				end = await drawEndGam();
			}
			else {
				await drawTron();
				updatePlayersTron();
				end = await drawEndTron();
			}
			if (end == 1)
			{
				cancelAllAnimationFrames()
				game_state.scores = null;
				game_state.usernames = null;
				game_state.players = [];
				game_state.state = 'nope';
				return;
			}
			requestAnimationFrame((timestamp) => gameLoop(game, timestamp))
		}
	} catch (error) {
		console.log(error)
	}
}

function cancelAllAnimationFrames(){
	var id = window.requestAnimationFrame(function(){});
	while(id--){
	  window.cancelAnimationFrame(id);
	}
 }

 let hitSound = new Audio('https://localhost:8003/usr/src/app/static/sounds/hit.mp3'); // need global var {% static 'sounds/hit.mp3' %}
function loadPong() {
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
	connect('pong');
	if (!isGameLoopRunning) {
		isGameLoopRunning = true;
		requestAnimationFrame(() => gameLoop('pong'))
	}
}