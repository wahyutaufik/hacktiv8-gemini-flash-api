import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import multer from "multer";

const PORT = 3000;
const MODEL = "gemini-2.5-flash";
const DIR = "uploads/";

const app = express();

dotenv.config();
app.use(express.json());

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ dest: DIR });

app.listen(PORT, () => {
  console.log(`Gemini API server is running at http://localhost:${PORT}`);
});

const imageToGenerativePart = (filePath, mimeType) => ({
  inlineData: {
    data: fs.readFileSync(filePath).toString("base64"),
    mimeType,
  },
});

const generateContentWithFile = (filePart, prompt) => {
  return genAI.models.generateContent({
    model: MODEL,
    contents: [
      {
        parts: [
          filePart,
          {
            text: prompt,
          },
        ],
      },
    ],
  });
};

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
  const { path, mimetype } = req.file;

  try {
    const imagePart = imageToGenerativePart(path, mimetype);

    const result = await generateContentWithFile(imagePart, prompt);

    res.json({ output: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(path);
  }
});

app.post(
  "/generate-from-document",
  upload.single("document"),
  async (req, res) => {
    const prompt = "Analyze this document:";
    const { path, mimetype } = req.file;

    try {
      const documentPart = imageToGenerativePart(path, mimetype);

      const result = await generateContentWithFile(documentPart, prompt);

      res.json({ output: result.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
    } finally {
      fs.unlinkSync(path);
    }
  }
);

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
  const prompt = "Transcribe or analyze the following audio:";
  const { path, mimetype } = req.file;

  try {
    const audioPart = imageToGenerativePart(path, mimetype);

    const result = await generateContentWithFile(audioPart, prompt);

    res.json({ output: result.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  } finally {
    fs.unlinkSync(path);
  }
});
