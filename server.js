app.get("/data.json", (req, res) => {
  const paramRaw = req.query.params;

  if (!paramRaw) {
    return res.status(400).json({ error: "Missing 'params' query parameter." });
  }

  // Decode steps
  let onceDecoded, twiceDecoded, encodingStatus;
  try {
    onceDecoded = decodeURIComponent(paramRaw);
    twiceDecoded = decodeURIComponent(onceDecoded);

    if (onceDecoded !== twiceDecoded) {
      return res.status(500).json({
        error: "Double encoding detected — request rejected.",
        receivedParam: paramRaw,
        decodedOnce: onceDecoded,
        decodedTwice: twiceDecoded
      });
    }

    encodingStatus = "Single encoding detected — processing...";
  } catch (err) {
    return res.status(400).json({ error: "Failed to decode param", detail: err.message });
  }

  // Accept format like: params=outerkey=innerkey=value
  const segments = onceDecoded.split("=");

  if (segments.length < 2) {
    return res.status(400).json({ error: "Invalid 'params' format. Expected at least key=value." });
  }

  // Support nested param styles
  const [outerKey, ...rest] = segments;
  const field = rest.length === 2 ? rest[0] : outerKey;
  const value = rest.length === 2 ? rest[1] : rest[0];

  // Load book data
  const rawData = fs.readFileSync(path.join(__dirname, "Data.json"), "utf-8");
  const jsonData = JSON.parse(rawData);
  const books = jsonData.books || [];

  const filtered = books.filter(book => {
    const bookValue = book[field];

    if (typeof bookValue === "string") {
      return bookValue.toLowerCase() === value.toLowerCase();
    } else if (typeof bookValue === "number") {
      return bookValue.toString() === value;
    } else if (typeof bookValue === "boolean") {
      return bookValue.toString().toLowerCase() === value.toLowerCase();
    } else if (Array.isArray(bookValue)) {
      return bookValue.map(v => v.toLowerCase()).includes(value.toLowerCase());
    }

    return false;
  });

  res.json({
    status: "ok",
    encodingStatus,
    paramParsed: { outerKey, field, value },
    totalResults: filtered.length,
    books: filtered
  });
});
