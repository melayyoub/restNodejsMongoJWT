const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define collection and schema for users
let Users = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  token: {
    type: String
  }
});

module.exports = mongoose.model("Users", Users);
