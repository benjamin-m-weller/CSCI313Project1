
/*
DOCUMENTATION

*/

var queue; // LoadQueue
var stage; // Stage

//KEYS
var KEYCODE_ENTER = 13;
var KEYCODE_SPACE = 32;
var KEYCODE_UP = 38;
var KEYCODE_DOWN = 40;
var KEYCODE_LEFT = 37;
var KEYCODE_RIGHT = 39;
var KEYCODE_W = 87;
var KEYCODE_A = 65;
var KEYCODE_D = 68;
var KEYCODE_S = 83;

var xKeyHeld = "NONE";
var yKeyHeld = "NONE";
var playerDirection = "RIGHT";

var yMomentum = 0;
var onGround = 0;
var pressedLeft = 0, pressedRight = 0;
var pressedDown = 0;

var diver, tank, oceanbackground, blackScreen, redScreen, redarrowL, redarrowR;
var floor, platform1, platform2, platform3, platform4, platform5;
var diverChangeX, diverChangeY;
var oxygenLabel, oxygenBarBack, oxygenBar, oxygenCommand, oxygenRate = 0.5;
var drowningbar, drowningCommand, drowningRate = 1;
var scoreLabel, score = 0, scoreRate = 0, tanksCollected = 0;;
var staminaLabel, staminaBar, staminaBarBack, staminaCommand, staminaRate = 2, isFiring = 0;
var scoreLabel, score = 0, scoreRate = 0, staminaRecover = 0;;
var bullets = [], bulletSpeed = 10;
var fish = new createjs.Container(), fishRate = 200, fishCount = 0;
var currentWall = 50000, wallDuration = 60, wallCount = 0;
var bubbleSound;

const PWidth=300; //width of the platforms

//var pB; // pause button
var pausedLabel;
var isInstructions = 1;
var isGameOver = 0; //This needs to get removed 

//sprite sheets
var magikarpSheet;
magikarpData = {
    images:["magikarpsubsheet.png"],
    frames:[
      [5, 150, 63, 69], [73, 150, 63, 69], [141, 150, 63, 69]
    ],
    animations:{ 
      stand: 0,
      moveLeft: [0, 2, 0.3]
    }
};

function load()
{
    queue = new createjs.LoadQueue(false);
    queue.addEventListener( "complete", init );
    queue.loadManifest([{id:"bigdaddy",src:"bigdaddy.png"},{id:"tank",src:"tank.png"},
        {id:"oceanbackground",src:"oceanbackground.png"},{id:"redarrow",src:"redarrow.png"},
        {id:"magikarpImage",src:"magikarpsubsheet.png"},
		{id: "bubbleSound", src:"bubble.mp3"}]);
	queue.installPlugin(createjs.Sound);	
	

    document.onkeyup = handleKeyUp.bind(this);
    document.onkeydown = handleKeyDown.bind(this);
    document.getElementById("canvas").onkeydown = handleKeyDown;

    pB = document.getElementById("pauseBtn");
}

function init()
{
    stage = new createjs.Stage("canvas");
	
	//Sound code doesn't work
	// bubbleSound=queue.getResult("bubbleSound");
	// createjs.Sound.registerSound("bubble.mp3", "bubbleSound", 0);
	// createjs.Sound.play("bubbleSound");
	
    var diverImage = queue.getResult("bigdaddy");
    var tankImage = queue.getResult("tank");
    var oceanImage = queue.getResult("oceanbackground");
    var redarrowImage = queue.getResult("redarrow");

    // spritesheets
    magikarpSheet = new createjs.SpriteSheet(magikarpData);
    
    // floor rectangle
    var g1 = new createjs.Graphics();
    g1.beginStroke("black").beginFill("#E5CF7F").drawRect(0, 670, 1280, 50);

    // platform1 rectangle
    var g2 = new createjs.Graphics();
    g2.beginStroke("black").beginFill("#7481BA").drawRect(0, 0, PWidth, 30);

    // black screen
    var g3 = new createjs.Graphics();
    g3.beginStroke("black").beginFill("black").drawRect(0, 0, 1280, 720);

    // oxygen bar black background  
    var g4 = new createjs.Graphics();
    g4.beginStroke("black").beginFill("#434343").drawRect(0, 0, 400, 25);

    // oxygen bar
    var g5 = new createjs.Graphics();
    g5.beginStroke("black").beginFill("lightblue"); //.drawRect() is set in a command later

    // drowning bar
    var g7 = new createjs.Graphics();
    g7.beginStroke("black").beginFill("red"); //.drawRect() is set in a command later

    // stamina bar black background  
    var g8 = new createjs.Graphics();
    g8.beginStroke("black").beginFill("#434343").drawRect(0, 0, 300, 25);

    // stamina bar
    var g9 = new createjs.Graphics();
    g9.beginStroke("black").beginFill("green"); //.drawRect() is set in a command later

    // red screen (for gameOver)
    var g6 = new createjs.Graphics();
    g6.beginStroke("red").beginFill("red").drawRect(0, 0, 1280, 720);

    oceanbackground = new createjs.Bitmap(oceanImage);
    oceanbackground.x = 0; oceanbackground.y = 0;
    stage.addChild(oceanbackground);
    stage.update();

    floor = new createjs.Shape(g1);
    stage.addChild(floor);
    stage.update();

    platform1 = new createjs.Shape(g2);
    platform1.x = 490; platform1.y = 345;
    stage.addChild(platform1);
    stage.update();

    platform2 = new createjs.Shape(g2);
    platform2.x = -138; platform2.y = 122;
    stage.addChild(platform2);
    stage.update();

    platform3 = new createjs.Shape(g2);
    platform3.x = 1118; platform3.y = 122;
    stage.addChild(platform3);
    stage.update();

    platform4 = new createjs.Shape(g2);
    platform4.x = -138; platform4.y = 487;
    stage.addChild(platform4);
    stage.update();

    platform5 = new createjs.Shape(g2);
    platform5.x = 1118; platform5.y = 487;
    stage.addChild(platform5);
    stage.update();

    oxygenLabel = new createjs.Text("Oxygen: ", "bold 25px Arial", "#434343");
    oxygenLabel.x = 30; oxygenLabel.y = 685;
    stage.addChild(oxygenLabel);
    stage.update();

    oxygenBarBack = new createjs.Shape(g4);
    oxygenBarBack.x = 140; oxygenBarBack.y = 685;
    stage.addChild(oxygenBarBack);
    stage.update();

    oxygenBar = new createjs.Shape(g5);    
    oxygenBar.x = 140; oxygenBar.y = 685;
    oxygenCommand = oxygenBar.graphics.drawRect(0, 0, 400, 25).command;
    stage.addChild(oxygenBar);
    stage.update();

    drowningBar = new createjs.Shape(g7);
    drowningBar.x = 140; drowningBar.y = 685;
    drowningCommand = drowningBar.graphics.drawRect(0, 0, 0, 25).command;
    drowningBar.alpha = 0.5;
    stage.addChild(drowningBar);
    stage.update();

    staminaLabel = new createjs.Text("Stamina: ", "bold 25px Arial", "#434343");
    staminaLabel.x = 835; staminaLabel.y = 685;
    stage.addChild(staminaLabel);
    stage.update();

    staminaBarBack = new createjs.Shape(g8);
    staminaBarBack.x = 950; staminaBarBack.y = 685;
    stage.addChild(staminaBarBack);
    stage.update();

    staminaBar = new createjs.Shape(g9);
    staminaBar.x = 950; staminaBar.y = 685;
    staminaCommand = staminaBar.graphics.drawRect(0, 0, 300, 25).command;
    stage.addChild(staminaBar);
    stage.update();

    redScreen = new createjs.Shape(g6);
    stage.addChild(redScreen);
    redScreen.alpha = 0;
    stage.update();

    scoreLabel = new createjs.Text("Score: " + score, "bold 25px Arial", "#434343");
    scoreLabel.x = 580; scoreLabel.y = 685;
    stage.addChild(scoreLabel);
    stage.update();

    blackScreen = new createjs.Shape(g3);
    stage.addChild(blackScreen);
    stage.update();

    redarrowL = new createjs.Bitmap(redarrowImage);
    redarrowL.x = 567; redarrowL.y = 320;
    stage.addChild(redarrowL);
    stage.update();

    redarrowR = new createjs.Bitmap(redarrowImage);
    redarrowR.x = 693; redarrowR.y = 320;
    redarrowR.regX = redarrowR.image.width/2;
    redarrowR.scaleX *= -1;
    stage.addChild(redarrowR);
    stage.update();

    tank = new createjs.Bitmap(tankImage);
    tank.x = 630; tank.y = 325;
    stage.addChild(tank);
    stage.update();

    diver = new createjs.Bitmap(diverImage);
    diverChangeX = diver.image.width/2;
    diverChangeY = diver.image.height/2;
    diver.x = 640; diver.y = 570;
    diver.regX = 20; diver.regY = 23; //set regX & refY to center (40x46)    
    stage.addChild(diver);
    stage.update();

    //initialize fish Container
    fish = new createjs.Container();
    stage.addChild(fish);

    //Create text for instructions
    var instructions = new createjs.Text("Quickly! Gather Oxygen Tanks to stay alive!\nPress the ARROW KEYS to move left, right, up and down!\nPress SPACEBAR to shoot enemies!\n\nPress ENTER to begin!", "bold 25px Arial", "white");
    instructions.x = 640; instructions.y = 70;
    instructions.textAlign = "center";
    stage.addChild(instructions);
    stage.update();
    pause();
    isInstructions = 0;
    stage.removeChild(instructions);
    createjs.Tween.get(blackScreen).to({alpha: 0}, 500);
    createjs.Tween.get(redarrowL).to({alpha: 0}, 500);
    createjs.Tween.get(redarrowR).to({alpha: 0}, 500);

    pausedLabel = new createjs.Text("PAUSED", "bold 70px Arial", "white");
    pausedLabel.x = 640; pausedLabel.y = 120;
    pausedLabel.textAlign = "center";
    pausedLabel.visible = false;
    stage.addChild(pausedLabel);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
	
}

/*----------\
| Game Loop |
\----------*/
function tick(event) {
    if (!event.paused)
    {

        /*------------------------\
        | Left and Right Controls |
        \------------------------*/
        switch (xKeyHeld)
        {
            case "LEFT":
                diver.x -= 6;
                diver.rotation = -20;
                if (diver.x <= -38) // pacman/mario bros logic
                    diver.x = 1318;
                break;
            case "RIGHT":
                diver.x += 6;
                diver.rotation = 20;
                if (diver.x >= 1318)
                    diver.x = -38
                break;
        }

        /*-----------\
        | Up Control |
        \-----------*/
        if (yKeyHeld == "UP")
        {
            if (diver.y > 20) //Prevents character from swimming too high out of view
                yMomentum = -10
            onGround = 0;
        }

        /*--------\
        | Gravity |
        \--------*/
        if (diver.y < 670 - diverChangeY) //Prevents character from falling through the floor
        {
            //Check if on platforms
            if (onPlatform(platform1) == 1 || onPlatform(platform2) || onPlatform(platform3) ||
                    onPlatform(platform4) || onPlatform(platform5)) 
            {
                yMomentum = 0;
            }
            else
            {
                diver.y += yMomentum; //apply gravity
            }

            if(pressedDown == 1) //holding DOWN
            {
                if(yMomentum < 7)
                    yMomentum++;
            }
            else if (yMomentum > 3)
                yMomentum--; //Slow down
            else
                yMomentum++; //Increase gravity
        
        }
        else //On floor
        { 
            if (onGround == 0) //Adjusts to floor
            {
                diver.y = 670 - diverChangeY;
                onGround = 1;
            }               
            if (yMomentum < 0)
                diver.y += yMomentum;
        }
        
        /*---------------\
        | Tank Collision |
        \---------------*/
        checkTankCollision();

         /*-----------\
         | Oxygen Bar |
         \-----------*/
		 //The below method call also implicitly does the drowning logic.
		 oxygenBarLogic();
      
        /*--------\
        | Bullets |
        \--------*/
        if(bullets.length > 0)
        {
            //checking all bullets in array
            for(i = bullets.length-1; i >= 0; i--)
            {
                //removing bullets
                if(bullets[i].b.x < -40 || bullets[i].b.x > 1320)
                {
                    stage.removeChild(bullets[i].b);
                    bullets[i].b = null;
                    bullets.splice(i, 1);
                }
                //moving bullets 
                else
                    bullets[i].b.x += bullets[i].m;
            }
        }

        /*-----\
        | Fish |
        \-----*/
        //Fish Collisions
        if(fish.children.length > 0)
        {
            //checking all fish in array
            for(i = 0; i < fish.children.length; i++)
            {
                //removing fish
                if(fish.children[i].x < -70)
                {
                    fish.removeChildAt(i);
                    stage.update();
                    break;
                }

                //fish collision with bulletes
                if(checkBulletCollision(i) == 1)
                    break;

                //fish collision with diver
                if(checkFishCollision(i) == 1)
                    break;
            }
        }
        //Adding Fish
        if(fishCount < fishRate)
        {
            fishCount++;
        }
        else
        {
            createFish("NORMAL");
            fishCount = 0;

            if(fishRate > 150)
                fishRate -= 10;
            else if(fishRate > 50)
                fishRate -= 5;
            else if(fishRate > 30)
                fishRate -= 1;
        }

        /*--------------\
        | Walls of Fish |
        \--------------*/
        //Create walls of fish at certain scores throughout the game
        if(score > currentWall)
        {
            createFish("WALL");
            wallCount ++;

            if(wallCount > wallDuration)
            {
                // Determine the next wall
                //  AND set the next wall's duration
                if(currentWall == 50000)
                    currentWall = 200000;
                else if(currentWall == 200000)
                {
                    currentWall = 500000;
                    wallDuration += 30;
                }                 
                else if(currentWall == 500000)
                {
                    currentWall = 1000000;
                    wallDuration += 30;
                }
                else
                    currentWall += 1000000;

                // Reset the wall counter
                wallCount = 0;
            }
        }


        /*--------\
        | Stamina |
        \--------*/
        if(staminaCommand.w <= 0)
        {
            staminaCommand.w = 0;

            staminaRecover++;
            if(staminaRecover >= 120)
            {
                staminaRecover = 0;
                staminaCommand.w = 1;
                isFiring = 0;
            }

        }
        else if(isFiring == 1)
        {
            staminaRecover++;
            if(staminaRecover >= 30)
            {
                staminaRecover = 0;
                isFiring = 0;
            }
        }
        else if(staminaCommand.w < 295)
            staminaCommand.w += staminaRate;
        else
            staminaCommand.w = 300;
        
        stage.update();
    }
}

function checkFishCollision(fishI)
{
 	
  	if(diver.x + 23 > fish.children[fishI].x && diver.x - 23 < fish.children[fishI].x + 93 &&
            diver.y + 20 > fish.children[fishI].y && diver.y - 23 < fish.children[fishI].y + 69)
 	{
 		//Decrement oxygenBar
        if(oxygenCommand.w > 50)
 		    oxygenCommand.w -= 50; //Randomly picked number
        else
            oxygenCommand.w = 0;
 		
 		//Decrease score
 		score-=100;
 		
 		//Removes fish
 		fish.removeChildAt(fishI);

        return 1;
     }
 	
}

function checkBulletCollision(fishI)
{

    for(var i = bullets.length-1; i >= 0; i--)
    {

        if(bullets[i].b.x + 50 > fish.children[fishI].x && bullets[i].b.x < fish.children[fishI].x + 93 &&
            bullets[i].b.y + 40 > fish.children[fishI].y && bullets[i].b.y < fish.children[fishI].y + 69)
        {
            // remove bullet
            if(bullets[i].b.alpha == 1)
                bullets[i].b.alpha = 0.5
            else
            {
                stage.removeChild(bullets[i].b);
                bullets[i].b = null;
                bullets.splice(i, 1);
            }

            //increase score
            scoreRate += 100;
            score += (500 + scoreRate/2);

            //remove fish
            fish.removeChildAt(fishI);

            return 1;
            break;
        }

    }
    return 0;

} 

function onPlatform(p) 
{
    //On top of platform
    if (yMomentum >= 0 && pressedDown == 0 &&
        diver.y >= p.y-4 - diverChangeY && diver.y <= p.y - diverChangeY &&
        diver.x >= p.x - diverChangeX && diver.x <= p.x + PWidth + diverChangeX)
        {
            diver.y = p.y - diverChangeY;
            return 1;
        }
    else
        return 0;
}

function checkTankCollision()
{
	//Going to get the local point for the middle of the oxygen tank
	var point = tank.localToLocal(10, 10, diver);
	
	//Now comparing the local point to see if the diver has hit the middle of the tank.
	if (diver.hitTest(point.x, point.y))
	{
        //Move tank to a different location
		movesTank();

		//Reset oxygen bar 
        oxygenCommand.w = 400;

        //Adjust score/difficulty
        tanksCollected++;
        scoreRate += 100;
		score += (1000 + scoreRate);
        if(oxygenRate <= 1.5) //Dropping faster is too hard
            oxygenRate += 0.1;
	}
}

function movesTank()
{
	//I have a list of locations that the tank could be in
	var myArray=[
        {x:630, y:325}, //middle platform
        {x:630, y:650}, //middle floor
        {x:10, y:102}, //top left platform
        {x:10, y:467}, //bottom left platform
        {x:10, y:650}, //left floor
        {x:1250, y:102}, //top right platform
        {x:1250, y:467}, //bottom right platform
        {x:1250, y:650} //right floor
        ];
		
	//I take the current location of the tank, remove it, and then randomly place the tank in another location.
	var myx = tank.x;
	var myy = tank.y;
	for (var i = 0; i < myArray.length; i++)
	{
		if (myArray[i].x == tank.x && myArray[i].y == tank.y)
		{
			break;
		}
	}
	
	//Whatever value the for loop stops at indicates the index of the location that will be removed.
	myArray.splice(i, 1); //This should remove the current location.
	
	//Going to select a random location
	var randomIndex = Math.floor(Math.random() * (myArray.length-1)); 
	
	//Set the tank to the random index's location
    createjs.Tween.get(tank).to({x: myArray[randomIndex].x}, 200);
    createjs.Tween.get(tank).to({y: myArray[randomIndex].y}, 200);
	//tank.x=myArray[randomIndex].x;
	//tank.y=myArray[randomIndex].y;
	
	//stage.update();
	
}

function createFish(fishSpeed)
{
    //create temporary magikarp
    var magik = new createjs.Sprite(magikarpSheet,'moveLeft');
    
    if(fishSpeed == "WALL")
    {
        magik.addEventListener("change", swimLeftSlow);
        magik.scaleX = magik.scaleY = 0.75;
    }
    else // "NORMAL"
    {
        var speed = Math.random() * 3;
        if(speed < 1)
        {
            magik.addEventListener("change", swimLeft);
        }
        else if(speed < 2)
        {
            magik.addEventListener("change", swimLeftFast);
            magik.scaleX = magik.scaleY = 1.5;
        }
        else
        {
            magik.addEventListener("change", swimLeftSlow);
            magik.scaleX = magik.scaleY = 0.75;
        }
    }

    //magik.addEventListener("change", swimLeft);
    magik.x = 1320;
    magik.y = 50 + Math.floor(Math.random() * 505);

    //add temp magikarp to fish container
    fish.addChild(magik);
    stage.update();
}

function swimLeft(e) {
    var s = e.target;
    s.x -= 3;
}

function swimLeftFast(e) {
    var s = e.target;
    s.x -= 4;
}

function swimLeftSlow(e) {
    var s = e.target;
    s.x -= 2;
}

function createBullet()
{
    //create temporary bullet
    var gBullet = new createjs.Graphics();
    gBullet.beginStroke("black").beginFill(getRandomColor()).drawCircle(0, 0, 20);

    var gBullet2 = new createjs.Graphics();
    gBullet2.beginStroke("black").beginFill(getRandomColor()).drawCircle(0, 0, 10);

    var gBullet3 = new createjs.Graphics();
    gBullet3.beginStroke("black").beginFill(getRandomColor()).drawCircle(0, 0, 10);

    var bullet = new createjs.Shape(gBullet);
    bullet.x = 60; bullet.y = 20;
    var bullet2 = new createjs.Shape(gBullet2);
    bullet2.x = 30; bullet2.y = 20;
    var bullet3 = new createjs.Shape(gBullet3);
    bullet3.x = 10; bullet3.y = 20;

    var bulletContainer = new createjs.Container();
    bulletContainer.addChild(bullet, bullet2, bullet3);
    bulletContainer.x = diver.x;
    bulletContainer.y = diver.y - 20;
    stage.addChild(bulletContainer);

    //determine the direction/speed of the bullet
    var bulletMovement = bulletSpeed;
    if(playerDirection == "LEFT")
    {
        bulletMovement *= -1;
        bulletContainer.scaleX *= -1;
    }

    //add the bullet to the array
    bullets.push({b:bulletContainer,m:bulletMovement});
    bullet = null;
    bullet2 = null;
    bullet3 = null;
    bulletContainer = null;

    //decrease stamina bar
    staminaCommand.w -= 50;
    if(staminaRecover == 0)
        isFiring = 1;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function handleKeyDown(e)
{
    //cross browser issues
    if (!e)
    {
        var e = window.event;
    }

    //handle for which key is pressed
    switch (e.keyCode)
    {
        case KEYCODE_SPACE:
            if(staminaCommand.w > 0) //Doesn't allow player to shoot while out of stamina
                createBullet();
            break;

        case KEYCODE_ENTER:
            if(isGameOver == 0)
                pause();
            else
                resetGame();
            break;

        case KEYCODE_D:
        case KEYCODE_RIGHT:
            pressedRight = 1;
            xKeyHeld = "RIGHT";
            if (playerDirection != "RIGHT") //Should diver change direction?
            {
                diver.scaleX *= -1;
                playerDirection = "RIGHT";
            }               
            break;

        case KEYCODE_A:
        case KEYCODE_LEFT:
            pressedLeft = 1;
            xKeyHeld = "LEFT";
            if (playerDirection != "LEFT") //Should diver change direction?
            {
                diver.scaleX *= -1;
                playerDirection = "LEFT";
            }               
            break;

        case KEYCODE_W:
        case KEYCODE_UP:
            yKeyHeld = "UP";
            break;

        case KEYCODE_S:
        case KEYCODE_DOWN:
            pressedDown = 1;
            break;

    }
}

function handleKeyUp(e)
{
    //cross browser issues
    if (!e)
    {
        var e = window.event;
    }

    //handle for which key is released
    switch (e.keyCode)
    {
        case KEYCODE_D:
        case KEYCODE_RIGHT:           
            pressedRight = 0;
            if (pressedLeft == 1) //Checks to see if left key is still pressed down
            {
                xKeyHeld = "LEFT";

                if (playerDirection != "LEFT") //Should diver change direction?
                {
                    diver.scaleX *= -1;
                    playerDirection = "LEFT";
                }
            }               
            else
            {
                diver.rotation = 0;
                xKeyHeld = "NONE";
            }
            break;

        case KEYCODE_A:
        case KEYCODE_LEFT:            
            pressedLeft = 0;
            if (pressedRight == 1) //Checks to see if right key is still pressed down
            {
                xKeyHeld = "RIGHT";

                if (playerDirection != "RIGHT") //Should diver change direction?
                {
                    diver.scaleX *= -1;
                    playerDirection = "RIGHT";
                }
            }                
            else
            {
                diver.rotation = 0;
                xKeyHeld = "NONE";
            }
            break;

        case KEYCODE_W:
        case KEYCODE_UP:
            yKeyHeld = "NONE";
            break;

        case KEYCODE_S:
        case KEYCODE_DOWN:
            pressedDown = 0;
            break;

    } 

}

//Pauses the ticker
function pause()
{
    if (createjs.Ticker.getPaused())
    {
        createjs.Ticker.setPaused(false);
        //pB.textContent="Pause Game";
        pausedLabel.visible = false;
        stage.update();
    }
    else {
        createjs.Ticker.setPaused(true);
        //pB.textContent="Paused";
        if(isInstructions == 0)
        {
            pausedLabel.visible = true;
            stage.update();
        }
    }
}

function gameOver()
{
    //Reposition scoreLabel
    scoreLabel.color = "white";
    scoreLabel.font = "bold 50px Arial";
    scoreLabel.x = 640; scoreLabel.y = 620;
    scoreLabel.textAlign = "center";
    stage.swapChildren(diver, scoreLabel);
    
    //reuse pauseLabel
    pausedLabel.text = "YOU DROWNED"
    pausedLabel.visible = true;

    var gameOverText = new createjs.Text("Press ENTER to play again!", "bold 30px Arial", "white");
    gameOverText.textAlign = "center";
    gameOverText.x = 640; gameOverText.y = 300;
    stage.addChild(gameOverText);
    stage.update();

    //set visible to false
    tank.visible = false;
    //Remove bullets on screen
    for(i = bullets.length-1; i >= 0; i--)
    {
        stage.removeChild(bullets[i].b);
        bullets[i].b = null;
        bullets.splice(i, 1);
    }

    createjs.Ticker.setPaused(true);
    redScreen.alpha = 1;
    isGameOver = true;

}

function resetGame()
{
    //reset variables
    score = 0;
    scoreRate = 0;
    oxygenRate = 0.5;
    oxygenCommand.w = 400;
    drowningCommand.w = 0;
    isInstructions = 1;
    yMomentum = 0;
    onGround = 0;
    pressedLeft = 0, pressedRight = 0;
    pressedDown = 0;
    isGameOver = 0;
    fishRate= 200;
    fishCount = 0;
    currentWall = 50000;
    wallDuration = 60;
    wallCount = 0;
    fish.removeAllChildren();
    playerDirection = "RIGHT";
    createjs.Ticker.setPaused(false);

    //removes all children from stage. Saves memory (i think)
    for (var i = stage.children.length - 1; i >= 0; i--)
    {
        stage.removeChild(stage.children[i]);
    };

    init();
}

//This method does the logic for the oxygenBar during the game
function oxygenBarLogic()
{
	if(oxygenCommand.w > 0)
        {
            oxygenCommand.w -= oxygenRate;
            drowningLogic(false); //We are not currently drowning

			//Flag
			//We should make a method that does this instead of placing these two lines of code everwhere
            //Adding to the score
            score++;
            scoreLabel.text = "Score: " + score;
        }
        else
        {
			//Flag
			//The below line of code can be put in the game over function then??
            oxygenCommand.w = 0; //Makes it look cleaner when gameover. 
            drowningLogic(true);

        }
}

//This method does the drowning logic for the game.
//It will only be called from within the oxygenBarLogic method.
function drowningLogic (drowningStaus)
{
	if (drowningStaus==true) //Spelled out to be entirely explicit
	{
		drowningCommand.w += drowningRate;
            if(redScreen.alpha == 0) //Chould be shipped of to a tween method
            {
                createjs.Tween.get(redScreen).to({alpha: 0.3}, 500);
                createjs.Ticker.setFPS(50);
            }

            //Check for gameOver
            if(drowningCommand.w >= 400){
                gameOver();
            }    
	}
	else if(drowningCommand.w > 0) //lower if now drowning
        {
            //drowningCommand.w -= 0.05; //drowning bar slowly drains
            if(redScreen.alpha == 0.3) //Chould be shipped of to a tween method
            {
                createjs.Tween.get(redScreen).to({alpha: 0}, 500);
                createjs.Ticker.setFPS(60);                
            }
        }
}
