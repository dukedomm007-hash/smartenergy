# Google Sheets Integration Troubleshooting

## Common Issues and Solutions

### 302 Redirect Error
If you're getting a 302 redirect error, this means your Google Apps Script isn't properly deployed. Follow these steps:

1. **Re-deploy your Google Apps Script:**
   - Go to your Google Apps Script project
   - Click "Deploy" → "Manage Deployments"
   - Click the pencil icon to edit your deployment
   - Make sure "Execute as" is set to "Me (your email)"
   - Make sure "Who has access" is set to "Anyone"
   - Click "Deploy"

2. **Get the correct URL:**
   - After deployment, copy the Web App URL
   - It should look like: `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec`
   - Update your `GOOGLE_SHEETS_URL` environment variable with this URL

3. **Test the deployment:**
   - You can test your Google Apps Script by visiting the URL directly in a browser
   - It should show an error about GET requests not being supported (this is normal)

### Updated Google Apps Script Code
Make sure your Google Apps Script uses this updated code:

\`\`\`javascript
function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Try to get the sheet by name, or create it if it doesn't exist
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
    
    // Prepare the row data
    const rowData = [
      new Date().toLocaleString(),
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
    
    // Append the data to the sheet
    sheet.appendRow(rowData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Lead submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: 'Error: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
\`\`\`

### Environment Variable Setup
Your `GOOGLE_SHEETS_URL` should be set to the Web App URL from your Google Apps Script deployment.
