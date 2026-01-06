// Global variables
let currentLanguage = 'en';
let quillEditors = {};
let logoBase64 = '';

// Cookie utility functions
function setCookie(name, value, days = 365) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Save form data to cookie
function saveFormDataToCookie() {
    try {
        const formData = {
            studentName: document.getElementById('studentName').value || '',
            subject: document.getElementById('subject').value || '',
            classGrade: document.getElementById('classGrade').value || '',
            reportTitle: document.getElementById('reportTitle').value || '',
            reportDate: document.getElementById('reportDate').value || '',
            teacherName: document.getElementById('teacherName').value || '',
            section1: quillEditors.section1 ? quillEditors.section1.root.innerHTML : '',
            section2: quillEditors.section2 ? quillEditors.section2.root.innerHTML : '',
            section3: quillEditors.section3 ? quillEditors.section3.root.innerHTML : '',
            section4: quillEditors.section4 ? quillEditors.section4.root.innerHTML : '',
            language: currentLanguage
        };
        
        const jsonData = JSON.stringify(formData);
        setCookie('reportFormData', jsonData, 365); // Store for 1 year
    } catch (error) {
        console.warn('Failed to save form data to cookie:', error);
    }
}

// Load form data from cookie
function loadFormDataFromCookie() {
    try {
        const cookieData = getCookie('reportFormData');
        if (!cookieData) return false;
        
        const formData = JSON.parse(cookieData);
        
        // Restore input fields
        if (formData.studentName) document.getElementById('studentName').value = formData.studentName;
        if (formData.subject) document.getElementById('subject').value = formData.subject;
        if (formData.classGrade) document.getElementById('classGrade').value = formData.classGrade;
        if (formData.reportTitle) document.getElementById('reportTitle').value = formData.reportTitle;
        if (formData.reportDate) document.getElementById('reportDate').value = formData.reportDate;
        if (formData.teacherName) document.getElementById('teacherName').value = formData.teacherName;
        
        // Restore Quill editor content (only if editors are initialized)
        if (quillEditors.section1 && formData.section1) {
            quillEditors.section1.root.innerHTML = formData.section1;
        }
        if (quillEditors.section2 && formData.section2) {
            quillEditors.section2.root.innerHTML = formData.section2;
        }
        if (quillEditors.section3 && formData.section3) {
            quillEditors.section3.root.innerHTML = formData.section3;
        }
        if (quillEditors.section4 && formData.section4) {
            quillEditors.section4.root.innerHTML = formData.section4;
        }
        
        // Restore language (do this last to avoid triggering unnecessary updates)
        if (formData.language && formData.language !== currentLanguage) {
            currentLanguage = formData.language;
            // Update UI without triggering save (we'll save after)
            document.querySelectorAll('.lang-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.lang === formData.language) {
                    btn.classList.add('active');
                }
            });
            // Update translatable elements
            document.querySelectorAll('[data-en][data-zh]').forEach(element => {
                const text = formData.language === 'en' ? element.dataset.en : element.dataset.zh;
                if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                    if (element.type === 'button' || element.type === 'submit') {
                        element.value = text;
                    }
                } else {
                    element.textContent = text;
                }
            });
            document.querySelectorAll('select option').forEach(option => {
                if (option.dataset.en && option.dataset.zh) {
                    option.textContent = formData.language === 'en' ? option.dataset.en : option.dataset.zh;
                }
            });
        }
        
        return true;
    } catch (error) {
        console.warn('Failed to load form data from cookie:', error);
        return false;
    }
}

// Initialize Quill editors and form
document.addEventListener('DOMContentLoaded', function() {
    initializeEditors();
    initializeForm();
    
    // Try to load data from cookie first
    const dataLoaded = loadFormDataFromCookie();
    
    if (!dataLoaded) {
        // Only set defaults if no cookie data was found
        setDefaultDate();
        setDefaultTitle();
        setDefaultSectionText();
    }
    
    loadDefaultLogo();
    updatePreview();
});

// Initialize Quill rich text editors
function initializeEditors() {
    const sections = ['section1', 'section2', 'section3', 'section4'];
    
    sections.forEach(sectionId => {
        const editor = new Quill(`#${sectionId}`, {
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['link'],
                    ['clean']
                ]
            },
            placeholder: 'Enter content here...'
        });
        
        quillEditors[sectionId] = editor;
        
        // Update preview and save to cookie on content change
        editor.on('text-change', function() {
            updatePreview();
            saveFormDataToCookie();
        });
    });
}

// Initialize form with event listeners
function initializeForm() {
    const form = document.getElementById('reportForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            updatePreview();
            saveFormDataToCookie();
        });
        input.addEventListener('change', function() {
            updatePreview();
            saveFormDataToCookie();
        });
    });
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
}

// Set default report title
function setDefaultTitle() {
    const titleField = document.getElementById('reportTitle');
    if (!titleField.value.trim()) {
        titleField.value = '學生進度報告';
        updatePreview();
    }
}

// Set default text for sections
function setDefaultSectionText() {
    const defaultTexts = {
        en: {
            section1: 'The student has shown consistent effort in their academic work. They demonstrate a good understanding of the fundamental concepts covered in class.',
            section2: 'The student displays positive behavior during class sessions. They are attentive, participate actively, and show respect towards peers and the teacher.',
            section3: 'In the next four lessons, we will focus on reinforcing key concepts, practicing problem-solving skills, and preparing for upcoming assessments.',
            section4: 'Overall, the student is making steady progress. Continued practice and engagement will help them achieve their learning goals. Action items: Complete assigned homework and review previous lessons.'
        },
        zh: {
            section1: '學生在學業方面表現出持續的努力。他們對課堂上涵蓋的基本概念有良好的理解。',
            section2: '學生在課堂上表現出積極的行為。他們專心聽講，積極參與，並對同學和老師表現出尊重。',
            section3: '在接下來的四節課中，我們將重點加強關鍵概念，練習解決問題的技能，並為即將到來的評估做準備。',
            section4: '總體而言，學生正在穩步進步。持續的練習和參與將幫助他們實現學習目標。行動項目：完成指定的作業並複習之前的課程。'
        }
    };
    
    const texts = defaultTexts[currentLanguage];
    
    // Only set default if section is empty
    if (!quillEditors.section1.root.textContent.trim()) {
        quillEditors.section1.setText(texts.section1);
    }
    if (!quillEditors.section2.root.textContent.trim()) {
        quillEditors.section2.setText(texts.section2);
    }
    if (!quillEditors.section3.root.textContent.trim()) {
        quillEditors.section3.setText(texts.section3);
    }
    if (!quillEditors.section4.root.textContent.trim()) {
        quillEditors.section4.setText(texts.section4);
    }
    
    updatePreview();
}

// Language switching
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.lang === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update all translatable elements
    document.querySelectorAll('[data-en][data-zh]').forEach(element => {
        const text = lang === 'en' ? element.dataset.en : element.dataset.zh;
        if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
            if (element.type === 'button' || element.type === 'submit') {
                element.value = text;
            }
        } else {
            element.textContent = text;
        }
    });
    
    // Update select options
    document.querySelectorAll('select option').forEach(option => {
        if (option.dataset.en && option.dataset.zh) {
            option.textContent = lang === 'en' ? option.dataset.en : option.dataset.zh;
        }
    });
    
    // Update default title if empty
    const titleField = document.getElementById('reportTitle');
    if (!titleField.value.trim()) {
        titleField.value = '學生進度報告';
    }
    
    // Update default section text when language changes
    setDefaultSectionText();
    
    // Save language preference to cookie
    saveFormDataToCookie();
    
    updatePreview();
}

// Load default logo
function loadDefaultLogo() {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        try {
            logoBase64 = canvas.toDataURL('image/png');
            updatePreview();
        } catch (error) {
            console.warn('Could not convert logo to base64, using file path instead');
            // Fallback: use file path
            logoBase64 = 'logo.png';
        }
    };
    img.onerror = function() {
        console.warn('Could not load logo.png, using file path instead');
        logoBase64 = 'logo.png';
    };
    img.src = 'logo.png';
}

// Update live preview
function updatePreview() {
    const preview = document.getElementById('livePreview');
    
    // Get form values
    const studentName = document.getElementById('studentName').value || '________';
    const subject = document.getElementById('subject').value || '________';
    const classGrade = document.getElementById('classGrade').value || '________';
    const reportTitle = document.getElementById('reportTitle').value || '________';
    const reportDate = document.getElementById('reportDate').value || new Date().toISOString().split('T')[0];
    const teacherName = document.getElementById('teacherName').value || '________';
    
    // Get section contents
    const section1 = quillEditors.section1.root.innerHTML || '<p>No content yet...</p>';
    const section2 = quillEditors.section2.root.innerHTML || '<p>No content yet...</p>';
    const section3 = quillEditors.section3.root.innerHTML || '<p>No content yet...</p>';
    const section4 = quillEditors.section4.root.innerHTML || '<p>No content yet...</p>';
    
    // Format date
    const formattedDate = reportDate ? new Date(reportDate).toLocaleDateString(
        currentLanguage === 'en' ? 'en-US' : 'zh-TW',
        { year: 'numeric', month: 'long', day: 'numeric' }
    ) : '';
    
    // Build preview HTML
    let previewHTML = `
        <div class="preview-header">
            ${logoBase64 ? `<div class="preview-logo"><img src="${logoBase64}" alt="Logo"></div>` : ''}
            <h2>${reportTitle}</h2>
            <p><strong>${currentLanguage === 'en' ? 'Date' : '日期'}:</strong> ${formattedDate}</p>
        </div>
        
        <div class="preview-info">
            <p><strong>${currentLanguage === 'en' ? 'Student Name' : '學生姓名'}:</strong> ${studentName}</p>
            <p><strong>${currentLanguage === 'en' ? 'Subject' : '科目'}:</strong> ${subject}</p>
            <p><strong>${currentLanguage === 'en' ? 'Class/Grade' : '班級/年級'}:</strong> ${classGrade}</p>
            <p><strong>${currentLanguage === 'en' ? 'Teacher' : '教師'}:</strong> ${teacherName}</p>
        </div>
        
        <h3>${currentLanguage === 'en' ? 'Section 1: Academic Performance Assessment' : '第一部分：學業表現評估'}</h3>
        <div>${section1}</div>
        
        <h3>${currentLanguage === 'en' ? 'Section 2: In-class Behavioral Performance' : '第二部分：課堂行為表現'}</h3>
        <div>${section2}</div>
        
        <h3>${currentLanguage === 'en' ? 'Section 3: Learning Plan for Next 4 Lessons' : '第三部分：未來四節課學習計劃'}</h3>
        <div>${section3}</div>
        
        <h3>${currentLanguage === 'en' ? 'Section 4: Teacher\'s Final Remarks & Action Items' : '第四部分：教師總結及行動項目'}</h3>
        <div>${section4}</div>
    `;
    
    preview.innerHTML = previewHTML;
}

// AI Enhancement function
async function enhanceWithAI(sectionId, buttonElement) {
    const editor = quillEditors[sectionId];
    const currentContent = editor.root.textContent;
    
    if (!currentContent.trim()) {
        alert(currentLanguage === 'en' 
            ? 'Please enter some content first before enhancing with AI.' 
            : '請先輸入內容，然後再使用 AI 增強。');
        return;
    }
    
    const sectionTitles = {
        'section1': currentLanguage === 'en' ? 'Academic Performance Assessment' : '學業表現評估',
        'section2': currentLanguage === 'en' ? 'In-class Behavioral Performance' : '課堂行為表現',
        'section3': currentLanguage === 'en' ? 'Learning Plan for Next 4 Lessons' : '未來四節課學習計劃',
        'section4': currentLanguage === 'en' ? 'Teacher\'s Final Remarks & Action Items' : '教師總結及行動項目'
    };
    
    const button = buttonElement || document.querySelector(`button[onclick*="${sectionId}"]`);
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> ' + (currentLanguage === 'en' ? 'Enhancing...' : '增強中...');
    
    try {
        // Use the new DeepSeek integration function
        const enhancedText = await enhanceTextWithDeepSeek(currentContent, currentLanguage);
        
        if (enhancedText) {
            // Strip any formatting that might have been returned (bold, italic, markdown, etc.)
            let plainText = enhancedText
                // Remove markdown formatting
                .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
                .replace(/\*(.*?)\*/g, '$1')      // Italic
                .replace(/__(.*?)__/g, '$1')      // Bold underscore
                .replace(/_(.*?)_/g, '$1')         // Italic underscore
                .replace(/#{1,6}\s*(.*?)$/gm, '$1') // Headers
                .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
                // Remove HTML tags if any
                .replace(/<[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .trim();
            
            // Split into paragraphs and create simple HTML
            const paragraphs = plainText
                .split(/\n\n+/)
                .map(p => p.trim())
                .filter(p => p.length > 0);
            
            const htmlContent = paragraphs.length > 0
                ? paragraphs.map(p => `<p>${p.replace(/\n/g, ' ')}</p>`).join('')
                : `<p>${plainText}</p>`;
            
            // Replace the current content with enhanced plain text content
            editor.root.innerHTML = htmlContent;
            updatePreview();
            saveFormDataToCookie(); // Save to cookie after AI enhancement
            
            alert(currentLanguage === 'en' 
                ? 'Content enhanced successfully!' 
                : '內容增強成功！');
        }
    } catch (error) {
        console.error('AI Enhancement error:', error);
        alert(currentLanguage === 'en' 
            ? `Failed to enhance content: ${error.message}` 
            : `增強內容失敗：${error.message}`);
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

/**
 * DeepSeek API Integration Function
 * Takes a text section as input and returns enhanced, professional text
 * 
 * @param {string} textSection - The text content to enhance
 * @param {string} language - 'en' for English, 'zh' for Traditional Chinese
 * @returns {Promise<string>} - Enhanced text content
 */
async function enhanceTextWithDeepSeek(textSection, language = 'en') {
    // DeepSeek API Configuration
    // Use default API key
    const API_KEY = 'sk-0fdaddd9f0db4e70821938381de23af6';
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    // Validate input
    if (!textSection || textSection.trim().length === 0) {
        throw new Error(language === 'en' 
            ? 'Text section cannot be empty' 
            : '文字內容不能為空');
    }
    
    // Build prompt based on language with word limits and plain text requirement
    const prompt = language === 'en'
        ? `As an experienced teacher, improve this student assessment section to be more professional and constructive. Write ONLY plain text (no bold, italic, underline, headers, or formatting). Keep it between 50-100 words. Original text: ${textSection}`
        : `作為一位經驗豐富的教師，請改進這段學生評估內容，使其更加專業和建設性。只寫純文字（不要粗體、斜體、底線、標題或任何格式）。保持在40-80個中文字。原文：${textSection}`;
    
    // System message based on language
    const systemMessage = language === 'en'
        ? 'You are an experienced teacher and educational assessment writer. Your task is to improve student assessment sections to be more professional, constructive, and helpful. IMPORTANT: Return ONLY plain text with no formatting (no bold, italic, underline, headers, sections, or markdown). Keep responses between 50-100 words. Maintain the original meaning while enhancing clarity, professionalism, and educational value.'
        : '你是一位經驗豐富的教師和教育評估撰寫者。你的任務是改進學生評估內容，使其更加專業、建設性和有幫助。重要：只返回純文字，不要任何格式（不要粗體、斜體、底線、標題、章節或標記）。保持在40-80個中文字。在保持原意的同時，增強清晰度、專業性和教育價值。';
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: systemMessage
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: language === 'en' ? 150 : 120, // Limit tokens for word count control
                top_p: 0.95,
                frequency_penalty: 0.3,
                presence_penalty: 0.3
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                language === 'en'
                    ? `API error (${response.status}): ${errorData.error?.message || response.statusText}`
                    : `API 錯誤 (${response.status})：${errorData.error?.message || response.statusText}`
            );
        }
        
        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            throw new Error(language === 'en' 
                ? 'Invalid response format from API' 
                : 'API 回應格式無效');
        }
        
        let enhancedText = data.choices[0].message.content.trim();
        
        if (!enhancedText) {
            throw new Error(language === 'en' 
                ? 'Empty response from API' 
                : 'API 回應為空');
        }
        
        // Strip any formatting that might have been returned
        enhancedText = enhancedText
            .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold markdown
            .replace(/\*(.*?)\*/g, '$1')      // Italic markdown
            .replace(/__(.*?)__/g, '$1')      // Bold underscore
            .replace(/_([^_]+)_/g, '$1')      // Italic underscore
            .replace(/#{1,6}\s*(.*?)$/gm, '$1') // Headers
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
            .replace(/<[^>]+>/g, '')           // HTML tags
            .trim();
        
        // Enforce word count limits
        if (language === 'en') {
            const words = enhancedText.split(/\s+/).filter(w => w.length > 0);
            if (words.length > 100) {
                // Trim to 100 words
                enhancedText = words.slice(0, 100).join(' ');
            } else if (words.length < 50 && words.length > 0) {
                // If too short, keep as is (API might have been conservative)
                // Could add a note, but for now just return
            }
        } else {
            // For Chinese, count characters (roughly 1-2 chars per word)
            const chars = enhancedText.replace(/\s+/g, '').length;
            if (chars > 160) { // 80 words * 2 chars per word
                // Trim to approximately 80 words (160 chars)
                enhancedText = enhancedText.substring(0, 160);
                // Find last complete sentence or word boundary
                const lastPeriod = enhancedText.lastIndexOf('。');
                const lastComma = enhancedText.lastIndexOf('，');
                const lastSpace = enhancedText.lastIndexOf(' ');
                const cutPoint = Math.max(lastPeriod, lastComma, lastSpace);
                if (cutPoint > 120) {
                    enhancedText = enhancedText.substring(0, cutPoint + 1);
                }
            } else if (chars < 80 && chars > 0) {
                // If too short, keep as is
            }
        }
        
        return enhancedText;
        
    } catch (error) {
        console.error('DeepSeek API error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('API error')) {
            throw new Error(
                language === 'en'
                    ? `Failed to connect to DeepSeek API: ${error.message}`
                    : `無法連接到 DeepSeek API：${error.message}`
            );
        }
        
        throw error;
    }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use enhanceTextWithDeepSeek instead
 */
async function callDeepSeekAPI(prompt) {
    // Extract text from prompt if it contains the format
    let textSection = prompt;
    if (prompt.includes('Current content:')) {
        textSection = prompt.split('Current content:')[1].trim();
    } else if (prompt.includes('當前內容：')) {
        textSection = prompt.split('當前內容：')[1].trim();
    }
    
    return await enhanceTextWithDeepSeek(textSection, currentLanguage);
}

// Clear form
function clearForm() {
    if (confirm(currentLanguage === 'en' 
        ? 'Are you sure you want to clear all form data?' 
        : '確定要清除所有表單資料嗎？')) {
        document.getElementById('reportForm').reset();
        setDefaultDate();
        
        // Clear Quill editors
        Object.values(quillEditors).forEach(editor => {
            editor.setText('');
        });
        
        // Reset logo to default
        loadDefaultLogo();
        
        // Clear cookie
        deleteCookie('reportFormData');
        
        // Set defaults again
        setDefaultTitle();
        setDefaultSectionText();
        
        updatePreview();
    }
}

// Generate Report (LaTeX/PDF)
async function generateReport(buttonElement) {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const button = buttonElement || document.querySelector('button[onclick*="generateReport"]');
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> ' + (currentLanguage === 'en' ? 'Generating...' : '生成中...');
    
    try {
        // Collect all form data
        const reportData = collectFormData();
        
        // Generate LaTeX template with all features
        const latexResult = generateLaTeXTemplate(reportData);
        
        // Download LaTeX file
        downloadFile(latexResult.latex, 'report.tex', 'text/plain');
        
        // Logo file (logo.png) should be in the same folder as report.tex
        // No need to save separately as it's already a file
        
        // Show success message with compilation instructions
        const instructions = currentLanguage === 'en'
            ? `LaTeX file generated successfully!\n\nTo compile to PDF:\n1. Use XeLaTeX compiler (required for Chinese support)\n2. Place logo.png and report.tex in the same folder in your LaTeX editor\n3. Compile using XeLaTeX\n\nOr use Overleaf.com and upload both files.`
            : `LaTeX 檔案生成成功！\n\n編譯為 PDF 的方法：\n1. 使用 XeLaTeX 編譯器（中文支援必需）\n2. 將 logo.png 和 report.tex 放在同一資料夾放入 LaTeX 編輯器\n3. 使用 XeLaTeX 編譯\n\n或使用 Overleaf.com 上傳兩個檔案。`;
        
        alert(instructions);
        
        showMessage(
            currentLanguage === 'en' 
                ? 'LaTeX file generated successfully! Make sure logo.png is in the same folder as report.tex.' 
                : 'LaTeX 檔案生成成功！請確保 logo.png 與 report.tex 在同一資料夾。',
            'success'
        );
        
    } catch (error) {
        console.error('Report generation error:', error);
        showMessage(
            currentLanguage === 'en' 
                ? `Failed to generate report: ${error.message}` 
                : `生成報告失敗：${error.message}`,
            'error'
        );
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

/**
 * Generate PDF using jsPDF
 * Creates a professional PDF document with proper styling
 */
async function generatePDF(buttonElement) {
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    const button = buttonElement || document.querySelector('button[onclick*="generatePDF"]');
    const originalText = button.textContent;
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> ' + (currentLanguage === 'en' ? 'Generating PDF...' : '生成 PDF 中...');
    
    try {
        // Collect all form data
        const reportData = collectFormData();
        
        // Generate PDF
        await createPDFDocument(reportData);
        
        showMessage(
            currentLanguage === 'en' 
                ? 'PDF generated and downloaded successfully!' 
                : 'PDF 生成並下載成功！',
            'success'
        );
        
    } catch (error) {
        console.error('PDF generation error:', error);
        showMessage(
            currentLanguage === 'en' 
                ? `Failed to generate PDF: ${error.message}` 
                : `生成 PDF 失敗：${error.message}`,
            'error'
        );
    } finally {
        button.disabled = false;
        button.textContent = originalText;
    }
}

/**
 * Create PDF Document with jsPDF
 * Uses html2canvas for Chinese character support
 * @param {Object} data - Form data object
 */
async function createPDFDocument(data) {
    const { jsPDF } = window.jspdf;
    
    // Format date
    const formattedDate = new Date(data.reportDate).toLocaleDateString(
        data.language === 'en' ? 'en-US' : 'zh-TW',
        { year: 'numeric', month: 'long', day: 'numeric' }
    );
    
    // Create a temporary container for PDF rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '210mm'; // A4 width
    tempContainer.style.padding = '20mm';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.fontFamily = data.language === 'zh' ? 'Microsoft JhengHei, Arial, sans-serif' : 'Arial, sans-serif';
    document.body.appendChild(tempContainer);
    
    try {
        // Build HTML content for PDF
        let htmlContent = `
            <div style="text-align: center; margin-bottom: 20px;">
                ${data.logo ? `<img src="${data.logo}" style="max-width: 40mm; max-height: 40mm; margin-bottom: 10px;" />` : ''}
                <h1 style="color: #1e40af; font-size: 24pt; margin: 10px 0;">${escapeHtml(data.reportTitle)}</h1>
                <p style="color: #666; font-size: 12pt; margin: 5px 0;">${data.language === 'en' ? 'Date: ' : '日期：'}${formattedDate}</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                <h2 style="color: #1e40af; font-size: 14pt; text-align: center; margin: 0 0 10px 0;">${data.language === 'en' ? 'Student Information' : '學生資料'}</h2>
                <div style="font-size: 11pt; line-height: 1.8;">
                    <p style="margin: 5px 0;"><strong>${data.language === 'en' ? 'Name: ' : '姓名：'}</strong>${escapeHtml(data.studentName)}</p>
                    <p style="margin: 5px 0;"><strong>${data.language === 'en' ? 'Subject: ' : '科目：'}</strong>${escapeHtml(data.subject)}</p>
                    <p style="margin: 5px 0;"><strong>${data.language === 'en' ? 'Class/Grade: ' : '班級/年級：'}</strong>${escapeHtml(data.classGrade)}</p>
                    <p style="margin: 5px 0;"><strong>${data.language === 'en' ? 'Teacher: ' : '教師：'}</strong>${escapeHtml(data.teacherName)}</p>
                </div>
            </div>
        `;
        
        // Add sections
        const sections = [
            {
                title: data.language === 'en' 
                    ? 'Section 1: Academic Performance Assessment' 
                    : '第一部分：學業表現評估',
                content: data.section1
            },
            {
                title: data.language === 'en' 
                    ? 'Section 2: In-class Behavioral Performance' 
                    : '第二部分：課堂行為表現',
                content: data.section2
            },
            {
                title: data.language === 'en' 
                    ? 'Section 3: Learning Plan for Next 4 Lessons' 
                    : '第三部分：未來四節課學習計劃',
                content: data.section3
            },
            {
                title: data.language === 'en' 
                    ? 'Section 4: Teacher\'s Final Remarks & Action Items' 
                    : '第四部分：教師總結及行動項目',
                content: data.section4
            }
        ];
        
        sections.forEach((section, index) => {
            htmlContent += `
                <div style="margin-bottom: 20px; page-break-inside: avoid;">
                    <h2 style="color: #1e40af; font-size: 14pt; margin: 15px 0 10px 0; border-bottom: 2px solid #1e40af; padding-bottom: 5px;">
                        ${escapeHtml(section.title)}
                    </h2>
                    <div style="font-size: 11pt; line-height: 1.6; text-align: justify;">
                        ${section.content || (data.language === 'en' ? '<p>No content provided.</p>' : '<p>未提供內容。</p>')}
                    </div>
                </div>
            `;
        });
        
        // Add signature area
        htmlContent += `
            <div style="margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid;">
                <div style="width: 45%;">
                    <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 40px;">
                        <p style="margin: 5px 0; font-size: 11pt;">${escapeHtml(data.teacherName)}</p>
                        <p style="margin: 5px 0; font-size: 9pt; color: #666;">${data.language === 'en' ? 'Teacher\'s Signature' : '教師簽名'}</p>
                    </div>
                </div>
                <div style="width: 45%;">
                    <div style="border-top: 1px solid #000; padding-top: 5px; margin-top: 40px;">
                        <p style="margin: 5px 0; font-size: 11pt;">${data.language === 'en' ? 'Date: ' : '日期：'}${formattedDate}</p>
                    </div>
                </div>
            </div>
        `;
        
        tempContainer.innerHTML = htmlContent;
        
        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Convert to canvas using html2canvas
        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });
        
        // Calculate PDF dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = 297; // A4 height in mm
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        let heightLeft = imgHeight;
        let position = 0;
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');
        
        // Add first page
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Add additional pages if needed
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Save PDF
        const filename = `Tutorial_Report_${data.studentName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        doc.save(filename);
        
    } finally {
        // Clean up temporary container
        document.body.removeChild(tempContainer);
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validate form
function validateForm() {
    const requiredFields = [
        'studentName',
        'subject',
        'classGrade',
        'reportTitle',
        'reportDate',
        'teacherName'
    ];
    
    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            alert(currentLanguage === 'en' 
                ? `Please fill in the required field: ${field.previousElementSibling.textContent}` 
                : `請填寫必填欄位：${field.previousElementSibling.textContent}`);
            field.focus();
            return false;
        }
    }
    
    // Check if all sections have content
    const sections = ['section1', 'section2', 'section3', 'section4'];
    for (const sectionId of sections) {
        const content = quillEditors[sectionId].root.textContent.trim();
        if (!content) {
            alert(currentLanguage === 'en' 
                ? `Please fill in ${sectionId}` 
                : `請填寫${sectionId}`);
            return false;
        }
    }
    
    return true;
}

// Collect form data
function collectFormData() {
    return {
        studentName: document.getElementById('studentName').value,
        subject: document.getElementById('subject').value,
        classGrade: document.getElementById('classGrade').value,
        reportTitle: document.getElementById('reportTitle').value,
        reportDate: document.getElementById('reportDate').value,
        teacherName: document.getElementById('teacherName').value,
        logo: logoBase64,
        section1: quillEditors.section1.root.innerHTML,
        section2: quillEditors.section2.root.innerHTML,
        section3: quillEditors.section3.root.innerHTML,
        section4: quillEditors.section4.root.innerHTML,
        language: currentLanguage
    };
}

/**
 * LaTeX Template Generator
 * Takes all form data and generates a complete, professional LaTeX document
 * 
 * @param {Object} data - Form data object containing all report information
 * @returns {Object} - Object containing LaTeX content and logo file (if any)
 */
function generateLaTeXTemplate(data) {
    // Convert HTML to LaTeX-friendly text with better formatting
    const convertHTMLToLaTeX = (html) => {
        if (!html) return '';
        
        // Clean and convert HTML to LaTeX
        let text = html
            // Headers
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\\subsection*{$1}\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\\subsubsection*{$1}\n')
            .replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/gi, '\n\\textbf{$1}\n\n')
            // Text formatting
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '\\textbf{$1}')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '\\textbf{$1}')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '\\textit{$1}')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '\\textit{$1}')
            .replace(/<u[^>]*>(.*?)<\/u>/gi, '\\underline{$1}')
            // Lists
            .replace(/<ul[^>]*>/gi, '\n\\begin{itemize}\n')
            .replace(/<\/ul>/gi, '\n\\end{itemize}\n')
            .replace(/<ol[^>]*>/gi, '\n\\begin{enumerate}\n')
            .replace(/<\/ol>/gi, '\n\\end{enumerate}\n')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '    \\item $1\n')
            // Paragraphs and line breaks
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<br\s*\/?>/gi, ' \\\\\n')
            .replace(/<div[^>]*>/gi, '')
            .replace(/<\/div>/gi, '\n')
            // Remove remaining HTML tags
            .replace(/<[^>]+>/g, '')
            // HTML entities
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '\\&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            // Clean up extra whitespace
            .replace(/\n{3,}/g, '\n\n')
            .replace(/[ \t]+/g, ' ')
            .trim();
        
        return text || '';
    };
    
    // Format date
    const formattedDate = new Date(data.reportDate).toLocaleDateString(
        data.language === 'en' ? 'en-US' : 'zh-TW',
        { year: 'numeric', month: 'long', day: 'numeric' }
    );
    
    // Escape LaTeX special characters
    const escapeLaTeX = (text) => {
        if (!text) return '';
        return text
            .replace(/\\/g, '\\textbackslash{}')
            .replace(/\{/g, '\\{')
            .replace(/\}/g, '\\}')
            .replace(/\$/g, '\\$')
            .replace(/\&/g, '\\&')
            .replace(/#/g, '\\#')
            .replace(/\^/g, '\\textasciicircum{}')
            .replace(/_/g, '\\_')
            .replace(/%/g, '\\%')
            .replace(/~/g, '\\textasciitilde{}');
    };
    
    // Handle logo - always use logo.png
    let logoInclude = '';
    let logoFileName = 'logo.png';
    logoInclude = data.language === 'en'
        ? `\\begin{figure}[h]
    \\centering
    \\includegraphics[width=0.3\\textwidth]{${logoFileName}}
\\end{figure}
\\vspace{0.5cm}`
        : `\\begin{figure}[h]
    \\centering
    \\includegraphics[width=0.3\\textwidth]{${logoFileName}}
\\end{figure}
\\vspace{0.5cm}`;
    
    // Generate LaTeX document based on language
    const latexContent = data.language === 'en' 
        ? generateEnglishLaTeXTemplate(data, formattedDate, logoInclude, convertHTMLToLaTeX, escapeLaTeX)
        : generateChineseLaTeXTemplate(data, formattedDate, logoInclude, convertHTMLToLaTeX, escapeLaTeX);
    
    return {
        latex: latexContent,
        logoBase64: data.logo,
        logoFileName: logoFileName // Always 'logo.png'
    };
}

/**
 * Generate English LaTeX Template
 */
function generateEnglishLaTeXTemplate(data, formattedDate, logoInclude, convertHTMLToLaTeX, escapeLaTeX) {
    return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{titlesec}

% Colors
\\definecolor{primaryblue}{RGB}{30, 64, 175}
\\definecolor{lightgray}{RGB}{245, 245, 245}

% Header
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[C]{\\textcolor{primaryblue}{\\textbf{Tutorial Report}}}
\\renewcommand{\\headrulewidth}{0.5pt}

% Section formatting
\\titleformat{\\section}
  {\\Large\\bfseries\\color{primaryblue}}
  {}
  {0em}
  {}
  [\\titlerule[0.5pt]]

% Title
\\title{\\vspace{-2cm}\\Huge\\textbf{\\textcolor{primaryblue}{${escapeLaTeX(data.reportTitle)}}}}
\\author{}
\\date{\\large\\textbf{Date:} ${escapeLaTeX(formattedDate)}}

\\begin{document}

% Title page
\\maketitle
\\thispagestyle{empty}
\\vspace{-1cm}

${logoInclude}

\\vspace{0.5cm}

% Student Information Box
\\begin{center}
\\colorbox{lightgray}{%
    \\parbox{0.9\\textwidth}{%
        \\centering
        \\vspace{0.3cm}
        \\textbf{\\Large Student Information}\\\\[0.5cm]
        \\begin{tabular}{ll}
            \\textbf{Name:} & ${escapeLaTeX(data.studentName)} \\\\
            \\textbf{Subject:} & ${escapeLaTeX(data.subject)} \\\\
            \\textbf{Class/Grade:} & ${escapeLaTeX(data.classGrade)} \\\\
            \\textbf{Teacher:} & ${escapeLaTeX(data.teacherName)} \\\\
        \\end{tabular}
        \\vspace{0.3cm}
    }%
}
\\end{center}

\\vspace{1cm}

% Report Sections
\\section*{Section 1: Academic Performance Assessment}
${convertHTMLToLaTeX(data.section1)}

\\vspace{0.8cm}

\\section*{Section 2: In-class Behavioral Performance}
${convertHTMLToLaTeX(data.section2)}

\\vspace{0.8cm}

\\section*{Section 3: Learning Plan for Next 4 Lessons}
${convertHTMLToLaTeX(data.section3)}

\\vspace{0.8cm}

\\section*{Section 4: Teacher's Final Remarks \\& Action Items}
${convertHTMLToLaTeX(data.section4)}

\\vspace{2cm}

% Signature Area
\\begin{center}
\\begin{tabular}{c}
    \\rule{6cm}{0.4pt}\\\\[0.3cm]
    \\textbf{${escapeLaTeX(data.teacherName)}}\\\\[0.2cm]
    Teacher's Signature
\\end{tabular}
\\hspace{3cm}
\\begin{tabular}{c}
    \\rule{6cm}{0.4pt}\\\\[0.3cm]
    Date: ${escapeLaTeX(formattedDate)}
\\end{tabular}
\\end{center}

\\vspace{1cm}

\\end{document}`;
}

/**
 * Generate Chinese LaTeX Template with xeCJK support
 */
function generateChineseLaTeXTemplate(data, formattedDate, logoInclude, convertHTMLToLaTeX, escapeLaTeX) {
    return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=1in]{geometry}
\\usepackage{graphicx}
\\usepackage{enumitem}
\\usepackage{xcolor}
\\usepackage{fancyhdr}
\\usepackage{titlesec}
\\usepackage{xeCJK}

% Chinese font configuration
\\setCJKmainfont{Microsoft JhengHei}
\\setCJKsansfont{Microsoft JhengHei}
\\setCJKmonofont{Microsoft JhengHei}

% Colors
\\definecolor{primaryblue}{RGB}{30, 64, 175}
\\definecolor{lightgray}{RGB}{245, 245, 245}

% Header
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[C]{\\textcolor{primaryblue}{\\textbf{補習報告}}}
\\renewcommand{\\headrulewidth}{0.5pt}

% Section formatting
\\titleformat{\\section}
  {\\Large\\bfseries\\color{primaryblue}}
  {}
  {0em}
  {}
  [\\titlerule[0.5pt]]

% Title
\\title{\\vspace{-2cm}\\Huge\\textbf{\\textcolor{primaryblue}{${escapeLaTeX(data.reportTitle)}}}}
\\author{}
\\date{\\large\\textbf{日期：} ${escapeLaTeX(formattedDate)}}

\\begin{document}

% Title page
\\maketitle
\\thispagestyle{empty}
\\vspace{-1cm}

${logoInclude}

\\vspace{0.5cm}

% Student Information Box
\\begin{center}
\\colorbox{lightgray}{%
    \\parbox{0.9\\textwidth}{%
        \\centering
        \\vspace{0.3cm}
        \\textbf{\\Large 學生資料}\\\\[0.5cm]
        \\begin{tabular}{ll}
            \\textbf{姓名：} & ${escapeLaTeX(data.studentName)} \\\\
            \\textbf{科目：} & ${escapeLaTeX(data.subject)} \\\\
            \\textbf{班級/年級：} & ${escapeLaTeX(data.classGrade)} \\\\
            \\textbf{教師：} & ${escapeLaTeX(data.teacherName)} \\\\
        \\end{tabular}
        \\vspace{0.3cm}
    }%
}
\\end{center}

\\vspace{1cm}

% Report Sections
\\section*{第一部分：學業表現評估}
${convertHTMLToLaTeX(data.section1)}

\\vspace{0.8cm}

\\section*{第二部分：課堂行為表現}
${convertHTMLToLaTeX(data.section2)}

\\vspace{0.8cm}

\\section*{第三部分：未來四節課學習計劃}
${convertHTMLToLaTeX(data.section3)}

\\vspace{0.8cm}

\\section*{第四部分：教師總結及行動項目}
${convertHTMLToLaTeX(data.section4)}

\\vspace{2cm}

% Signature Area
\\begin{center}
\\begin{tabular}{c}
    \\rule{6cm}{0.4pt}\\\\[0.3cm]
    \\textbf{${escapeLaTeX(data.teacherName)}}\\\\[0.2cm]
    教師簽名
\\end{tabular}
\\hspace{3cm}
\\begin{tabular}{c}
    \\rule{6cm}{0.4pt}\\\\[0.3cm]
    日期：${escapeLaTeX(formattedDate)}
\\end{tabular}
\\end{center}

\\vspace{1cm}

\\end{document}`;
}

// Legacy function for backward compatibility
function generateLaTeX(data) {
    const result = generateLaTeXTemplate(data);
    return result.latex;
}

// Get English LaTeX template
function getEnglishLaTeXTemplate() {
    return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{graphicx}
\\usepackage{xeCJK}
\\geometry{margin=1in}

\\title{\\textbf{\\{REPORT_TITLE\\}}}
\\author{}
\\date{\\{DATE\\}}

\\begin{document}
\\maketitle

\\section*{Student Information}
\\begin{itemize}
    \\item \\textbf{Name:} \\{STUDENT_NAME\\}
    \\item \\textbf{Subject:} \\{SUBJECT\\}
    \\item \\textbf{Class/Grade:} \\{CLASS_GRADE\\}
    \\item \\textbf{Teacher:} \\{TEACHER_NAME\\}
\\end{itemize}

\\section*{Section 1: Academic Performance Assessment}
\\{SECTION1\\}

\\section*{Section 2: In-class Behavioral Performance}
\\{SECTION2\\}

\\section*{Section 3: Learning Plan for Next 4 Lessons}
\\{SECTION3\\}

\\section*{Section 4: Teacher's Final Remarks \\& Action Items}
\\{SECTION4\\}

\\end{document}`;
}

// Get Chinese LaTeX template
function getChineseLaTeXTemplate() {
    return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\usepackage{graphicx}
\\usepackage{xeCJK}
\\geometry{margin=1in}
\\setCJKmainfont{Microsoft JhengHei}

\\title{\\textbf{\\{REPORT_TITLE\\}}}
\\author{}
\\date{\\{DATE\\}}

\\begin{document}
\\maketitle

\\section*{學生資料}
\\begin{itemize}
    \\item \\textbf{姓名:} \\{STUDENT_NAME\\}
    \\item \\textbf{科目:} \\{SUBJECT\\}
    \\item \\textbf{班級/年級:} \\{CLASS_GRADE\\}
    \\item \\textbf{教師:} \\{TEACHER_NAME\\}
\\end{itemize}

\\section*{第一部分：學業表現評估}
\\{SECTION1\\}

\\section*{第二部分：課堂行為表現}
\\{SECTION2\\}

\\section*{第三部分：未來四節課學習計劃}
\\{SECTION3\\}

\\section*{第四部分：教師總結及行動項目}
\\{SECTION4\\}

\\end{document}`;
}

// Download file
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Save logo file from base64 data
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} filename - Filename for the logo
 */
function saveLogoFile(base64Data, filename) {
    try {
        // Convert base64 to blob
        const base64Parts = base64Data.split(',');
        const contentType = base64Parts[0].match(/:(.*?);/)[1];
        const base64DataOnly = base64Parts[1];
        
        const byteCharacters = atob(base64DataOnly);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        
        // Download the logo file
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error saving logo file:', error);
        console.warn('Logo file could not be saved. You may need to add it manually to the LaTeX project.');
    }
}

/**
 * Simulate PDF Compilation
 * This function simulates the PDF compilation process and provides instructions
 * In a real implementation, this would call a backend service to compile LaTeX
 * 
 * @param {string} latexContent - The LaTeX document content
 * @returns {Promise<Object>} - Simulation result with status and message
 */
async function simulatePDFCompilation(latexContent) {
    return new Promise((resolve) => {
        // Simulate compilation delay
        setTimeout(() => {
            // Check for common LaTeX errors (simulation)
            const hasErrors = latexContent.includes('\\undefined') || 
                            latexContent.includes('\\usepackage{undefined}');
            
            if (hasErrors) {
                resolve({
                    success: false,
                    message: currentLanguage === 'en'
                        ? 'Simulated compilation found potential errors. Please check your LaTeX code.'
                        : '模擬編譯發現潛在錯誤。請檢查您的 LaTeX 代碼。',
                    pdfData: null
                });
            } else {
                resolve({
                    success: true,
                    message: currentLanguage === 'en'
                        ? 'PDF compilation simulated successfully! In a real implementation, this would generate a PDF file.'
                        : 'PDF 編譯模擬成功！在實際實現中，這將生成 PDF 檔案。',
                    pdfData: 'simulated_pdf_data' // In real implementation, this would be the PDF binary
                });
            }
        }, 1500); // Simulate 1.5 second compilation time
    });
}

// Show message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
    messageDiv.textContent = message;
    
    const form = document.getElementById('reportForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

