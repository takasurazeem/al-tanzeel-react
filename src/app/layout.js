import '../app/shared/styles/fonts.css';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@fontsource/noto-sans-arabic';
import '@fontsource/amiri';
import { LanguageProvider } from './contexts/LanguageContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Al-Tanzeel - Verses for Translation",
  description: "A tool for selecting Quranic verses and words for translation and study",
  viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
