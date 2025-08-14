import Header from '@/components/Header';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
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
				className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}
			>
				<div className="min-h-screen flex flex-col">
					<Header />
					<main className="max-w-5xl w-full mx-auto p-4 md:p-8">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
