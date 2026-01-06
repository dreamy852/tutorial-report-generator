/**
 * Google Apps Script for Tutorial Report Generator
 * This script handles writing data to Google Sheets
 * 
 * Setup Instructions:
 * 1. Go to https://script.google.com
 * 2. Create a new project
 * 3. Copy and paste this entire file
 * 4. Replace the SHEET_ID below with your Google Sheets ID
 * 5. Deploy as Web App:
 *    - Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 *    - Click "Deploy"
 *    - Copy the Web App URL
 * 6. Update the googleScriptUrl in app.js with the Web App URL
 */

// Replace this with your Google Sheets ID
// You can find it in the URL: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
const SHEET_ID = '1M4mRBujj-mx4eHHNl55RrgfA-SqVLaVoubnQ58MmKLU';

/**
 * Handle POST requests from the web application
 * Expected parameters:
 * - teacherName: Name of the teacher
 * - studentName: Name of the student
 * - classGrade: Class or grade of the student
 * - subject: Subject name
 */
function doPost(e) {
  try {
    // Get form data from the request
    const teacherName = e.parameter.teacherName || '';
    const studentName = e.parameter.studentName || '';
    const classGrade = e.parameter.classGrade || '';
    const subject = e.parameter.subject || '';
    
    // Validate that all required fields are provided
    if (!teacherName || !studentName || !classGrade || !subject) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Open the Google Sheet
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getActiveSheet();
    
    // Check if header row exists, if not, add it
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['教師姓名', '學生姓名', '班級/年級', '科目']);
    }
    
    // Add new row: Teacher Name | Student Name | Class/Grade | Subject
    sheet.appendRow([teacherName, studentName, classGrade, subject]);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data added successfully',
      data: {
        teacherName: teacherName,
        studentName: studentName,
        classGrade: classGrade,
        subject: subject
      }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Log the error for debugging
    console.error('Error in doPost:', error);
    
    // Return error response
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: 'Failed to add data to Google Sheets'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 * You can test the script by visiting the Web App URL in a browser
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Google Apps Script is running',
    instructions: 'This is a POST endpoint. Use POST method to submit data.'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function - you can run this manually to test the script
 * Go to Run > Run function > testAddData
 */
function testAddData() {
  // Simulate a POST request
  const mockEvent = {
    parameter: {
      teacherName: 'Test Teacher',
      studentName: 'Test Student',
      classGrade: 'S4',
      subject: 'Math'
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}

