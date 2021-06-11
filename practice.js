let swiping = false;
let start = {};
let end = {};

const touchStart = (event) => {
  swiping = true;
  start.pageX = event.targetTouches[0].pageX;
  start.pageY = event.targetTouches[0].pageY;
};

const touchMove = (event) => {
  if (swiping) {
    end.pageX = event.targetTouches[0].pageX;
    end.pageY = event.targetTouches[0].pageY;
  }
};

const getDirection = () => {
  const changePageX = end.pageX - start.pageX;
  const changePageY = end.pageY - start.pageY;

  let direction = null;

  console.log(Number.isNaN(changePageX));

  if (
    Number.isNaN(changePageX) === false ||
    Number.isNaN(changePageY) === false
  ) {
    if (Math.abs(changePageX) > Math.abs(changePageY)) {
      changePageX > 0 ? (direction = "right") : (direction = "left");
    } else {
      changePageY > 0 ? (direction = "down") : (direction = "up");
    }
  }

  return direction;
};

const touchEnd = (event) => {
  swiping = false;

  // Determine the direction of the user
  const direction = getDirection();
  start = {};
  end = {};

  // respond to keydown press if game is not over
  if (gameApp.isGameOver === false) {
    // right key press
    direction === "right" && gameApp.rightPressed();

    // left key press
    direction === "left" && gameApp.leftPressed();

    // up key press
    direction === "up" && gameApp.upPressed();

    // down key press
    direction === "down" && gameApp.downPressed();
  }

  // move pieces on the board
  gameApp.animationQueue.forEach((item) => {
    gameApp.movePiece(item);
  });

  // create a new piece if atleast one another piece has moved
  if (gameApp.animationQueue.length > 0) {
    setTimeout(gameApp.createPiece, 400);
  }

  // reset variables
  gameApp.stacked = {}; // empty stack
  gameApp.animationQueue = []; // empty animation que

  // check if game is over
  gameApp.checkGameOver();

  if (gameApp.isGameOver === true) {
    gameApp.displayGameOver();
  }
};

$(".game-board").on("touchstart", touchStart);
$(".game-board").on("touchmove", touchMove);
$(".game-board").on("touchend", touchEnd);
