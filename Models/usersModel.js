const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, '請輸入您的名字'],
  },
  email: {
    type: String,
    required: [true, '請輸入您的 Email'],
    unique: true,
    lowercase: true,
    select: false,
  },
  photo: String,
  sex: {
    type: String,
    enum: ['male', 'female'],
  },
  password: {
    type: String,
    required: [true, '請輸入密碼'],
    minlength: 4,
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    select: false,
  },
});
// User
const User = mongoose.model('user', userSchema);

module.exports = User;
