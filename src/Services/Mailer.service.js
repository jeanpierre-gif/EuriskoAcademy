const sgMail = require("@sendgrid/mail");
require("dotenv").config();

//set the api Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, text, html }) => {
  const msg = {
    to, 
    from: "jaypnakhoul@gmail.com",
    subject, 
    text, 
    html, 
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
