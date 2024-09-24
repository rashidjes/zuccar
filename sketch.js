/**
The Game Project 7 – Make it awesome
*/


var gameCharX;
var gameCharY;
var floorPosY;

// declare variables for interaction
var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var canyons;
var collectables;

// declare treesX
var treesX;
var treePosY;
var clouds;
var mountains;

// camara position
var cameraPosX;

var gameScore;
var flagpole;
var lives;
var fallSoundUsed;
var sounds;
var platforms;
var enemies;

function preload() {
	soundFormats('wav');

	// load your sounds here
	loadSounds();
}

function loadSounds() {
	sounds = {
		jumpSound: loadSound('assets/jump.wav'),
		getTokenSound: loadSound('assets/gettoken.wav'),
		fallSound: loadSound('assets/fall.wav'),
		gameOverSound: loadSound('assets/gameover.wav'),
		completionSound: loadSound('assets/completion.wav')
	};
}

function setup() {
	createCanvas(1024, 576);
	floorPosY = height * 3 / 4;
	lives = 3;

	startGame();
}

function startGame() {
	gameCharX = (width / 2) + 9;
	gameCharY = floorPosY;

	// initilise variables for interaction
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
	fallSoundUsed = false;

	// multiple canyons
	canyons = [
		{ xPos: 100, width: 100 },
		{ xPos: 370, width: 100 },
		{ xPos: 700, width: 300 },
		{ xPos: 1250, width: 100 }
	];

	// multiple collectables
	collectables = [
		{ xPos: -475, yPos: 100, size: 45, textSize: 13, isFound: false },
		{ xPos: 475, yPos: 100, size: 45, textSize: 13, isFound: false },
		{ xPos: 690, yPos: 90, size: 45, textSize: 13, isFound: false },
		{ xPos: 965, yPos: 100, size: 45, textSize: 13, isFound: false },
		{ xPos: 1500, yPos: 100, size: 45, textSize: 13, isFound: false }
	];

	// initilise tree variables
	treesX = [-150, 265, 500, 900, 1150, 1450];
	treePosY = height / 2;

	// initialise a `clouds` variable with an array
	clouds = [
		{ xPos: 50, yPos: 60, size: 15 },
		{ xPos: 150, yPos: 90, size: 15 },
		{ xPos: 400, yPos: 50, size: 15 },
		{ xPos: 700, yPos: 90, size: 15 },
		{ xPos: 800, yPos: 60, size: 15 },
		{ xPos: 1250, yPos: 50, size: 15 }
	];

	// mountains initialisation
	mountains = [
		{ xPos: 0, yPos: 432 },
		{ xPos: 550, yPos: 432 },
		{ xPos: 1100, yPos: 432 }
	];

	// camara position
	cameraPosX = 0;

	// initilise the platfoms
	platforms = [];
	platforms.push(createPlatforms(235, floorPosY - 95, 100));
	platforms.push(createPlatforms(650, floorPosY - 95, 50));
	platforms.push(createPlatforms(750, floorPosY - 95, 150));
	platforms.push(createPlatforms(825, floorPosY - 5, 75));

	gameScore = 0;
	flagpole = { isReached: false, xPos: 1900 };

	enemies = [];
	enemies.push(new Enemy(-390, floorPosY - 10, 140, 6));
	enemies.push(new Enemy(216, floorPosY - 10, 140, 3));
	enemies.push(new Enemy(1045, floorPosY - 10, 100, 1));
	enemies.push(new Enemy(1105, floorPosY - 10, 100, 1));
}

function draw() {
	// change the value of cameraPosX
	cameraPosX = constrain(gameCharX - width / 2, -width / 2, width * 2);

	// fill the sky blue
	background(100, 155, 255);

	// draw some green ground
	noStroke();
	fill(0, 155, 0);
	rect(0, floorPosY, width, height - floorPosY);

	// save current coordinates
	push();
	translate(-cameraPosX, 0);

	// draw the clouds
	drawClouds();

	// draw the mountains
	drawMountains();

	// draw the trees
	drawTrees();

	// draw the platforms
	for (var i = 0; i < platforms.length; i++) {
		platforms[i].draw();
	}

	// draw the canyons and the caracter enters in the canyon zones
	for (var i = 0; i < canyons.length; i++) {
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
	}

	// draw the collectables and find the collectables
	for (var i = 0; i < collectables.length; i++) {
		if (collectables[i].isFound == false) {
			drawCollectable(collectables[i]);
			checkCollectable(collectables[i]);
		}
	}

	// draw the game character
	drawGameChar();

	// draw the end of the game
	renderFlagpole();

	// restore coordinates
	pop();

	// draw the score
	fill(0);
	noStroke();
	textSize(13);
	text("Score: " + gameScore, 20, 20);
	fill(0, 128, 0);

	// draw life tokens
	for (var i = 0; i < lives; i++) {
		drawLifeTokens(i);
	}

	// draw "Game over" text
	if (lives < 1) {
		sounds.gameOverSound.play();
		strokeWeight(1);
		textSize(33);
		textAlign(CENTER);
		noLoop();
		fill(0);
		text("Game over. Press space to continue.", width / 2, height / 2);
		return;
	}

	// draw "Level complete" text
	if (flagpole.isReached) {
		sounds.completionSound.play();
		strokeWeight(1);
		textSize(33);
		textAlign(CENTER);
		noLoop();
		fill(0);
		text("Level completed. Press space to continue.", width / 2, height / 2);
		return;
	}

	// game logic code - conditional statements to move the character
	if (isLeft) {
		gameCharX -= 3;
	}
	if (isRight) {
		gameCharX += 3;
	}

	// detect when the character is jumping above the ground and the platforms
	if (gameCharY < floorPosY) {
		var isContact = false;
		for (var i = 0; i < platforms.length; i++) {
			if (platforms[i].checkContact(gameCharX, gameCharY) == true) {
				isContact = true;
				break;
			}
		}

		if (isContact == false) {
			gameCharY += 3;
			isFalling = true;
		} else {
			isFalling = false;
		}
	} else {
		isFalling = false;
	}

	// check if player dies
	checkPlayerDie();

	// check the flagpole
	if (flagpole.isReached == false) {
		checkFlagpole();
	}

}


function keyPressed() {
	// 'a' or left key pressed
	if ((keyCode == 65 || keyCode == 37) && isPlummeting == false) {
		isLeft = true;
	}

	// 'd' or right key pressed
	if ((keyCode == 68 || keyCode == 39) && isPlummeting == false) {
		isRight = true;
	}

	// 'w' or up key pressed
	if ((keyCode == 87 || keyCode == 38) && isFalling == false && isPlummeting == false) {
		gameCharY -= 100;
		sounds.jumpSound.play();
	}

	// start the game again
	if (keyCode == 32 && lives < 1 || keyCode == 32 && flagpole.isReached) {
		window.location.reload();
	}
}

function keyReleased() {
	// 'a' or left key released
	if ((keyCode == 65 || keyCode == 37)) {
		isLeft = false;
	}

	// 'd' or right key released
	if ((keyCode == 68 || keyCode == 39)) {
		isRight = false;
	}
}

function drawClouds() {
	for (var i = 0; i < clouds.length; i++) {
		fill(224, 255, 255);
		ellipse(clouds[i].xPos, clouds[i].yPos, clouds[i].size, clouds[i].size);
		ellipse(clouds[i].xPos + 20, clouds[i].yPos, clouds[i].size + 20, clouds[i].size + 20);
		ellipse(clouds[i].xPos + 50, clouds[i].yPos, clouds[i].size + 40, clouds[i].size + 40);
		ellipse(clouds[i].xPos + 90, clouds[i].yPos, clouds[i].size + 55, clouds[i].size + 55);
		ellipse(clouds[i].xPos + 130, clouds[i].yPos, clouds[i].size + 40, clouds[i].size + 40);
	}
}

function drawMountains() {
	for (var i = 0; i < mountains.length; i++) {
		fill(95, 105, 105);
		triangle(mountains[i].xPos + 60, mountains[i].yPos,
			mountains[i].xPos + 160, mountains[i].yPos - 257,
			mountains[i].xPos + 260, mountains[i].yPos);
		fill(255);
		triangle(mountains[i].xPos + 133, mountains[i].yPos - 187,
			mountains[i].xPos + 160, mountains[i].yPos - 257,
			mountains[i].xPos + 187, mountains[i].yPos - 187);
		fill(105, 105, 105);
		triangle(mountains[i].xPos + 135, mountains[i].yPos,
			mountains[i].xPos + 235, mountains[i].yPos - 187,
			mountains[i].xPos + 335, mountains[i].yPos);
		fill(151, 124, 83);
		triangle(mountains[i].xPos, mountains[i].yPos,
			mountains[i].xPos + 80, mountains[i].yPos - 132,
			mountains[i].xPos + 160, mountains[i].yPos);
	}
}

function drawTrees() {
	noStroke();
	for (var i = 0; i < treesX.length; i++) {
		fill(114, 92, 66);
		rect(treesX[i] - 5, treePosY + 30, 50, 120);
		// branches
		fill(0, 155, 0);
		ellipse(treesX[i] + 20, treePosY, 130, 120);
		ellipse(treesX[i] + 20, treePosY - 60, 90, 90);
		ellipse(treesX[i] + 20, treePosY - 110, 60, 60);
	}
}

function drawCollectable(tCollectable) {
	if (tCollectable.isFound == false) {
		fill(0);
		ellipse(tCollectable.xPos + 155, tCollectable.yPos + 320, tCollectable.size - 10, tCollectable.size - 10);
		fill(255);
		ellipse(tCollectable.xPos + 160, tCollectable.yPos + 320, tCollectable.size - 30, tCollectable.size - 30);
		fill(0);
		textSize(tCollectable.textSize);
		textStyle(BOLD);
		text("8", tCollectable.xPos + 156, tCollectable.yPos + 325);
	}
}

function checkCollectable(tCollectable) {
	if (dist(gameCharX, gameCharY, tCollectable.xPos + 155, tCollectable.yPos + 320) < 25) {
		tCollectable.isFound = true;
		gameScore += 1;
		sounds.getTokenSound.play();
	}
}

function drawGameChar() {
	if (isLeft && isFalling) {
		// the head
		fill(250, 128, 114);
		rect(gameCharX - 4, gameCharY - 64, 8, 16);
		// the face
		fill(0);
		stroke(2);
		strokeWeight(2);
		point(gameCharX - 3, gameCharY - 59);
		strokeWeight(1);
		triangle(gameCharX - 3.5, gameCharY - 53, gameCharX - 3.5, gameCharY - 55, gameCharX - 2, gameCharY - 54);
		// the body
		noStroke();
		fill(165, 42, 42);
		ellipse(gameCharX, gameCharY - 37, 42, 25);
		fill(255, 255, 255);
		ellipse(gameCharX - 6, gameCharY - 37, 25, 4);
		fill(0);
		stroke(1);
		// the right foot
		line(gameCharX - 5, gameCharY - 24.5, gameCharX - 10, gameCharY - 20);
		line(gameCharX - 10, gameCharY - 20, gameCharX - 5, gameCharY - 15);
		// the left foot
		line(gameCharX, gameCharY - 24.5, gameCharX + 5, gameCharY - 20);
		line(gameCharX + 5, gameCharY - 20, gameCharX + 10, gameCharY - 15);
	} else if (isRight && isFalling) {
		// the head
		fill(250, 128, 114);
		rect(gameCharX - 4, gameCharY - 64, 8, 16);
		// the face
		fill(0);
		stroke(2);
		strokeWeight(2);
		point(gameCharX + 3, gameCharY - 59);
		strokeWeight(1);
		triangle(gameCharX + 3.5, gameCharY - 53, gameCharX + 3.5, gameCharY - 55, gameCharX + 2, gameCharY - 54);
		// the body
		noStroke();
		fill(165, 42, 42);
		ellipse(gameCharX, gameCharY - 37, 42, 25);
		fill(255, 255, 255);
		ellipse(gameCharX + 6, gameCharY - 37, 25, 4);
		// the right foot
		fill(0);
		stroke(1);
		line(gameCharX - 5, gameCharY - 24.5, gameCharX - 10, gameCharY - 20);
		line(gameCharX - 10, gameCharY - 20, gameCharX - 15, gameCharY - 15);
		// the left foot
		line(gameCharX, gameCharY - 24.5, gameCharX + 5, gameCharY - 20);
		line(gameCharX + 5, gameCharY - 20, gameCharX, gameCharY - 15);
	} else if (isLeft) {
		// the head
		fill(250, 128, 114);
		rect(gameCharX - 4, gameCharY - 55, 8, 16);
		// the face
		fill(0);
		stroke(2);
		strokeWeight(2);
		point(gameCharX - 3, gameCharY - 50);
		strokeWeight(1);
		triangle(gameCharX - 3.5, gameCharY - 44, gameCharX - 3.5, gameCharY - 46, gameCharX - 2, gameCharY - 45);
		// the body
		noStroke();
		fill(165, 42, 42);
		ellipse(gameCharX, gameCharY - 25, 15, 35);
		fill(255, 255, 255);
		ellipse(gameCharX - 4, gameCharY - 25, 3, 15);
		// the feet
		fill(0);
		stroke(1);
		line(gameCharX + 2, gameCharY - 8, gameCharX + 8, gameCharY + 2);
		line(gameCharX - 2, gameCharY - 8, gameCharX - 5, gameCharY + 2);
	} else if (isRight) {
		// the head
		fill(250, 128, 114);
		rect(gameCharX - 4, gameCharY - 55, 8, 16);
		// the face
		fill(0);
		stroke(2);
		strokeWeight(2);
		point(gameCharX + 3, gameCharY - 50);
		strokeWeight(1);
		triangle(gameCharX + 3.5, gameCharY - 44, gameCharX + 3.5, gameCharY - 46, gameCharX + 2, gameCharY - 45);
		// the body
		noStroke();
		fill(165, 42, 42);
		ellipse(gameCharX, gameCharY - 25, 15, 35);
		fill(255, 255, 255);
		ellipse(gameCharX + 4, gameCharY - 25, 3, 15);
		// the feet
		fill(0);
		stroke(1);
		line(gameCharX - 2, gameCharY - 8, gameCharX - 8, gameCharY + 2);
		line(gameCharX + 2, gameCharY - 8, gameCharX + 5, gameCharY + 2);
	} else if (isFalling || isPlummeting) {
		// the head
		fill(250, 128, 114);
		rect(gameCharX - 8, gameCharY - 63, 16, 16);
		// the face
		fill(0);
		stroke(2);
		line(gameCharX - 4, gameCharY - 58, gameCharX - 2, gameCharY - 58);
		line(gameCharX + 4, gameCharY - 58, gameCharX + 2, gameCharY - 58);
		ellipse(gameCharX, gameCharY - 53, 10, 5);
		// the body
		noStroke();
		fill(165, 42, 42);
		ellipse(gameCharX, gameCharY - 37, 42, 25);
		fill(255, 255, 255);
		ellipse(gameCharX, gameCharY - 37, 20, 10);
		// the right foot
		fill(0);
		stroke(1);
		line(gameCharX - 5, gameCharY - 24.5, gameCharX - 10, gameCharY - 20);
		line(gameCharX - 10, gameCharY - 20, gameCharX - 5, gameCharY - 15);
		// the left foot
		line(gameCharX + 5, gameCharY - 24.5, gameCharX + 10, gameCharY - 20);
		line(gameCharX + 10, gameCharY - 20, gameCharX + 5, gameCharY - 15);
	} else {
		// the head
		fill(250, 128, 114);
		rect(gameCharX - 8, gameCharY - 58, 16, 16);
		// the face
		fill(0);
		stroke(2);
		strokeWeight(2);
		point(gameCharX - 3, gameCharY - 53);
		point(gameCharX + 3, gameCharY - 53);
		strokeWeight(1);
		line(gameCharX - 4, gameCharY - 48, gameCharX + 4, gameCharY - 48);
		// the body
		noStroke();
		fill(165, 42, 42);
		ellipse(gameCharX, gameCharY - 28, 35);
		fill(255, 255, 255);
		ellipse(gameCharX, gameCharY - 28, 15);
		// the feet
		fill(0);
		stroke(1);
		line(gameCharX - 5, gameCharY - 11, gameCharX - 5, gameCharY + 2);
		line(gameCharX + 5, gameCharY - 11, gameCharX + 5, gameCharY + 2);
	}
}

function drawCanyon(tCanyon) {
	noStroke();
	fill(139, 69, 19);
	rect(tCanyon.xPos, 432, tCanyon.width, 144);
	fill(64, 224, 208);
	rect(tCanyon.xPos + 25, 432, tCanyon.width - 55, 144);
}

function checkCanyon(tCanyon) {
	if (gameCharX > tCanyon.xPos + 5
		&& gameCharX < (tCanyon.xPos + tCanyon.width) - 5
		&& gameCharY >= 432) {
		isPlummeting = true;
	}

	// the caracter falls down the canyon
	if (isPlummeting) {
		gameCharY += 1;
		isLeft = false;
		isRight = false;

		if (!fallSoundUsed) {
			sounds.fallSound.play();
			fallSoundUsed = true;
		}
	}
}

function drawLifeTokens(iToken) {
	var factor = 16;
	// the little head
	noStroke();
	fill(250, 128, 114);
	rect(25 + iToken * factor, 25, 6, 8);
	// the little body
	fill(165, 42, 42);
	ellipse(28 + iToken * factor, 37, 15);
	fill(255, 255, 255);
	ellipse(28 + iToken * factor, 37, 7);
	// the little feet
	fill(0);
	stroke(1);
	line(25 + iToken * factor, 44, 25 + iToken * factor, 50);
	line(31 + iToken * factor, 44, 31 + iToken * factor, 50);
}

function renderFlagpole() {
	push();
	strokeWeight(5);
	stroke(125);
	line(flagpole.xPos, floorPosY, flagpole.xPos, floorPosY - 250);
	fill(0, 155, 0);
	ellipse(flagpole.xPos, floorPosY - 250, 20, 20);
	fill(255, 215, 0);
	noStroke();

	if (flagpole.isReached) {
		triangle(flagpole.xPos, floorPosY - 238,
			flagpole.xPos, floorPosY - 208,
			flagpole.xPos + 35, floorPosY - 238);
	} else {
		triangle(flagpole.xPos - 35, floorPosY,
			flagpole.xPos, floorPosY - 30,
			flagpole.xPos, floorPosY);
	}

	for (var i = 0; i < enemies.length; i++) {
		enemies[i].draw();

		var isContact = enemies[i].checkContact(gameCharX, gameCharY);
		if (isContact) {
			if (lives > 0) {
				lives -= 1;
				startGame();
				break;
			}
		}
	}

	pop();
}

function checkFlagpole() {
	var d = abs(gameCharX - flagpole.xPos);

	if (d < 10) {
		flagpole.isReached = true;
	}
}

function checkPlayerDie() {
	if (gameCharY > height) {
		lives -= 1;

		if (lives > 0) {
			startGame();
		}
	}
}

function createPlatforms(x, y, length) {
	var p = {
		x: x,
		y: y,
		length: length,
		draw: function () {
			fill(242, 233, 116);
			ellipse(this.x + this.length / 2, this.y, this.length, 18);
		},
		checkContact: function (gcX, gcY) {
			if (gcX > this.x && gcX < this.x + this.length) {
				var d = this.y - gcY;
				if (d >= 0 && d < 5) {
					return true;
				}
			}

			return false;
		}
	};

	return p;
}

function Enemy(x, y, range, inc) {
	this.x = x;
	this.y = y;
	this.range = range;

	this.currentX = x;
	this.inc = inc;
	this.radius = 30;
	this.enemyFace = { a1: 0.52, a2: 5.76 };

	this.update = function () {
		this.currentX += this.inc;

		if (this.currentX >= this.x + this.range) {
			this.inc = -this.inc;
			this.enemyFace = { a1: 3.67, a2: 8.9 };
		} else if (this.currentX < this.x) {
			this.inc = abs(this.inc);
			this.enemyFace = { a1: 0.52, a2: 5.76 };
		}
	}

	this.draw = function () {
		this.update();
		fill(255, 0, 0);
		arc(this.currentX, this.y, this.radius, this.radius, this.enemyFace.a1, this.enemyFace.a2);
		fill(0);
		ellipse(this.currentX - 4 * this.inc / abs(this.inc), this.y - 7, 5, 5);
	}

	this.checkContact = function (gcX, gcY) {
		var d = dist(gcX, gcY, this.currentX, this.y);
		if (d < 20) {
			return true;
		}

		return false;
	}
}
