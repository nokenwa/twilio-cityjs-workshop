const express = require("express");
const session = require("sesion");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(
  session({
    secret: "TwilioRocks",
    cookie: { maxAge: 10000 },
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.listen(PORT, () => {
  console.log(`App listenings at PORT: ${PORT}`);
});
