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
		<div className="w-full flex flex-col gap-2">
			<div className="w-full flex items-center gap-2 rounded-lg border border-black/10 bg-background px-3 py-3 shadow-sm focus-within:ring-2 focus-within:ring-black/10 transition">
				<span>🔎</span>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="예: 보조배터리, 라이터, 가위"
					className="flex-1 bg-transparent outline-none text-base placeholder:text-foreground/40"
				/>
				{query && (
					<button
						onClick={() => setQuery('')}
						className="text-xs px-2 py-1 rounded hover:bg-black/5"
					>
						지우기
					</button>
				)}
			</div>
			{/* {suggestions.length > 0 && (
        <div className="w-full bg-background rounded-lg border border-black/10 shadow-sm">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="px-4 py-2 cursor-pointer hover:bg-black/5"
              onClick={() => setQuery(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )} */}
		</div>
	);
}
