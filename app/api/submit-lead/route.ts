import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received form data:", body)

    const { name, email, phone, monthlyBill, zipCode, homeSize, savings } = body

    // Google Sheets Web App URL (user will need to create this)
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL
    console.log("[v0] Google Sheets URL configured:", !!GOOGLE_SHEETS_URL)

    // Prepare data for logging/storage
    const leadData = {
      timestamp: new Date().toISOString(),
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

    if (!GOOGLE_SHEETS_URL) {
      console.log("[v0] Google Sheets not configured - using fallback storage")
      console.log("[v0] Lead data (SAVE THIS):", JSON.stringify(leadData, null, 2))

      return NextResponse.json({
        success: true,
        message: "Lead captured successfully! (Using fallback - check server logs for data)",
        fallback: true,
      })
    }

    console.log("[v0] Attempting Google Sheets submission...")

    try {
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(leadData),
        redirect: "manual", // Handle redirects manually to detect deployment issues
      })

      console.log("[v0] Google Sheets response status:", response.status)

      if (response.status === 302 || response.status === 301) {
        console.log("[v0] Redirect detected - Google Apps Script deployment issue")
        console.log("[v0] Using fallback storage for lead:", JSON.stringify(leadData, null, 2))

        return NextResponse.json({
          success: true,
          message: "Lead captured! Note: Google Sheets needs proper deployment (see console for setup instructions)",
          fallback: true,
          deploymentIssue: true,
        })
      }

      const responseText = await response.text()
      console.log("[v0] Google Sheets response:", responseText)

      if (!response.ok) {
        throw new Error(`Google Sheets error: ${response.status}`)
      }

      // Try to parse response
      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        if (responseText.includes("success") || responseText.includes("OK")) {
          responseData = { success: true }
        } else {
          throw new Error("Invalid response format")
        }
      }

      if (responseData.success === false) {
        throw new Error(responseData.message || "Google Sheets reported failure")
      }

      console.log("[v0] Lead submitted to Google Sheets successfully")
      return NextResponse.json({ success: true, message: "Lead submitted to Google Sheets successfully!" })
    } catch (sheetsError) {
      console.log("[v0] Google Sheets failed, using fallback storage")
      console.log("[v0] Lead data (SAVE THIS):", JSON.stringify(leadData, null, 2))
      console.log("[v0] Google Sheets error:", sheetsError)

      return NextResponse.json({
        success: true,
        message: "Lead captured successfully! (Google Sheets unavailable - check server logs for data)",
        fallback: true,
      })
    }
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
