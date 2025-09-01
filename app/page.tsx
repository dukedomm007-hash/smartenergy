"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EnergyCalculatorPage() {
  const [monthlyBill, setMonthlyBill] = useState("")
  const [zipCode, setZipCode] = useState("")
  const [homeSize, setHomeSize] = useState("")
  const [showResults, setShowResults] = useState(false)
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [savings, setSavings] = useState({
    monthly: 0,
    annual: 0,
    tenYear: 0,
  })
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
  })

  const calculateSavings = () => {
    const bill = Number.parseFloat(monthlyBill)

    if (!bill || !zipCode || !homeSize) {
      alert("Please fill in all fields to calculate your savings.")
      return
    }

    // Simple savings calculation (65% average savings)
    const savingsPercentage = 0.65
    const monthlySavings = Math.round(bill * savingsPercentage)
    const annualSavings = monthlySavings * 12
    const tenYearSavings = annualSavings * 10

    setSavings({
      monthly: monthlySavings,
      annual: annualSavings,
      tenYear: tenYearSavings,
    })

    setShowResults(true)
  }

  const generatePDFReport = async (userData: typeof leadForm, savingsData: typeof savings) => {
    // Create PDF content as HTML string
    const reportHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Energy Savings Report - ${userData.name}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px; margin-bottom: 30px; }
          .savings-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
          .savings-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #3b82f6; }
          .savings-amount { font-size: 28px; font-weight: bold; color: #059669; }
          .section { margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; }
          .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Your Personalized Energy Savings Report</h1>
          <p>Prepared for: ${userData.name}</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <p>Based on your monthly electric bill of $${monthlyBill} and home details, here's your personalized savings projection:</p>
          
          <div class="savings-grid">
            <div class="savings-card">
              <h3>Monthly Savings</h3>
              <div class="savings-amount">$${savingsData.monthly}</div>
            </div>
            <div class="savings-card">
              <h3>Annual Savings</h3>
              <div class="savings-amount">$${savingsData.annual.toLocaleString()}</div>
            </div>
            <div class="savings-card">
              <h3>10-Year Savings</h3>
              <div class="savings-amount">$${savingsData.tenYear.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Your Home Profile</h2>
          <p><strong>Location:</strong> ${zipCode}</p>
          <p><strong>Home Size:</strong> ${homeSize === "small" ? "Under 1,500 sq ft" : homeSize === "medium" ? "1,500 - 2,500 sq ft" : "Over 2,500 sq ft"}</p>
          <p><strong>Current Monthly Bill:</strong> $${monthlyBill}</p>
        </div>

        <div class="highlight">
          <h3>Key Benefits for Your Home:</h3>
          <ul>
            <li>Reduce your energy costs by up to 65%</li>
            <li>Protection against rising utility rates</li>
            <li>Increase your home's value</li>
            <li>Environmental impact: Equivalent to planting ${Math.round(savingsData.annual / 50)} trees annually</li>
            <li><strong>Enjoy Fixed Energy Rate:</strong> Lock in a $0.12/kWh rate for the first year, with a 2.9% annual increase, offering protection from rising electricity costs for up to 25 years.</li>
            <li><strong>Savings & Stability:</strong> Reduce reliance on the grid, providing you with stable, predictable energy costs while mitigating the impact of rising utility rates.</li>
          </ul>
        </div>

        <div class="section">
          <h2>Next Steps</h2>
          <p><strong>Complimentary Home Assessment:</strong> An Energy Consultant from our team will reach out to you within 24 hours to arrange a no-obligation consultation with one of our engineers.</p>
        </div>

      </body>
      </html>
    `

    // Convert HTML to PDF using browser's print functionality
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(reportHTML)
      printWindow.document.close()

      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000)
    }
  }

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!leadForm.name || !leadForm.email || !leadForm.phone) {
      alert("Please fill in all fields to get your report.")
      return
    }

    if (!showResults) {
      alert("Please calculate your savings first to generate your report.")
      return
    }

    setIsGeneratingReport(true)

    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leadForm.name,
          email: leadForm.email,
          phone: leadForm.phone,
          monthlyBill,
          zipCode,
          homeSize,
          savings,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.message)
      }

      // Generate PDF report after successful submission
      await generatePDFReport(leadForm, savings)

      // Show success message
      alert(
        "Get your complete savings report and next steps—absolutely free. Your information has been saved and your report is being generated.",
      )

      // Clear form
      setLeadForm({ name: "", email: "", phone: "" })
    } catch (error) {
      console.error("Error submitting lead:", error)
      alert("There was an issue submitting your information. Please try again.")
    } finally {
      setIsGeneratingReport(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Hero Header */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] opacity-30"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 drop-shadow-lg">Stop Overpaying on Energy Bills</h1>
              <p className="text-xl md:text-2xl mb-8 opacity-95">
                Discover how you can save thousands while protecting against rising utility rates
              </p>
              <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-lg border border-white/30 animate-pulse">
                Average homeowners save $1,500+ per year
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Pain Point Section */}
            <Card className="mb-12 border-l-4 border-l-orange-500">
              <CardContent className="pt-8 text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-6">Tired of Unpredictable Energy Bills?</h2>
                <p className="text-lg text-slate-600 mb-6 max-w-4xl mx-auto">
                  With utility rates rising 5-10% annually, homeowners are feeling the squeeze. Alternative energy isn't
                  just about going green—it's your financial shield against unpredictable costs, putting money back in
                  your pocket while reliably powering your home.
                </p>
                <div className="inline-block bg-white p-4 rounded-lg shadow-md font-semibold text-orange-500 text-xl">
                  Homeowners typically save 50-70% on their monthly energy costs
                </div>
              </CardContent>
            </Card>

            {/* Calculator Section */}
            <Card className="mb-12">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-slate-800">🌞 Free Energy Savings Calculator</CardTitle>
                <p className="text-lg text-slate-600">Get your personalized savings estimate in 60 seconds</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyBill" className="text-base font-semibold">
                      Monthly Electric Bill ($)
                    </Label>
                    <Input
                      id="monthlyBill"
                      type="number"
                      placeholder="e.g., 200"
                      value={monthlyBill}
                      onChange={(e) => setMonthlyBill(e.target.value)}
                      className="text-lg p-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode" className="text-base font-semibold">
                      Zip Code
                    </Label>
                    <Input
                      id="zipCode"
                      placeholder="e.g., 12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="text-lg p-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="homeSize" className="text-base font-semibold">
                      Home Size
                    </Label>
                    <Select value={homeSize} onValueChange={setHomeSize}>
                      <SelectTrigger className="text-lg p-4">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Under 1,500 sq ft</SelectItem>
                        <SelectItem value="medium">1,500 - 2,500 sq ft</SelectItem>
                        <SelectItem value="large">Over 2,500 sq ft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={calculateSavings}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    CALCULATE MY SAVINGS
                  </Button>
                </div>

                {/* Results */}
                {showResults && (
                  <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <CardContent className="pt-8 text-center">
                      <h3 className="text-2xl font-bold mb-6">Your Potential Energy Savings</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                          <h4 className="text-lg mb-2 opacity-90">Monthly Savings</h4>
                          <div className="text-3xl font-bold text-yellow-300">${savings.monthly}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                          <h4 className="text-lg mb-2 opacity-90">Annual Savings</h4>
                          <div className="text-3xl font-bold text-yellow-300">${savings.annual.toLocaleString()}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg">
                          <h4 className="text-lg mb-2 opacity-90">10-Year Savings</h4>
                          <div className="text-3xl font-bold text-yellow-300">${savings.tenYear.toLocaleString()}</div>
                        </div>
                      </div>
                      <p className="text-lg opacity-90">Get your full savings report details below</p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-slate-800 to-slate-700 text-white mb-12">
              <CardContent className="pt-12 pb-8 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Lock in Your Savings?</h2>
                <p className="text-xl mb-8 opacity-90">
                  Get your complete savings report and next steps—absolutely free.
                </p>

                <form onSubmit={handleLeadSubmit} className="max-w-2xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <Input
                      placeholder="Your Name"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
                      required
                      className="text-slate-800"
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
                      required
                      className="text-slate-800"
                    />
                    <Input
                      type="tel"
                      placeholder="Phone Number"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
                      required
                      className="text-slate-800"
                    />
                    <Button
                      type="submit"
                      disabled={isGeneratingReport}
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-slate-800 font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {isGeneratingReport ? "Generating..." : "Get My Free Report"}
                    </Button>
                  </div>
                </form>

                <p className="text-sm opacity-70 mt-4">
                  No spam, no high-pressure sales calls. Just helpful information to help you make the best decision.
                </p>
              </CardContent>
            </Card>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  quote:
                    "We cut our electric bill from $180 to just $45 per month. The savings have been incredible, and we wish we'd made the switch sooner!",
                  author: "Sarah M., Richardson, TX",
                },
                {
                  quote:
                    "Alternative energy has been a game-changer for our family. No more sticker shock when the electric bill arrives—just predictable, low costs every month.",
                  author: "Mike D., Plano, TX",
                },
                {
                  quote:
                    "The installation was smooth, and we started seeing savings immediately. Our neighbors are now asking us about it too!",
                  author: "Jennifer L., Dallas, TX",
                },
              ].map((testimonial, index) => (
                <Card key={index} className="border-l-4 border-l-indigo-500">
                  <CardContent className="pt-6">
                    <p className="italic text-slate-600 mb-4 text-lg">"{testimonial.quote}"</p>
                    <div className="font-semibold text-slate-800">- {testimonial.author}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
