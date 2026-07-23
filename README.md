# 🚀 ResumeIQ | AI-Powered ATS Optimization Engine

![ResumeIQ Dashboard Preview](https://via.placeholder.com/1000x500.png?text=ResumeIQ+Dashboard+-+AI+Resume+Analyzer) 
*(Note: Replace the URL above with a real screenshot of your deployed app)*

**ResumeIQ** is a full-stack SaaS application designed to help software engineers optimize their resumes for modern Applicant Tracking Systems (ATS). By leveraging Google's advanced **Gemini 3.5 Flash** model, the platform acts as a strict, objective technical recruiter—providing instant scoring, keyword gap analysis, and tailored bullet-point recommendations.

## ✨ Enterprise-Grade Features

* **🧠 Smart Document Guardrails:** The AI context engine actively evaluates document validity, automatically rejecting non-resume files (journals, essays, tax forms) before running intensive ATS calculations.
* **🛡️ Secure File Processing:** Robust backend middleware (Multer) strictly enforces 5MB file limits and PDF-only MIME types, protecting the server from memory bloat and malicious payloads.
* **📊 Strict ATS Scoring (0-100):** Calculates an objective match score based on a targeted engineering role (Frontend, Backend, Full Stack).
* **🔍 Keyword Gap Analysis:** Extracts explicit technical skills present in the document and cross-references them against industry-standard requirements to identify critical missing buzzwords.
* **💡 Actionable AI Directives:** Generates 3 to 5 highly specific, line-by-line recommendations to make experience bullet points more metric-driven and impactful.
* **🧹 Zero-Footprint Architecture:** Temporary files are instantly unlinked and wiped from the server via Node's `fs` module immediately after PDF text extraction.

## 💻 Tech Stack

**Frontend:**
* React.js
* Tailwind CSS (Sleek, modern, responsive UI)
* Deployed on Vercel

**Backend:**
* Node.js & Express.js
* Multer (Secure file upload handling)
* `pdf-parse` (Buffer-to-text extraction)
* Deployed on Render

**AI / Machine Learning:**
* Google Generative AI SDK (`@google/generative-ai`)
* Model: `gemini-3.5-flash`
* Prompt Engineering with Strict JSON Response Enforcing

## 🚀 Getting Started (Local Development)

### Prerequisites
* Node.js (v18 or higher)
* A Google Gemini API Key

### 1. Clone the repository
```bash
git clone [https://github.com/yourusername/resumeiq.git](https://github.com/yourusername/resumeiq.git)
cd resumeiq
