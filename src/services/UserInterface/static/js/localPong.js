paddleHeight = 100

c = document.getElementById('pongCanvas').getContext('2d')

c.font = "60px monospace"
w = s = 1
p = q = s1 = s2 = 0
x = 400; y = 300
r = 5; v = 3
dx = 4; dy = 4;
mode = "ffa"
positions = [250,250]
scores = [0,0]


const keyState = {};

document.addEventListener('keydown', function (event) {
    keyState[event.key] = true;
});

document.addEventListener('keyup', function (event) {
    keyState[event.key] = false;
});

function updatePositions() {
    if (keyState["w"] && positions[0] > 50) {
        positions[0] -= 5;
    }
    if (keyState["s"] && positions[0] < 600 - 50) {
        positions[0] += 5;
    }

    if (keyState["ArrowUp"] && positions[1] > 50) {
        positions[1] -= 5;
    }
    if (keyState["ArrowDown"] && positions[1] < 600 - 50) {
        positions[1] += 5;
    }
}

function drawPlayers() {
	colors = ['#7e3047', '#498d14', '#a891d5', 'white']
	c.fillStyle = colors[0]
    c.fillRect(40, positions[0] - 100/2, 10, 100)
    c.fillStyle = colors[1]
    c.fillRect(800 - 40 - 10, positions[1] - 100/2, 10, 100)
}

function drawNS() {
	c.font = "20px monospace";
    c.textBaseline = "middle"
    c.textAlign = 'center'
    c.fillStyle = 'white'
    c.fillRect(0, 600, 800, 2)
    c.fillText(scores[0] + ' | ' + scores[1], 800/2, 625)	
}

function resetBall() {
    x = 400;
    y = 300;
    dx = (Math.random() > 0.5 ? 4 : -4);
    dy = (Math.random() > 0.5 ? 4 : -4);
}

function updateBall() {
    x += dx;
    y += dy;

    if (y - r < 0 || y + r > 600) {
        dy = -dy;
    }

    if (x - r < 40 + 10 && y > positions[0] - paddleHeight / 2 && y < positions[0] + paddleHeight / 2)
        dx = -dx;
    if (x - r < 10) {
        scores[1]++;
        resetBall();
    }

    if (x + r > 800 - 40 - 10 && y > positions[1] - paddleHeight / 2 && y < positions[1] + paddleHeight / 2)
        dx = -dx;
    if (x + r > 800 - 10) {
        scores[0]++;
        resetBall();
    }
}

function draw() {
	c.fillStyle = "rgb(0 0 0 / 20%)";
	c.fillRect(0, 0, 800, 650);
	c.fillStyle = "#8791ed";
	for (i = 5; i < 600; i += 20)c.fillRect(400, i, 4, 10)
	drawPlayers()
	drawNS()
	updatePositions()
	c.fillStyle = "#FFFFFF";
    c.beginPath();
    c.moveTo(x, y);
    c.arc(x, y, r, 0, Math.PI * 2, true);
    c.stroke();
    c.fill()
}

function gameLoop() {
	draw();
    updateBall()
    
    c.textAlign = 'center'
    if (scores[0] > 10)
	{
        c.fillText("player 1 won", 800/2, 600/2)
		return
	}
    else if (scores[1] > 10)
	{
        c.fillText("player 2 won", 800/2, 600/2)
		return
	}
	requestAnimationFrame(gameLoop);
}

gameLoop();