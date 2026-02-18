const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const ExcelJS = require("exceljs");
const nodemailer = require("nodemailer");
const path = require("path");
const app = express();

app.use(cors());
require("dotenv").config();

app.use(express.json());
// If you support classic form POST: Uncomment for form encoding
// app.use(bodyParser.urlencoded({ extended: true }));

// Email setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Mongoose setup
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Serve static files (HTML, CSS, JS, submisssion.html etc.)
app.use(express.static(path.join(__dirname, "PROJECTS/registration-form")));

// Mongoose user schema
const userSchema = new mongoose.Schema({
  fullname: String,
  regdate: { type: Date, default: Date.now },
  programme: String,
  department: String,
  email: String,
  phone: String,
  altphone: String
});
const User = mongoose.model("User", userSchema);

// Registration POST
app.post("/register", async (req, res) => {
  try {
    console.log("Incoming data:", req.body);
    const user = new User(req.body);
    const saved = await user.save();
    console.log("Saved user=", saved);

    // Send email
    const mailOptions = {
      from: `"Registration Team" <${process.env.EMAIL_USER}>`,
      to: saved.email,
      subject: "Registration Successful",
      html: `
        <h2>Hi ${saved.fullname},</h2>
        <p>Thank you for registering!</p>
        <p><b>Programme:</b> ${saved.programme}</p>
        <p><b>Department:</b> ${saved.department}</p>
        <p>We’ll contact you on <b>${saved.phone}</b> if needed.</p>
        <br>
        <p>Best regards,<br>Registration Team</p>
      `,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Error sending email:", err);
      } else {
        console.log("✅ Email sent:", info.response);
      }
    });

    res.json({ message: "registered successfully" });
  } catch (err) {
    console.log("Save error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Export Excel
app.get("/export", async (req, res) => {
  try {
    const users = await User.find();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registrations");
    worksheet.columns = [
      { header: "Full Name", key: "fullname", width: 20 },
      { header: "Registration Date", key: "regdate", width: 20 },
      { header: "Programme", key: "programme", width: 15 },
      { header: "Department", key: "department", width: 20 },
      { header: "Email", key: "email", width: 25 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Alternate Phone", key: "altphone", width: 15 }
    ];
    users.forEach(user => worksheet.addRow(user.toObject()));
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=registrations.xlsx");
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve landing page (registration.html, or index.html as needed)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "PROJECTS/registration-form", "registration.html"));
  // Or use "index.html" if your main page is named so
});

// Get all users
app.get("/all-data", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
