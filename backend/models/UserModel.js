import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },

    fullName: {
      type: String,
      required: true,
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
      required: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    avatar: {
      type: String,
      default: "", // store image URL or path
    },
<<<<<<< HEAD
    theme: {
      type: String,
      enum: ["theme1", "theme2", "theme3", "theme4"],
      default: "theme1",
    },
=======
>>>>>>> ceabd7b28c7de71e4eb8549276d0159b6924d407
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
