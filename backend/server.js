const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

const { initSocket } = require("./socket");
const Product = require("./models/Product");

// Import Routes
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes");

// Load env vars
dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup Socket.io
initSocket(server);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://fresh-curator.vercel.app",
];

//Middleware older------->>>>
// const corsOptions = {
//   origin: process.env.NEXT_BASE_URL || "http://localhost:3000",
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));
// app.use(express.json());

//--- UPDATED MIDDLEWARE ---->>>>
// const corsOptions = {
//   origin: process.env.NEXT_BASE_URL || "http://localhost:3000",
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"], // CRITICAL: Allow the token header
//   credentials: true,
//   optionsSuccessStatus: 200,
// };
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like Postman, mobile apps)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked for:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());

// Connect to MongoDB
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/FreshCurator";
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("MongoDB Connected: FreshCurator");
    // Seed initial products if none exist
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        {
          name: "Red Jewel Strawberries",
          price: 4.5,
          category: "Fruits",
          description:
            "Sweet and juicy hand-picked strawberries from organic farms.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDPMN8ABHjdvXBkrpmutS7TPtXG9qtXJ325t2F-z8IH55PlQG0e3sZkIglFh4eLBV4E8OJEWOOOhdVC9m94YcvZT1K_qYHHOjxtqvZaX7YjfPuuUZ7lD89-j0lwhkz76uJ8TMOl9MEct_s9Yp3JBFI9aVSBO-yCvQjrjcUpps0YJ-IkphEHyz1-Nh6rlo3pARbwYBTn05HNsa6U_kTRHFI_0aFOEqlCQSUI7cxfVGUBt2wjJW9QEYc34KsLthfey3gZmyckkk2yNw60",
          tags: ["organic", "fruit"],
        },
        {
          name: "Sun-Ripened Bell Peppers",
          price: 2.2,
          category: "Vegetables",
          description:
            "Vibrant, crunchy peppers bursting with natural sweetness.",
          imageUrl:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCai2owf8uK6RUnZt7yNBpcZYRSH26IdeKELgtTj42XQ4G_5Y4bjFtZHVYoU1Y7BG4IQwTxs0ff2FHX9Vdg-dM8l_0OpHxYaikToml8ZDXmP03TIPBXFTI93kNrafABpFnzitbAvmBhBEFGf9UTS52v4ZjF0A19FdZdCgR7vgcNxwxmFTK8435xA3ojwg462w1DIbFQ6xxzArl6SLsEoCe2FstHqUEE4ScRrkHJHIKaQLejLzfpRDsLL0eKkpOdrQpCIe3shxrFhR3_",
          tags: ["fresh", "vegetable"],
        },
        {
          name: "Farm Fresh Milk",
          price: 1.8,
          category: "Dairy",
          description:
            "Pure whole milk from grass-fed cows, delivered fresh daily.",
          imageUrl:
            "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80",
          tags: ["dairy", "fresh"],
        },
        {
          name: "Organic Spinach",
          price: 3.2,
          category: "Vegetables",
          description: "Tender baby spinach leaves, washed and ready to eat.",
          imageUrl:
            "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80",
          tags: ["organic", "leafy", "vegetable"],
        },
        {
          name: "Alphonso Mangoes",
          price: 6.5,
          category: "Fruits",
          description:
            "The king of mangoes — rich, creamy, and intensely fragrant.",
          imageUrl:
            "https://images.unsplash.com/photo-1519096845289-95806ee03a1a?w=400&q=80",
          tags: ["seasonal", "fruit"],
        },
        {
          name: "Greek Yogurt",
          price: 2.9,
          category: "Dairy",
          description:
            "Thick, protein-rich yogurt made from whole organic milk.",
          imageUrl:
            "https://images.unsplash.com/photo-1488477181228-9ba5ece7b1cf?w=400&q=80",
          tags: ["dairy", "protein"],
        },
        {
          name: "Heirloom Tomatoes",
          price: 3.75,
          category: "Vegetables",
          description: "Rare, colorful tomatoes with complex, rich flavor.",
          imageUrl:
            "https://images.unsplash.com/photo-1561136594-7f68813f8f36?w=400&q=80",
          tags: ["organic", "vegetable"],
        },
        {
          name: "Wild Blueberries",
          price: 5.0,
          category: "Fruits",
          description:
            "Smaller and more flavorful than farmed berries, packed with antioxidants.",
          imageUrl:
            "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&q=80",
          tags: ["superfood", "fruit"],
        },
      ]);
      console.log("Seeded initial products.");
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "FreshCurator API Running", version: "2.0.1 Modular" });
});

// ─── ROUTE MOUNTING ──────────────────────────────────────────────────────────
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", userRoutes);
app.use("/api/ai", aiRoutes);

// ─── EMAIL TEST ───────────────────────────────────────────────────────────────
app.get("/api/test-email", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL, pass: process.env.PASS },
    });
    const info = await transporter.sendMail({
      from: `"FreshCurator System" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      subject: "Test Email from FreshCurator Backend",
      html: "<b>Nodemailer setup works!</b>",
    });
    res.json({ message: "Email sent!", messageId: info.messageId });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to send test email", details: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 FreshCurator backend running on http://localhost:${PORT}`);
  console.log("Socket.io is listening.");
  if (process.env.GEMINI_API_KEY) {
    console.log("Gemini API initialized successfully.");
  } else {
    console.warn("Gemini API Key missing.");
  }
});
