import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const PORT = 3000;
const MODEL = "gemini-2.5-flash";
const app = express();

dotenv.config();
app.use(express.json());

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
