# Google Sheets Integration Setup

To connect your lead form to Google Sheets, follow these steps:

## 1. Create a Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Create a new project
3. Replace the default code with:

\`\`\`javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Open your Google Sheet (replace with your sheet ID)
    const sheet = SpreadsheetApp.openById('1ANKRnjL4jv7fP_W-3Isw09_HzDIOwI90h_4B2n8tuZU').getActiveSheet();
    
    // Add headers if this is the first row
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 10).setValues([[
        'Timestamp', 'Name', 'Email', 'Phone', 'Monthly Bill', 
        'Zip Code', 'Home Size', 'Monthly Savings', 'Annual Savings', '10-Year Savings'
      ]]);
    }
    
    // Add the new lead data
    sheet.appendRow([
      data.timestamp,
      data.name,
      data.email,
      data.phone,
      data.monthlyBill,
      data.zipCode,
      data.homeSize,
      data.monthlySavings,
      data.annualSavings,
      data.tenYearSavings
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

## 2. Deploy the Script

1. Click "Deploy" > "New deployment"
2. Choose "Web app" as the type
3. Set execute as "Me" and access to "Anyone"
4. Click "Deploy" and copy the web app URL

## 3. Add Environment Variable

Add this environment variable to your Vercel project:
- `GOOGLE_SHEETS_URL` = Your Google Apps Script web app URL

## 4. Create Your Google Sheet

1. Create a new Google Sheet
2. Copy the sheet ID from the URL
3. Replace `YOUR_SHEET_ID` in the Apps Script code with your actual sheet ID
