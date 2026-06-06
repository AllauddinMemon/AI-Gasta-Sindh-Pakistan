import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'GASTA AI — Teachers\' Claim Management',
  description:
    "Government Secondary Teachers' Association System — submit and track welfare claims with an AI assistant.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
