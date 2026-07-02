import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Griot — Earn USDC when AI cites your work',
  description: 'Register articles and earn USDC when AI agents cite your content.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
