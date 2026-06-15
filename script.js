// DOM Elements
const form = document.getElementById('resume-form');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const fileNameDisplay = document.getElementById('file-name');
const resumeText = document.getElementById('resume-text');
const targetRole = document.getElementById('target-role');
const submitBtn = document.getElementById('analyze-btn');
const btnText = document.getElementById('btn-text');
const btnSpinner = document.getElementById('btn-spinner');
const errorContainer = document.getElementById('form-errors');

// --- Helper Functions ---
function showError(message) {
    errorContainer.textContent = message;
    errorContainer.hidden = false;
    // Scroll slightly so the user sees the error
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideError() {
    errorContainer.hidden = true;
    errorContainer.textContent = '';
    dropZone.classList.remove('error-state');
}

// --- Keyboard Accessibility for Drop Zone ---
dropZone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        fileInput.click();
    }
});

// --- File Upload Logic ---
dropZone.addEventListener('click', () => {
    hideError();
    fileInput.click();
});

fileInput.addEventListener('change', handleFiles);

// Drag and Drop
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
});

dropZone.addEventListener('drop', (e) => {
    hideError();
    const dt = e.dataTransfer;
    fileInput.files = dt.files; 
    handleFiles();
});

function handleFiles() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        
        // Validation: PDF only
        if (file.type !== "application/pdf") {
            fileNameDisplay.textContent = "";
            fileInput.value = ""; 
            dropZone.classList.add('error-state');
            showError("Invalid file format. Please upload a PDF file.");
            return;
        }

        // Validation: Size limit (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
            fileNameDisplay.textContent = "";
            fileInput.value = "";
            dropZone.classList.add('error-state');
            showError("File is too large. Please upload a PDF under 5MB.");
            return;
        }

        dropZone.classList.remove('error-state');
        hideError();
        fileNameDisplay.textContent = `Attached: ${file.name}`;
        resumeText.value = ''; // Auto-clear text area if file is attached
    }
}

// Clear file display if user starts typing
resumeText.addEventListener('input', () => {
    if (resumeText.value.trim().length > 0) {
        fileInput.value = "";
        fileNameDisplay.textContent = "";
        hideError();
    }
});

// Clear errors when selecting a role
targetRole.addEventListener('change', hideError);

// --- Form Submission Logic ---
form.addEventListener('submit', (e) => {
    e.preventDefault();
    hideError();

    const hasFile = fileInput.files.length > 0;
    const hasText = resumeText.value.trim().length > 0;
    const roleValue = targetRole.value;

    // Custom UI Validation
    if (!hasFile && !hasText) {
        showError("Please upload a PDF or paste your resume text to continue.");
        return;
    }

    if (!roleValue) {
        showError("Please select a target role so we can tailor the analysis.");
        targetRole.focus();
        return;
    }

    // Set Loading State
    submitBtn.disabled = true;
    btnText.textContent = "Analyzing...";
    btnSpinner.hidden = false;

    // Simulate API Call (Replace with real Fetch request)
    setTimeout(() => {
        // Reset State
        submitBtn.disabled = false;
        btnText.textContent = "Analyze Resume";
        btnSpinner.hidden = true;
        
        // Mock Success Action
        alert("Success! The frontend is ready to pass data to the AI backend.");
    }, 2000);
});