import type { Metadata } from "next"
import { Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Script from "next/script"

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets:  ["latin"],
  weight:   ["300", "400", "500", "600", "700"],
})

const fontMono = Plus_Jakarta_Sans({
  variable: "--font-geist-mono",
  subsets:  ["latin"],
})

export const metadata: Metadata = {
  title:       "CarePulse — Digital Healthcare Platform",
  description: "The complete digital healthcare platform for hospitals across Ghana and Africa.",
  icons: {
    icon: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
