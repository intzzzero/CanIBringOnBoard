'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import itemsKr from '../../data/items.kr.json';

type RuleValue = boolean | string | null | undefined;
type RuleSummary = { carry_on: RuleValue; checked: RuleValue };
type Item = {
	item_id: number;
	name_ko: string;
	rules_summary?: Record<string, RuleSummary>;
	published?: boolean;
};
type ItemsData = { country?: string; items: Item[] };

export default function Home() {
	const [query, setQuery] = useState('');

	const data = itemsKr as unknown as ItemsData;
	const defaultCountry = (data.country || 'KR').toUpperCase();

	const list = useMemo(() => {
		const items = (data.items || []).filter((i) => i.published !== false);
		return items.map((i) => {
			const rule = i.rules_summary?.[defaultCountry];
			const toRuleLabel = (value: RuleValue): string => {
				if (value === true) return '허용';
				if (value === false) return '금지';
				if (typeof value === 'string') {
					const trimmed = value.trim();
					if (trimmed === '허용' || trimmed === '금지') return trimmed;
					if (/^true$/i.test(trimmed)) return '허용';
					if (/^false$/i.test(trimmed)) return '금지';
				}
				return '정보 없음';
			};
			const summary = rule
				? `기내 ${toRuleLabel(rule.carry_on)} · 위탁 ${toRuleLabel(
						rule.checked
				  )}`
				: '';
			return {
				item_id: i.item_id,
				name_ko: i.name_ko,
				summary,
			};
		});
	}, [data.items, defaultCountry]);

	const filtered = useMemo(() => {
		const q = query.toLowerCase();
		if (!q) return [];
		return list
			.filter((x) =>
				`${x.item_id} ${x.name_ko} ${x.summary}`.toLowerCase().includes(q)
			)
			.slice(0, 100);
	}, [list, query]);

	return (
		<div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center px-4 gap-6 pt-[25vh]">
			<div className="w-full max-w-md mx-auto flex flex-col gap-4 items-center">
				<h1 className="text-2xl font-semibold tracking-tight text-center">
					어떤 물품을 가져가시나요?
				</h1>
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
			</div>

			{query && (
				<div className="w-full max-w-md mx-auto flex flex-col gap-1">
					<div className="text-xs text-foreground/60">
						결과 {filtered.length}건
					</div>
					<div className="divide-y divide-black/5 rounded-lg border border-black/10 overflow-hidden">
						{filtered.map((item) => (
							<Link
								key={item.item_id}
								href={`/items/${String(item.item_id)}`}
								className="block px-4 py-3 hover:bg-black/5 transition"
							>
								<div className="flex items-center justify-between">
									<div className="font-medium">{item.name_ko}</div>
								</div>
								<div className="text-sm text-foreground/70 mt-1">
									{item.summary}
								</div>
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
