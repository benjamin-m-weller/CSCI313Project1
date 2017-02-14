/*
Link I'm currently using for the snorkeling kid picture: http://www.123rf.com/photo_19336608_vector-illustration-of-snorkeling-kid.html
Link I'm currently using for the oxygen picture: https://www.google.com/url?sa=i&rct=j&q=&esrc=s&source=images&cd=&cad=rja&uact=8&ved=0ahUKEwj_8K7Uu47SAhWs6oMKHX3fCc4QjRwIBw&url=https%3A%2F%2Fcommons.wikimedia.org%2Fwiki%2FFile%3AOxygen_symbol.svg&psig=AFQjCNGQS-3h2kHnBRBvwdGdKnOR_rRBFQ&ust=1487123145069711
*/

/*
I'm trying to make the game be keyboard controlled.
Touching the left arrow should move the scuba to the left by 10 pixels.
Touching the right arrow should move the scuba to the right by 10 pixels.
*/

const var ARROW_KEY_LEFT=37;
const var ARROW_KEY_RIGHT=39;

var stage;
var preloadQueue;
var bitMapSnorkel;
var bitMapOxygen;



function init()
{
	//Creating the stage
	stage = new createjs.Stage("canvas");
	
	//I'm going to do some things with preloadjs
	preloadQueue=new createjs.LoadQueue(false);
	
	//Now going to add the event listener for the load queue completion.
	preloadQueue.addEventListener("complete", onComplete);
	preloadQueue.loadManifest([{id: "snorkel", src: "snorkel.jpg"}, 
	{id:"oxygen", src: "oxygen.png"}]);
	
	//Apparently writing this code broke something???
	//Going to create a ticker for the left and right movement.
	createjs.Ticker.addEventListener("tick" movementFunction);
	createjs.Ticker.setFPS(30);
}

function onComplete()
{
	//I should branch out further now and add the assets to the page.
	var preBitmapSnorkel=preloadQueue.getResult("snorkel");
	var preBitmapOxygen=preloadQueue.getResult("oxygen");
	
	//Now going to make the bitmaps	
	bitMapSnorkel=new createjs.Bitmap(preBitmapSnorkel);
	bitMapOxygen=new createjs.Bitmap(preBitmapOxygen);
	
	stage.addChild(bitMapSnorkel);
	
	stage.update();
	
}


//Apparently writing this code broke something???
function movementFunction(e)
{
	/*
	Should first check to see if the scuba is colliding with one of the platforms.
	If he's not I would like we would tween down the scuba by say ~250 pixels per second
	If the scuba is in constact with a platform just let him be.
	*/
	
	/*
	My below code is here to listen for the keyboard events
	*/
	
	window.addEventListener("keydown", function(e))
	{
		//Here is my code for moving the scuba left and right
		switch (e.keyCode)
		{
			case ARROW_KEY_LEFT:
				bitMapSnorkel.x--;
				break;
			case ARROW_KEY_RIGHT:
				bitMapSnorkel.x++;
				break;
		}
	})
	
	stage.update();
}









