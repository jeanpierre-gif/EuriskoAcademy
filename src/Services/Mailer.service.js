const sgMail = require("@sendgrid/mail");
require("dotenv").config();

// Set the API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Function to send email
const sendEmail = async ({ to, subject, text, html }) => {
  const msg = {
    to, // Recipient's email
    from: "jaypnakhoul@gmail.com", // Your verified sender email
    subject, // Subject line
    text, // Plain text body
    html, // HTML body (optional)
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.response ? error.response.body : error.message);
    throw error;
  }
};

module.exports = { sendEmail };
