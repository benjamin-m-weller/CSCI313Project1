
/*
DOCUMENTATION

*/

var queue; // LoadQueue
var stage; // Stage

//KEYS
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

var diver, tank, oceanbackground, floor, platform1;
var diverChangeX, diverChangeY;

const P1X=250, P1Y=300, P1Width=300;

var pB; // pause button
var pausedLabel;
var isInstructions = 1;
var oxygen; // oxygen bar

function load()
{
    queue = new createjs.LoadQueue(false);
    queue.addEventListener( "complete", init );
    queue.loadManifest([{id:"bigdaddy",src:"bigdaddy.png"},{id:"tank",src:"tank.png"},
        {id:"oceanbackground",src:"oceanbackground.png"}]);

    document.onkeyup = handleKeyUp.bind(this);
    document.onkeydown = handleKeyDown.bind(this);
    document.getElementById("canvas").onkeydown = handleKeyDown;

    pB = document.getElementById("pauseBtn");
    oxygen = document.getElementById("oxygen");
}

function init()
{
    stage = new createjs.Stage("canvas");

    var diverImage = queue.getResult("bigdaddy");
    var tankImage = queue.getResult("tank");
    var oceanImage = queue.getResult("oceanbackground");

    //floor rectangle
    var g1 = new createjs.Graphics();
    g1.beginStroke("black").beginFill("#E5CF7F").drawRect(0, 550, 800, 50);

    // platform1 rectangle
    var g2 = new createjs.Graphics();
    g2.beginStroke("black").beginFill("#7481BA").drawRect(P1X, P1Y, P1Width, 30);

    oceanbackground = new createjs.Bitmap(oceanImage);
    oceanbackground.x = 0; oceanbackground.y = 0;
    stage.addChild(oceanbackground);
    stage.update();

    floor = new createjs.Shape(g1);
    stage.addChild(floor);
    stage.update();

    platform1 = new createjs.Shape(g2);
    stage.addChild(platform1);
    stage.update();

    diver = new createjs.Bitmap(diverImage);
    diverChangeX = diver.image.width/2;
    diverChangeY = diver.image.height/2;
    diver.x = 400; diver.y = 450;
    diver.regX = 20; diver.regY = 23; //set regX & refY to center (40x46)    
    stage.addChild(diver);
    stage.update();

    tank = new createjs.Bitmap(tankImage);
    tank.x = 390; tank.y = 280;
    stage.addChild(tank);
    stage.update();

    //Create text for instructions
    var instructions = new createjs.Text("Quickly! Gather Oxygen Tanks to stay alive!\nUse the ARROW KEYS to move left, right, up and down!\n\nPress SPACEBAR to begin!", "bold 25px Arial", "white");
    instructions.x = 400; instructions.y = 70;
    instructions.textAlign = "center";
    stage.addChild(instructions);
    stage.update();
    pause();
    isInstructions = 0;
    stage.removeChild(instructions);

    pausedLabel = new createjs.Text("PAUSED", "bold 70px Arial", "white");
    pausedLabel.x = 400; pausedLabel.y = 120;
    pausedLabel.textAlign = "center";
    pausedLabel.visible = false;
    stage.addChild(pausedLabel);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", tick);
}

function tick(event) {
    if (!event.paused)
    {

        //Left and Right controls
        switch (xKeyHeld)
        {
            case "LEFT":
                diver.x -= 6;
                if (diver.x <= -38) // pacman/mario bros logic
                    diver.x = 832;
                break;
            case "RIGHT":
                diver.x += 6;
                if (diver.x >= 838)
                    diver.x = -32
                break;
        }

        //Up control
        if (yKeyHeld == "UP")
        {
            if (diver.y > 20) //Prevemts character from swimming too high out of view
                yMomentum = -10
            onGround = 0;
        }

        //GRAVITY
        if (diver.y < 545 - diverChangeY) //Prevents character from falling through the floor
        {

            if (diver.y >= P1Y-4 - diverChangeY && diver.y <= P1Y - diverChangeY &&
                diver.x >= P1X - diverChangeX && diver.x <= P1X + P1Width + diverChangeX &&
                yMomentum >= 0 && pressedDown == 0) //On top of platform1
            {
                diver.y = P1Y - diverChangeY;
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
                diver.y = 550 - diverChangeY;
                onGround = 1;
            }               
            if (yMomentum < 0)
                diver.y += yMomentum;
        }

        oxygen.value--;
        stage.update();
    }
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
            pause();
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
                xKeyHeld = "NONE";
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
                xKeyHeld = "NONE";
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
        pB.textContent="Pause Game";
        pausedLabel.visible = false;
        stage.update();
    }
    else {
        createjs.Ticker.setPaused(true);
        pB.textContent="Paused";
        if(isInstructions == 0)
        {
            pausedLabel.visible = true;
            stage.update();
        }
    }
}



