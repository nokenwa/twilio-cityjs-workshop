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
  const { channel, locale, to } = req.body;
  try {
    if (channel === "sms" || "call") {
      const resp = await twilio.lookups.v2
        .phoneNumbers(to)
        .fetch({ fields: "line_type_intelligence" });
      console.log(resp);
      if (resp.lineTypeIntelligence === ("premium" || "sharedCost")) {
        throw new Error("We do not support premium phone numbers for 2FA");
      }
    }
    const verification = await twilio.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verifications.create({
        to,
        channel,
        locale,
      });
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
    const check = await twilio.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to,
        code,
      });

    if (check.status === "approved") {
      req.session.loggedIn = true;
      console.log(req.session);
      res.json({ success: true, message: "Verification Success" });
    } else {
      res.json({
        success: false,
        message: `Verification Unsuccessful: ${check.status}`,
      });
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(400);
  }
});

app.listen(PORT, () => {
  console.log(`App listenings at PORT: ${PORT}`);
});
