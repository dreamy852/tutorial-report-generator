// Global variables
let currentLanguage = 'en';
let quillEditors = {};
let logoBase64 = '';

// Initialize Quill editors and form
document.addEventListener('DOMContentLoaded', function() {
    initializeEditors();
    initializeForm();
    setDefaultDate();
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
        
        // Update preview on content change
        editor.on('text-change', function() {
            updatePreview();
        });
    });
}

// Initialize form with event listeners
function initializeForm() {
    const form = document.getElementById('reportForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('input', updatePreview);
        input.addEventListener('change', updatePreview);
    });
}

// Set default date to today
function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
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
    
    updatePreview();
}

// Logo preview
function previewLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoBase64 = e.target.result;
            const preview = document.getElementById('logoPreview');
            preview.innerHTML = `<img src="${logoBase64}" alt="School Logo">`;
            preview.style.display = 'block';
            updatePreview();
        };
        reader.readAsDataURL(file);
    }
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
            // Convert plain text to HTML format for Quill editor
            // Split by newlines and create paragraphs
            const htmlContent = enhancedText
                .split('\n\n')
                .map(paragraph => paragraph.trim())
                .filter(paragraph => paragraph.length > 0)
                .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
                .join('');
            
            // Replace the current content with enhanced content
            editor.root.innerHTML = htmlContent || `<p>${enhancedText}</p>`;
            updatePreview();
            
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
    const API_KEY = 'YOUR_DEEPSEEK_API_KEY'; // Replace with your actual DeepSeek API key
    const API_URL = 'https://api.deepseek.com/v1/chat/completions';
    
    // Validate API key
    if (!API_KEY || API_KEY === 'YOUR_DEEPSEEK_API_KEY') {
        console.warn('DeepSeek API key not configured. Using mock enhancement.');
        // Return mock enhanced text for demonstration
        return language === 'en' 
            ? `[Enhanced Version]\n\n${textSection}\n\n[Note: Please configure your DeepSeek API key in app.js to enable real AI enhancement]`
            : `[增強版本]\n\n${textSection}\n\n[注意：請在 app.js 中配置您的 DeepSeek API 金鑰以啟用真實的 AI 增強功能]`;
    }
    
    // Validate input
    if (!textSection || textSection.trim().length === 0) {
        throw new Error(language === 'en' 
            ? 'Text section cannot be empty' 
            : '文字內容不能為空');
    }
    
    // Build prompt based on language
    const prompt = language === 'en'
        ? `As an experienced teacher, improve this student assessment section to be more professional and constructive: ${textSection}`
        : `作為一位經驗豐富的教師，請改進這段學生評估內容，使其更加專業和建設性：${textSection}`;
    
    // System message based on language
    const systemMessage = language === 'en'
        ? 'You are an experienced teacher and educational assessment writer. Your task is to improve student assessment sections to be more professional, constructive, and helpful. Maintain the original meaning while enhancing clarity, professionalism, and educational value.'
        : '你是一位經驗豐富的教師和教育評估撰寫者。你的任務是改進學生評估內容，使其更加專業、建設性和有幫助。在保持原意的同時，增強清晰度、專業性和教育價值。';
    
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
                max_tokens: 2000,
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
        
        const enhancedText = data.choices[0].message.content.trim();
        
        if (!enhancedText) {
            throw new Error(language === 'en' 
                ? 'Empty response from API' 
                : 'API 回應為空');
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
        
        // Clear logo preview
        logoBase64 = '';
        document.getElementById('logoPreview').style.display = 'none';
        document.getElementById('logoPreview').innerHTML = '';
        
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
        
        // If logo exists, save it as a separate file
        if (latexResult.logoBase64 && latexResult.logoFileName) {
            saveLogoFile(latexResult.logoBase64, latexResult.logoFileName);
        }
        
        // Show success message with compilation instructions
        const instructions = currentLanguage === 'en'
            ? `LaTeX file generated successfully!\n\nTo compile to PDF:\n1. Use XeLaTeX compiler (required for Chinese support)\n2. Place ${latexResult.logoFileName ? latexResult.logoFileName + ' in the same folder as report.tex' : 'report.tex'} in your LaTeX editor\n3. Compile using XeLaTeX\n\nOr use Overleaf.com and upload both files.`
            : `LaTeX 檔案生成成功！\n\n編譯為 PDF 的方法：\n1. 使用 XeLaTeX 編譯器（中文支援必需）\n2. 將 ${latexResult.logoFileName ? latexResult.logoFileName + ' 和 report.tex 放在同一資料夾' : 'report.tex'} 放入 LaTeX 編輯器\n3. 使用 XeLaTeX 編譯\n\n或使用 Overleaf.com 上傳兩個檔案。`;
        
        alert(instructions);
        
        showMessage(
            currentLanguage === 'en' 
                ? 'LaTeX file and logo generated successfully! Check your downloads.' 
                : 'LaTeX 檔案和標誌生成成功！請檢查您的下載資料夾。',
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
 * @param {Object} data - Form data object
 */
async function createPDFDocument(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Colors
    const primaryBlue = [30, 64, 175];
    const lightGray = [245, 245, 245];
    const darkGray = [100, 100, 100];
    
    // Page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;
    
    // Helper function to add new page if needed
    const checkPageBreak = (requiredHeight) => {
        if (yPosition + requiredHeight > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };
    
    // Helper function to strip HTML and get plain text
    const stripHTML = (html) => {
        if (!html) return '';
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };
    
    // Helper function to split text into lines that fit width
    const splitText = (text, maxWidth) => {
        return doc.splitTextToSize(text, maxWidth);
    };
    
    // Format date
    const formattedDate = new Date(data.reportDate).toLocaleDateString(
        data.language === 'en' ? 'en-US' : 'zh-TW',
        { year: 'numeric', month: 'long', day: 'numeric' }
    );
    
    // Add logo if available
    if (data.logo && data.logo.trim() !== '') {
        try {
            // Convert base64 to image
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = data.logo;
            });
            
            // Calculate logo dimensions (max width 40mm, maintain aspect ratio)
            const maxLogoWidth = 40;
            const logoWidth = Math.min(maxLogoWidth, img.width * (maxLogoWidth / img.width));
            const logoHeight = img.height * (logoWidth / img.width);
            
            doc.addImage(data.logo, 'PNG', pageWidth / 2 - logoWidth / 2, yPosition, logoWidth, logoHeight);
            yPosition += logoHeight + 10;
        } catch (error) {
            console.warn('Could not add logo to PDF:', error);
        }
    }
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(...primaryBlue);
    const titleLines = splitText(data.reportTitle, contentWidth);
    doc.text(titleLines, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += titleLines.length * 10 + 5;
    
    // Date
    doc.setFontSize(12);
    doc.setTextColor(...darkGray);
    const dateText = (data.language === 'en' ? 'Date: ' : '日期：') + formattedDate;
    doc.text(dateText, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Student Information Box
    checkPageBreak(30);
    doc.setFillColor(...lightGray);
    doc.roundedRect(margin, yPosition, contentWidth, 30, 3, 3, 'F');
    
    doc.setFontSize(14);
    doc.setTextColor(...primaryBlue);
    doc.setFont(undefined, 'bold');
    const infoTitle = data.language === 'en' ? 'Student Information' : '學生資料';
    doc.text(infoTitle, pageWidth / 2, yPosition + 8, { align: 'center' });
    
    yPosition += 12;
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
    
    const studentInfo = [
        (data.language === 'en' ? 'Name: ' : '姓名：') + data.studentName,
        (data.language === 'en' ? 'Subject: ' : '科目：') + data.subject,
        (data.language === 'en' ? 'Class/Grade: ' : '班級/年級：') + data.classGrade,
        (data.language === 'en' ? 'Teacher: ' : '教師：') + data.teacherName
    ];
    
    studentInfo.forEach((info, index) => {
        doc.text(info, margin + 10, yPosition + (index * 5));
    });
    
    yPosition += 35;
    
    // Section titles and content
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
        checkPageBreak(25);
        
        // Section title
        doc.setFontSize(14);
        doc.setTextColor(...primaryBlue);
        doc.setFont(undefined, 'bold');
        yPosition += 5;
        
        const titleLines = splitText(section.title, contentWidth);
        doc.text(titleLines, margin, yPosition);
        yPosition += titleLines.length * 7 + 3;
        
        // Section underline
        doc.setDrawColor(...primaryBlue);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
        yPosition += 5;
        
        // Section content
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, 'normal');
        
        const contentText = stripHTML(section.content);
        if (contentText.trim()) {
            const contentLines = splitText(contentText, contentWidth);
            checkPageBreak(contentLines.length * 5);
            
            contentLines.forEach(line => {
                if (yPosition > pageHeight - margin - 10) {
                    doc.addPage();
                    yPosition = margin;
                }
                doc.text(line, margin, yPosition);
                yPosition += 5;
            });
        } else {
            const placeholder = data.language === 'en' ? 'No content provided.' : '未提供內容。';
            doc.text(placeholder, margin, yPosition);
            yPosition += 5;
        }
        
        yPosition += 8;
    });
    
    // Signature area
    checkPageBreak(40);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Teacher signature line
    const signatureY = yPosition;
    doc.line(margin, signatureY, margin + 60, signatureY);
    doc.text(data.teacherName, margin, signatureY - 2);
    doc.setFontSize(9);
    doc.setTextColor(...darkGray);
    const signatureLabel = data.language === 'en' ? 'Teacher\'s Signature' : '教師簽名';
    doc.text(signatureLabel, margin, signatureY + 5);
    
    // Date signature line
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const dateLabel = (data.language === 'en' ? 'Date: ' : '日期：') + formattedDate;
    doc.text(dateLabel, pageWidth - margin - 60, signatureY - 2);
    doc.line(pageWidth - margin - 60, signatureY, pageWidth - margin, signatureY);
    
    // Footer on each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(...darkGray);
        const footerText = data.language === 'en' 
            ? `Page ${i} of ${totalPages}` 
            : `第 ${i} 頁，共 ${totalPages} 頁`;
        doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    // Save PDF
    const filename = `Tutorial_Report_${data.studentName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
    doc.save(filename);
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
    
    // Handle logo - save as separate file if provided
    let logoInclude = '';
    let logoFileName = '';
    if (data.logo && data.logo.trim() !== '') {
        logoFileName = 'school_logo.png';
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
    }
    
    // Generate LaTeX document based on language
    const latexContent = data.language === 'en' 
        ? generateEnglishLaTeXTemplate(data, formattedDate, logoInclude, convertHTMLToLaTeX, escapeLaTeX)
        : generateChineseLaTeXTemplate(data, formattedDate, logoInclude, convertHTMLToLaTeX, escapeLaTeX);
    
    return {
        latex: latexContent,
        logoBase64: data.logo,
        logoFileName: logoFileName
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
\\usepackage{lastpage}

% Colors
\\definecolor{primaryblue}{RGB}{30, 64, 175}
\\definecolor{lightgray}{RGB}{245, 245, 245}

% Header and footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[C]{\\textcolor{primaryblue}{\\textbf{Tutorial Report}}}
\\fancyfoot[C]{\\textcolor{gray}{Page \\thepage\\ of \\pageref{LastPage}}}
\\renewcommand{\\headrulewidth}{0.5pt}
\\renewcommand{\\footrulewidth}{0.5pt}

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
\\usepackage{lastpage}
\\usepackage{xeCJK}

% Chinese font configuration
\\setCJKmainfont{Microsoft JhengHei}
\\setCJKsansfont{Microsoft JhengHei}
\\setCJKmonofont{Microsoft JhengHei}

% Colors
\\definecolor{primaryblue}{RGB}{30, 64, 175}
\\definecolor{lightgray}{RGB}{245, 245, 245}

% Header and footer
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[C]{\\textcolor{primaryblue}{\\textbf{補習報告}}}
\\fancyfoot[C]{\\textcolor{gray}{第 \\thepage\\ 頁，共 \\pageref{LastPage} 頁}}
\\renewcommand{\\headrulewidth}{0.5pt}
\\renewcommand{\\footrulewidth}{0.5pt}

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

