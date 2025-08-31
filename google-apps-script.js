function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents)

    // Open your Google Sheet by name
    const sheetName =
      "Ready to Lock in Your Savings?Get your complete savings report and next steps—absolutely free.Get My Free Report"
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)

    // If sheet doesn't exist, create it
    if (!sheet) {
      const newSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName)
      // Add headers
      newSheet
        .getRange(1, 1, 1, 10)
        .setValues([
          [
            "Timestamp",
            "Name",
            "Email",
            "Phone",
            "Monthly Bill",
            "Zip Code",
            "Home Size",
            "Monthly Savings",
            "Annual Savings",
            "Ten Year Savings",
          ],
        ])
      newSheet.getRange(1, 1, 1, 10).setFontWeight("bold")
    }

    const targetSheet = sheet || SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName)

    // Prepare the row data
    const rowData = [
      new Date().toLocaleString(), // Timestamp
      data.name || "",
      data.email || "",
      data.phone || "",
      data.monthlyBill || "",
      data.zipCode || "",
      data.homeSize || "",
      data.monthlySavings || "",
      data.annualSavings || "",
      data.tenYearSavings || "",
    ]

    // Append the data to the sheet
    targetSheet.appendRow(rowData)

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Lead submitted successfully",
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "Error: " + error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}
