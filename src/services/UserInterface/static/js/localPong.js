let paddleHeight = 100;
let w = s = 1;
let p = q = s1 = s2 = 0;
let x = 400; y = 300;
let r = 5; v = 3;
let dx = 4; dy = 4;
let mode = "ffa";
let positions = [250,250];
let scores = [0,0];

function localupdatePositions() {
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

function localdrawPlayers() {
	colors = ['#7e3047', '#498d14', '#a891d5', 'white']
	canv.fillStyle = colors[0]
    canv.fillRect(40, positions[0] - 100/2, 10, 100)
    canv.fillStyle = colors[1]
    canv.fillRect(800 - 40 - 10, positions[1] - 100/2, 10, 100)
}

function localdrawNS() {
	canv.font = "20px monospace";
    canv.textBaseline = "middle"
    canv.textAlign = 'center'
    canv.fillStyle = 'white'
    canv.fillRect(0, 600, 800, 2)
    canv.fillText(scores[0] + ' | ' + scores[1], 800/2, 625)	
}

function localresetBall() {
    x = 400;
    y = 300;
    dx = (Math.random() > 0.5 ? 4 : -4);
    dy = (Math.random() > 0.5 ? 4 : -4);
}

function localupdateBall() {
    x += dx;
    y += dy;

    if (y - r < 0 || y + r > 600) {
        dy = -dy;
    }

    if (x - r < 40 + 10 && y > positions[0] - paddleHeight / 2 && y < positions[0] + paddleHeight / 2)
        dx = -dx;
    if (x - r < 10) {
        scores[1]++;
        localresetBall();
    }

    if (x + r > 800 - 40 - 10 && y > positions[1] - paddleHeight / 2 && y < positions[1] + paddleHeight / 2)
        dx = -dx;
    if (x + r > 800 - 10) {
        scores[0]++;
        localresetBall();
    }
}

function localdraw() {
	canv.fillStyle = "rgb(0 0 0 / 20%)";
	canv.fillRect(0, 0, 800, 650);
	canv.fillStyle = "#8791ed";
	for (i = 5; i < 600; i += 20)canv.fillRect(400, i, 4, 10)
	localdrawPlayers()
	localdrawNS()
	localupdatePositions()
	canv.fillStyle = "#FFFFFF";
    canv.beginPath();
    canv.moveTo(x, y);
    canv.arc(x, y, r, 0, Math.PI * 2, true);
    canv.stroke();
    canv.fill()
}

function localgameLoop() {
	localdraw();
    localupdateBall()
    
    canv.textAlign = 'center'
    if (scores[0] > 10)
	{
        canv.fillText("player 1 won", 800/2, 600/2)
		return
	}
    else if (scores[1] > 10)
	{
        canv.fillText("player 2 won", 800/2, 600/2)
		return
	}
	requestAnimationFrame(localgameLoop);
}

function loadLocalPong() {
	canv = document.getElementById('pongCanvas').getContext('2d')
	offScreenC = document.createElement('canvas');
	offScreenC.width = canv.width = 800;
	offScreenC.height = canv.height = 600;
	offc = offScreenC.getContext('2d');
	obstaclesDrawn = false;
	canv.font = "60px monospace"

	document.removeEventListener('keydown', keyDown)
	document.removeEventListener('keyup', keyUp)
	document.addEventListener('keydown', keyDown);
	document.addEventListener('keyup', keyUp);
	localgameLoop();
}