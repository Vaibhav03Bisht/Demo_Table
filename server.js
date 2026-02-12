const express = require("express");
const basicAuth = require("express-basic-auth");
const path = require("path");
const fs = require("fs");

const app = express();

// -------------------------------
// Basic Auth
// -------------------------------
app.use(
  basicAuth({
    users: { testuser: "testpass" },
    challenge: true,
  })
);

// -------------------------------
// /data.json route
// -------------------------------
app.get("/data.json", (req, res) => {
  const paramRaw = req.query.params;

  if (!paramRaw) {
    return res.status(400).json({ error: "Missing 'params' query parameter." });
  }

  let onceDecoded, twiceDecoded;

  try {
    onceDecoded = decodeURIComponent(paramRaw);
    twiceDecoded = decodeURIComponent(onceDecoded);

    // Reject if double-encoded
    if (onceDecoded !== twiceDecoded) {
      return res.status(500).json({
        error: "Double encoding detected — rejected",
        received: paramRaw,
        decodedOnce: onceDecoded,
        decodedTwice: twiceDecoded
      });
    }
  } catch (err) {
    return res.status(400).json({ error: "Failed to decode param", detail: err.message });
  }

  // Now parse something like: params=outer=inner=value
  const segments = onceDecoded.split("=");
  if (segments.length < 2) {
    return res.status(400).json({ error: "Invalid param format. Expect at least key=value" });
  }

  const [outerKey, ...rest] = segments;
  const field = rest.length === 2 ? rest[0] : outerKey;
  const value = rest.length === 2 ? rest[1] : rest[0];

  // Load JSON data
  const rawData = fs.readFileSync(path.join(__dirname, "Data.json"), "utf-8");
  const books = JSON.parse(rawData).books || [];

  // Apply filter
  const filtered = books.filter(book => {
    const bookVal = book[field];
    if (typeof bookVal === "string") return bookVal.toLowerCase() === value.toLowerCase();
    if (typeof bookVal === "number") return bookVal.toString() === value;
    if (typeof bookVal === "boolean") return bookVal.toString().toLowerCase() === value.toLowerCase();
    if (Array.isArray(bookVal)) return bookVal.map(v => v.toLowerCase()).includes(value.toLowerCase());
    return false;
  });

  res.json({
    status: "ok",
    parsed: { outerKey, field, value },
    filteredCount: filtered.length,
    books: filtered
  });
});

// -------------------------------
// Start the server
// -------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
