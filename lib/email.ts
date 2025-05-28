import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // You can replace this with another provider if needed
  auth: {
    user: process.env.EMAIL_FROM || "your-gmail@gmail.com",
    pass: process.env.EMAIL_SERVER_PASSWORD || "your-app-password",
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"My App" <noreply@example.com>',
      ...options,
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  host: string
) {
  const verificationLink = `http://${host}/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify Your Email Address",
    text: `Please verify your email by visiting this link: ${verificationLink}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to My App!</h2>
        <p style="font-size: 16px; color: #555;">Thank you for registering. Please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        
        <p style="font-size: 14px; color: #999;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 14px; color: #555;"><a href="${verificationLink}">${verificationLink}</a></p>
        <p style="font-size: 12px; color: #aaa;">This link will expire in 1 hour. If you didn’t request this email, you can safely ignore it.</p>
        
        <hr style="margin-top: 30px;" />
        <p style="font-size: 12px; color: #bbb;">&copy; ${new Date().getFullYear()} My App. All rights reserved.</p>
      </div>
    `,
  });
}
