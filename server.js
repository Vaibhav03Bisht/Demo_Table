const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");

const app = express();

app.use(
  basicAuth({
    users: { "testuser": "testpass" },
    challenge: true,
  })
);

app.get("/data.json", (req, res) => {
  res.sendFile(path.join(__dirname, "data.json"));
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
