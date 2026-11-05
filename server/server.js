const authMiddleware = require("./middleware/authMiddleware");
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
  }

  next();
};
const authRoutes = require("./routes/authRoutes");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const Ticket = require("./models/Ticket");

const app = express();
const PORT = process.env.PORT || 5000;
// Gemini AI configuration
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
// FAST AI RESPONSE HELPER
async function generateFastAI(prompt, maxOutputTokens = 120) {
  return await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      temperature: 0.2,
      maxOutputTokens
    }
  });
}
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HelpFlow AI backend is running!"
  });
});
app.use("/api/tickets", authMiddleware);
// GET all tickets
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch tickets"
    });
  }
});

// CREATE a ticket
app.post("/api/tickets", async (req, res) => {
  try {
    const { title, category, description } = req.body;

    const ticket = await Ticket.create({
      title,
      category,
      description
    });

    res.status(201).json({
      success: true,
      message: "Ticket created successfully",
      data: ticket
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create ticket"
    });
  }
});

 // UPDATE ticket status
 console.log("PATCH ROUTE REGISTERED");
app.patch("/api/tickets/:id/status", async (req, res) => {
  console.log("PATCH REQUEST RECEIVED", req.params.id, req.body);
  try {
    const { status } = req.body;

    const allowedStatuses = ["Open", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update ticket status"
    });
  }
});

// UPDATE ticket priority
app.patch("/api/tickets/:id/priority", async (req, res) => {
  try {
    const { priority } = req.body;

    const allowedPriorities = ["Low", "Medium", "High"];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority"
      });
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { priority },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket priority updated successfully",
      data: ticket
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update ticket priority"
    });
  }
});
// Delete a ticket
app.delete("/api/tickets/:id", requireAdmin, async (req, res) => {
  try {
    const deletedTicket = await Ticket.findByIdAndDelete(req.params.id);

    if (!deletedTicket) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Ticket deleted successfully",
      data: deletedTicket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete ticket",
    });
  }
});
// AI TICKET CATEGORY PREDICTION
app.post("/api/ai/predict-category", async (req, res) => {
  try {
    const { title, description } = req.body;
    console.log("AI PRIORITY ROUTE HIT");

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    const prompt = `
You are an IT helpdesk ticket classification assistant.

Analyze the following IT issue:

Title: ${title}
Description: ${description}

Choose exactly ONE category from this list:
- Network / Wi-Fi
- Software Issue
- Hardware Issue
- Login / Access
- Other

Return ONLY the category name.
Do not provide explanations.
`;

  const result = await generateFastAI(prompt, 20);

const predictedCategory = result.text.trim();

    const allowedCategories = [
      "Network / Wi-Fi",
      "Software Issue",
      "Hardware Issue",
      "Login / Access",
      "Other"
    ];

    if (!allowedCategories.includes(predictedCategory)) {
      return res.status(422).json({
        success: false,
        message: "AI returned an invalid category"
      });
    }

    res.status(200).json({
      success: true,
      message: "Category predicted successfully",
      data: {
        category: predictedCategory
      }
    });

  } catch (error) {
    console.error("AI Category Prediction Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI category prediction failed"
    });
  }
});
// AI TROUBLESHOOTING SUGGESTIONS
app.post("/api/ai/troubleshoot", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    const prompt = `
You are an experienced IT helpdesk support assistant.

Analyze this technical issue:

Title: ${title}
Description: ${description}

Provide 5 practical troubleshooting steps to help resolve this issue.

Rules:
- Give simple, clear instructions.
- Number each step from 1 to 5.
- Start with basic troubleshooting.
- Do not suggest risky actions such as deleting data or changing security settings.
- If the issue cannot be resolved, recommend contacting IT support.
`;

    const result = await generateFastAI(prompt, 180);

    const suggestions = result.text.trim();

    if (!suggestions) {
      return res.status(422).json({
        success: false,
        message: "AI did not generate troubleshooting suggestions"
      });
    }

    res.status(200).json({
      success: true,
      message: "Troubleshooting suggestions generated successfully",
      data: {
        suggestions
      }
    });

  } catch (error) {
    console.error("AI Troubleshooting Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI troubleshooting failed"
    });
  }
});

// AI-GENERATED RESOLUTION SUMMARY
app.post("/api/ai/resolution-summary", async (req, res) => {
  try {
    const { title, description, resolutionNotes } = req.body;

    if (!title || !description || !resolutionNotes) {
      return res.status(400).json({
        success: false,
        message: "Title, description and resolution notes are required"
      });
    }

    const prompt = `
You are an IT helpdesk documentation assistant.

Create a concise resolution summary for this ticket.

Issue Title: ${title}
Issue Description: ${description}
Actual Resolution Notes: ${resolutionNotes}

Rules:
- Summarize only the actions mentioned in the resolution notes.
- Do not invent steps or claim success unless the notes confirm it.
- Use clear, professional language.
- Keep the summary within 3-5 sentences.
`;

    const result = await generateFastAI(prompt, 100);

    const summary = result.text.trim();

    if (!summary) {
      return res.status(422).json({
        success: false,
        message: "AI did not generate a resolution summary"
      });
    }

    res.status(200).json({
      success: true,
      message: "Resolution summary generated successfully",
      data: {
        summary
      }
    });

  } catch (error) {
    console.error("AI Resolution Summary Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI resolution summary generation failed"
    });
  }
});

// Connect database and start server
// AI TICKET PRIORITY PREDICTION
app.post("/api/ai/predict-priority", async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required"
      });
    }

    const prompt = `
You are an IT helpdesk priority assessment assistant.

Analyze this IT issue:

Title: ${title}
Description: ${description}

Choose exactly ONE priority:
- Low: Minor issue with little impact.
- Medium: Issue affecting normal work but with a workaround.
- High: Critical issue causing major disruption or blocking important work.

Return ONLY one word: Low, Medium, or High.
Do not provide explanations.
`;

    const result = await generateFastAI(prompt, 20);

    const predictedPriority = result.text.trim();

    const allowedPriorities = ["Low", "Medium", "High"];

    if (!allowedPriorities.includes(predictedPriority)) {
      return res.status(422).json({
        success: false,
        message: "AI returned an invalid priority"
      });
    }

    res.status(200).json({
      success: true,
      message: "Priority predicted successfully",
      data: {
        priority: predictedPriority
      }
    });

  } catch (error) {
    console.error("AI Priority Prediction Error:", error.message);

    res.status(500).json({
      success: false,
      message: "AI priority prediction failed"
    });
  }
});
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();
