'use client';
import { useSearch } from '@/hooks/useSearch';
import SearchInput from '@/components/SearchInput';
import SearchResults from '@/components/SearchResults';

export default function Home() {
	const { query, setQuery, items, suggestions, loading } = useSearch();

	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center px-4 gap-8 pt-[20vh]">
			<div className="w-full max-w-lg mx-auto flex flex-col gap-6 items-center">
				<div className="text-center space-y-3">
					<div
						className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
						style={{
							background:
								'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)',
						}}
					>
						<span className="text-2xl">✈️</span>
					</div>
					<h1
						className="text-3xl font-bold tracking-tight text-center"
						style={{ color: 'var(--secondary)' }}
					>
						어떤 물품을 가져가시나요?
					</h1>
					<p
						className="text-lg"
						style={{ color: 'var(--foreground-secondary)' }}
					>
						항공기 기내 반입 규정을 쉽게 확인하세요
					</p>
				</div>
				<SearchInput
					query={query}
					setQuery={setQuery}
					suggestions={suggestions}
				/>
			</div>

			{query && <SearchResults items={items} loading={loading} />}
		</div>
	);
}
