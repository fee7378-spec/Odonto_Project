import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

// Firebase Admin Setup
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
} catch (error) {
  console.error("Firebase Admin Init Error (expected if no credentials):", error);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini Setup
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/auth/create-user", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!admin.apps || admin.apps.length === 0) {
        return res.status(500).json({ error: "Firebase Admin not initialized" });
      }

      // Create user with a random password
      const userRecord = await admin.auth().createUser({
        email,
        displayName: name,
        password: Math.random().toString(36).slice(-12), // Placeholder password
      });

      res.json({ uid: userRecord.uid, status: 'created' });
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        return res.json({ status: 'already_exists' });
      }
      console.error("Firebase Auth Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/suggest-treatment", async (req, res) => {
    try {
      const { patientData } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Com base nos seguintes dados clínicos do paciente, sugira procedimentos odontológicos preventivos ou corretivos (limite a 3 sugestões): ${JSON.stringify(patientData)}`,
        config: {
          systemInstruction: "Você é um assistente odontológico experiente. Responda em português brasileiro de forma técnica porém acessível.",
        }
      });
      res.json({ suggestion: response.text });
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Erro ao gerar sugestão" });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
