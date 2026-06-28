const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.json({
        message: 'ResumeIQ Backend Running'
    });
});

app.post('/api/analyze', upload.single('resume'), async (req, res) => {
    try {
        console.log(req.file);
        console.log("STEP 1");

        let text = '';

        const role = req.body.role || 'fullstack';

        console.log('ROLE:', role);

        // Text Mode
        if (!req.file) {
            text = (req.body.resumeText || '').toLowerCase();
        }
        // PDF Mode
        else {
            const dataBuffer = fs.readFileSync(req.file.path);
            console.log("STEP 2");

            const pdfData = await pdfParse(dataBuffer);
            console.log("STEP 3");

            text = pdfData.text.toLowerCase();
        }

        console.log("STEP 4");
        console.log(text.substring(0, 200));
        const resumeKeywords = [
            'education',
            'experience',
            'skills',
            'project',
            'email',
            'phone'
        ];

        let resumeMatches = 0;

        resumeKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                resumeMatches++;
            }
        });

        if (resumeMatches < 2) {
            return res.json({
                success: false,
                message: 'This does not appear to be a resume.'
            });
        }

        let score = 0;

        let desiredSkills = [];

        if (role === 'frontend') {
            desiredSkills = [
                'html',
                'css',
                'javascript',
                'react',
                'typescript'
            ];
        }
        else if (role === 'backend') {
            desiredSkills = [
                'node',
                'express',
                'mongodb',
                'api',
                'docker'
            ];
        }
        else {
            desiredSkills = [
                'html',
                'css',
                'javascript',
                'react',
                'node',
                'express',
                'mongodb',
                'api'
            ];
        }

        let missingSkills = [];
        let foundSkills = [];
        let recommendations = [];


        desiredSkills.forEach(skill => {
            if (text.includes(skill)) {
                score += Math.floor(100 / desiredSkills.length);
                foundSkills.push(skill);
            }
        });
        desiredSkills.forEach(skill => {
            if (!text.includes(skill)) {
                missingSkills.push(skill);
            }
        });
        missingSkills.forEach(skill => {

            switch (skill) {

                case 'typescript':
                    recommendations.push('Learn TypeScript and build at least one project using it.');
                    break;

                case 'docker':
                    recommendations.push('Learn Docker to improve deployment and DevOps skills.');
                    break;

                case 'node':
                    recommendations.push('Create a backend project using Node.js.');
                    break;

                case 'express':
                    recommendations.push('Build REST APIs with Express.js.');
                    break;

                case 'mongodb':
                    recommendations.push('Add MongoDB database experience to your resume.');
                    break;

                case 'react':
                    recommendations.push('Develop a React project to strengthen your frontend profile.');
                    break;

                case 'html':
                    recommendations.push('Improve your HTML fundamentals.');
                    break;

                case 'css':
                    recommendations.push('Practice responsive CSS layouts.');
                    break;

                case 'javascript':
                    recommendations.push('Strengthen your JavaScript problem-solving skills.');
                    break;

                case 'api':
                    recommendations.push('Mention REST API development or API integration projects.');
                    break;
            }

        });
        if (score > 100) score = 100;

        res.json({
            success: true,
            role,
            score,
            foundSkills,
            missingSkills,
            recommendations,
            textLength: text.length,
            preview: text.substring(0, 500)
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: 'PDF parsing failed'
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
