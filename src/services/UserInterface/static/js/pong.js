let ballX;
let ballY;
let player1Y;
let player2Y;
let canvas;

function getElementPong() {
	console.log("pong");
	canvas = document.getElementById('pongCanvas');
	pong();
}

function pong() {
	// Vérifiez que le canvas existe avant de continuer
	if (canvas) {
		const ctx = canvas.getContext('2d');

		// Définir la taille du canvas
		canvas.width = 800;
		canvas.height = 600;

		const paddleWidth = 10;
		const paddleHeight = 100;
		const ballRadius = 10;

		// Positions initiales
		player1Y = (canvas.height - paddleHeight) / 2;
		player2Y = (canvas.height - paddleHeight) / 2;
		ballX = canvas.width / 2;
		ballY = canvas.height / 2;
		// let ballSpeedX = 5;
		// let ballSpeedY = 5;

		// Fonction de dessin
		function draw() {
			// Efface le canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Dessine les raquettes
			ctx.fillStyle = 'white';
			ctx.fillRect(0, player1Y, paddleWidth, paddleHeight);
			ctx.fillRect(canvas.width - paddleWidth, player2Y, paddleWidth, paddleHeight);

			// Dessine la balle
			ctx.beginPath();
			ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
			ctx.fillStyle = 'white';
			ctx.fill();
			ctx.closePath();

			// Déplacement de la balle
			// ballX += ballSpeedX;
			// ballY += ballSpeedY;

			// Vérifie les collisions avec les murs
			// if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
			// 	ballSpeedY = -ballSpeedY;
			// }

			// if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
			// 	ballSpeedX = -ballSpeedX;
			// }

			requestAnimationFrame(draw);
		}

		// Lancer l'animation
		draw();
	} else {
		console.error('Canvas not found');
	}
}

function connect() {
	let sessionId = 1; // getCookie('sessionid');
	console.log(sessionId);
	let partyId = 1; // document.getElementById('partyId').value;
	let token = localStorage.getItem('token');
	console.log(token);

	let wsUrl = `wss://localhost:8001/ws/pong/${partyId}/5/5`;
	wsUrl = wsUrl.replace("localhost", window.location.hostname);

	// let wsUrl = `wss://fu-r9-p5:8001/ws/pong/${partyId}/5/5`;

	let socket = new WebSocket(wsUrl);

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
		ballX = serverMessage.x;
		ballY = serverMessage.y;
		player1Y = serverMessage.p1; // Assuming player 0 is the player on the left
		player2Y = serverMessage.p2; // Assuming player 1 is the player on the right
		console.log(player1Y);
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
			var sessionId = getCookie('sessionid');
			var token = localStorage.getItem('token');
			console.log(sessionId)
			socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', player: 'p1', direction: direction, token: token }));
		}
	});
}