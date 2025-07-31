const express = require("express");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app); 
const io = socket(server);

const chess = new Chess();
let players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" }); 
});

io.on("connection", function (socket) {         //This uniquesocket is the unique information about the new player
  console.log("Connected");                     //Socket io needs to be setup on both frontend and backend

  if (!players.white) {
    players.white = socket.id; //every uniquesocket has a unique id.
    socket.emit("playerRole", "w"); //emit to the new player only.
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectatorRole");
  }

  socket.on("disconnect", function () {
    if (socket.id == players.black) {
      delete players.black;
    } else if (socket.id == players.white) {
      delete players.white;
    }
  });

  socket.on("move", (move) => {
    //Try and catch to check valid moves
    try {
      if (chess.turn() === "w" && socket.id != players.white) return;
      if (chess.turn() === "b" && socket.id != players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.log("Invalid Move: ", move);
        socket.emit("invalidMove", move);
      }
    } catch (err) {
      console.log(err);
      socket.emit("invalidMove", move);             //only sent to user who made the wrong move
    }
  });
});

server.listen(3000, function () {
  console.log("listening on 3000");
});
