import type { Metadata } from 'next';
import Link from 'next/link';
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
				className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-hidden`}>
				<div className="min-h-screen flex flex-col">
					<header className="sticky top-0 z-10 border-b border-black/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
						<div className="h-14 flex items-center gap-3 px-4">
							<Link
								href="/"
								className="text-base md:text-lg font-semibold px-2 py-1 rounded hover:bg-black/5"
							>
								Can I Bring On Board?
							</Link>
							<nav className="ml-1">
								<ul className="flex items-center gap-1 md:gap-2 text-sm">
									<li>
										<Link
											href="/"
											className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-black/5 transition"
										>
											<span>🏠</span>
											<span className="hidden sm:inline">홈 · 검색</span>
											<span className="sm:hidden">홈</span>
										</Link>
									</li>
									<li>
										<Link
											href="/report"
											className="flex items-center gap-2 px-2 py-1.5 rounded border border-black/10 hover:bg-black/5 transition"
										>
											<span>📝</span>
											<span>제보하기</span>
										</Link>
									</li>
								</ul>
							</nav>
							<div className="flex-1" />
						</div>
					</header>
					<main className="max-w-5xl w-full mx-auto p-4 md:p-8">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
