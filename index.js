require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const PORT = 3000;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Schema & Model
const UserSchema = new mongoose.Schema({
  email_address: { type: String, required: true, unique: true },
  full_name: String,
  profile_picture_url: String,
  access_token: String,
  refresh_token: String,
  login_time: Date,
  logout_time: Date,
});

const User = mongoose.model('User', UserSchema);

// Route to save or update user and login time
app.post('/save_user_metadata', async (req, res) => {
  try {
    const { email_address, full_name, profile_picture_url, access_token, refresh_token } = req.body;
    const now = new Date();

    let user = await User.findOne({ email_address });

    if (user) {
      // Update existing user
      user.full_name = full_name;
      user.profile_picture_url = profile_picture_url;
      user.access_token = access_token;
      user.refresh_token = refresh_token;
      user.login_time = now;
      await user.save();
    } else {
      // Create new user
      user = new User({
        email_address,
        full_name,
        profile_picture_url,
        access_token,
        refresh_token,
        login_time: now
      });
      await user.save();
    }

    res.status(200).json({ message: "User metadata saved successfully", user });
  } catch (err) {
    console.error("Error saving user metadata:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to record logout time
app.post('/logout', async (req, res) => {
  try {
    const { email_address } = req.body;
    const now = new Date();

    const user = await User.findOne({ email_address });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.logout_time = now;
    await user.save();

    res.status(200).json({ message: "Logout time saved successfully", logout_time: now });
  } catch (err) {
    console.error("Error saving logout time:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});

