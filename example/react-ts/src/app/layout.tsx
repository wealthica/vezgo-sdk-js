import type { Metadata } from 'next'
import './globals.css'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Vezgo Example App using React/TS',
  description: 'Next.js implementation of Vezgo SDK',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.4.1/mdb.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <nav className="navbar navbar-expand-lg bg-light">
          <div className="container-fluid">
            <a className="navbar-brand mt-2 mt-lg-0" href="https://vezgo.com/">
              <img
                src="https://vezgo.com/vezgo.svg"
                alt="Vezgo Logo"
                loading="lazy"
              />
            </a>
          </div>
        </nav>
        {children}
        <Script
          type="text/javascript"
          src="https://cdnjs.cloudflare.com/ajax/libs/mdb-ui-kit/6.4.1/mdb.min.js"
        />
      </body>
    </html>
  )
}