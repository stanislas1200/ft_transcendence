document.getElementById('loginForm').addEventListener('submit', function (event) {
	event.preventDefault(); // Prevent the form from submitting the traditional way

	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;

	var xhr = new XMLHttpRequest();
	xhr.open('POST', 'http://localhost:8000/login/', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4) {
			if (xhr.status === 200) {
				console.log('Login Success:', xhr.responseText);
				var response = JSON.parse(xhr.responseText);
				localStorage.setItem('token', response.token);
				// Here you can store the session ID or token if needed
			} else {
				console.error('Login Error:', xhr.responseText);
			}
		}
	};
	xhr.send('username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password));
});

function getCookie(name) {
	console.log(document.cookie);
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function connect() {
	let sessionId = getCookie('sessionid');
	console.log(sessionId)
	let partyId = document.getElementById('partyId').value;
	let token = localStorage.getItem('token');
	console.log(token);
	let wsUrl = `wss://fu-r9-p5:8001/ws/pong/${partyId}/5/5`;

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
		x = serverMessage.x;
		y = serverMessage.y;
		m = serverMessage.p1; // Assuming player 0 is the player on the left
		n = serverMessage.p2; // Assuming player 1 is the player on the right
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
c = document.getElementById('c').getContext('2d')
c.fillStyle = "#FFF"
c.font = "60px monospace"
w = s = 1
p = q = a = b = 0
m = n = 190
x = 400; y = 300
u = -5; v = 3
function draw() {

	c.clearRect(0, 0, 800, 600)
	for (i = 5; i < 600; i += 20)c.fillRect(400, i, 4, 10)
	c.fillText(a + " " + b, 350, 60)
	c.fillRect(20, m, 10, 80)
	c.fillRect(770, n, 10, 80)
	c.fillRect(x, y, 10, 10)
}

function gameLoop() {
	draw();
	requestAnimationFrame(gameLoop);
}

gameLoop();