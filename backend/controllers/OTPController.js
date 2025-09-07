// backend/controllers/OTPController.js
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// ✅ Send OTP
export const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    console.log("📨 Sending OTP to:", phoneNumber);
    console.log("Using Verify SID:", process.env.TWILIO_VERIFY_SID);

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    console.log("✅ Twilio verification response:", verification);

    res.status(200).json({
      success: true,
      message: "OTP sent",
      sid: verification.sid,
    });
  } catch (error) {
    console.error("❌ Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// ✅ Verify OTP
export const verifyOtp = async (req, res) => {
  const { phoneNumber, code } = req.body;

  try {
    console.log("🔍 Verifying OTP...");
    console.log("Phone:", phoneNumber);
    console.log("Code:", code);
    console.log("Using Verify SID:", process.env.TWILIO_VERIFY_SID);

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to: phoneNumber, code });

    console.log("✅ Twilio verificationCheck response:", verificationCheck);

    if (verificationCheck.status === "approved") {
      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid OTP",
        status: verificationCheck.status,
      });
    }
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};
