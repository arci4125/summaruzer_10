const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

// In a Cloud Run environment, process.env.API_KEY will be set in the service configuration.
// The server will fail to make API calls if it's not set.
if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. The server will not be able to connect to the Gemini API.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const app = express();

// Use a larger request body limit to handle base64 encoded images from file uploads.
app.use(express.json({ limit: '50mb' }));

// For production, you should configure CORS more securely, for example:
// app.use(cors({ origin: 'https://your-frontend-domain.com' }));
app.use(cors());

const systemInstructions = {
  summary: `You are a highly skilled records officer's assistant. Your primary function is to create a concise, professional, and neutral summary of the provided document. 
The summary must capture the key points, main arguments, decisions made, and any conclusions or action items. 
The output should be clear and easily understandable, suitable for use as an official attachment when transmitting or forwarding the document to other departments or stakeholders.
Focus on factual information and maintain an objective tone. Avoid adding personal opinions or information not present in the original text.`,
  briefingNote: `You are an expert policy analyst. Your task is to create a formal and structured briefing note based on the provided document.
The output must be well-organized and include the following distinct sections, clearly marked with markdown headings:
1.  PURPOSE: A single, concise sentence explaining why this note is being written.
2.  BACKGROUND: Provide essential context, history, and any relevant prior information.
3.  KEY FINDINGS / CURRENT STATUS: Detail the most critical information, data, and the current state of affairs as described in the document. Use bullet points for clarity if needed.
4.  RECOMMENDATIONS / NEXT STEPS: Outline any actionable recommendations or the logical next steps suggested or implied by the document.
Maintain a formal, objective, and analytical tone throughout.`,
  transmittalNote: `You are a professional administrative assistant. Your task is to draft a formal transmittal note (or cover letter) for the provided document.
The note should be polite, concise, and professional. It must clearly state that a document is being forwarded for the recipient's information, review, approval, or action, as appropriate from the context.
Use professional formatting and include placeholders like [Recipient Name/Department], [Sender Name/Department], and [Date]. The tone must be formal and suitable for official correspondence.
Example structure:
DATE: [Date]
TO:[Recipient Name/Department]
FROM: [Sender Name/Department]
SUBJECT: Transmittal of: [Infer Document Title or Subject]

This note is to forward the attached document for your review and consideration. Please let us know if you require any further information.

Thank you.`
};

app.post('/api/generate', async (req, res) => {
    try {
        const { documentContent, outputType } = req.body;

        if (!documentContent || !outputType) {
            return res.status(400).json({ error: 'Missing documentContent or outputType in the request body.' });
        }
        
        const systemInstruction = systemInstructions[outputType];
        if (!systemInstruction) {
             return res.status(400).json({ error: `Invalid outputType: ${outputType}` });
        }
        
        let requestContents;
        if (typeof documentContent === 'string') {
            const prompt = `Please generate a ${outputType.replace(/([A-Z])/g, ' $1').toLowerCase()} for the following document:\n\n---\n${documentContent}\n---`;
            requestContents = prompt;
        } else if (Array.isArray(documentContent)) {
            const promptPart = {
                text: `This document is composed of one or more pages as images. First, perform OCR to extract all text from these images in order. Then, using the extracted text, generate a ${outputType.replace(/([A-Z])/g, ' $1').toLowerCase()}.`
            };
            const imageParts = documentContent.map(img => ({
                inlineData: {
                    mimeType: img.mimeType,
                    data: img.data
                }
            }));
            requestContents = { parts: [promptPart, ...imageParts] };
        } else {
             return res.status(400).json({ error: 'Invalid format for documentContent.' });
        }

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: requestContents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.25, 
            topK: 32,
            topP: 0.9,
          },
        });
        
        // Send back the generated text in a JSON object
        res.json({ text: response.text });

    } catch (error) {
        console.error(`Error in /api/generate endpoint:`, error);
        res.status(500).json({ error: 'Failed to generate content due to an internal server error.' });
    }
});

// Cloud Run provides the PORT environment variable
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
