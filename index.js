require("dotenv").config();
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const { TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET } = process.env;

const twilio = require("twilio")(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.use(
  session({
    secret: "TwilioRocks",
    cookie: { maxAge: 10000 },
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.post("/", (req, res) => {
  let { email, pwd } = req.body;
  if (email && pwd) {
    res.redirect("/2fa");
  } else res.sendStatus(401);
});

app.get("/2fa", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/2fa.html"));
});

app.get("/secrets", (req, res) => {
  console.log(req.session);
  if (req.session.loggedIn) {
    res.send("Here are all the secrets");
  } else res.sendStatus(401);
});

app.post("/start-verify", async (req, res) => {
  try {
    res.json({ success: true, attempts: verification.sendCodeAttempts.length });
  } catch (error) {
    console.error(error);
    res.statusCode = error.status;
    res.send(error);
  }
});

app.post("/check-verify", async (req, res) => {
  const { to, code } = req.body;
  try {
    req.session.loggedIn = true;
    res.json({ success: true, message: "Verification Success" });
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

app.listen(PORT, () => {
  console.log(`App listenings at PORT: ${PORT}`);
});
