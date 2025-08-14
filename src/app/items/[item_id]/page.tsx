import { notFound } from 'next/navigation';
import Link from 'next/link';
import itemsKr from '../../../../data/items.kr.json';

type Props = {
	params: Promise<{ item_id: string }>;
	searchParams: Promise<{ country?: string }>;
};

type RuleValue = boolean | string | null | undefined;
type RuleSummary = { carry_on: RuleValue; checked: RuleValue };
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
	rules_summary?: Record<string, RuleSummary>;
	rules_sources?: Record<string, string[]>;
};
type ItemsData = { country?: string; items: Item[] };

export default async function ItemPage({ params, searchParams }: Props) {
	const { item_id } = await params;
	const numericId = Number(item_id);
	if (!Number.isFinite(numericId)) return notFound();
	const { country } = await searchParams;

	const data = itemsKr as unknown as ItemsData;
	const item = data.items.find((i) => i.item_id === numericId);
	if (!item) return notFound();

	const c = (country || data.country || 'KR').toUpperCase();
	const rule = item.rules_summary?.[c] ?? null;

	return (
		<div className="flex flex-col gap-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold">{item.item_name.KR}</h1>
					<p className="text-sm text-foreground/60">{item.description.KR}</p>
					<div className="text-sm text-foreground/60">item_id: {item_id}</div>
				</div>
				<Link
					href="/"
					className="text-sm px-3 py-1.5 rounded border hover:bg-black/5"
				>
					목록으로
				</Link>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<section className="md:col-span-2 card p-4">
					<div className="flex items-center gap-2 mb-3">
						<span>🌍</span>
						<div className="text-sm text-foreground/60">국가 선택</div>
					</div>
					<div className="flex gap-2 mb-4">
						{(['KR', 'US'] as const).map((code) => (
							<Link
								key={code}
								href={`?country=${code.toLowerCase()}`}
								className={`text-xs px-2 py-1 rounded border ${
									c === code ? 'bg-black/5' : 'hover:bg-black/5'
								}`}
							>
								{code}
							</Link>
						))}
					</div>
					{rule ? (
						<div className="space-y-2">
							<div className="text-sm">
								<span className="font-medium">기내:</span>{' '}
								{(() => {
									const v = rule.carry_on;
									if (v === true) return '허용';
									if (v === false) return '금지';
									if (typeof v === 'string') {
										const t = v.trim();
										if (t === '허용' || t === '금지') return t;
										if (/^true$/i.test(t)) return '허용';
										if (/^false$/i.test(t)) return '금지';
									}
									return '정보 없음';
								})()}
							</div>
							<div className="text-sm">
								<span className="font-medium">위탁:</span>{' '}
								{(() => {
									const v = rule.checked;
									if (v === true) return '허용';
									if (v === false) return '금지';
									if (typeof v === 'string') {
										const t = v.trim();
										if (t === '허용' || t === '금지') return t;
										if (/^true$/i.test(t)) return '허용';
										if (/^false$/i.test(t)) return '금지';
									}
									return '정보 없음';
								})()}
							</div>
						</div>
					) : (
						<div className="text-sm text-foreground/60">
							선택한 국가의 요약 규정이 없습니다.
						</div>
					)}
				</section>

				<aside className="card p-4 h-fit">
					<div className="text-sm font-medium mb-2">출처</div>
					<ul className="list-disc list-inside space-y-1 text-sm">
						{(item.rules_sources?.[c] ?? []).map((u: string) => (
							<li key={u}>
								<a
									className="underline text-foreground/80"
									href={u}
									target="_blank"
									rel="noreferrer"
								>
									{u}
								</a>
							</li>
						))}
					</ul>
				</aside>
			</div>
		</div>
	);
}
