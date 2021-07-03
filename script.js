// 2048 game object
const gameApp = {};

// **************** VARIABLE NAMES ****************
gameApp.pieceId = 0; // id to track each piece on the board
gameApp.box = 0; // track the box id
gameApp.board = []; // tracks key details on the board
gameApp.boardDimension = 4; // 4 x 4 game board
gameApp.value = 2; // initial value for each piece
gameApp.isGameOver = false; // tracks whether the game is over or not
gameApp.stacked = {}; // tracks whether a piece moved onto another piece in the existing swipe
gameApp.animationQueue = []; // tracks animations que to be processed after board movements are updated
gameApp.keypress = null; // track user key press
gameApp.targetRow = null; // track target row to move a piece to
gameApp.targetColumn = null; // track target column to move a piece to
gameApp.totalScore = 0; // track target column to move a piece to

// Mobile gestures variables
gameApp.isSwiping = false; // Tracks whether the user is swiping or not
gameApp.swipeStart = {}; // Tracks the starting coordinates of the swipe
gameApp.swipeEnd = {}; // Tracks the ending coordinates of the swipe

// **************** JQUERY HANDLES ****************
gameApp.$gameBoard = $(".game-board");
gameApp.$instructionsContainer = $(".instructions-container");
gameApp.$gameOverContainer = $(".game-over-container");

// **************** FUNCTIONS ****************

// Start a new game or reset the old game
gameApp.startNewGame = () => {
  // Remove any left over pieces from the previous game
  $(".piece").remove();

  // Reset all global variables if a new game begins - to clear out old values
  gameApp.pieceId = 0; // id to track each piece on the board
  gameApp.box = 0; // track the box id
  gameApp.board = []; // tracks key details on the board
  gameApp.boardDimension = 4; // 4 x 4 game board
  gameApp.value = 2; // initial value for each piece
  gameApp.isGameOver = false; // tracks whether the game is over or not
  gameApp.stacked = {}; // tracks whether a piece moved onto another piece in the existing swipe
  gameApp.animationQueue = []; // tracks animations que to be processed after board movements are updated
  gameApp.keypress = null; // track user key press
  gameApp.targetRow = null; // track target row to move a piece to
  gameApp.targetColumn = null; // track target column to move a piece to
  gameApp.totalScore = 0; // track target column to move a piece to

  // Create an empty board and start a new game with new pieces
  gameApp.setScore();
  gameApp.createEmptyBoard();
  gameApp.createPiece();
  gameApp.createPiece();
};

// Create an empty board
gameApp.createEmptyBoard = () => {
  let box = 0; // box counter

  for (row = 0; row < gameApp.boardDimension; row++) {
    let boardRow = [];

    for (column = 0; column < gameApp.boardDimension; column++) {
      boardRow.push({
        boxId: gameApp.box++,
        isOccupied: false,
        row: row,
        column: column,
        pieceId: null,
        value: null,
      });
    }
    gameApp.board.push(boardRow);
  }
};

// Extracts the boxes on the game board with empty pieces
gameApp.getEmptyBoxes = () => {
  let emptyBoxes = [];

  gameApp.board.forEach((row, rowIndex) => {
    row.forEach((box, columnIndex) => {
      if (box.isOccupied === false) {
        emptyBoxes.push({ row: rowIndex, column: columnIndex });
      }
    });
  });

  return emptyBoxes;
};

gameApp.createPiece = () => {
  // extract all the empty boxes and randomly select one
  let emptyBoxes = gameApp.getEmptyBoxes();
  let randomBox = Math.floor(Math.random() * emptyBoxes.length);

  // Create a new piece only if there are empty boxes that can hold a new piece
  if (emptyBoxes.length > 0) {
    // Place the piece on the board and update the board array
    let row = emptyBoxes[randomBox].row;
    let column = emptyBoxes[randomBox].column;
    let position = $(`.row-${row} .col-${column}`).position();

    let newPiece = `<div id=piece-${gameApp.pieceId} class="box piece create-piece">${gameApp.value}</div>`;

    gameApp.$gameBoard.append(newPiece);
    $(`#piece-${gameApp.pieceId}`).css(position);

    gameApp.board[row][column] = {
      ...gameApp.board[row][column],
      isOccupied: true,
      pieceId: gameApp.pieceId,
      value: gameApp.value,
    };

    gameApp.pieceId++;
  }
};

gameApp.rightPressed = () => {
  let start = 0;
  let end = gameApp.boardDimension - 1;

  for (row = start; row <= end; row++) {
    gameApp.targetRow = row;
    gameApp.targetColumn = end;

    for (column = end; column >= start; column--) {
      let current = gameApp.board[row][column];
      let target = gameApp.board[gameApp.targetRow][gameApp.targetColumn];

      // Go through the movements / motions if there is an actual piece on the box being checked
      if (current.isOccupied === true) {
        // return value dictates which scenario you are in and how the target location should be updated
        let step = gameApp.navigateBoard(current, target);

        // update target
        (step === 2 || step === 3) && gameApp.targetColumn--;

        // retry with the same box if the box is behind the target
        step === 3 && current.column < target.column && column++;
      }
    }
  }
};

gameApp.leftPressed = () => {
  let start = 0;
  let end = gameApp.boardDimension - 1;

  for (row = start; row <= end; row++) {
    gameApp.targetRow = row;
    gameApp.targetColumn = start;

    for (column = start; column <= end; column++) {
      let current = gameApp.board[row][column];
      let target = gameApp.board[gameApp.targetRow][gameApp.targetColumn];

      // Go through the movements / motions if there is an actual piece on the box being checked
      if (current.isOccupied === true) {
        // return value dictates which scenario you are in and how the target location should be updated
        let step = gameApp.navigateBoard(current, target);

        // update target
        (step === 2 || step === 3) && gameApp.targetColumn++;

        // retry with the same box if the box is behind the target
        step === 3 && current.column > target.column && column--;
      }
    }
  }
};

gameApp.upPressed = () => {
  let start = 0;
  let end = gameApp.boardDimension - 1;

  for (column = start; column <= end; column++) {
    gameApp.targetRow = start;
    gameApp.targetColumn = column;

    for (row = start; row <= end; row++) {
      let current = gameApp.board[row][column];
      let target = gameApp.board[gameApp.targetRow][gameApp.targetColumn];

      // Go through the movements / motions if there is an actual piece on the box being checked
      if (current.isOccupied === true) {
        // return value dictates which scenario you are in and how the target location should be updated
        let step = gameApp.navigateBoard(current, target);

        // update target
        (step === 2 || step === 3) && gameApp.targetRow++;

        // retry with the same box if the box is behind the target
        step === 3 && current.row > target.row && row--;
      }
    }
  }
};

gameApp.downPressed = () => {
  let start = 0;
  let end = gameApp.boardDimension - 1;

  for (column = end; column >= start; column--) {
    gameApp.targetRow = end;
    gameApp.targetColumn = column;

    for (row = end; row >= start; row--) {
      let current = gameApp.board[row][column];
      let target = gameApp.board[gameApp.targetRow][gameApp.targetColumn];

      // Go through the movements / motions if there is an actual piece on the box being checked
      if (current.isOccupied === true) {
        // return value dictates which scenario you are in and how the target location should be updated
        let step = gameApp.navigateBoard(current, target);

        // update target
        (step === 2 || step === 3) && gameApp.targetRow--;

        // retry with the same box if the box is behind the target
        step === 3 && current.row < target.row && row++;
      }
    }
  }
};

// REVIEW BOARD
gameApp.navigateBoard = (current, target) => {
  // piece is is not at the target
  if (current.row !== target.row || current.column !== target.column) {
    // no piece exists at the target
    if (
      target.isOccupied === false // target is not occupied
    ) {
      // update animation queue
      gameApp.animationQueue.push({
        id: current.pieceId,
        toRow: target.row,
        toColumn: target.column,
        value: current.value,
      });

      // update board
      gameApp.updateBoard(
        current.row,
        current.column,
        target.row,
        target.column
      );

      return 1;
    }

    // another piece exist at target + its value is same + its not stacked
    else if (
      target.isOccupied === true && // target has a piece there
      current.value === target.value && // value of the target is the same as the current piece
      gameApp.stacked[`${target.row}_${target.column}`] !== true // target has not been stacked yet by another piece
    ) {
      // update animation queue
      gameApp.animationQueue.push({
        id: current.pieceId,
        targetId: target.pieceId,
        toRow: target.row,
        toColumn: target.column,
        value: current.value + target.value,
        targetIsOccupied: true,
      });

      // update board
      gameApp.updateBoard(
        current.row,
        current.column,
        target.row,
        target.column
      );

      // update and set total score on the board
      gameApp.updateScore(current.value, target.value);
      gameApp.setScore();

      // update stacked object to indicate these pieces are stacked during this round
      gameApp.stacked = {
        ...gameApp.stacked,
        [`${target.row}_${target.column}`]: true,
      };

      return 2;
    }

    // Piece exists at target + value is different
    else if (
      target.isOccupied === true && // target has a piece
      current.value !== target.value // value of the target is different
    ) {
      return 3;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
};

// update the board array to track the movement of pieces
gameApp.updateBoard = (row, column, targetRow, targetColumn) => {
  let currentObject = gameApp.board[row][column];
  let targetObject = gameApp.board[targetRow][targetColumn];

  let value = targetObject.isOccupied
    ? currentObject.value + targetObject.value
    : currentObject.value;

  // update target details on the board
  gameApp.board[targetRow][targetColumn] = {
    ...gameApp.board[targetRow][targetColumn],
    isOccupied: true,
    pieceId: currentObject.pieceId,
    value: value,
  };

  // reset current location on the board
  gameApp.board[row][column] = {
    ...gameApp.board[row][column],
    isOccupied: false,
    pieceId: null,
    value: null,
  };
};

// Animates the movement of pieces on the game board
gameApp.movePiece = ({
  id,
  targetId,
  toRow,
  toColumn,
  value,
  targetIsOccupied,
}) => {
  // animate movement to the target
  let targetPosition = $(
    `.row-${gameApp.board[toRow][toColumn].row}.col-${gameApp.board[toRow][toColumn].column}`
  ).position();

  let $piece = $(`#piece-${id}`);
  $piece.animate(targetPosition, {
    duration: 200,
  });

  // remove old element if it exists
  targetIsOccupied && setTimeout(() => $(`#piece-${targetId}`).remove(), 200);

  // update text
  setTimeout(() => $piece.text(value), 200);
};

// Assess if the game is over
gameApp.checkGameOver = () => {
  gameApp.isGameOver = true;

  let emptyBoxes = gameApp.getEmptyBoxes();

  // check if there are any empty spaces
  if (emptyBoxes.length === 0) {
    // review the board to assess if identical adjacent pieces exist
    for (row = 0; row < gameApp.boardDimension; row++) {
      for (column = 0; column < gameApp.boardDimension; column++) {
        if (
          // check if it equals to the cell right below
          (column !== gameApp.boardDimension - 1 && // not at the edge
            gameApp.board[row][column].value ===
              gameApp.board[row][column + 1].value) || // equals to cell immediately below
          // check if it equals to the adjacent cell
          (row !== gameApp.boardDimension - 1 && // not at the edge
            gameApp.board[row][column].value ===
              gameApp.board[row + 1][column].value) // equals to adjacent cell
        ) {
          // game isn't over
          gameApp.isGameOver = false;
          break;
        }
      }

      if (gameApp.isGameOver === false) {
        break;
      }
    }
  } else {
    gameApp.isGameOver = false;
  }
};

// Function to get and update the current score on the board
gameApp.updateScore = (currentValue, targetValue) => {
  gameApp.totalScore += currentValue + targetValue;
};

gameApp.setScore = () => {
  $(".score-current").text(gameApp.totalScore);
};

// ******************* MOBILE GESTURE FUNCTIONS *************************
// Tracks the starting coordinates for user swipe
gameApp.touchStart = (event) => {
  gameApp.isSwiping = true;
  gameApp.swipeStart.pageX = event.originalEvent.targetTouches[0].pageX;
  gameApp.swipeStart.pageY = event.originalEvent.targetTouches[0].pageY;

  event.preventDefault();
};

// Tracks the ending coordinates for user swipe
gameApp.touchMove = (event) => {
  if (gameApp.isSwiping) {
    gameApp.swipeEnd.pageX = event.originalEvent.targetTouches[0].pageX;
    gameApp.swipeEnd.pageY = event.originalEvent.targetTouches[0].pageY;
  }
};

// Determine the direction of the user's swipe action
gameApp.getDirection = () => {
  const changePageX = gameApp.swipeEnd.pageX - gameApp.swipeStart.pageX;
  const changePageY = gameApp.swipeEnd.pageY - gameApp.swipeStart.pageY;

  let direction = null;

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

// Determine when the user's swipe has ended
gameApp.touchEnd = () => {
  gameApp.isSwiping = false;

  // Determine the direction of the user
  const direction = gameApp.getDirection();
  gameApp.swipeStart = {};
  gameApp.swipeEnd = {};

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
  } else {
    gameApp.removeDisplayGameOver();
  }
};

// Function to show the game is over to the user
gameApp.displayGameOver = () => {
  $(".game-over-score").text(`Score: ${gameApp.totalScore}`);
  gameApp.$gameOverContainer.removeClass("hide-container");
};

// Function to remove game is over from the screen
gameApp.removeDisplayGameOver = () => {
  gameApp.$gameOverContainer.addClass("hide-container");
};

// Function to show the game instructions to the user
gameApp.displayInstructions = () => {
  gameApp.$instructionsContainer.removeClass("hide-container");
};

// Function to hide the game instructions
gameApp.removeDisplayInstructions = () => {
  gameApp.$instructionsContainer.addClass("hide-container");
};

// **************** INIT FUNCTION ****************

// initialize app
gameApp.init = () => {
  // Start a new game
  gameApp.startNewGame();

  // event listner to recognize a user's key press
  // REFACTOR WITH MOBILE SWIPES
  $("body").on("keydown", (e) => {
    // extract user's key press
    gameApp.keypress = parseInt(e.which);

    // prevent user from scrolling the page with arrow keys when the game is played
    if (
      gameApp.keypress === 37 ||
      gameApp.keypress === 38 ||
      gameApp.keypress === 39 ||
      gameApp.keypress === 40
    ) {
      e.preventDefault();
    }

    // respond to keydown press if game is not over
    if (gameApp.isGameOver === false) {
      // right key press
      gameApp.keypress === 39 && gameApp.rightPressed();

      // left key press
      gameApp.keypress === 37 && gameApp.leftPressed();

      // up key press
      gameApp.keypress === 38 && gameApp.upPressed();

      // down key press
      gameApp.keypress === 40 && gameApp.downPressed();
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
    } else {
      gameApp.removeDisplayGameOver();
    }
  });

  // Mobile swipe event listeners
  $(".game-board").on("touchstart", gameApp.touchStart);
  $(".game-board").on("touchmove", gameApp.touchMove);
  $(".game-board").on("touchend", gameApp.touchEnd);

  // Start new game when the button is selected
  $(".new-game-btn").on("click", () => {
    gameApp.startNewGame();
  });

  // Listens to user clicking the reset button to restart the game once its over
  $(".game-over-btn").on("click", () => {
    gameApp.removeDisplayGameOver();
    gameApp.startNewGame();
  });

  // Show instructions to the user
  $(".instructions-btn").on("click", () => {
    gameApp.displayInstructions();
  });

  // Show instructions to the user
  $(".close-instructions-btn").on("click", () => {
    gameApp.removeDisplayInstructions();
  });
};

// **************** DOCUMENT READY ****************
$(() => {
  gameApp.init();
});
