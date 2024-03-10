const express = require("express");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const routes = require("./routes/transactionRoutes");
const authRoutes = require("./routes/authRoutes");
const authenticateJWT = require("./middleware/authMiddleware");
const cors = require("cors"); 
const dotenv = require("dotenv"); 
dotenv.config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Use bodyParser for urlencoded data
app.use(cors());

// MongoDB setup
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) =>
    console.error("Connection to MongoDB failed:", err)
  );

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
});
app.use(limiter);

// Routes
app.use("/auth", authRoutes);
app.use(authenticateJWT); 
app.use("/transactions", routes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
