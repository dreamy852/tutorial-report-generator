# Google Apps Script 設置說明

為了實現將數據寫入 Google Sheets 的功能，您需要設置一個 Google Apps Script Web App。

## 設置步驟

1. **打開 Google Apps Script**
   - 訪問 https://script.google.com
   - 點擊「新增專案」

2. **複製並貼上以下代碼**

```javascript
function doPost(e) {
  try {
    // 獲取表單數據
    const teacherName = e.parameter.teacherName;
    const studentName = e.parameter.studentName;
    const classGrade = e.parameter.classGrade;
    const subject = e.parameter.subject;
    
    // 打開 Google Sheets（替換為您的表格 ID）
    const sheetId = '1M4mRBujj-mx4eHHNl55RrgfA-SqVLaVoubnQ58MmKLU';
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    // 添加新行：教師姓名 | 學生姓名 | 班級/年級 | 科目
    sheet.appendRow([teacherName, studentName, classGrade, subject]);
    
    // 返回成功響應
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data added successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // 返回錯誤響應
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. **修改表格 ID**
   - 在代碼中找到 `const sheetId = '1M4mRBujj-mx4eHHNl55RrgfA-SqVLaVoubnQ58MmKLU';`
   - 確保這是您的 Google Sheets ID（如果不同，請替換）

4. **部署為 Web App**
   - 點擊右上角的「部署」>「新增部署作業」
   - 選擇類型：「網頁應用程式」
   - 執行身分：選擇「我」
   - 具有存取權的使用者：選擇「任何人」
   - 點擊「部署」
   - 複製「網頁應用程式網址」

5. **更新 app.js**
   - 打開 `app.js` 文件
   - 找到 `let googleScriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';`
   - 將 `YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL` 替換為您剛才複製的網址

## 注意事項

- 確保 Google Sheets 的權限設置為「知道連結的使用者可以檢視」
- 首次部署時，您需要授權應用程式存取您的 Google Sheets
- 如果修改了代碼，需要重新部署並選擇「新版本」

## 測試

設置完成後，當您在應用程式中點擊「新增」按鈕並提交表單時，數據應該會自動添加到 Google Sheets 中。

