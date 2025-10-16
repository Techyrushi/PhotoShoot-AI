require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const app = express();
const PORT = process.env.PORT || 5000;

// ===============================
// ⚙️ CONFIGURATION
// ===============================
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));
app.use("/outputs", express.static("outputs"));

["uploads", "outputs"].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed!"), false);
  },
});

// ===============================
// 🎨 SCENE PROMPTS WITH GENDER SUPPORT
// ===============================
const SCENES = {
  studio: {
    description: "Product in a clean white studio background, soft lighting, professional e-commerce photo.",
    prompts: {
      men: "professional product photography, clean white studio background, soft lighting, sharp focus, high detail, e-commerce style, male model wearing the product, confident pose, commercial photography, high resolution, professional lighting setup",
      women: "professional product photography, clean white studio background, soft lighting, sharp focus, high detail, e-commerce style, female model wearing the product, elegant pose, commercial photography, high resolution, professional lighting setup",
      kids: "professional product photography, clean white studio background, soft lighting, sharp focus, high detail, e-commerce style, child model wearing the product, playful pose, commercial photography, high resolution, professional lighting setup"
    }
  },
  lifestyle: {
    description: "Product being used by people in a natural indoor home setting with warm light.",
    prompts: {
      men: "lifestyle product photography, natural indoor home setting, warm lighting, male model using the product, cozy atmosphere, realistic, candid moment, home environment, natural light, authentic lifestyle, high quality",
      women: "lifestyle product photography, natural indoor home setting, warm lighting, female model using the product, cozy atmosphere, realistic, candid moment, home environment, natural light, authentic lifestyle, high quality",
      kids: "lifestyle product photography, natural indoor home setting, warm lighting, child model using the product, cozy atmosphere, realistic, playful moment, home environment, natural light, authentic lifestyle, high quality"
    }
  },
  outdoor: {
    description: "Product in a bright outdoor park or travel setting, with natural daylight and greenery.",
    prompts: {
      men: "outdoor product photography, bright natural daylight, park setting, greenery, male model wearing the product, travel vibe, natural background, outdoor lifestyle, adventure feel, high resolution, professional outdoor photography",
      women: "outdoor product photography, bright natural daylight, park setting, greenery, female model wearing the product, travel vibe, natural background, outdoor lifestyle, adventure feel, high resolution, professional outdoor photography",
      kids: "outdoor product photography, bright natural daylight, park setting, greenery, child model wearing the product, travel vibe, natural background, outdoor lifestyle, playful adventure, high resolution, professional outdoor photography"
    }
  },
  creative: {
    description: "Product in an artistic, bold, colorful, creative advertising style composition.",
    prompts: {
      men: "creative advertising photography, artistic composition, bold colors, dramatic lighting, male model wearing the product, innovative, eye-catching, professional product shot, fashion photography, high-end commercial, creative styling",
      women: "creative advertising photography, artistic composition, bold colors, dramatic lighting, female model wearing the product, innovative, eye-catching, professional product shot, fashion photography, high-end commercial, creative styling",
      kids: "creative advertising photography, artistic composition, bold colors, dramatic lighting, child model wearing the product, innovative, eye-catching, professional product shot, fashion photography, high-end commercial, creative styling"
    }
  },
};

// ===============================
// 🧠 IMAGE GENERATION FUNCTION (Updated for Google GenAI SDK)
// ===============================
async function generateImageWithGoogleAI(promptText, imagePath = null) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("Google AI API key missing in .env");

  const ai = new GoogleGenAI({ apiKey });

  try {
    console.log("🔄 Sending request to Google AI...");

    let contents;
    
    if (imagePath) {
      // Read and encode the image file
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");
      
      contents = [
        {
          parts: [
            { text: promptText },
            {
              inlineData: {
                mimeType: "image/png",
                data: base64Image
              }
            }
          ]
        }
      ];
    } else {
      contents = promptText;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: contents,
    });

    console.log("✅ Response received from Google AI");

    // Process the response
    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("No response candidate returned");

    let generatedImagePath = null;

    for (const part of candidate.content.parts) {
      if (part.text) {
        console.log("📝 Text response:", part.text);
      } else if (part.inlineData) {
        // Save the generated image
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        generatedImagePath = `outputs/${Date.now()}-generated.png`;
        fs.writeFileSync(generatedImagePath, buffer);
        console.log(`✅ Image saved: ${generatedImagePath}`);
        break;
      }
    }

    if (!generatedImagePath) {
      throw new Error("No image data returned from model");
    }

    return generatedImagePath;
  } catch (err) {
    console.error("❌ Image generation failed:", err.response?.data || err.message);
    throw new Error(err.message || "Image generation failed");
  }
}

// ===============================
// 📡 ROUTES
// ===============================
app.get("/api", (req, res) => {
  res.json({
    message: "🚀 AI Photoshoot Generator (Google AI + Gemini 2.5 Flash Image)",
    status: "running",
    scenes: Object.keys(SCENES),
    endpoint: "POST /api/upload",
  });
});

app.get("/api/scenes", (req, res) => {
  res.json(
    Object.entries(SCENES).map(([id, scene]) => ({
      id,
      description: scene.description,
    }))
  );
});

app.get("/api/genders", (req, res) => {
  res.json([
    { id: "men", name: "Men", description: "Male models" },
    { id: "women", name: "Women", description: "Female models" },
    { id: "kids", name: "Kids", description: "Child models" }
  ]);
});

app.post("/api/upload", upload.single("productImage"), async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, error: "No image uploaded" });

    const sceneType = req.body.sceneType || "studio";
    const gender = req.body.gender || "men";
    const scene = SCENES[sceneType] || SCENES.studio;

    // Get the appropriate prompt based on scene and gender
    const prompt = scene.prompts?.[gender] || scene.prompts?.men || "professional product photography";

    console.log(`🎨 Generating ${sceneType} image with ${gender} model using Gemini...`);

    // Use local file path instead of URL for the Google AI SDK
    const generatedPath = await generateImageWithGoogleAI(prompt, req.file.path);

    res.json({
      success: true,
      message: "Image generated successfully",
      originalImage: `/uploads/${req.file.filename}`,
      generatedImage: `/${generatedPath}`,
      model: "gemini-2.5-flash-image",
      sceneType,
      gender,
      prompt: prompt
    });
  } catch (error) {
    console.error("❌ Upload error:", error.message);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===============================
// 🚀 START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log("✅ Ready to generate with Google AI Gemini 2.5 Flash Image");
});