'use client'

import { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'
import { CartProvider } from '@/context/CartContext'
import Header from '@/components/Header' // ✅ thêm dòng này


export default function ClientWrapper({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>
        <Header />
        {children}
      </CartProvider>
    </SessionProvider>
  )
}
