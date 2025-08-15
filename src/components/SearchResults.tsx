'use client';

import Link from 'next/link';

type Item = {
	item_id: number;
	item_name: {
		KR: string;
		EN: string;
	};
	description: {
		KR: string;
		EN: string;
	};
};

type SearchResultsProps = {
	items: Item[];
	loading: boolean;
};

export default function SearchResults({ items, loading }: SearchResultsProps) {
	return (
		<div className="w-full max-w-lg mx-auto flex flex-col gap-4">
			<div
				className="text-sm font-semibold px-2"
				style={{ color: 'var(--foreground-secondary)' }}
			>
				검색 결과 {items.length}건
			</div>
			<div className="space-y-3 max-h-96 overflow-y-auto">
				{loading ? (
					<div className="px-4 py-6 text-center" style={{ color: 'var(--foreground-muted)' }}>
						검색 중...
					</div>
				) : (
					items.map((item) => (
						<Link
							key={item.item_id}
							href={`/items/${String(item.item_id)}`}
							className="block px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
						>
							<div className="font-medium" style={{ color: 'var(--foreground)' }}>
								{item.item_name.KR}
							</div>
							{item.description && (
								<div
									className="text-sm mt-1 line-clamp-2"
									style={{ color: 'var(--foreground-secondary)' }}
								>
									{item.description.KR}
								</div>
							)}
						</Link>
					))
				)}
			</div>
		</div>
	);
}
