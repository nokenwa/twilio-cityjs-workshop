require("dotenv").config();
const { TWILIO_ACCOUNT_SID, TWILIO_API_KEY, TWILIO_API_SECRET } = process.env;

const twilio = require("twilio")(TWILIO_API_KEY, TWILIO_API_SECRET, {
  accountSid: TWILIO_ACCOUNT_SID,
});

(async () => {
  try {
    const rateLimit = await twilio.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .rateLimits.create({
        decription: "Limit verifications by session id",
        uniqueName: "session_id",
      });
    const bucket = await twilio.verify.v2
      .services(process.env.VERIFY_SERVICE_SID)
      .rateLimits(rateLimit.sid)
      .buckets.create({ max: 2, interval: 30 });
  } catch (error) {
    console.log(error);
  }
})();
