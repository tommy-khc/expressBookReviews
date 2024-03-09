const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  for (let user of users) {
    if (user.username === username) {
      return true;
    }
  }
  return false;
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  for (let user of users) {
    if (user.username === username && user.password === password) {
      return true;
    }
  }
  return false;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Missing username or/and password" });
  }
  if (!isValid(username)) {
    return res.status(401).json({ message: "Username hasn't registered" });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).json({ message: "User logged in successfully" });
  } else {
    return res.status(401).json({ message: "Incorrect password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Missing review" });
  }

  if (isbn > 0 && isbn <= Object.keys(books).length) {
    // Check if the user has already reviewed the book
    if (books[isbn].reviews[username]) {
      // Update the existing review
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review updated successfully" });
    } else {
      // Add a new review
      books[isbn].reviews[username] = review;
      return res.status(200).json({ message: "Review added successfully" });
    }
  } else {
    return res.status(404).json({ message: "Invalid ISBN" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.authorization.username;
  if (isbn > 0 && isbn <= Object.keys(books).length) {
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res
        .status(404)
        .json({ message: `Review from ${username} not found` });
    }
  } else {
    return res.status(404).json({ message: "Invalid ISBN" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
