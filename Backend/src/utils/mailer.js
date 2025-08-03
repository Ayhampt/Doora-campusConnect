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
    const user = await User.findOne({ _id: userId });
    const name = user.firstname;
    const endPoint = emailType == "VERIFY" ? "verifyemail" : "resetPassword";

    const link = `${process.env.DOMAIN}/${endPoint}?token=${hashedToken}`;
    const content =
      emailType == "VERIFY"
        ? "Thank you for registering! Please click the button below to verify your account."
        : " We received a request to reset the password for your account. If you made this request, please click the button below to set a new password.";
    /* const main =
      emailType == "VERIFY"
        ? "Verify Your Email Address"
        : "Reset Your Password";*/

    const mailOptions = {
      from: "doora@no-reply.in",
      to: email,
      subject: emailType === "VERIFY" ? "verify your Email" : "Reset Password",
      html: `

  <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="padding: 20px 0;">
      <tr>
        <td align="center">
          <!-- Container Table -->
          <table width="608" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff;">
            <!-- Logo Section -->
            <tr>
              <td style="padding: 20px 30px; font-size: 60px; font-weight: bold; color: #585b5e;">
                <span style="color: #585b5e;">D</span><span style="color: #0071e2;">oo</span><span style="color: #585b5e;">ra</span>
              </td>
            </tr>

            <!-- Greeting -->
            <tr>
              <td style="padding: 20px 30px 10px; font-size: 22px; color: #616161;">
                Hi ${name},
              </td>
            </tr>

            <!-- Main Content -->
            <tr>
              <td style="padding: 10px 30px 20px; font-size: 22px; color: #6f6f6f;">
                ${content}
              </td>
            </tr>

            <!-- Button -->
            <tr>
              <td align="left" style="padding: 25px 30px 30px;">
                <a href="${link}" style="display: inline-block; padding: 15px 30px; background-color: #198dcf; color: #eaf3f8; text-decoration: none; border-radius: 26px; font-size: 20px; font-weight: bold;">
                  ${action}
                </a>
              </td>
            </tr>

            <!-- Secondary Message -->
            <tr>
              <td style="padding: 0 30px 40px; font-size: 16px; color: #6b6b6b;">
                If the button above doesn’t work, copy and paste this link into your browser:<br />
                <a href="${link}" style="color: #198dcf; word-break: break-all;">${link}</a>
              </td>
            </tr>

            <!-- Optional Background Side Image (Can be removed for email safety) -->
            <!-- If you need a side image, it should be in a separate table column, not absolutely positioned -->
          </table>
        </td>
      </tr>
    </table>
     <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="padding: 20px 0;">
      <tr>
        <td align="center" style="font-size: 14px; color: #999999; font-family: Arial, sans-serif; padding-top: 20px;">
          &copy; 2025 Doora. All rights reserved.
        </td>
      </tr>
    </table>
 </body>

        `,
    };
    const mailresponse = await transporter.sendMail(mailOptions);
    return mailresponse;
  } catch (error) {
    throw new ApiError(500, "mailer error");
  }
};
