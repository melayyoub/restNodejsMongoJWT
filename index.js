// Created By Sam Elayyoub
// Authorization: Brearer <token>
// Create a user after starting MongoDB
// Login and get the token
// require express
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// get the users model
const Users = require("./models/Users");
// require JsonWebToken
const jwt = require("jsonwebtoken");
// include the MongoDB now
const mongo = require("mongoose");
// autoinc from mongoose auto id autoIncrement for later use
const autoIncrement = require("mongoose-auto-increment");
// require the MongoDB config obj
const config = require("./db");
// connect to MongoDB
mongo.Promise = global.Promise;
mongo
  .connect(
    config.DB,
    { useNewUrl: true }
  )
  .then(
    () => {
      console.log("Database is connected");
    },
    err => {
      console.log("Can not connect to the database" + err);
    }
  );
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to the API"
  });
});

app.post("/api/:id/post", verifyToken, (req, res) => {
  // check our token
  jwt.verify(req.token, "secretkey", (err, authData) => {
    if (err) {
      res.status(403).send("Unauthorized");
    } else {
      res.json({
        message: "Post accepted",
        authData
      });
    }
  });
  res.json({
    message: "Post Created"
  });
});

// Get needed fields for a new user
app.get("/api/fields", (req, res) => {
  let fields = {
    name: "",
    email: ""
  };
  res.status(200).send(fields);
});

// store new user
app.post("/api/add", (req, res) => {
  let user = new Users(req.body);
  user
    .save()
    .then(user => {
      res.status(200).json({ User: "user created", user });
    })
    .catch(err => {
      res.status(400).send(err + " - unable to save new user.");
    });
});

app.post("/api/login", (req, res) => {
  let email = req.body.email;
  Users.find({ email: email }, (err, user) => {
    if (err) {
      console.log("Sign in error");
      res.status(403).send(`${err} - ${email} `);
    } else {
      //if user found.
      if (user.length != 0) {
        if (user[0].email) {
          console.log("Username already exists, id: " + user.id);
          jwt.sign({ user }, "secretkey", { expiresIn: "1m" }, (err, token) => {
            res
              .json({
                token: token
              })
              .status(200);
          });
        }
      } else {
        res.json({
          email: "Dose not exist"
        });
      }
    }
  });
});

// Verify Token function
function verifyToken(req, res, next) {
  // get the token from the header value
  const bearerHeader = req.headers["authorization"];
  // Check the token
  if (typeof bearerHeader !== "undefined") {
    //   split at the space
    const bearer = bearerHeader.split(" ");
    // get token from array
    const bearerToken = bearer[1];
    // set token
    req.token = bearerToken;
    //  next middleware
    next();
  } else {
    //   respond with status 403
    res.status(403).send("Unauthorized");
  }
}

app.listen(3000, () => console.log("Server started. port 3000"));
