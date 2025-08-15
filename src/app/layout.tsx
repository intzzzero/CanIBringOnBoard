import Header from '@/components/Header';
import type { Metadata } from 'next';
import { Inter, Geist_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
	weight: ['400', '600', '700'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'Can I Bring On Board',
	description: '항공 기내 반입 규정 검색',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ko">
			<body
				className={`${inter.variable} ${geistMono.variable} antialiased overflow-hidden`}
			>
				<div
					className="min-h-screen flex flex-col"
					style={{ background: 'var(--background)' }}
				>
					<Header />
					<main className="max-w-6xl w-full mx-auto flex-1">{children}</main>
				</div>
			</body>
		</html>
	);
}
