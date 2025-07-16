import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import fs from "fs/promises";

const PORT = 3000;
const MODEL = "gemini-2.5-flash";
const app = express();

dotenv.config();
app.use(express.json());

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ dest: "uploads/" });

app.listen(PORT, () => {
  console.log(`Gemini API server is running at http://localhost:${PORT}`);
});

app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;

  try {
    const result = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    res.json({ output: result.text });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
  const { prompt } = req.body;
  try {
    const buffer = await fs.readFile(req.file.path);
    const base64Image = buffer.toString("base64");

    const result = await genAI.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: req.file.mimetype,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    res.json({ output: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});
