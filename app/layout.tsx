import type React from "react"
import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const _geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

export const metadata: Metadata = {
  title: "ProductionPro | Enterprise Production Management",
  description: "Advanced Production & Inventory Management System",
  generator: "v0.app",
}

import { ProductionProvider } from "@/lib/production-context"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-inter antialiased">
        <ProductionProvider>
          {children}
        </ProductionProvider>
        <Analytics />
      </body>
    </html>
  )
}
