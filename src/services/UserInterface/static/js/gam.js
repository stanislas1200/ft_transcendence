function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

const wallTextureUrl = 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/intermediary/f/4ed87dc0-09ac-41f7-aa8b-bbd53aceb973/d6k6a7-eee0706f-8d4b-422f-8122-a0300c2b8131.jpg';
const textures = new Image();
textures.src = wallTextureUrl;

const TILE_SIZE = 64;
const FOV = 60 * Math.PI / 180;
const HALF_FOV = FOV / 2;
const NUM_RAYS = 1000;
const MAX_DEPTH = 1000;
const screenWidth = 800;
const screenHeight = 650;
const mapWidth = 8;
const mapHeight = 8;
const WALL_HEIGHT = 100;

// c.imageSmoothingEnabled = false;  // Disable image smoothing for sharp textures

const player = {
	x: TILE_SIZE * 2,
	y: TILE_SIZE * 2,
	angle: Math.PI / 4,  // 45 degrees in radians
	speed: 0,
	speedX: 0,
	id: 0,
	hp: 100,
};

const map = [
	[1, 1, 1, 1, 1, 1, 1, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 0, 0, 0, 1, 0, 1],
	[1, 0, 1, 0, 1, 1, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1],
];

textures.src = wallTextureUrl;

function fixAngle(angle) {
	if (angle < 0) return angle + 2 * Math.PI;
	if (angle >= 2 * Math.PI) return angle - 2 * Math.PI;
	return angle;
}

function castRay(rayAngle) {
	rayAngle = fixAngle(rayAngle);

	const horizontal = castHorizontalRay(rayAngle);
	const vertical = castVerticalRay(rayAngle);

	let ray = (horizontal.distance < vertical.distance) ? horizontal : vertical;
	ray.distance *= Math.cos(player.angle - rayAngle); // Correct fish-eye effect
	// ray.distance = ray.distance * Math.cos(player.angle - rayAngle); // Correct fish-eye effect
	return ray;
}

function renderFloor() {
	const horizon = screenHeight / 2;

	c.fillStyle = "#0F0202"
	c.fillRect(0, horizon, screenWidth, screenHeight - horizon);

	c.fillStyle = "#03030D"
	c.fillRect(0, 0, screenWidth, screenHeight - horizon);
}

function castHorizontalRay(angle) {
	let dist = MAX_DEPTH;
	let xStep, yStep;
	let hitX, hitY;
	let side = 'horizontal';
	const tan = 1 / Math.tan(angle);
	const facingNorthSouth = Math.sin(angle) > 0 ? 'north' : 'south';

	if (Math.sin(angle) > 0) {
		hitY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
		yStep = TILE_SIZE;
	} else {
		hitY = Math.floor(player.y / TILE_SIZE) * TILE_SIZE - 1;
		yStep = -TILE_SIZE;
	}
	xStep = yStep * tan;
	hitX = player.x + (hitY - player.y) * tan;

	while (hitX >= 0 && hitY >= 0 && hitX < mapWidth * TILE_SIZE && hitY < mapHeight * TILE_SIZE) {
		const mapX = Math.floor(hitX / TILE_SIZE);
		const mapY = Math.floor(hitY / TILE_SIZE);
		if (map[mapY][mapX] === 1) {
			dist = distance(player.x, player.y, hitX, hitY);
			break;
		}
		hitX += xStep;
		hitY += yStep;
	}

	return { distance: dist, hitX, hitY, side, facingNorthSouth };
}

function castVerticalRay(angle) {
	let dist = MAX_DEPTH;
	let xStep, yStep;
	let hitX, hitY;
	let side = 'vertical';
	const tan = Math.tan(angle);
	const facingEastWest = Math.cos(angle) > 0 ? 'east' : 'west';

	if (Math.cos(angle) > 0) {
		hitX = Math.floor(player.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE;
		xStep = TILE_SIZE;
	} else {
		hitX = Math.floor(player.x / TILE_SIZE) * TILE_SIZE - 1;
		xStep = -TILE_SIZE;
	}
	yStep = xStep * tan;
	hitY = player.y + (hitX - player.x) * tan;

	while (hitX >= 0 && hitY >= 0 && hitX < mapWidth * TILE_SIZE && hitY < mapHeight * TILE_SIZE) {
		const mapX = Math.floor(hitX / TILE_SIZE);
		const mapY = Math.floor(hitY / TILE_SIZE);
		if (map[mapY][mapX] === 1) {
			dist = distance(player.x, player.y, hitX, hitY);
			break;
		}
		hitX += xStep;
		hitY += yStep;
	}

	return { distance: dist, hitX, hitY, side, facingEastWest };
}

function distance(x1, y1, x2, y2) {
	return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function render3DScene() {
	const rayAngleStep = FOV / NUM_RAYS;

	for (let i = 0; i < NUM_RAYS; i++) {
		const rayAngle = player.angle - FOV / 2 + rayAngleStep * i;
		const { distance, hitX, hitY, side, facingNorthSouth, facingEastWest } = castRay(rayAngle);

		if (distance === 0) continue;

		const correctedDistance = distance
		// const correctedDistance = distance * Math.cos(rayAngle - player.angle); // Fix fish-eye distortion

		let textureX;
		if (side === 'vertical') {
			textureX = hitY % TILE_SIZE;
			if (facingEastWest === 'west') {
				textureX = TILE_SIZE - textureX;
			}
		} else {
			textureX = hitX % TILE_SIZE;
			if (facingNorthSouth === 'south') {
				textureX = TILE_SIZE - textureX;
			}
		}

		textureX = (textureX / TILE_SIZE) * textures.width;

		const wallHeight = (WALL_HEIGHT / correctedDistance) * (screenHeight / 2);
		const dx = i * (screenWidth / NUM_RAYS);
		const dy = (screenHeight / 2) - (wallHeight / 2);
		const dWidth = (screenWidth / NUM_RAYS);
		const dHeight = wallHeight;

		c.drawImage(textures, textureX, 0, 1, textures.height, dx - 1, dy, 1, dHeight);
	}
}

function drawCross() {
	const centerX = c.width / 2;
	const centerY = c.height / 2;
	const crossSize = 20;

	c.beginPath();
	c.strokeStyle = 'white';
	c.lineWidth = 2;

	c.moveTo(centerX, centerY - crossSize / 2);
	c.lineTo(centerX, centerY + crossSize / 2);

	c.moveTo(centerX - crossSize / 2, centerY);
	c.lineTo(centerX + crossSize / 2, centerY);

	c.stroke();
}

function light() {
	const gradient = c.createRadialGradient(
		screenWidth / 2, screenHeight / 2, 50,
		screenWidth / 2, screenHeight / 2, 300
	);

	gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
	gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
	gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

	c.fillStyle = gradient;
	c.fillRect(0, 0, screenWidth, screenHeight);
}

spritesData = {
	monster: {
		spriteSheet: new Image(),
		url: '',
		frames: 4,
		frameDuration: 100,
	},
	player: {
		spriteSheet: new Image(),
		url: '',
		frames: 4,
		frameDuration: 100,
	},
	weapon: {
		spriteSheet: new Image(),
		url: 'https://localhost:8003/usr/src/app/static/images/spritesheetGun.png',
		frames: 4,
		frameDuration: 100,
	}
}

function loadImage() {
	// spritesData.monster.spriteSheet.src = spritesData.monster.url;
	// spritesData.player.spriteSheet.src = spritesData.player.url;
	spritesData.weapon.spriteSheet.src = spritesData.weapon.url;
}

let isFiring = false;
let currentFrame = 0;
const totalFrames = 4;
const frameDuration = 100;
let lastFrameTime = 0;
function updateWeaponAnimation(deltaTime) {
    if (isFiring) {
	    if (currentFrame==0)
		    gunFire.play();
        lastFrameTime += deltaTime;
        if (lastFrameTime >= frameDuration) {
            currentFrame++;
            lastFrameTime = 0;
            if (currentFrame >= totalFrames) {
                isFiring = false;
                currentFrame = 0;
            }
        }
    }
}

function drawWeapon() {
	const weaponWidth = 200;
	const weaponHeight = 200;
	const data = spritesData.weapon
	const frameWidth = data.spriteSheet.width / data.frames; // TODO : store when load

    c.drawImage(
        data.spriteSheet,
        currentFrame * frameWidth, 0, frameWidth, data.spriteSheet.height,
        screenWidth/2 - weaponWidth/2, screenHeight - weaponHeight, weaponWidth, weaponHeight
    );	
}

function drawHealBar() {
	c.fillStyle = 'red';
	c.fillRect(10, 10, 100, 10);
	c.fillStyle = 'green';
	c.fillRect(10, 10, 100 * player.hp / 100, 10);
}

const playerTexture = new Image();
playerTexture.src = ''


const playerSpriteSheet = new Image();
playerSpriteSheet.src = '';

const SPRITE_WIDTH = playerSpriteSheet.width/4; 
const SPRITE_HEIGHT = playerSpriteSheet.height; 


function drawEntity(x, y, entity) {
	const dx = x - player.x;
	const dy = y - player.y;
	const dist = Math.sqrt(dx * dx + dy * dy);

	const size = 10000 / dist;

	let angleToE = Math.atan2(dy, dx) - player.angle;

	angleToE = (angleToE + 2 * Math.PI) % (2 * Math.PI);
	if (angleToE > Math.PI) angleToE -= 2 * Math.PI;
	
	if (distance(player.x, player.y, x, y) > castRay(player.angle + angleToE).distance)
		return;
	

	const eScreenX = c.width / 2 + (angleToE / FOV) * c.width;

	if (Math.abs(angleToE) < FOV / 2) {
        let texture;
		if (entity.username)
			c.fillStyle = 'green';
		else
			c.fillStyle = 'red';
        // if (entity === 'monster') {
        //     texture = monsterTexture;
        // } else {
        //     texture = playerTexture;
        // }

		entityAngle = fixAngle(entity.angle)
		playerAngle = fixAngle(player.angle)
		let spriteX = 0;

        let relativeAngle = (entityAngle - playerAngle + 2 * Math.PI) % (2 * Math.PI);
        if (relativeAngle > Math.PI) relativeAngle -= 2 * Math.PI;

		// diffAngle = entityAngle - playerAngle

		// if (diffAngle < -Math.PI) diffAngle += 2 * Math.PI;
		if (relativeAngle > -Math.PI / 4 && relativeAngle < Math.PI / 4) {
			spriteX = 3 * playerSpriteSheet.width / 11; // Back sprite
        } else if (relativeAngle >= Math.PI / 4 && relativeAngle <= 3 * Math.PI / 4) {
            spriteX = playerSpriteSheet.width / 11; // Right sprite
        } else if (relativeAngle <= -Math.PI / 4 && relativeAngle >= -3 * Math.PI / 4) {
            spriteX = 2 * playerSpriteSheet.width / 11; // Left sprite
        } else {
            spriteX = 0; // Front sprite
        }

		
        // c.drawImage(playerSpriteSheet, eScreenX - size / 2, c.height / 2 - size / 2, size, size);
		// c.drawImage(playerSpriteSheet, 3*playerSpriteSheet.width/11 + spriteX, 30, playerSpriteSheet.width/11, playerSpriteSheet.height/10, eScreenX - size / 2, c.height / 2 - size / 2, size, size*4)
		c.fillRect(eScreenX - size / 2, c.height / 2 - size / 2, size, size*4)
	}
}

function drawPlayers() {
	if (!game_state.players)
		return;
	game_state.players.forEach((p, index) => {
		if (parseInt(p.user_id) === parseInt(player.id)) {
			player.x = p.x;
			player.y = p.y;
			player.hp = p.hp;
			return;
		}
		const x = p['x']
		const y = p['y']
		drawEntity(x, y, p);
	});
}

function drawMonsters() {
	if (!game_state.monsters)
		return;
	game_state.monsters.forEach((m, index) => {
		const x = m['x']
		const y = m['y']
		drawEntity(x, y, m);
	});
}

function drawMap() {
	const tileSize = 15;
	const mapWidth = 8;
	const mapHeight = 8;

	for (let y = 0; y < mapHeight; y++) {
		for (let x = 0; x < mapWidth; x++) {
			if (map[y][x] === 1) {
				c.fillStyle = 'black';
			}
			else
				c.fillStyle = 'green';
			
			c.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
		}
		if (game_state.monsters)
			game_state.monsters.forEach((m, index) => {
				c.fillStyle = 'red';
				c.fillRect(m.x/ TILE_SIZE* tileSize, m.y/ TILE_SIZE* tileSize, 5, 5);
			})
	}
}

async function drawGam(deltaTime) {
	if (game_state.state == 'waiting')
		return await drawWaitingState();
	c.width = 800;
	c.height = 650;
	c.clearRect(0, 0, c.width, c.height);
	renderFloor();
	render3DScene();
	drawPlayers();
	drawMonsters();
	light();
	drawMap();
	drawHealBar();

    updateWeaponAnimation(deltaTime);
	drawWeapon();

	// render();
	// movePlayer();
	drawCross();

	// if (game_state.players) {
		// const currentPlayer = game_state.players.find(p => p.user_id === player.id);
		// console.log(currentPlayer, player.id)
		// if (currentPlayer) {
		// 	player.x = currentPlayer.x;
		// 	player.y = currentPlayer.y;
		// }
	// }
}

async function drawEndGam() {
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

		c.fillText("Moving to " + page + " page", 800 / 2, 650 / 2)
		
		await sleep(2000);
		loadPage(page, 1)
		return 1
	}
	return 0
}

let previousKeyState = { ...keyState };
function sendKeystate() {
	// if (JSON.stringify(keyState) !== JSON.stringify(previousKeyState)) {
	if (socket.readyState === WebSocket.OPEN) {
		socket.send(JSON.stringify({ command: 'move', k: keyState, angle: player.angle }));
	}
	// 	previousKeyState = { ...keyState };
	// }
}

var url = "https://localhost:8003/usr/src/app/static/"
url = url.replace("localhost", window.location.hostname);
   
let gunFire = new Audio('https://localhost:8003/usr/src/app/static/sounds/gun.wav');
// let gunImpact = new Audio('https://localhost:8003/usr/src/app/static/sounds/impact.mp3');
// let chubDead= new Audio('https://localhost:8003/usr/src/app/static/sounds/chubbs_dead.mp3');
// let playerHit = new Audio('https://localhost:8003/usr/src/app/static/sounds/player_hit.mp3');
let song = new Audio('https://localhost:8003/usr/src/app/static/sounds/song.wav');

function loadGam() {
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
	connect('gam');
	player.id = getCookie('userId');
	loadImage()
	if (!isGameLoopRunning) {

		document.addEventListener('mousemove', (event) => {
			let sensitivity = 0.005;
			let movementX = event.movementX || event.mozMovementX || 0;
			player.angle += movementX * sensitivity;
			sendKeystate();
		});


		// player.sprint = 1;
		document.addEventListener('keydown', (e) => {
			keyState[e.key] = true;

			if (event.code === 'Space') {
				isFiring = true;
				currentFrame = 0;
				lastFrameTime = 0;
			}
			// if (e.key === "z")
			// 	player.speed = 2;
			// if (e.key === "q")
			// 	player.speedX = -2;
			// if (e.key === "s")
			// 	player.speed = -2;
			// if (e.key === "d")
			// 	player.speedX = 2;

			// if (socket) {
			// 	socket.send(JSON.stringify({ command: 'move', k: e.key, direction: 'down', angle: player.angle }));
			// }
		});

		document.addEventListener('keyup', (e) => {
			// if (e.key === "Shift")
			// 	player.sprint = 1;

			keyState[e.key] = false;

			// if (e.key === "z")
			// 	player.speed = 0;
			// if (e.key === "q")
			// 	player.speedX = 0;
			// if (e.key === "s")
			// 	player.speed = -0;
			// if (e.key === "d")
			// 	player.speedX = -0;

			// if (socket) {
			// 	socket.send(JSON.stringify({ command: 'move', k: e.key, direction: 'up', angle: player.angle }));
			// }
		});

		setInterval(() => {
			sendKeystate();
		}, 100); // Send updates every 100ms

		canv = document.getElementById('pongCanvas')
		canv.requestPointerLock = canv.requestPointerLock || canv.mozRequestPointerLock;
		canv.onclick = function () {
			console.log("lock")
			canv.requestPointerLock();
		};

		isGameLoopRunning = true;
		gameLoop('gam');
		song.play();
	}
}




