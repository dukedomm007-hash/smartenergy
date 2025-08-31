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
        Accept: "application/json",
      },
      body: JSON.stringify(sheetData),
      redirect: "follow", // This should follow redirects automatically
    })

    console.log("[v0] Google Sheets response status:", response.status)
    const responseText = await response.text()
    console.log("[v0] Google Sheets response:", responseText)

    if (response.status === 302) {
      console.log("[v0] Received redirect - this indicates Google Apps Script deployment issue")
      throw new Error(
        `Google Apps Script deployment error: Please ensure your script is deployed as a web app with 'Anyone' access permissions. Status: ${response.status}`,
      )
    }

    if (!response.ok) {
      console.log("[v0] Google Sheets request failed with status:", response.status)

      if (response.status === 403) {
        throw new Error(
          `Access denied: Please check that your Google Apps Script is deployed with 'Anyone' access permissions. Status: ${response.status}`,
        )
      } else if (response.status === 404) {
        throw new Error(
          `Script not found: Please verify your Google Apps Script URL is correct. Status: ${response.status}`,
        )
      } else {
        throw new Error(`Google Sheets request failed: ${response.status} - ${responseText}`)
      }
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (e) {
      if (responseText.includes("success") || responseText.includes("OK")) {
        console.log("[v0] Response appears successful despite not being JSON")
        responseData = { success: true }
      } else {
        console.log("[v0] Response is not JSON and doesn't indicate success:", responseText)
        throw new Error("Invalid response from Google Sheets")
      }
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
