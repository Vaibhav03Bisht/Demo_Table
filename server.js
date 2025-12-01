const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");

const app = express();

// Basic Auth Credentials
app.use(
  basicAuth({
    users: { "testuser": "testpass" },
    challenge: true,
  })
);

// Serve JSON file
app.get("/data.json", (req, res) => {
  res.sendFile(path.join(__dirname, "data.json"));
});

// Render requires listening on process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
