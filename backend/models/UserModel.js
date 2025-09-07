import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true, // Firebase UID
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

    theme: {
      type: String,
      enum: ["theme1", "theme2", "theme3", "theme4"],
      default: "theme1",
    },
    stripeCustomerId: {
      type: String,
      default: null, // set after first checkout
    },
    subscriptionId: {
      type: String,
      default: null, // set after checkout.session.completed webhook
    },
    membership: {
      isMember: {
        type: Boolean,
        default: false,
      },
      plan: {
        type: String,
        default: null, // e.g. "monthly"
      },
      currentPeriodEnd: {
        type: Date,
        default: null, // subscription expiry date
      },
      points: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;
