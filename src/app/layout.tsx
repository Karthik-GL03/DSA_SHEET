import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AlgoPulse — Unified Data Structures & Algorithms Tracking Platform',
  description: 'Automated, multi-platform DSA tracker aggregating LeetCode, Codeforces, and GeeksforGeeks progress against Striver A2Z & NeetCode 150 curricula with real-time Telegram alerts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-950 text-slate-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
