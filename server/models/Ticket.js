
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Ticket title is required"],
      trim: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Network / Wi-Fi",
        "Software Issue",
        "Hardware Issue",
        "Login / Access",
        "Other"
      ]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open"
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", ticketSchema);
