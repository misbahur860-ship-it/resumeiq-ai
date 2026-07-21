require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
// Fix: We removed the broken SchemaType import from this line
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Lock down CORS to only accept requests from your Vercel frontend
// IMPORTANT: Replace the URL below with your actual live Vercel link!
// Lock down CORS to only accept requests from your Vercel frontend
app.use(cors({
    origin: ['http://localhost:5173', 'https://resumeiq-ai-gamma.vercel.app']
}));
app.use(express.json());

// Secure Multer: Limit to 5MB and explicitly only allow PDFs
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max size
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
        }
    }
});
// Initialize Gemini safely using your environment secret
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/', (req, res) => {
    res.json({
        message: 'ResumeIQ Backend Running'
    });
});
// Fix: We use raw uppercase strings instead of SchemaType to define the JSON structure
const responseSchema = {
    type: "OBJECT",
    properties: {
        score: { 
            type: "INTEGER", 
            description: "Strict ATS comparison score from 0 to 100 based on matching target requirements." 
        },
        foundSkills: { 
            type: "ARRAY", 
            items: { type: "STRING" }, 
            description: "Technical skills, frameworks, and tools present in the resume matching the role." 
        },
        missingSkills: { 
            type: "ARRAY", 
            items: { type: "STRING" }, 
            description: "Core missing technologies, industry skills, or key buzzwords required for the role." 
        },
        recommendations: { 
            type: "ARRAY", 
            items: { type: "STRING" }, 
            description: "3 to 5 highly specific recruiter tips highlighting project enhancements or metric modifications." 
        }
    },
    required: ["score", "foundSkills", "missingSkills", "recommendations"]
};

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
    try {
        console.log(req.file);
        console.log("STEP 1");

        let text = '';
        const role = req.body.role || 'fullstack';
        console.log('ROLE:', role);

        // Text Mode
        if (!req.file) {
            text = req.body.resumeText || '';
        }
        // PDF Mode
        else {
            const dataBuffer = fs.readFileSync(req.file.path);
            console.log("STEP 2");

            const pdfData = await pdfParse(dataBuffer);
            console.log("STEP 3");

            text = pdfData.text;

            // Render Cleanup: Remove the temp file immediately after reading to safeguard storage limits
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
                console.error("Temp file removal skipped:", unlinkErr);
            }
        }

        console.log("STEP 4");
        
        if (!text || text.trim() === "") {
            return res.json({
                success: false,
                message: 'No text details could be gathered. Please paste text or check your PDF.'
            });
        }

        console.log(`Initiating Gemini Analysis for engineering path: ${role}...`);

        // Set up the high-speed Gemini 1.5 Flash model with explicit JSON schemas
        const model = genAI.getGenerativeModel({
            model: "gemini-3.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            }
        });

        const prompt = `
            You are an advanced technical recruiter and a strict, objective Applicant Tracking System (ATS).
            Evaluate this developer resume against the specific career target profile: "${role}".
            
            CRITICAL INSTRUCTIONS FOR KEYWORDS:
            1. "foundSkills": Extract ONLY technical skills explicitly written in the resume text. Do not invent skills.
            2. "missingSkills": Identify core technologies typically required for a "${role}" that are ABSOLUTELY NOT present in the text. You MUST double-check the resume text. If a skill (e.g., Docker, AWS, PostgreSQL) is mentioned ANYWHERE in the resume, DO NOT put it in missingSkills.

            Scan technical skills, frame evaluation strictly on standard job criteria, verify metric impact statements, and format structural evaluations.
            Determine an accurate overall score out of 100, catalogue explicit technical tools found, reveal the key technical gaps missing, and map distinct improvement directives.

            Resume Content:
            ${text}
        `;

        const result = await model.generateContent(prompt);
        const geminiResponse = JSON.parse(result.response.text());

        // Return clean results mapped to your exact UI components
        res.json({
            success: true,
            role,
            score: geminiResponse.score,
            foundSkills: geminiResponse.foundSkills,
            missingSkills: geminiResponse.missingSkills,
            recommendations: geminiResponse.recommendations,
            textLength: text.length,
            preview: text.substring(0, 500)
        });

    } catch (err) {
        console.error("AI Analysis Engine Error:", err);

        res.status(500).json({
            success: false,
            message: 'AI resume evaluation process encountered an issue. Please try again.'
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
