
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE_SIZE = 64; // Size of each tile in the grid
const FOV = Math.PI / 4; // Field of view
const RAY_COUNT = 200; // Number of rays to cast
const MAX_DEPTH = 1000; // Max depth a ray can travel
const WALL_HEIGHT = 200; // Height of walls in the 3D rendering

const wallTextureUrl = 'https://' + window.location.hostname + ':8000/var/www/transcendence/media/default.png';
const wallTexture = new Image();

// Load the texture
wallTexture.src = wallTextureUrl;
// wallTexture.onload = function() {
//   // Once the image is loaded, you can start the game or render the scene
//   render3DScene();
// };

function render3DScene() {
  const rayAngleStep = FOV / RAY_COUNT;

  for (let i = 0; i < RAY_COUNT; i++) {
    const rayAngle = player.angle - FOV / 2 + rayAngleStep * i;
    const depth = castRay(rayAngle);
    const distance = depth * Math.cos(rayAngle - player.angle); // Fix fish-eye distortion
    const wallHeight = (WALL_HEIGHT / distance) * 300; // Calculate wall height

    // Calculate the width of each slice to draw from the texture
    const textureWidth = wallTexture.width / RAY_COUNT;
    const sx = i * textureWidth;
    const sy = 0;
    const sWidth = textureWidth;
    const sHeight = wallTexture.height;

    const dx = i * (canvas.width / RAY_COUNT);
    const dy = (canvas.height / 2) - wallHeight / 2;
    const dWidth = canvas.width / RAY_COUNT;
    const dHeight = wallHeight;

    // Draw the slice of the wall texture
    ctx.drawImage(wallTexture, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  }
}

// Map grid (1 = wall, 0 = empty space)
const map = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

const player = {
  x: TILE_SIZE * 2,
  y: TILE_SIZE * 2,
  angle: 0,
  speed: 0,
  speedX: 0
};

var players = []

var monsters = []

function castRay(angle) {
  let sin = Math.sin(angle);
  let cos = Math.cos(angle);

  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    let targetX = player.x + cos * depth;
    let targetY = player.y + sin * depth;

    let mapX = Math.floor(targetX / TILE_SIZE);
    let mapY = Math.floor(targetY / TILE_SIZE);

    if (map[mapY] && map[mapY][mapX] === 1) {
      return depth; // Return the depth of the wall hit
    }
  }

  return MAX_DEPTH;
}

// function render3DScene() {
//   const rayAngleStep = FOV / RAY_COUNT;

//   for (let i = 0; i < RAY_COUNT; i++) {
//     const rayAngle = player.angle - FOV / 2 + rayAngleStep * i;
//     const depth = castRay(rayAngle);

//     const distance = depth * Math.cos(rayAngle - player.angle); // Fix fish-eye distortion
//     const wallHeight = (WALL_HEIGHT / distance) * 300; // Calculate wall height

//     ctx.fillStyle = `rgb(${255 - depth * 0.1}, ${255 - depth * 0.1}, ${255 - depth * 0.1})`;
//     ctx.fillRect(i * (canvas.width / RAY_COUNT), (canvas.height / 2) - wallHeight / 2, canvas.width / RAY_COUNT, wallHeight);
//   }
// }

function movePlayer()  {
    // Calculate potential new positions
    let newX = player.x - Math.sin(player.angle) * player.speedX + Math.cos(player.angle) * player.speed;
    let newY = player.y + Math.cos(player.angle) * player.speedX + Math.sin(player.angle) * player.speed;

    // Calculate map positions for potential new positions
    let mapX = Math.floor(newX / TILE_SIZE);
    let mapY = Math.floor(newY / TILE_SIZE);

    // Check for wall collisions in the X direction
    if (map[Math.floor(player.y / TILE_SIZE)][mapX] !== 1) {
        player.x = newX;
    }

    // Check for wall collisions in the Y direction
    if (map[mapY][Math.floor(player.x / TILE_SIZE)] !== 1) {
        player.y = newY;
    }
}

function drawEntity(x, y, entity) {
  const dx = x - player.x;
  const dy = y - player.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const size = 10000 / distance; // Arbitrary scaling factor for size

  let angleToE = Math.atan2(dy, dx) - player.angle;
  
  angleToE = (angleToE + 2 * Math.PI) % (2 * Math.PI);
  if (angleToE > Math.PI) angleToE -= 2 * Math.PI;
  
  const eScreenX = canvas.width / 2 + (angleToE / FOV) * canvas.width;

  if (Math.abs(angleToE) < FOV / 2) {
      if (entity === 'monster') ctx.fillStyle = 'red';
      else ctx.fillStyle = 'green';
      ctx.fillRect(eScreenX - size / 2, canvas.height / 2 - size / 2, size, size);
  }
}

function drawCross() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const crossSize = 20; // Size of the cross

    ctx.beginPath(); // Begin a new path for the cross
    ctx.strokeStyle = 'white'; // Set the color of the cross
    ctx.lineWidth = 2; // Set the width of the lines

    // Draw the vertical line
    ctx.moveTo(centerX, centerY - crossSize / 2);
    ctx.lineTo(centerX, centerY + crossSize / 2);

    // Draw the horizontal line
    ctx.moveTo(centerX - crossSize / 2, centerY);
    ctx.lineTo(centerX + crossSize / 2, centerY);

    ctx.stroke(); // Render the cross
}

canvas.width = 800;
canvas.height = 600;
function gameLoop() {
	canvas.width = 800;
	canvas.height = 600;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	render3DScene();
	movePlayer();
  monsters.forEach(monster => {
    drawEntity(monster.x, monster.y, 'monster');
  })
  players.forEach(p => {
    drawEntity(p.x, p.y, 'player');
  })
  drawCross();
	requestAnimationFrame(gameLoop);
}

document.addEventListener('mousemove', (event) => {
    let sensitivity = 0.005; // Adjust sensitivity as needed
    let movementX = event.movementX || event.mozMovementX || 0;

    // Update player's angle based on mouse movement
    player.angle += movementX * sensitivity;
});

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock;
canvas.onclick = function() {
  canvas.requestPointerLock();
};

gameLoop();

function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function connect() {
	let sessionId = getCookie('sessionid');
	console.log(sessionId)
	let partyId = document.getElementById('partyId').value;
	let token = getCookie('token');
	let userId = getCookie('userId');
	console.log(token);
	let wsUrl = `wss://localhost:8001/ws/pong/${partyId}/${userId}`;

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
    // players = serverMessage.players;
    player.x = serverMessage.players[0].x;
    player.y = serverMessage.players[0].y;

    monsters = [];
    serverMessage.monsters.forEach(monster => {
      monsters.push(monster);
    })
    players = [];
    serverMessage.players.forEach(p => {
      players.push(p);
    })
	});

	socket.addEventListener('close', function (event) {
		console.log('WebSocket is closed now.');
	});

	socket.addEventListener('error', function (event) {
		console.log('Error: ', event);
	});

  
  document.addEventListener('keydown', (e) => {
		if (socket) {
			var sessionId = getCookie('sessionid');
			var token = getCookie('token');
			socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', k: e.key, token: token, direction: 'down', angle: player.angle }));
		}
  });

  document.addEventListener('keyup', (e) => {
		if (socket) {
			var sessionId = getCookie('sessionid');
			var token = getCookie('token');
			socket.send(JSON.stringify({ sessionId: sessionId, command: 'move', k: e.key, token: token, direction: 'up', angle: player.angle }));
		}
  });
}