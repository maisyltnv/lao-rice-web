import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Lao } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { StoreProvider } from '@/lib/store'
import { AuthProvider } from '@/lib/auth'
import { ShopChrome } from '@/components/layout/shop-chrome'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: '--font-geist',
})

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: '--font-geist-mono',
})

const notoSansLao = Noto_Sans_Lao({
  subsets: ['lao'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-lao',
})

export const metadata: Metadata = {
  title: 'ຮ້ານເຂົ້າສານ | ຈັດສົ່ງນະຄອນຫຼວງວຽງຈັນ',
  description: 'ຂາຍເຂົ້າຈ້າວ ເຂົ້າໜຽວ ຄຸນນະພາບດີ — ສັ່ງອອນລາຍ ແລະ ຈັດສົ່ງເຖິງບ້ານພາຍໃນນະຄອນຫຼວງວຽງຈັນ',
  keywords: ['ເຂົ້າສານ', 'ເຂົ້າໜຽວ', 'ເຂົ້າຈ້າວ', 'ວຽງຈັນ', 'ລາວ', 'rice', 'laos'],
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#7C5C1E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="lo" className={`${geist.variable} ${geistMono.variable} ${notoSansLao.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <StoreProvider>
          <AuthProvider>
            <ShopChrome>{children}</ShopChrome>
          </AuthProvider>
        </StoreProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
