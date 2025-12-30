# Tutorial Report Generator

A professional web application for generating educational tutorial reports with support for English and Traditional Chinese.

## Features

- 📝 **Comprehensive Form**: Student information, report details, and four customizable sections
- 🌐 **Bilingual Support**: Switch between English and Traditional Chinese (繁體中文)
- 👁️ **Live Preview**: Real-time preview of the report as you type
- 🤖 **AI Enhancement**: Enhance report sections using DeepSeek API
- 📄 **LaTeX Export**: Generate LaTeX files for professional PDF reports
- 🎨 **Professional Design**: Clean, formal blue/white color scheme suitable for educational reports
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Project Structure

```
tutorial-report-generator/
├── index.html          # Main HTML file with form structure
├── style.css           # Professional styling (blue/white theme)
├── app.js              # JavaScript functionality
├── templates/          # LaTeX templates
│   ├── template_en.tex # English LaTeX template
│   └── template_zh.tex # Traditional Chinese LaTeX template
└── README.md           # This file
```

## How to Use

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No server setup required for basic functionality

2. **Fill in the Form**
   - Complete all required fields (marked with *)
   - Use the rich text editors for the four report sections
   - Upload a school logo (optional)

3. **Use AI Enhancement** (Optional)
   - Click "Enhance with AI" next to any section
   - Note: You need to configure your DeepSeek API key in `app.js`
   - Replace `YOUR_DEEPSEEK_API_KEY` with your actual API key

4. **Preview Your Report**
   - The live preview updates automatically as you type
   - Switch between English and Traditional Chinese using the language toggle

5. **Generate Report**
   - Click "Generate Report" to create a LaTeX file
   - Compile the `.tex` file using a LaTeX compiler (e.g., Overleaf, TeX Live) to create a PDF

## Form Fields

### Student Information
- Student Name (required)
- Subject (dropdown: Mathematics, English Language, Science, Chinese Language, General Studies)
- Class/Grade (required)

### Report Details
- Report Title (required)
- Report Date (required, defaults to today)
- Teacher Name (required)
- School Logo (optional, with preview)

### Report Sections (all required)
1. Academic Performance Assessment
2. In-class Behavioral Performance
3. Learning Plan for Next 4 Lessons
4. Teacher's Final Remarks & Action Items

## AI Enhancement Setup

To use the AI enhancement feature:

1. Get a DeepSeek API key from [DeepSeek](https://www.deepseek.com/)
2. Open `app.js`
3. Find the line: `const API_KEY = 'YOUR_DEEPSEEK_API_KEY';`
4. Replace `YOUR_DEEPSEEK_API_KEY` with your actual API key

## LaTeX Compilation

After generating the `.tex` file:

1. **Using Overleaf** (Recommended for beginners):
   - Upload the `.tex` file to [Overleaf](https://www.overleaf.com/)
   - For Chinese reports, ensure you have the `xeCJK` package and a Chinese font installed
   - Click "Recompile" to generate the PDF

2. **Using Local LaTeX Installation**:
   - Install a LaTeX distribution (TeX Live, MiKTeX, etc.)
   - For Chinese support, install XeLaTeX and Chinese fonts
   - Compile using: `xelatex report.tex`

## Technologies Used

- **HTML5**: Structure and form elements
- **CSS3**: Professional styling with modern design
- **JavaScript (ES6+)**: Form handling, live preview, API integration
- **Quill.js**: Rich text editor for report sections
- **LaTeX**: Professional document generation

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Notes

- The application works entirely in the browser (client-side)
- No data is sent to external servers except when using AI enhancement
- All form data stays in your browser until you generate the report
- LaTeX files are generated locally and downloaded to your computer

## License

See LICENSE file for details.

