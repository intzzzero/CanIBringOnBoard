'use client';

import { Dispatch, SetStateAction } from 'react';

type SearchInputProps = {
	query: string;
	setQuery: Dispatch<SetStateAction<string>>;
	suggestions: string[];
};

export default function SearchInput({
	query,
	setQuery,
	suggestions,
}: SearchInputProps) {
	return (
		<div className="w-full flex flex-col gap-3">
			<div
				className="w-full flex items-center gap-4 rounded-2xl bg-white px-6 py-4 shadow-lg transition-all duration-300 focus-within:shadow-xl h-16"
				style={{
					border: `2px solid var(--border-light)`,
					background: 'linear-gradient(135deg, #ffffff 0%, #F8FAFE 100%)',
				}}
			>
				<div
					className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
					style={{ background: 'var(--primary-light)' }}
				>
					<span style={{ color: 'var(--primary)' }}>🔍</span>
				</div>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="예: 보조배터리, 라이터, 가위..."
					className="flex-1 bg-transparent outline-none text-lg font-medium h-8"
				/>
			</div>
		</div>
	);
}
