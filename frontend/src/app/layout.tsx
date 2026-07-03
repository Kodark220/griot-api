import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Griot — Earn USDC when AI cites your work',
  description: 'Register articles and earn USDC when AI agents cite your content.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap" rel="stylesheet" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
