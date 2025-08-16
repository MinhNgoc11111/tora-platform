import '@/i18n';
import './globals.css';
import { ReactNode } from 'react';
import ClientWrapper from '@/components/ClientWrapper'


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-800">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
