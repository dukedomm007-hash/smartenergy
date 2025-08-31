function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents)

    // Get the active spreadsheet (the one where this script is attached)
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()

    // Get the first sheet or create one if none exists
    let sheet = spreadsheet.getSheets()[0]

    // If no sheets exist, create one
    if (!sheet) {
      sheet = spreadsheet.insertSheet("Lead Data")
    }

    // Check if headers exist, if not add them
    const lastRow = sheet.getLastRow()
    if (lastRow === 0) {
      // Add headers
      sheet
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
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold")
    }

    // Prepare the row data
    const rowData = [
      new Date().toLocaleString("en-US", { timeZone: "America/Chicago" }), // Timestamp
      data.name || "",
      data.email || "",
      data.phone || "",
      data.monthlyBill || "",
      data.zipCode || "",
      data.homeSize || "",
      data.monthlySavings || data.savings?.monthly || "",
      data.annualSavings || data.savings?.annual || "",
      data.tenYearSavings || data.savings?.tenYear || "",
    ]

    // Append the data to the sheet
    sheet.appendRow(rowData)

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        message: "Lead submitted successfully",
        rowsAdded: 1,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    // Log the error for debugging
    console.error("Google Apps Script Error:", error)

    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        message: "Error: " + error.toString(),
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}
