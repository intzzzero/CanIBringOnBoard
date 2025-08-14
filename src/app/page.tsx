'use client';
import { useSearch } from '@/hooks/useSearch';
import SearchInput from '@/components/SearchInput';
import SearchResults from '@/components/SearchResults';

export default function Home() {
	const { query, setQuery, items, suggestions, loading } = useSearch();

	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center px-4 gap-6 pt-[25vh]">
			<div className="w-full max-w-md mx-auto flex flex-col gap-4 items-center">
				<h1 className="text-2xl font-semibold tracking-tight text-center">
					어떤 물품을 가져가시나요?
				</h1>
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
