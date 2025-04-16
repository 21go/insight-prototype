import '../styles/globals.css';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';
import type { Metadata, Viewport } from 'next';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'Insight | Conference app built with LiveKit and Nextjs',
    template: '%s',
  },
  description:
    'Insight a project prototype for use in a user study run at Columbia University examining Candid Interactions in virtual spaces',
  openGraph: {
    url: 'https://readily-helped-roughy.ngrok-free.app/',
  },
  icons: {
    icon: {
      rel: 'icon',
      url: '/favicon.ico',
    },
  },
};

export const viewport: Viewport = {
  themeColor: '#070707',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body data-lk-theme="default" suppressHydrationWarning>
        <Toaster />
        {children}
      </body>
    </html>
  );
}
