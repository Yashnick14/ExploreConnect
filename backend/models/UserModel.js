import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
  },

  fullName: { 
    type: String, 
    required: true 
  },

  username: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },

  phoneNumber: {
    type: String,
    required: false 
  },

  role: {
    type: String,
    enum: ["user", "admin"], 
    default: "user",         
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
export default User;
