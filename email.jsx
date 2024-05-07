// FRONTEND
import { getFunctions, httpsCallable } from "firebase/functions";

const sendEmail = async (currentUserData) => {
  const functions = getFunctions();
  const sendEmailNewMessage = httpsCallable(functions, "sendEmailNewMessage");
  try {
    const result = await sendEmailNewMessage({
      email: otherUser.email,
      receivingUser: otherUser.firstName,
      sendingUser: currentUserData.firstName + " " + currentUserData.lastName,
    });
  } catch (error) {
    console.error(error);
  }
};

// FIREBASE FUNCTION
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mgApiKey = functions.config().mailgun.api_key;
const mgURL = functions.config().mailgun.url;
const mg = mailgun.client({ username: "api", key: mgApiKey, url: mgURL });

exports.sendEmailNewMessage = onCall(async (data, context) => {
  console.log(data);
  console.log(data.email);
  mg.messages
    .create(mgdomain, {
      from: "Lettz <info@lettz.ie>",
      to: data.email,
      subject: "New Message",
      text: `Hi ${data.receivingUser}, ${data.sendingUser} just
       sent you a new message.
      Please log in to your account to view the message at https://lettz.ie. `,
      html: `
      <div style="background-color: #F5F5F5; padding: 40px 0;
      font-family: Arial, sans-serif; font-size: 16px; color: #333;">
    <div style="max-width: 600px; width: 95%; margin: auto;
     border: 1px solid #ddd; border-radius: 8px; overflow: hidden;
      background-color: white;">
      <div style="display: flex; align-items: left; margin: 10px;">
        <img src=${string} alt="Lettz Logo" style="width: 40px;
         height: 40px; margin: 0px;"/>
         <p style="font-weight: bold; font-size: 32px;
         margin: 0px;">Lettz</p>
         </div>
      <div style="padding: 20px; text-align: center;
       border-bottom: 1px solid #ddd;">
        <h2 style="color: #333;
         margin: 0px;">You have a new message!</h2>
      </div>
      <div style="padding: 20px;">
        <p>Hi ${data.receivingUser},</p>
        <p>${data.sendingUser} just sent you a new message.
         Please log in to your account to view the message.</p>
        <div style="text-align: center;">
          <a href="https://lettz.ie" style="display: inline-block;
           background-color: #A754FF; color: white; padding: 12px 24px;
            border-radius: 4px; text-decoration: none; font-weight: bold;
             margin-top: 20px;">Visit Lettz</a>
        </div>
      </div>
    </div>
  </div>
      `,
    })
    .then((msg) => console.log(msg)) // logs response data
    .catch((err) => {
      console.error("Error sending mail:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response body:", err.response.body);
      }
      throw new HttpsError("Unable send email", err.message);
    });
});
