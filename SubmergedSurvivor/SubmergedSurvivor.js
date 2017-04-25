//---GLOBAL VARIABLES---

var queue; // LoadQueue
var stage; // Stage

//Keycodes for later use when getting input
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
var KEYCODE_G = 71;

var xKeyHeld = "NONE"; //Determines if any of the keys that moves the Diver's X are held.
var yKeyHeld = "NONE"; //Determines if any of the keys that moves the Diver's Y are held.
var playerDirection = "RIGHT";

var yMomentum = 0;
var onGround = 0;
var pressedLeft = 0, pressedRight = 0;
var pressedDown = 0;

var diver, tank, oceanbackground, blackScreen, redScreen, redarrowL, redarrowR;
var floor, platforms = [];
var diverChangeX, diverChangeY;
var oxygenLabel, oxygenBarBack, oxygenBar, oxygenCommand, oxygenRate = 0.5;
var drowningbar, drowningCommand, drowningRate = 1;
var scoreLabel, score = 0, scoreRate = 0, tanksCollected = 0;
var staminaLabel, staminaBar, staminaBarBack, staminaCommand, staminaRate = 2, isFiring = 0;
var scoreLabel, score = 0, scoreRate = 0, staminaRecover = 0;
var bullets = [], bulletSpeed = 10;
var fish = new createjs.Container(), fishRate = 200, fishCount = 0;
var currentWall = 50000, wallDuration = 60, wallCount = 0;
var powerUpArray = [], previousScore = 0, bubble, repair, bomb;
var godMode = false;

const PWidth = 300; //width of the platforms

//Here are two custom events that assist in the game over logic.
// var gameOverEvent=new CustomEvent("gameOver");
// var restartGameEvent=new CustomEvent("restartGame");

var pausedLabel;
var isInstructions = 1;

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
    queue.installPlugin(createjs.Sound);
	queue.addEventListener( "complete", init );
    queue.loadManifest([{id: "bigdaddy", src: "bigdaddy.png"}, {id: "tank", src: "tank.png"},
        {id: "oceanbackground", src: "oceanbackground.png"}, {id: "sand", src: "sand.png"}, {id: "redarrow", src: "redarrow.png"},
        {id: "trident", src: "trident.png"}, {id: "bigdaddyGod", src: "bigdaddyGod.png"}, {id: "oceanbackgroundGod", src: "oceanbackgroundGod.png"},
        {id: "coral", src: "coral.png"}, {id: "coralyellow", src: "coralyellow.png"}, {id: "coralblue", src: "coralblue.png"},
        {id: "coralgreen", src: "coralgreen.png"}, {id: "coralred", src: "coralred.png"},
        {id: "magikarpImage", src: "magikarpsubsheet.png"},
        {id: "bomb", src: "bomb.png"}, {id: "bubble", src: "bubble.png"}, {id: "repair", src: "repair.png"},
		{id: "bubbleSound", src: "bubbles.mp3"}, {id: "shotSound", src: "shot.mp3"}, {id: "albatross", src:"albatross.mp3"},
        {id: "pop", src: "pop.mp3"}, {id: "repaired", src: "repaired.mp3"}, {id: "throw", src: "throw.mp3"},
        {id: "blood1", src: "blood1.mp3"}, {id: "blood2", src: "blood2.mp3"}, {id: "blood3", src: "blood3.mp3"},
        {id: "crash", src: "roblox.mp3"}, {id: "titanic", src: "titanicMeme.mp3"}]);
	
	//Adding my event listeners here
	//document.addEventListener("gameOver", gameOver, false);
	//document.addEventListener("restartGame", resetGame, false); 
}

function init()
{
    stage = new createjs.Stage("canvas");
    game_build();
    set_controls();
    game_start();	
}

/*----------\
| Game Loop |
\----------*/
function game_step(event) 
{
    if (!event.paused)
    {
		//Include an updated score label
		scoreLabel.text = "Score: " + score;

        check_controls();
        apply_gravity();
        add_enemies();
        change_oxygen_and_stamina();
        check_collisions();
		powerUpLogic();
        
        //GOD MODE
        if(godMode)
        {
            oxygenCommand.w = 400;
            staminaCommand.w = 300;
            score = 0; //prevents cheating ;)
        }

        //Update the stage
        stage.update();
    }
}

function check_controls()
{
    const xSpeed = 6;
    const rotDegrees = 20;
    const xSpawnLeft = -38;
    const xSpawnRight = 1318;

    //Left and Right controls
    switch (xKeyHeld)
    {
        case "LEFT":
            diver.x -= xSpeed;
            diver.rotation = -rotDegrees;
            if (diver.x <= xSpawnLeft) // pacman/mario bros logic
                diver.x = xSpawnRight;
            break;
        case "RIGHT":
            diver.x += xSpeed;
            diver.rotation = rotDegrees;
            if (diver.x >= xSpawnRight)
                diver.x = xSpawnLeft
            break;
    }

    //Up control
    if (yKeyHeld == "UP")
    {
        if (diver.y > 20) //Prevents character from swimming too high out of view
            yMomentum = -10
        onGround = 0;
    }
}

function apply_gravity()
{
    if (diver.y < 670 - diverChangeY) //Prevents character from falling through the floor
    {
        //Check if on platforms
        var isOn = false;
        for(var i = 0; i < platforms.length; i++)
        {
            if(onPlatform(platforms[i]))
            {
                isOn = true;
                break; //don't need to check any more platforms
            }   
        }                         
        if (isOn)
        {
            yMomentum = 0;
        }
        else
        {
            diver.y += yMomentum; //apply gravity
        }

        // if holding DOWN
        if(pressedDown == 1) 
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
}

function add_enemies()
{
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
    
    //Fish Walls: Create walls of fish at certain scores throughout the game
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
                currentWall += (currentWall / 2); //walls keep coming at higher and higher scores

            // Reset the wall counter
            wallCount = 0;
        }
    }
}

function change_oxygen_and_stamina()
{
    //Oxygen
    oxygenBarLogic();

    //Stamina
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
}

function check_collisions()
{
    //Tank and Diver
    checkTankCollision();   

    //Powerups and Diver
	powerUpCollisions();
    
    //moving bullets (MOVE SOMEWHERE ELSE AT SOME POINT)
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

    //Fish Collisions
    if(fish.children.length > 0)
    {
        //checking all fish in array
        for(i = 0; i < fish.children.length; i++)
        {
            //removing fish off screen
            if(fish.children[i].x < -70 || fish.children[i].x > 1350)
            {
                fish.removeChildAt(i);
                break;
            }

            //fish collision with bulletes
            if(checkBulletCollision(i) == true) //Spelled out explicitly for readability. 
                break;

            //fish collision with diver
            if(checkFishCollision(i) == true) //Spelled out explicitly for readability. 
                break;
        }
    }
}

function game_build()
{
    /*-----------------------\
    | Load Images From Queue |
    \-----------------------*/
    var diverImage = queue.getResult("bigdaddy");
    var tankImage = queue.getResult("tank");
    var oceanImage = queue.getResult("oceanbackground");
    var sandImage = queue.getResult("sand");
    var redarrowImage = queue.getResult("redarrow");
    var coralImage = queue.getResult("coral");
    var coralblueImage = queue.getResult("coralblue");
    var coralyellowImage = queue.getResult("coralyellow");
    var coralredImage = queue.getResult("coralred");
    var coralgreenImage = queue.getResult("coralgreen");

    // spritesheets
    magikarpSheet = new createjs.SpriteSheet(magikarpData);

    // powerups
    bubble = new createjs.Bitmap(queue.getResult("bubble"));
    bomb = new createjs.Bitmap(queue.getResult("bomb"));
    repair = new createjs.Bitmap(queue.getResult("repair"));
    bubble.regX = bomb.regX = repair.regX = 20;
    
    /*--------------------------\
    | Creating Graphics Objects |
    \--------------------------*/
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

    /*----------------------\
    | Creating Game Objects |
    \----------------------*/
    oceanbackground = new createjs.Bitmap(oceanImage);
    oceanbackground.x = 0; oceanbackground.y = 0;

    floor = new createjs.Bitmap(sandImage);
    floor.y = 670;
    floor.alpha = 0.5;

    //platforms
    for(var i = 0; i < 5; i++)
    {
        switch(Math.floor(Math.random() * 5)){
            case 0: platforms[i] = new createjs.Bitmap(coralImage); break;
            case 1: platforms[i] = new createjs.Bitmap(coralblueImage); break;
            case 2: platforms[i] = new createjs.Bitmap(coralyellowImage); break;
            case 3: platforms[i] = new createjs.Bitmap(coralredImage); break;
            default: platforms[i] = new createjs.Bitmap(coralgreenImage); break;
        }
    }

    //set location of platforms
    platforms[0].x = 490; platforms[0].y = 345;
    platforms[1].x = -138; platforms[1].y = 122;
    platforms[2].x = 1118; platforms[2].y = 122;
    platforms[3].x = -138; platforms[3].y = 487;
    platforms[4].x = 1118; platforms[4].y = 487;

    //oxygen bar
    oxygenLabel = new createjs.Text("Oxygen: ", "bold 25px Arial", "#434343");
    oxygenLabel.x = 20; oxygenLabel.y = 685;
    oxygenBarBack = new createjs.Shape(g4);
    oxygenBarBack.x = 130; oxygenBarBack.y = 685;
    oxygenBar = new createjs.Shape(g5);    
    oxygenBar.x = 130; oxygenBar.y = 685;
    oxygenCommand = oxygenBar.graphics.drawRect(0, 0, 400, 25).command;

    //drowning bar
    drowningBar = new createjs.Shape(g7);
    drowningBar.x = 130; drowningBar.y = 685;
    drowningCommand = drowningBar.graphics.drawRect(0, 0, 0, 25).command;
    drowningBar.alpha = 0.5;

    //stamina bar
    staminaLabel = new createjs.Text("Stamina: ", "bold 25px Arial", "#434343");
    staminaLabel.x = 835; staminaLabel.y = 685;
    staminaBarBack = new createjs.Shape(g8);
    staminaBarBack.x = 950; staminaBarBack.y = 685;
    staminaBar = new createjs.Shape(g9);
    staminaBar.x = 950; staminaBar.y = 685;
    staminaCommand = staminaBar.graphics.drawRect(0, 0, 300, 25).command;

    redScreen = new createjs.Shape(g6);
    redScreen.alpha = 0;
    
    scoreLabel = new createjs.Text("Score: " + score, "bold 25px Arial", "#434343");
    scoreLabel.x = 580; scoreLabel.y = 685;

    blackScreen = new createjs.Shape(g3);

    redarrowL = new createjs.Bitmap(redarrowImage);
    redarrowL.x = 567; redarrowL.y = 320;

    redarrowR = new createjs.Bitmap(redarrowImage);
    redarrowR.x = 693; redarrowR.y = 320;
    redarrowR.regX = redarrowR.image.width/2;
    redarrowR.scaleX *= -1;

    tank = new createjs.Bitmap(tankImage);
    tank.x = 630; tank.y = 325;

    diver = new createjs.Bitmap(diverImage);
    diverChangeX = diver.image.width/2;
    diverChangeY = diver.image.height/2;
    diver.x = 640; diver.y = 570;
    diver.regX = 20; diver.regY = 23; //set regX & refY to center (40x46)    

    fish = new createjs.Container();

    //Create text for instructions
    var instructions = new createjs.Text("Quickly! Gather Oxygen Tanks to stay alive!\nPress the ARROW KEYS to move left, right, up and down!\nPress SPACEBAR to shoot enemies!\n\nPress G to switch to GOD MODE!\n\nPress ENTER to begin!", "bold 25px Arial", "white");
    instructions.x = 640; instructions.y = 70;
    instructions.textAlign = "center";

    //Add everything to stage.
    stage.addChild(oceanbackground, floor);
    for(var i = 0; i < platforms.length; i++)
        stage.addChild(platforms[i]);
    stage.addChild(oxygenLabel, oxygenBarBack, oxygenBar, drowningBar, staminaLabel, staminaBarBack, staminaBar, redScreen, scoreLabel, blackScreen, redarrowL, redarrowR, tank, diver, fish, instructions);
    stage.update();

    //Pause game to read instructions
    pause();

    /*--------------------\
    | Remove Instructions |
    \--------------------*/
    isInstructions = 0;
    //stage.removeChild(instructions);
    createjs.Tween.get(instructions).to({alpha: 0}, 500);
    createjs.Tween.get(blackScreen).to({alpha: 0}, 500);
    createjs.Tween.get(redarrowL).to({alpha: 0}, 500);
    createjs.Tween.get(redarrowR).to({alpha: 0}, 500);

    pausedLabel = new createjs.Text("PAUSED", "bold 70px Arial", "white");
    pausedLabel.x = 640; pausedLabel.y = 120;
    pausedLabel.textAlign = "center";
    pausedLabel.visible = false;
    stage.addChild(pausedLabel);
}

function set_controls()
{
    document.onkeyup = handleKeyUp.bind(this);
    document.onkeydown = handleKeyDown.bind(this);
    document.getElementById("canvas").onkeydown = handleKeyDown;
}

function game_start()
{
    //set ticker
    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", game_step);

    //start background music
    createjs.Sound.play("albatross", "none", 0, 0, -1, 0.3, 0, null, null);
}

/*
This function checks to see if the diver is colliding with a fish. If the diver is colliding with a fish
then the oxygen is dropped, and fish is removed.
fishI: This is the index of the fish sprite as it is contained in the mother "fish" container.
return: The function returns true if the fish is colliding with the diver. False otherwise.
*/
function checkFishCollision(fishI)
{
 	
  	if(diver.x + 23 > fish.children[fishI].x && diver.x < fish.children[fishI].x + 63 &&
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

        //sound effects
        //  Diver gets hit
        createjs.Sound.play("crash");
        //  Fish dies
        switch(Math.floor(Math.random() * 3)){
            case 0: createjs.Sound.play("blood1"); break;
            case 1: createjs.Sound.play("blood2"); break;
            default: createjs.Sound.play("blood3"); break;
        }

        return true; 
     }
 	
}
/*
This function checks to see if a bullet is colliding with a fish. If a bullet is colliding with a fish
then the bullet/fish are removed, in addition to adding to the score and incrementing the score rate.
fishI: This is the index of the fish sprite as it is contained in the mother "fish" container.
return: The function returns true if a bullet is colliding with a fish. False otherwise.
*/
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

            //play blood sound effect
            switch(Math.floor(Math.random() * 3)){
                case 0: createjs.Sound.play("blood1"); break;
                case 1: createjs.Sound.play("blood2"); break;
                default: createjs.Sound.play("blood3"); break;
            }

            return true; 
            break;
        }

    }
    return false; 

} 
/*
This function indicates if the diver is standing on a platform, and it stops him falling through 
the top of the platform, but it allows him to go through the bottom of it.
p: Is is reference to a platform.
return: True if the diver is on the playform, false otherwise.
*/
function onPlatform(p) 
{
    //On top of platform
    if (yMomentum >= 0 && pressedDown == 0 &&
        diver.y >= p.y-4 - diverChangeY && diver.y <= p.y - diverChangeY &&
        diver.x >= p.x - diverChangeX && diver.x <= p.x + PWidth + diverChangeX)
        {
            diver.y = p.y - diverChangeY;
            return true; 
        }
    else
        return false; 
}

/*
This function checks to see if the tank and diver are colliding.
If they are, it calls the moveTank() method, and plays a sound.
It also does some score logic with regards to difficulty.
*/
function checkTankCollision()
{
	if (genericCollisionMethod(tank, diver, 10, 10))
	{
		//Plays the bubble sound
		createjs.Sound.play("bubbleSound");
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

/*
This method is a generic collision method that will determine if two bitmaps are colliding.
imageWithCenterCollision: This is the image that will have to collide with the center.
imageWithCollisionAnywhere: This is the image that if anywhere touches the center of the fist arugment it will "collide".
centerOfImageOneX: This is used to determine the center of the first bitmap (X cordinate).
centerOfImageOneY: This is used to determine the center of the first bitmap (Y cordinate).
return: This method returns true if imageWithCollisionAnywhere is currently colliding with the center of imageWithCenterCollision. False otherwise.
*/
function genericCollisionMethod(imageWithCenterCollision, imageWithCollisionAnywhere, centerOfImageOneX, centerOfImageOneY)
{
	var point = imageWithCenterCollision.localToLocal(centerOfImageOneX, centerOfImageOneY, imageWithCollisionAnywhere);
	
	return (imageWithCollisionAnywhere.hitTest(point.x, point.y));
}

/*
This function moves the current location of the tank and moves it to a new one.
It also tweens them during the movement.
*/
function movesTank()
{
	//I have a list of locations that the tank could be in
	var myArray = [
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
	
	//Set the tank to the random index's location, and tween it there
    createjs.Tween.get(tank).to({x: myArray[randomIndex].x}, 200);
    createjs.Tween.get(tank).to({y: myArray[randomIndex].y}, 200);
}

/*
This function is the go to function for creating fish. 
fishSpeed: Has two values, "WALL" and "NORMAL", 
if the fish are to form a wall they must be a bit slower, 
otherwise the fish will be moving at a normal speed.
*/
function createFish(fishType)
{
    //create temporary magikarp
    var magik = new createjs.Sprite(magikarpSheet,'moveLeft');
    var dir = Math.random() * 2
    
    if(fishType == "WALL")
    {
        if(dir < 1)
            magik.addEventListener("change", swimLeftSlow);
        else
            magik.addEventListener("change", swimRightSlow);
  
        magik.scaleX = magik.scaleY = 0.75;
    }
    else // "NORMAL"
    {
        //Randomly set speed/size of fish
        var speed = Math.random() * 3;
        if(speed < 1)
        {
            if(dir < 1)
                magik.addEventListener("change", swimLeft);
            else
                magik.addEventListener("change", swimRight);
        }
        else if(speed < 2)
        {
            if(dir < 1)
                magik.addEventListener("change", swimLeftFast);
            else
                magik.addEventListener("change", swimRightFast);
            magik.scaleX = magik.scaleY = 1.5;
        }
        else
        {
            if(dir < 1)
                magik.addEventListener("change", swimLeftSlow);
            else
                magik.addEventListener("change", swimRightSlow);
            magik.scaleX = magik.scaleY = 0.75;
        }
    }

    //flip fish swimming right
    if(dir >= 1)
    {
        magik.regX = 31.5;
        magik.scaleX *= -1;
    }

    //Set position of fish
    if(dir < 1)
        magik.x = 1320;
    else    
        magik.x = -40;
    magik.y = 20 + Math.random() * 550;

    //add temp magikarp to fish container
    fish.addChild(magik);
}

/*
These functions are used to update the position of the fish each time the stage is updated.
e: The change event.
*/
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
function swimRight(e) {
    var s = e.target;
    s.x += 3;
}
function swimRightFast(e) {
    var s = e.target;
    s.x += 4;
}
function swimRightSlow(e) {
    var s = e.target;
    s.x += 2;
}

/*
This function creates the bullets. Each bullet is three circles, and are randomly assigned a color.
*/
function createBullet()
{
	//Creates shooting sound
	createjs.Sound.play("throw");

    var tridentImage = queue.getResult("trident");
    var tribullet = new createjs.Bitmap(tridentImage);
    tribullet.x = diver.x;
    tribullet.y = diver.y - 20;
    stage.addChild(tribullet);

    //determine the direction/speed of the bullet
    var bulletMovement = bulletSpeed;
    if(playerDirection == "LEFT")
    {
        bulletMovement *= -1;
        tribullet.scaleX *= -1;
    }

    //add the bullet to the array
    bullets.push({b:tribullet, m:bulletMovement});
    tribullet = null;

    //decrease stamina bar
    staminaCommand.w -= 50;
    if(staminaRecover == 0)
        isFiring = 1;
}

//THIS MIGHT BE UNNECESSARY NOW
/*
This function returns a random color to be used for the making of the bullets.
*/
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/*
This function handles all keydown events.
e: Keydown event.
*/
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
            if(isGameOver() == false) //Spelled out explicitly for readability
                pause();
            else
				resetGame();
                //document.dispatchEvent(restartGameEvent);
            break;
        
        case KEYCODE_G:
            setGodMode();
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

/*
This function handles all keyup events.
e: Keyup event.
*/
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

function setGodMode()
{
    //set godMode flag
    if(godMode == true)
    {
        godMode = false;
        fishRate = 200;
        fish.removeAllChildren();
        scoreRate = 0;

        //Bitmaps
        diver.image = queue.getResult("bigdaddy");
        oceanbackground.image = queue.getResult("oceanbackground");
    }   
    else
    {
        godMode = true;
        fishRate = 5; //maximum difficulty in God mode

        //Bitmaps
        diver.image = queue.getResult("bigdaddyGod");
        oceanbackground.image = queue.getResult("oceanbackgroundGod");
    }

    stage.update();
}

/*
This function pauses the ticker.
*/
function pause()
{
    createjs.Sound.stop("albatross");
    if (createjs.Ticker.getPaused())
    {
        createjs.Ticker.setPaused(false);
        pausedLabel.visible = false;
        stage.update();
        
        createjs.Sound.play("albatross", "none", 0, 0, -1, 0.15, 0, null, null);
    }
    else {
        createjs.Ticker.setPaused(true);
		if(isInstructions == 0)
        {
            pausedLabel.visible = true;
            stage.update();
        }
    }
}

/*
This function executes the game over sequence.
*/
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

    //sound
    createjs.Sound.stop("albatross");
    createjs.Sound.play("titanic", "none", 0, 0, -1, 0.5, 0, null, null);

    createjs.Ticker.setPaused(true);
    redScreen.alpha = 1;
}

/*
This function resets the game after the enter key is pressed folloing a game over.
*/
function resetGame()
{
    resetVariables();

    //removes all children from stage. Saves memory (I think)
    for (var i = stage.children.length - 1; i >= 0; i--)
    {
        stage.removeChild(stage.children[i]);
    };

    init();
}

/**
 * Resets global variables to restart game 
 */
function resetVariables()
{
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
    fishRate= 200;
    fishCount = 0;
    currentWall = 50000;
    wallDuration = 60;
    wallCount = 0;
    previousScore = 0;
    fish.removeAllChildren();
    playerDirection = "RIGHT";
    createjs.Ticker.setPaused(false);
}

/*
This method does the logic for the oxygenBar during the game
This method also implicitly does the drowning logic for the game.
*/
function oxygenBarLogic()
{
	if(oxygenCommand.w > 0)
        {
            oxygenCommand.w -= oxygenRate;
            drowningLogic(false); //We are not currently drowning
            score++;
		}
        else
        { 
            drowningLogic(true);
        }
}

/*
This method does the drowning logic for the game.
It will only be called from within the oxygenBarLogic method.
drowningStatus: Is true if the player currently is drowning, false otherwise.
*/
function drowningLogic (drowningStatus)
{
	if (drowningStatus == true) //Spelled out to be entirely explicit
	{
		drowningCommand.w += drowningRate;
		//Change the amount of red the screen shows (increase it)
		if(redScreen.alpha == 0) 
		{
			createjs.Tween.get(redScreen).to({alpha: 0.3}, 500);
		}
		if (isGameOver() == true) //Spelled out explicitly for readability
		{
			gameOver();
			//document.dispatchEvent(gameOverEvent);
		}
	}
	//If we were previously drowning but now currrently aren't
	else if(drowningCommand.w > 0 && drowningStatus==false) 
        {
            //drowningCommand.w -= 0.05; //drowning bar slowly drains
			//Change the amound of red the screen shows(decrease it)
			if(redScreen.alpha == 0.3) 
			{
				createjs.Tween.get(redScreen).to({alpha: 0}, 500);
				createjs.Ticker.setFPS(60); 
			}
        }
}

/*
This method was an attempt to simplify the logic that revolved around checking if the game was done or not.
*/
function isGameOver()
{
	if(drowningCommand.w >= 400)
	{
		return true;
	}
	else
	{
		return false;
	}
}

function powerUpLogic()
{	
	var itemsToRemove=[];
	if (powerUpArray.length>0)
	{
		//Loop through and move all powerups down (gravity)
		for (var myVariable = 0; myVariable < powerUpArray.length; myVariable++)
		{
			powerUpArray[myVariable].y += 3;
			
			//If they are below the sea floor remove them
			if (powerUpArray[myVariable].y > 670)
			{
				itemsToRemove.push(myVariable);
			}
		}
	}
		
	//Remove all of the shapes that need to be removed.
	removeFromPowerupArray(itemsToRemove);
	
	//Every 10k points I want to add a powerup.
	if (score - previousScore > 1000 && powerUpArray.length <= 3)
	{
		previousScore = score;
		//Now going to generate a "power up"
		createPowerUp();
	}
}

function removeFromPowerupArray(arrayOfIndexesToRemove)
{
	if (arrayOfIndexesToRemove.length>0) 
	{
		//This will remove all of the items from the passed array.
		for (var i=0; i<arrayOfIndexesToRemove.length; i++)
		{
			var variable=arrayOfIndexesToRemove.pop();
			stage.removeChild(powerUpArray[variable]);
			powerUpArray.splice(variable, 1); //Just removing the one value on this iteration
		}
	}
}

function powerUpCollisions()
{
	var itemsToRemove=[];
	
	for (var i=0; i< powerUpArray.length; i++)
	{
		if (genericCollisionMethod(powerUpArray[i], diver, 20, 20))
		{
			//This is pushing to the array that will remove the powerup
			itemsToRemove.push(i);
			
			if (powerUpArray[i].type == "Oxygen") 
			{
				if (oxygenCommand.w < 300) //If there is more than 100 health gone
				{
					oxygenCommand.w += 100;
				}
				else //refill oxygen
				{
					oxygenCommand.w = 400;
				}

                createjs.Sound.play("pop");
			}
			else if (powerUpArray[i].type == "Drowning")
			{
				if (drowningCommand.w > 200) //If there's more than 200 drowning
				{
					drowningCommand.w -= 200;
				}
				else //Remove it all
				{
					drowningCommand.w = 0;
				}

                createjs.Sound.play("repaired");
			}
			else //Do the clearing of enemies.
			{
				//Flag
				//Might tween this.

                //don't need to remove if there are no fish
                if(fish.children.length > 0)
                {
                    //Increase score
                    for(var i = 0; i < fish.children.length && i < 10; i++)
                    {
                        //Treated similar to normal fish deaths.
                        score += (500 + scoreRate/2);
                    }

                    fish.removeAllChildren();
                }
				    
                //play bomb sound
                createjs.Sound.play("shotSound");
			}
		}
	}
	
	removeFromPowerupArray(itemsToRemove);
}

function createPowerUp()
{
	//Randomly picking a powerup to display.
	
	//I get a random number between 0-6
	var i = (Math.random() * 6);
	
	/*
	    50% - Increase oxygen in the tank (Bubble)
	    25% - Reduce drowning rate (Repair)
	    25% - Clear enemies (Bomb)
	*/
	
	//Going to dynamically inject a property and then have it accessed when the collision happens
	var shape;
	
	if (i <= 3)
	{
        shape = new createjs.Bitmap(queue.getResult("bubble"));
		shape.type = "Oxygen";		
	}
			
	else if(i > 3 && i <= 4.5)
	{
        shape = new createjs.Bitmap(queue.getResult("repair"));
		shape.type = "Drowning";
	}
	else //Between 4.6 and 6
	{
        shape = new createjs.Bitmap(queue.getResult("bomb"));
		shape.type = "Enemies";
    }
	
	powerUpArray.push(shape);
	stage.addChild(shape);
		
	//Setting a random X value betwseen 0 and 1270
	shape.x = Math.round(Math.random() * 1270);
	
}