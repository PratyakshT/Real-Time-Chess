const socket = io(); //This will automatically send a request to backend to line io.on in app.js

// socket.emit("churan")                   //The event churan is sent from frontend to backend. This event is received by io.on in app.js

// socket.on("churan chaat", function(){   //run the function when churan chaat is received
//     console.log("tasty");
// });

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {       //core UI logic
  const board = chess.board();
  boardElement.innerHTML = ""; //this brings the board to original position/ clears the board
  board.forEach((row, rowindex) => {
    row.forEach((square, squareindex) => {
      const squareElement = document.createElement("div");
      squareElement.classList.add("square",(rowindex + squareindex) % 2 === 0 ? "light" : "dark");

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = squareindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");

        pieceElement.innerText = getPieceUnicode(square);   //Sets the Unicode symbol
        pieceElement.draggable = playerRole === square.color;   //makes the piec draggable only if it's your turn

        pieceElement.addEventListener("dragstart", (e) => {
          if (pieceElement.draggable) {
            draggedPiece = pieceElement;
            sourceSquare = { row: rowindex, col: squareindex };
            e.dataTransfer.setData("text/plain", "");
          }
        });
        pieceElement.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });
        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover", function (e) {
        e.preventDefault();
      });

      squareElement.addEventListener("drop", function (e) {
        e.preventDefault();
        if (draggedPiece) {
          const targetSource = {
            row: parseInt(squareElement.dataset.row),
            col: parseInt(squareElement.dataset.col),
          };

          handleMove(sourceSquare, targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
    unicodePieces.classList.add("piece");
  } 
  else {
    boardElement.classList.remove("flipped");
    unicodePieces.classList.remove("piece");
  }
};

const handleMove = (source, target) => {
  const move = {
    from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
    to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
  const unicodePieces = {
    K: "♔", // King
    Q: "♕", // Queen
    R: "♖", // Rook
    B: "♗", // Bishop
    N: "♘", // Knight
    P: "♟", // Pawn
    k: "♚", // King
    q: "♛", // Queen
    r: "♜", // Rook
    b: "♝", // Bishop
    n: "♞", // Knight
    p: "♟", // Pawn
    p: "♙"
  };
  return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function (role) {     //throgh socket.on, we can listen for events from a client
  playerRole = role;
  renderBoard();
});

socket.on("spectatortRole", function () {
  playerRole = null;
  renderBoard();
});

socket.on("boardState", function (fen) {
  chess.load(fen);
  renderBoard();
});

socket.on("move", function (move) {
  chess.move(move);
  renderBoard();
});

renderBoard();
