import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { ApiError } from "./ApiError.js";
import { User } from "../models/user.model.js";

export const sendEmail = async ({ email, emailType, userId }) => {
  try {
    const hashedToken = await bcrypt.hash(userId.toString(), 10);

    if (emailType == "VERIFY") {
      await User.findByIdAndUpdate(userId, {
        verifyToken: hashedToken,
        verifyTokenExpiry: Date.now() + 3600000,
      });
    }
    if (emailType == "RESET") {
      await User.findByIdAndUpdate(userId, {
        forgotPasswordToken: hashedToken,
        forgotPasswordTokenExpiry: Date.now() + 3600000,
      });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    const action = emailType == "VERIFY" ? "Verify  Email" : "Reset Password";

    const endPoint = emailType == "VERIFY" ? "verifyemail" : "forgotpassword";

    const link = `${process.env.DOMAIN}/${endPoint}?token=${hashedToken}`;
    const content =
      emailType == "VERIFY"
        ? "Thank you for registering! Please click the button below to verify your account."
        : " We received a request to reset the password for your account. If you made this request, please click the button below to set a new password.";
    const main =
      emailType == "VERIFY"
        ? "Verify Your Email Address"
        : "Reset Your Password";

    const mailOptions = {
      from: "doora@no-reply.in",
      to: email,
      subject: emailType === "VERIFY" ? "verify your Email" : "Reset Password",
      html: `
        <!-- Gradient Background Wrapper -->
<div style="background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); padding: 50px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">

  <!-- Gradient Content Card -->
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #1e2022, #232526, #414345); border-radius: 16px; box-shadow: 0 12px 30px rgba(0,0,0,0.6); padding: 40px 30px; color: #ffffff;">

    <!-- Logo -->
    <div style="text-align: center; margin-bottom: 25px;">
      <img src="https://i.pinimg.com/736x/bc/2f/58/bc2f589c19c7abf184d7ef9a88e4b8bd.jpg" alt="Company Logo" style="max-width: 130px; border-radius: 30%; box-shadow: 0 0 12px rgba(252,255,251,0.9);">
    </div>

    <!-- Heading -->
    <h1 style="font-size: 28px; text-align: center; margin: 0 0 20px; line-height: 1.3; letter-spacing: 0.5px;">${main}</h1>

    <!-- Body Text -->
    <p style="font-size: 16px; color: #e0e0e0; text-align: center; line-height: 1.6; margin-bottom: 35px;">
      ${content}
    </p>

    <!-- CTA Button -->
    <div style="text-align: center; margin-bottom: 35px;">
      <a href="${link}" 
         style="display: inline-block; padding: 15px 35px; background: linear-gradient(135deg, #1a0004, #601417, #ff3c38); color: #ffffff; font-size: 18px; font-weight: bold; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 15px rgba(255,81,47,0.4); transition: background 0.3s ease, color 0.3s ease;"
         onmouseover="this.style.background='linear-gradient(135deg, #ff4f5a, #c91345)'; this.style.color='#000';"
         onmouseout="this.style.background='linear-gradient(135deg, #1a0004, #601417, #ff3c38)'; this.style.color='#fff';"
      >
        ${action}
      </a>
    </div>

    <!-- Fallback Link -->
    <p style="font-size: 14px; color: #dddddd; text-align: center; line-height: 1.5;">
      If the button above doesn’t work, copy and paste this link into your browser:
      <br><br>
      <a href="${link}" style="color: #57b0ff; text-decoration: underline; word-break: break-word;">${link}</a>
    </p>

    <!-- Footer -->
    <div style="border-top: 1px solid rgba(255,255,255,0.15); margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #cccccc;">
      <p>&copy; 2025 <strong style="color:#fff;">Doora</strong>. All rights reserved.</p>
      <p>
        <a href="https://example.com/privacy" style="color: #cccccc; text-decoration: none;">Privacy Policy</a> |
        <a href="https://example.com/terms" style="color: #cccccc; text-decoration: none;">Terms of Service</a>
      </p>
    </div>

  </div>
</div>

        `,
    };
    const mailresponse = await transporter.sendMail(mailOptions);
    return mailresponse;
  } catch (error) {
    throw new ApiError(500, "mailer error");
  }
};
