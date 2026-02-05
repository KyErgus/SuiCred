import type { Metadata } from 'next';
import { Space_Grotesk, Archivo_Black } from 'next/font/google';
import './globals.css';
import '@mysten/dapp-kit/dist/index.css';
import { Providers } from './providers';

const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const archivo = Archivo_Black({ subsets: ['latin'], weight: '400', variable: '--font-archivo' });

export const metadata: Metadata = {
  title: 'SuiCred — On-chain Reputation',
  description: 'SuiCred scores your on-chain activity and turns it into mintable reputation.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${space.variable} ${archivo.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
