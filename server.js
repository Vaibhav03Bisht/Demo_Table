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
// Encoding Diagnostic Endpoint
// -------------------------------
app.get("/data.json", (req, res) => {
  const originalUrl = req.originalUrl;
  const paramRaw = req.query.params || null;

  let encodingStatus = "No params provided";
  let onceDecoded = null;
  let twiceDecoded = null;

  if (paramRaw) {
    try {
      onceDecoded = decodeURIComponent(paramRaw);
      twiceDecoded = decodeURIComponent(onceDecoded);

      if (paramRaw === onceDecoded) {
        encodingStatus = "Not encoded";
      } else if (onceDecoded === twiceDecoded) {
        encodingStatus = "Encoded once";
      } else {
        encodingStatus = "Double encoded";
      }
    } catch (err) {
      encodingStatus = "Encoding detection failed";
    }
  }

  // Load your existing JSON file
  const rawData = fs.readFileSync(path.join(__dirname, "Data.json"), "utf-8");
  const jsonData = JSON.parse(rawData);

  res.json({
    status: "ok",
    encodingAnalysis: encodingStatus,
    originalRequestUrl: originalUrl,
    receivedParam: paramRaw,
    decodedOnce: onceDecoded,
    decodedTwice: twiceDecoded,
    books: jsonData.books
  });
});

// -------------------------------
// Start Server
// -------------------------------
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
