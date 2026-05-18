import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RhinoConnect - Smart Booking & CRM Platform',
  description:
    'The all-in-one digital booking and customer management platform for tourism, hospitality, and service businesses in Nepal.',
  keywords: 'booking, CRM, Nepal, tourism, hospitality, hotel management',
  openGraph: {
    title: 'RhinoConnect',
    description: 'Smart Booking + Customer Engagement Platform for Nepal',
    type: 'website',
  },
  icons: {
    icon: '/brand/rhinoconnect-mark.svg',
    shortcut: '/brand/rhinoconnect-mark.svg',
    apple: '/brand/rhinoconnect-mark.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
