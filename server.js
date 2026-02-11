const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");
const fs = require("fs");

const app = express();

// -------------------------------
// Basic Auth Credentials
// -------------------------------
app.use(
  basicAuth({
    users: { testuser: "testpass" },
    challenge: true,
  })
);

// -------------------------------
// Filtered Data Endpoint
// -------------------------------
app.get("/data.json", (req, res) => {
  const authorParam = req.query.author;

  // Load book data from file
  const rawData = fs.readFileSync(path.join(__dirname, "Data.json"), "utf-8");
  const jsonData = JSON.parse(rawData);
  const books = jsonData.books || [];

  // Filter books if author param is provided
  const filteredBooks = authorParam
    ? books.filter(book =>
        book.author.toLowerCase() === decodeURIComponent(authorParam).toLowerCase()
      )
    : books;

  res.json({
    status: "ok",
    totalResults: filteredBooks.length,
    filteredBy: authorParam || "none",
    books: filteredBooks
  });
});

// -------------------------------
// Start Server
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
