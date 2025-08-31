# Google Sheets Deployment Guide

## Current Status
Your form is working with a fallback system! Lead data is being captured in the server logs while you set up Google Sheets.

## Step-by-Step Google Apps Script Setup

### 1. Create the Script
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Replace the default code with this:

\`\`\`javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    let spreadsheet;
    try {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    } catch (error) {
      // Create new spreadsheet if none exists
      spreadsheet = SpreadsheetApp.create("Energy Savings Leads");
    }
    
    // Get or create the sheet
    let sheet = spreadsheet.getSheetByName("Leads");
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Leads");
      // Add headers
      sheet.getRange(1, 1, 1, 10).setValues([[
        'Timestamp', 'Name', 'Email', 'Phone', 'Monthly Bill', 
        'Zip Code', 'Home Size', 'Monthly Savings', 'Annual Savings', 'Ten Year Savings'
      ]]);
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold');
    }
    
    // Add the data
    const rowData = [
      data.timestamp || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.phone || '',
      data.monthlyBill || '',
      data.zipCode || '',
      data.homeSize || '',
      data.monthlySavings || '',
      data.annualSavings || '',
      data.tenYearSavings || ''
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Lead saved successfully'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

### 2. Deploy the Script
1. Click "Deploy" → "New Deployment"
2. Choose "Web app" as the type
3. **IMPORTANT**: Set "Execute as" to "Me"
4. **IMPORTANT**: Set "Who has access" to "Anyone"
5. Click "Deploy"
6. Copy the Web App URL

### 3. Set Environment Variable
Add this to your Vercel environment variables:
\`\`\`
GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
\`\`\`

### 4. Test
Submit a test lead through your form. Check both your Google Sheet and the server logs to confirm it's working.

## Troubleshooting
- If you get 302 errors, redeploy the script with "Anyone" access
- If you get 403 errors, check the "Execute as" setting
- The fallback system will continue working until Google Sheets is properly configured
