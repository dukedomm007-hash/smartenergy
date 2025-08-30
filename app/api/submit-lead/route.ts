import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, monthlyBill, zipCode, homeSize, savings } = body

    // Google Sheets Web App URL (user will need to create this)
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL

    if (!GOOGLE_SHEETS_URL) {
      throw new Error("Google Sheets URL not configured")
    }

    // Prepare data for Google Sheets
    const sheetData = {
      timestamp: new Date().toISOString(),
      name,
      email,
      phone,
      monthlyBill,
      zipCode,
      homeSize,
      monthlySavings: savings.monthly,
      annualSavings: savings.annual,
      tenYearSavings: savings.tenYear,
    }

    // Send data to Google Sheets
    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sheetData),
    })

    if (!response.ok) {
      throw new Error("Failed to submit to Google Sheets")
    }

    return NextResponse.json({ success: true, message: "Lead submitted successfully" })
  } catch (error) {
    console.error("Error submitting lead:", error)
    return NextResponse.json({ success: false, message: "Failed to submit lead" }, { status: 500 })
  }
}
