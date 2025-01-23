// const express = require("express");
// const bcrypt = require("bcrypt");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const { User, PendingUsers, Calculation } = require("./models/");
// const crypto = require("crypto");
// const nodemailer = require("nodemailer");

// const app = express();
// const PORT = 5000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Nodemailer configuration
// const transporter = nodemailer.createTransport({
//   service: 'aol',
//   auth: {
//     user: 'hiveheavenpro@aol.com',
//     pass: 'elqlbshcyekgepps'
//   }
// });

// // Helper function to send verification code
// const sendVerificationCode = async (email, verificationCode) => {
//   const mailOptions = {
//     from: 'hiveheavenpro@aol.com',
//     to: email,
//     subject: 'Your Verification Code',
//     text: `Your verification code is ${verificationCode}. It will expire in 15 minutes.`,
//   };
//   await transporter.sendMail(mailOptions);
// };

// // Register Route
// app.post("/register", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
//     const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

//     await PendingUsers.create({ email, password: hashedPassword, verificationCode, expiresAt });
//     await sendVerificationCode(email, verificationCode);

//     res.status(200).json({ message: "Verification code sent" });
//   } catch (err) {
//     res.status(500).json({ error: "Registration failed" });
//   }
// });

// // Verify Email Route
// app.post("/verify-email", async (req, res) => {
//   const { email, verificationCode } = req.body;

//   try {
//     const pendingUser = await PendingUsers.findOne({ where: { email } });

//     if (!pendingUser) {
//       return res.status(400).json({ error: "No pending registration found" });
//     }

//     if (
//       pendingUser.verificationCode !== verificationCode ||
//       new Date() > new Date(pendingUser.expiresAt)
//     ) {
//       return res.status(400).json({ error: "Invalid or expired verification code" });
//     }

//     const newUser = await User.create({
//       email: pendingUser.email,
//       password: pendingUser.password,
//       isVerified: true
//     });

//     await PendingUsers.destroy({ where: { email } });

//     res.status(200).json({ message: "User verified and registered", user: newUser });
//   } catch (err) {
//     res.status(500).json({ error: "Verification failed" });
//   }
// });

// // Resend Verification Code Route
// app.post("/resend-verification", async (req, res) => {
//   const { email } = req.body;

//   try {
//     const pendingUser = await PendingUsers.findOne({ where: { email } });

//     if (!pendingUser) {
//       return res.status(400).json({ error: "No pending registration found" });
//     }

//     const newVerificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
//     const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

//     pendingUser.verificationCode = newVerificationCode;
//     pendingUser.expiresAt = newExpiresAt;
//     await pendingUser.save();

//     await sendVerificationCode(email, newVerificationCode);

//     res.status(200).json({ message: "Verification code resent" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to resend verification code" });
//   }
// });
// const jwt = require("jsonwebtoken");
// const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key";

// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     if (!user.isVerified) {
//       return res.status(403).json({ message: "Please verify your email first" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       SECRET_KEY,
//       { expiresIn: "1h" }
//     );

//     res.status(200).json({ token });
//   } catch (err) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // Create (Save) a new calculation
// app.post("/calculations", async (req, res) => {
//   const { num1, num2, operation } = req.body;
//   if (!req.user || !req.user.id) {
//     return res.status(400).json({ error: "User not authenticated" });
//   }
//   const userId = req.user.id;

//   try {
//     const result = performCalculation(Number(num1), Number(num2), operation);
//     const calculation = await Calculation.create({ 
//       userId, 
//       number1: num1, 
//       number2: num2, 
//       operation, 
//       result 
//     });
//     res.status(201).json({ calculation, result });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });
// // Read (Get) all calculations for a user
// app.get("/calculations", async (req, res) => {
//   // Check if req.user exists and has the id property
//   if (!req.user || !req.user.id) {
//     return res.status(400).json({ error: "User not authenticated" });
//   }

//   const userId = req.user.id;

//   try {
//     const calculations = await Calculation.findAll({
//       where: { userId },
//       order: [["createdAt", "DESC"]]
//     });

//     // Check if there are no calculations for the user
//     if (calculations.length === 0) {
//       return res.status(200).json({ message: "No calculations found for this user" });
//     }

//     res.status(200).json(calculations);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update an existing calculation
// app.put("/calculations/:id", async (req, res) => {
//   const { id } = req.params;
//   const { num1, num2, operation } = req.body;
//   const userId = req.user.id;

//   try {
//     const calculation = await Calculation.findOne({ where: { id, userId } });
//     if (!calculation) {
//       return res.status(404).json({ error: "Calculation not found" });
//     }

//     const result = performCalculation(Number(num1), Number(num2), operation);
//     calculation.number1 = num1;
//     calculation.number2 = num2;
//     calculation.operation = operation;
//     calculation.result = result;
//     await calculation.save();

//     res.status(200).json(calculation);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Delete a calculation
// app.delete("/calculations/:id", async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user.id;

//   try {
//     const result = await Calculation.destroy({ where: { id, userId } });
//     if (result === 0) {
//       return res.status(404).json({ error: "Calculation not found" });
//     }
//     res.status(200).json({ message: "Calculation deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });



// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });
