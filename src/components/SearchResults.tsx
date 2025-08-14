'use client';

import Link from "next/link";

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
    <div className="w-full max-w-md mx-auto flex flex-col gap-1">
      <div className="text-xs text-foreground/60">
        결과 {items.length}건
      </div>
      <div className="divide-y divide-black/5 rounded-lg border border-black/10 overflow-hidden max-h-96 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-3 text-center text-foreground/60">...</div>
        ) : (
          items.map((item) => (
            <Link
              key={item.item_id}
              href={`/items/${String(item.item_id)}`}
              className="block px-4 py-3 hover:bg-black/5 transition"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{item.item_name.KR}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
