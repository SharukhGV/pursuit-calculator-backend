const express = require("express");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
const { User, PendingUsers, Calculation } = require("./models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();const app = express();
const PORT = 5000;

// Middleware
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));app.use(bodyParser.json());

// authenticateToken.js
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer"

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user; // Attach decoded user info to the request
    next();
  });
};

function performCalculation(number1, number2, operation) {
  number1 = parseFloat(number1);
  number2 = parseFloat(number2);

  if (isNaN(number1) || isNaN(number2)) {
    throw new Error("Invalid numbers provided");
  }

  switch (operation) {
    case "add":
      return number1 + number2;
    case "subtract":
      return number1 - number2;
    case "multiply":
      return number1 * number2;
    case "divide":
      if (number2 === 0) {
        throw new Error("Division by zero is not allowed");
      }
      return number1 / number2;
    default:
      throw new Error("Invalid operation");
  }
}


// module.exports = authenticateToken;


// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'aol',
  auth: {
    user: 'hiveheavenpro@aol.com',
    pass: process.env.EMAIL_PW
  }
});

// Helper function to send verification code
const sendVerificationCode = async (email, verificationCode) => {
  const mailOptions = {
    from: 'hiveheavenpro@aol.com',
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${verificationCode}. It will expire in 15 minutes.`,
  };
  await transporter.sendMail(mailOptions);
};

// Register Route
app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PendingUsers.create({ email, password: hashedPassword, verificationCode, expiresAt });
    await sendVerificationCode(email, verificationCode);

    res.status(200).json({ message: "Verification code sent" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Verify Email Route
app.post("/verify-email", async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    const pendingUser = await PendingUsers.findOne({ where: { email } });

    if (!pendingUser) {
      return res.status(400).json({ error: "No pending registration found" });
    }

    if (
      pendingUser.verificationCode !== verificationCode ||
      new Date() > new Date(pendingUser.expiresAt)
    ) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    const newUser = await User.create({
      email: pendingUser.email,
      password: pendingUser.password,
      isVerified: true
    });

    await PendingUsers.destroy({ where: { email } });

    res.status(200).json({ message: "User verified and registered", user: newUser });
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

// Resend Verification Code Route
app.post("/resend-verification", async (req, res) => {
  const { email } = req.body;

  try {
    const pendingUser = await PendingUsers.findOne({ where: { email } });

    if (!pendingUser) {
      return res.status(400).json({ error: "No pending registration found" });
    }

    const newVerificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    pendingUser.verificationCode = newVerificationCode;
    pendingUser.expiresAt = newExpiresAt;
    await pendingUser.save();

    await sendVerificationCode(email, newVerificationCode);

    res.status(200).json({ message: "Verification code resent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend verification code" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h"
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/calculations", authenticateToken, async (req, res) => {
  const { number1, number2, operation } = req.body;
  const email = req.user.email; // Extracted from token

  try {
    if (!number1 || !number2 || !operation) {
      return res.status(400).json({ error: "All fields (number1, number2, operation) are required." });
    }

    const result = performCalculation(Number(number1), Number(number2), operation);

    const calculation = await Calculation.create({
      email,
      number1: Number(number1),
      number2: Number(number2),
      operation,
      result,
    });

    res.status(201).json({ calculation, result });
  } catch (error) {
    console.error("Error creating calculation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/calculations", authenticateToken, async (req, res) => {
  const email = req.user.email;

  try {
    const calculations = await Calculation.findAll({
      where: { email },
      order: [["created_at", "DESC"]],
    });

    if (calculations.length === 0) {
      return res.status(200).json({ message: "No calculations found for this user." });
    }

    res.status(200).json(calculations);
  } catch (error) {
    console.error("Error fetching calculations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/calculations/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { number1, number2, operation } = req.body;
  const email = req.user.email;

  try {
    const calculation = await Calculation.findOne({ where: { id, email } });

    if (!calculation) {
      return res.status(404).json({ error: "Calculation not found." });
    }

    if (!number1 || !number2 || !operation) {
      return res.status(400).json({ error: "All fields (number1, number2, operation) are required." });
    }

    const result = performCalculation(Number(number1), Number(number2), operation);

    calculation.number1 = Number(number1);
    calculation.number2 = Number(number2);
    calculation.operation = operation;
    calculation.result = result;

    await calculation.save();

    res.status(200).json(calculation);
  } catch (error) {
    console.error("Error updating calculation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/calculations/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const email = req.user.email;

  try {
    const result = await Calculation.destroy({ where: { id, email } });

    if (result === 0) {
      return res.status(404).json({ error: "Calculation not found." });
    }

    res.status(200).json({ message: "Calculation deleted successfully." });
  } catch (error) {
    console.error("Error deleting calculation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
