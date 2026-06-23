/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parsing middleware
  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // AI Generation of Flashcards
  app.post("/api/generate-cards", async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic || typeof topic !== "string" || topic.trim() === "") {
        res.status(400).json({ error: "A valid topic is required" });
        return;
      }

      const client = getGeminiClient();
      const prompt = `Generate exactly 4 high-quality educational flashcards for a quiz/study deck on the topic: "${topic}". 
Each card should cover a distinct sub-concept, with a challenging question on the front, and a comprehensive, clear, and actionable answer on the back. Return the response in the exact JSON schema requested.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite educational curator and study program designer. You create precise, deeply informative flashcards to help students understand complex concepts.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "The front side of the card. A clear, direct, and thoughtful question.",
                },
                answer: {
                  type: Type.STRING,
                  description: "The back side of the card. A rich, well-explained summary or explanation that fully answers the question.",
                },
                category: {
                  type: Type.STRING,
                  description: "A short category name classifying this specific domain (e.g. 'React Reconciliation', 'Quantum Mechanics', 'Linear Regression').",
                },
              },
              required: ["question", "answer", "category"],
            },
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error("Gemini returned an empty response");
      }

      const cards = JSON.parse(text.trim());
      res.json({ cards });
    } catch (error: any) {
      console.error("Error generating flashcards via Gemini:", error);
      res.status(500).json({ 
        error: error.message || "Failed to generate AI flashcards. Please check if your GEMINI_API_KEY is configured." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
