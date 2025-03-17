const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Capitalized 'User' to match the imported schema
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 3000;
app.use(express.json());

// MongoDB connection string (Make sure this is your actual connection string)
const mongoURI = "mongodb+srv://zomato123:zomato123@cluster0.t2ymr.mongodb.net/backend?retryWrites=true&w=majority&appName=Cluster0";

// Middleware for handling JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for the homepage
app.get('/', async (req, res) => {
    res.send("<h2 align=center>you got it kishore</h2>");
});


// Route for user registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email!" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance and save it to the database
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.json({ message: "User Registered successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error, please try again later." });
    }
});

// Route for user login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "User not found" }); // If user doesn't exist
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" }); // If password doesn't match
        }

        // If credentials are valid, return success
        res.json({ message: "Login successful", user });
        console.log("User login successful...");

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong!", error: error.message });
    }
});

// MongoDB connection setup
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ DB connected successfully..."))
.catch(err => {
    console.error("❌ DB connection error:", err.message);
    process.exit(1); // Exit process on connection failure
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port: ${PORT}`);
});
