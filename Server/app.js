const express = require("express");
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const unirest = require("unirest");
const axios = require("axios");

const fs = require("fs");
const path = require("path");
const http = require("http");

const pool = require("./server.js");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const store = new session.MemoryStore();

app.use(cookieParser("secretStringForCookies"));
app.use(
  session({
    secret: "secretStringForSession",
    // cookie: { maxAge: 60000 },
    resave: true,
    saveUninitialized: false,
    store: store,
  })
);
app.use(flash());

app.use(cors()); //send data between front and backend
app.use(express.json()); // to get access to data being sent through url eg name,password sent using http requests by java script
app.use(express.urlencoded({ extended: false })); //to get data being sent through url eg name,password sent through html forms

app.use(express.static(path.resolve("./public")));

app.set("view engine", "ejs");

//to routes

const home = require("./routes/home");
app.use("/", home);

const login = require("./routes/login");
app.use("/login", login);

const register = require("./routes/register");
app.use("/register", register);

const appointments = require("./routes/appointments");
app.use("/appointments", appointments);

const admin = require("./routes/admin");
app.use("/admin", admin);

//// chats

const server = http.createServer(app);

const socketio = require("socket.io");
const { log } = require("console");
const io = socketio(server);

let room = "";
let user = "";
let userId = "";
let accountType = "";

app.get("/chats/chat-rooms", (req, res) => {
  let rooms = [];

  const getChatRooms = new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      let query = "";
      if (req.session.accountType == "patient") {
        query = "SELECT * FROM chat_rooms WHERE patient_id = ?";
      } else {
        query = "SELECT * FROM chat_rooms WHERE doctor_id = ?";
      }

      connection.query(query, [req.session.userId], (err, results) => {
        if (err) throw err;
        if (results.length) {
          results.forEach((result, index) => {
            rooms.push(result);
            if (index == results.length - 1) {
              console.log(rooms);
              resolve(rooms);
            }
          });
        } else {
          resolve(rooms);
        }
      });

      connection.release();
    });
  });

  getChatRooms.then((rooms) => {
    const getNames = new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) throw err;
        if (rooms.length) {
          for (let i = 0; i < rooms.length; i++) {
            let query2 = "";
            let userId = "";
            if (req.session.accountType == "patient") {
              query2 = "SELECT name FROM doctor_details WHERE user_id = ?";
              userId = rooms[i].doctor_id;
            } else {
              query2 = "SELECT name FROM patient_details WHERE user_id = ?";
              userId = rooms[i].patient_id;
            }
            connection.query(query2, [userId], (err, results) => {
              if (err) throw err;
              console.log(results);
              rooms[i].name = results[0].name;

              const query3 = "SELECT * FROM chats WHERE room_id = ?";
              connection.query(query3,[rooms[i].room_id],(err,messages)=>{     ////// get last message in the chat room   /// and sender name
                if(err) throw err;
                if(messages.length){
                  rooms[i].message = messages[messages.length-1].message;
                  rooms[i].date = messages[messages.length-1].date;
                  rooms[i].time = messages[messages.length-1].time;
                  if((messages[messages.length-1].sender_id) == req.session.userId){
                    rooms[i].sender = "You";
                  }else{
                    rooms[i].sender = results[0].name;
                  }
                }else{
                  rooms[i].message = "";
                }
                if (i == rooms.length - 1) {
                resolve(rooms);
              }
              })
            });
          }
        } else {
          resolve(rooms);
        }
      });
    });

    getNames.then((rooms) => {
      console.log(req.session);
      res.render("chat-rooms", { rooms: rooms });
    });
  });
});

app.post("/chats/chat-rooms", (req, res) => {
  req.session.roomId = req.body.room_id;
  res.redirect("/chats/chat");
});

app.get("/chats/chat", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) throw err;
    let query = "";
    if (req.session.accountType == "patient") {
      query = "SELECT name FROM patient_details WHERE user_id = ?";
    } else {
      query = "SELECT name FROM doctor_details WHERE user_id = ?";
    }
    connection.query(query, [req.session.userId], (err, result) => {
      if (err) throw err;
      user = result[0].name;
      userId = req.session.userId;
      room = req.session.roomId;
      accountType = req.session.accountType;

      console.log(req.session);

      res.render("chat");
    });

    connection.release();
  });
});

io.on("connection", (socket) => {
  let date = "";

  let d = new Date();
  let date2 =
    ("0" + d.getDate()).slice(-2) +
    "-" +
    ("0" + (d.getMonth() + 1)).slice(-2) +
    "-" +
    d.getFullYear();

  console.log(`${user} joined the chart`);
  socket.emit("message", `${user} connected on Socket ${socket.id}`);
  socket.emit("message", `welcome to the chart ${user}`); // to the client

  socket.join(room);

  socket.broadcast.to(room).emit("message", `${user} joined the chart`); // all clients but user
  // io.emit(); //all clients

  pool.getConnection((err, connection) => {
    if (err) throw err;
    const query = "SELECT * FROM chats WHERE room_id = ?";
    connection.query(query, [room], (err, results) => {
      if (err) throw err;
      if (results.length) {
        results.forEach((message) => {

          let query2 = "";
          if (accountType == "patient") {
            query2 = "SELECT name FROM doctor_details WHERE user_id = ?";
          } else {
            query2 = "SELECT name FROM patient_details WHERE user_id = ?";
          }
          connection.query(query2, [message.sender_id], (err, result) => {
            if (err) throw err;

            if (!(message.date == date)) {
              date = message.date;
              if (message.date == date2) {
                socket.emit("message", "Today");
              } else {
                //// get previous day -- yesterday
                socket.emit("message", message.date);
              }
            }

            if (message.sender_id == userId) {
              socket.emit("retrieveSentChats", message.message, message.time);
            } else {
              socket.emit(
                "retrieveReceivedChats",
                message.message,
                result[0].name,
                message.time
              );
            }
          });
        });
      }
    });

    connection.release();
  });

  socket.on("sentChatMessage", (msg, datee, time) => {
    pool.getConnection((err, connection) => {
      if (err) throw err;
      const query =
        "SELECT * FROM chats WHERE room_id = ? ORDER BY date ASC, time ASC";
      connection.query(query, [room], (err, results) => {
        if (err) throw err;
        if (results.length) {
          if (!(results[results.length - 1].date == date)) {
            date = datee;
            if (date == date2) {
              socket.emit("message", "Today");
              socket.broadcast.to(room).emit("message", "Today");
            } else {
              socket.emit("message", datee);
              socket.broadcast.to(room).emit("message", datee);
            }
          }
        } else {
          date = datee;
          if (date == date2) {
            socket.emit("message", "Today");
            socket.broadcast.to(room).emit("message", "Today");
          } else {
            socket.emit("message", datee);
            socket.broadcast.to(room).emit("message", datee);
          }
        }

        const query2 =
          "INSERT INTO chats(`room_id`,`sender_id`, `date`, `time`, `message`) VALUES(?)";
        const values = [room, userId, datee, time, msg];
        connection.query(query2, [values], (err, data) => {
          if (err) throw err;
          console.log(data.insertId);
          console.log(userId);

          socket.emit("sentChatMessage", msg, time);
        });
      });

      connection.release();
    });
  });

  socket.on("receivedChatMessage", (msg, datee, time) => {
    socket.broadcast.to(room).emit("receivedChatMessage", msg, user, time);
  });

  socket.on("disconnect", () => {
    io.to(room).emit("message", `${user} left the chart`);
  });
});

server.listen(5000, () => {
  console.log("server listening at port 5000");
});
