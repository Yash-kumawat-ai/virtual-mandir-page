import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Noto_Serif_Devanagari } from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const notoDevanagari = Noto_Serif_Devanagari({
  variable: '--font-devanagari',
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Hari Kirtan — Virtual Mandir',
  description:
    'Enter the divine temple. Darshan of Shree Ram, Radha Krishna, Mahakal, and Hanuman Ji with offerings of flowers, diya, and bell.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#1a0f0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="hi"
      className={`bg-background ${cormorant.variable} ${notoDevanagari.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
