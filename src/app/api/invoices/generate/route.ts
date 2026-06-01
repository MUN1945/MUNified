import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import PDFDocument from "pdfkit"
import { readFile } from "fs/promises"
import path from "path"

// Use Node.js runtime for PDF generation (requires fs access)
export const runtime = 'nodejs'

// ============================================================
// POST /api/invoices/generate — Generate a professional PDF invoice
// Authenticated users can generate invoices for their payments
// Master Admin can generate invoices for any user
// ============================================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      invoiceId,
      paymentId,
      userId,
      invoiceData,
    } = body

    let targetUserId = session.user.id
    const isAdmin = ["MASTER_ADMIN", "FOUNDER", "SUPER_ADMIN"].includes(session.user.role as string)

    // Admin can generate invoices for other users
    if (userId && isAdmin) {
      targetUserId = userId
    }

    // Fetch user info
    const user = await db.user.findUnique({
      where: { id: targetUserId },
      include: { subscription: true, school: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      )
    }

    // Build invoice data
    let invoiceNumber = invoiceData?.invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}`
    let invoiceDate = invoiceData?.date || new Date().toISOString().split("T")[0]
    let amount = invoiceData?.amount || 0
    let currency = invoiceData?.currency || "USD"
    let description = invoiceData?.description || "Subscription Payment"
    let status = invoiceData?.status || "Paid"
    let planName = invoiceData?.planName || user.subscription?.tier?.replace(/_/g, " ") || "Free"
    let billingPeriod = invoiceData?.billingPeriod || "Monthly"

    // If referencing a DB invoice, fetch it
    if (invoiceId) {
      const invoice = await db.invoice.findUnique({ where: { id: invoiceId } })
      if (invoice) {
        invoiceNumber = invoice.invoiceNumber
        invoiceDate = (invoice.paidAt || invoice.createdAt).toISOString().split("T")[0]
        amount = invoice.amount
        currency = invoice.currency
        status = invoice.status === "PAID" ? "Paid" : invoice.status === "DRAFT" ? "Draft" : invoice.status
      }
    }

    // If referencing a DB payment, fetch it
    if (paymentId) {
      const payment = await db.payment.findUnique({ where: { id: paymentId } })
      if (payment) {
        invoiceNumber = `INV-${payment.id.slice(-8).toUpperCase()}`
        invoiceDate = payment.createdAt.toISOString().split("T")[0]
        amount = payment.amount
        currency = payment.currency
        description = payment.description || "Subscription Payment"
        status = payment.status === "COMPLETED" ? "Paid" : payment.status === "PENDING" ? "Pending" : "Failed"
      }
    }

    // Generate the PDF
    const pdfBuffer = await generateInvoicePDF({
      invoiceNumber,
      invoiceDate,
      customerName: user.name,
      customerEmail: user.email,
      customerSchool: user.school?.name,
      planName,
      billingPeriod,
      description,
      amount,
      currency,
      status,
    })

    // Return PDF as downloadable response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="DiplomatiQ-Invoice-${invoiceNumber}.pdf"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("[INVOICE GENERATE] Error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to generate invoice PDF" },
      { status: 500 }
    )
  }
}

// ============================================================
// PDF Generation using PDFKit
// ============================================================

interface InvoicePDFData {
  invoiceNumber: string
  invoiceDate: string
  customerName: string
  customerEmail: string
  customerSchool?: string | null
  planName: string
  billingPeriod: string
  description: string
  amount: number
  currency: string
  status: string
}

async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `DiplomatiQ Invoice ${data.invoiceNumber}`,
          Author: "DiplomatiQ",
          Subject: "Invoice",
        },
      })

      const chunks: Buffer[] = []
      doc.on("data", (chunk: Buffer) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      // Brand colors
      const navy = "#0D1B2A"
      const gold = "#D4A843"
      const teal = "#0A7E8C"
      const darkGray = "#4A5568"
      const lightGray = "#F7F8FA"
      const mediumGray = "#E2E8F0"
      const white = "#FFFFFF"

      // Try to load the logo
      let logoBuffer: Buffer | null = null
      try {
        const logoPath = path.join(process.cwd(), "public", "logo.png")
        logoBuffer = await readFile(logoPath)
      } catch {
        // Logo not available, skip it
      }

      // ============================================================
      // HEADER SECTION
      // ============================================================

      // Navy header bar
      doc.rect(0, 0, doc.page.width, 130).fill(navy)

      // Logo
      if (logoBuffer) {
        doc.image(logoBuffer, 50, 25, { width: 60, height: 60 })
      }

      // Company name
      doc.fontSize(28).font("Helvetica-Bold")
        .fillColor(white)
        .text("DiplomatiQ", logoBuffer ? 125 : 50, 30, { continued: false })

      // Tagline
      doc.fontSize(9).font("Helvetica")
        .fillColor("#94A3B8")
        .text("The Operating System for Model United Nations", logoBuffer ? 125 : 50, 62)

      // Invoice label (right side)
      doc.fontSize(12).font("Helvetica-Bold")
        .fillColor(gold)
        .text("INVOICE", 0, 35, { align: "right", width: doc.page.width - 50 })

      doc.fontSize(9).font("Helvetica")
        .fillColor("#94A3B8")
        .text(data.invoiceNumber, 0, 55, { align: "right", width: doc.page.width - 50 })

      // Gold accent line below header
      doc.rect(0, 130, doc.page.width, 3).fill(gold)

      // ============================================================
      // INVOICE DETAILS ROW
      // ============================================================

      const detailsY = 150

      // Left: Invoice details
      doc.fontSize(8).font("Helvetica").fillColor(darkGray)
      doc.text("Invoice Date", 50, detailsY)
      doc.font("Helvetica-Bold").fillColor(navy)
      doc.text(data.invoiceDate, 50, detailsY + 14)

      doc.font("Helvetica").fillColor(darkGray)
      doc.text("Status", 50, detailsY + 38)
      doc.font("Helvetica-Bold").fillColor(data.status === "Paid" ? "#059669" : "#D97706")
      doc.text(data.status, 50, detailsY + 52)

      // Right: Billed To
      doc.fontSize(8).font("Helvetica").fillColor(darkGray)
      doc.text("Billed To", 300, detailsY)
      doc.font("Helvetica-Bold").fillColor(navy).fontSize(11)
      doc.text(data.customerName, 300, detailsY + 14)
      doc.font("Helvetica").fillColor(darkGray).fontSize(9)
      doc.text(data.customerEmail, 300, detailsY + 32)
      if (data.customerSchool) {
        doc.text(data.customerSchool, 300, detailsY + 46)
      }

      // ============================================================
      // DIVIDER
      // ============================================================

      const dividerY = detailsY + 75
      doc.moveTo(50, dividerY).lineTo(doc.page.width - 50, dividerY)
        .strokeColor(mediumGray).lineWidth(1).stroke()

      // ============================================================
      // INVOICE TABLE HEADER
      // ============================================================

      const tableY = dividerY + 20

      // Table header background
      doc.rect(50, tableY, doc.page.width - 100, 30).fill(lightGray)

      doc.fontSize(9).font("Helvetica-Bold").fillColor(darkGray)
      doc.text("Description", 65, tableY + 9)
      doc.text("Plan", 280, tableY + 9)
      doc.text("Period", 400, tableY + 9)
      doc.text("Amount", 500, tableY + 9, { align: "right", width: 50 })

      // ============================================================
      // INVOICE TABLE ROW
      // ============================================================

      const rowY = tableY + 35
      doc.fontSize(10).font("Helvetica").fillColor(navy)
      doc.text(data.description, 65, rowY)
      doc.text(data.planName, 280, rowY)
      doc.text(data.billingPeriod, 400, rowY)
      doc.text(`${data.currency} ${data.amount.toFixed(2)}`, 500, rowY, { align: "right", width: 50 })

      // Light line below row
      doc.moveTo(50, rowY + 25).lineTo(doc.page.width - 50, rowY + 25)
        .strokeColor(mediumGray).lineWidth(0.5).stroke()

      // ============================================================
      // TOTALS SECTION
      // ============================================================

      const totalsY = rowY + 40

      // Subtotal
      doc.fontSize(9).font("Helvetica").fillColor(darkGray)
      doc.text("Subtotal", 400, totalsY)
      doc.text(`${data.currency} ${data.amount.toFixed(2)}`, 500, totalsY, { align: "right", width: 50 })

      // Tax (0 for now)
      doc.text("Tax", 400, totalsY + 18)
      doc.text(`${data.currency} 0.00`, 500, totalsY + 18, { align: "right", width: 50 })

      // Total line
      doc.moveTo(400, totalsY + 40).lineTo(doc.page.width - 50, totalsY + 40)
        .strokeColor(navy).lineWidth(1.5).stroke()

      // Total amount
      doc.fontSize(13).font("Helvetica-Bold").fillColor(navy)
      doc.text("Total", 400, totalsY + 48)
      doc.text(`${data.currency} ${data.amount.toFixed(2)}`, 500, totalsY + 48, { align: "right", width: 50 })

      // Paid badge if status is paid
      if (data.status === "Paid") {
        doc.roundedRect(475, totalsY + 72, 75, 22, 4)
          .fill("#059669")
        doc.fontSize(9).font("Helvetica-Bold").fillColor(white)
          .text("PAID", 475, totalsY + 77, { align: "center", width: 75 })
      }

      // ============================================================
      // PAYMENT INFO SECTION
      // ============================================================

      const paymentY = totalsY + 110

      doc.rect(50, paymentY, doc.page.width - 100, 60)
        .fillAndStroke(lightGray, mediumGray)

      doc.fontSize(8).font("Helvetica-Bold").fillColor(darkGray)
      doc.text("Payment Information", 65, paymentY + 10)

      doc.fontSize(8).font("Helvetica").fillColor(darkGray)
      doc.text("Payment Method: Credit Card (via Lemon Squeezy)", 65, paymentY + 26)
      doc.text("Payment Status: Paid" + (data.status === "Paid" ? " — Thank you for your business!" : ""), 65, paymentY + 40)

      // ============================================================
      // FOOTER
      // ============================================================

      const footerY = doc.page.height - 100

      // Gold line
      doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY)
        .strokeColor(gold).lineWidth(1).stroke()

      // Company info
      doc.fontSize(8).font("Helvetica-Bold").fillColor(navy)
      doc.text("DiplomatiQ", 50, footerY + 10)
      doc.fontSize(7).font("Helvetica").fillColor(darkGray)
      doc.text("https://mun-diplomatiq.vercel.app", 50, footerY + 23)
      doc.text("support@diplomatiq.io", 50, footerY + 34)

      // Right side footer
      doc.fontSize(7).font("Helvetica").fillColor(darkGray)
      doc.text("This invoice was generated automatically.", 0, footerY + 10, { align: "right", width: doc.page.width - 50 })
      doc.text("For questions, contact support@diplomatiq.io", 0, footerY + 23, { align: "right", width: doc.page.width - 50 })

      // Finalize
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
