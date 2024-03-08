const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Missing username or/and password" });
  } else if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists" });
  } else {
    users.push({ username, password });
    return res.status(201).json({ message: "User created successfully" });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  promise = new Promise((resolve, reject) => {
    try {
      resolve(books);
    } catch (err) {
      reject(err);
    }
  });
  promise.then(
    (books) => {
      if (books.length === 0) {
        return res.status(404).json({ message: "No books found" });
      }
      return res.send(books);
    },
    (err) => {
      return res.status(500).json({ message: err.message });
    }
  );
});

// Get book details based on ISBN from books
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (isbn > 0 && isbn <= Object.keys(books).length) {
    return res.send(books[isbn - 1]);
  } else {
    return res.status(404).json({ message: "Invalid ISBN" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  let books_by_author = {};
  for (let book of Object.values(books)) {
    if (book.author === author) {
      books_by_author[book.title] = book;
    }
  }
  if (Object.keys(books_by_author).length > 0) {
    return res.send(books_by_author);
  } else {
    return res.status(404).json({ message: "No books found for this author" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  let books_by_title = {};
  for (let book of Object.values(books)) {
    if (book.title === title) {
      books_by_title[book.title] = book;
    }
  }
  if (Object.keys(books_by_title).length > 0) {
    return res.send(books_by_title);
  } else {
    return res.status(404).json({ message: "No books found for this title" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (isbn > 0 && isbn <= Object.keys(books).length) {
    return res.send(books[isbn - 1].reviews);
  } else {
    return res.status(404).json({ message: "Invalid ISBN" });
  }
});

module.exports.general = public_users;
