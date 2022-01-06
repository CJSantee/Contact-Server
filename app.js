require('dotenv').config();

const express = require("express");
const router = express.Router();
const cors = require("cors");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Adding Rate Limit For Contact form to prevent exploits
app.use(
    rateLimit({
        windowMs: 1 * 60 * 60 * 1000, // 1 hour duration in milliseconds
        max: 5,
        message: "You exceeded 5 requests in 1 hour limit!",
        headers: true,
    })
);

app.use("/", router);
app.listen(process.env.PORT || 5000, () => console.log("Server Running"));

// Display incoming and outgoing emails at root
router.get("/", (req, res) => {
    res.json({outgoing_email: process.env.OUTGOING_EMAIL_USER, incoming_email: process.env.INCOMING_EMAIL_USER});
});

// Config for outgoing email
const contactEmail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.OUTGOING_EMAIL_USER,
        pass: process.env.OUTGOING_EMAIL_PASS
    },
});

// Verify outgoing email auth
contactEmail.verify((error) => {
    if (error) {
        console.log(error);
    } else {
        console.log("Ready to Send");
    }
});

// Route for sending email via contact form
router.post("/contact", (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    const mail = {
        from: name,
        to: process.env.INCOMING_EMAIL_USER,
        subject: "Contact Form Submission",
        html: `<p>Name: ${name}</p>
               <p>Email: ${email}</p>
               <p>Message: ${message}</p>`,
    };
    contactEmail.sendMail(mail, (error) => {
        if (error) {
            res.json({ status: "ERROR" });
        } else {
            res.json({ status: "Message Sent" });
        }
    });
});

// Route to download resume from server
router.get("/resume", (req, res) => {
    var path = __dirname + "/Santee-Resume-2022-PDF.pdf";
    res.download(path);
});