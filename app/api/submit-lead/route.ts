import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received form data:", body)

    const { name, email, phone, monthlyBill, zipCode, homeSize, savings } = body

    // Google Sheets Web App URL (user will need to create this)
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL
    console.log("[v0] Google Sheets URL configured:", !!GOOGLE_SHEETS_URL)

    if (!GOOGLE_SHEETS_URL) {
      console.log("[v0] Error: Google Sheets URL not configured")
      throw new Error("Google Sheets URL not configured")
    }

    // Prepare data for Google Sheets
    const sheetData = {
      name,
      email,
      phone,
      monthlyBill,
      zipCode,
      homeSize,
      monthlySavings: savings?.monthly || 0,
      annualSavings: savings?.annual || 0,
      tenYearSavings: savings?.tenYear || 0,
    }

    console.log("[v0] Sending data to Google Sheets:", sheetData)

    const response = await fetch(GOOGLE_SHEETS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sheetData),
      redirect: "follow",
    })

    console.log("[v0] Google Sheets response status:", response.status)
    const responseText = await response.text()
    console.log("[v0] Google Sheets response:", responseText)

    if (!response.ok) {
      console.log("[v0] Google Sheets request failed with status:", response.status)
      throw new Error(`Google Sheets request failed: ${response.status} - ${responseText}`)
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      console.log("[v0] Response is not JSON, treating as success")
      responseData = { success: true }
    }

    if (responseData.success === false) {
      throw new Error(responseData.message || "Google Sheets reported failure")
    }

    console.log("[v0] Lead submitted successfully")
    return NextResponse.json({ success: true, message: "Lead submitted successfully" })
  } catch (error) {
    console.error("[v0] Error submitting lead:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to submit lead",
      },
      { status: 500 },
    )
  }
}
