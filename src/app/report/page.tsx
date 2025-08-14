'use client';
import { useState } from 'react';

export default function ReportPage() {
	const [itemId, setItemId] = useState('');
	const [type, setType] = useState<'url' | 'text' | 'correction'>('url');
	const [payload, setPayload] = useState('');
	const [submitted, setSubmitted] = useState(false);

	const canSubmit = itemId.trim().length > 0 && payload.trim().length > 0;

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		// 실제 API 연결 시 /api/report POST 호출
		await new Promise((r) => setTimeout(r, 300));
		setSubmitted(true);
	}

	return (
		<div className="flex flex-col gap-6">
			<h1 className="text-2xl font-semibold">규정 제보</h1>
			<p className="text-sm text-foreground/70">
				출처 URL 또는 텍스트를 제출해 주세요. 관리자가 검수 후 반영합니다.
			</p>

			{submitted ? (
				<div className="card p-4">
					<div className="text-sm">제출이 완료되었습니다. 감사합니다!</div>
				</div>
			) : (
				<form onSubmit={onSubmit} className="card p-4 space-y-4">
					<div className="space-y-2">
						<label className="text-sm font-medium">물품명</label>
						<input
							value={itemId}
							onChange={(e) => setItemId(e.target.value)}
							placeholder="예: 보조배터리"
							className="w-full rounded-md border border-black/10 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
						/>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-medium">내용</label>
						<textarea
							value={payload}
							onChange={(e) => setPayload(e.target.value)}
							rows={5}
							placeholder={'내용을 입력해 주세요.'}
							className="w-full rounded-md border border-black/10 bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
						/>
						<div className="text-xs text-foreground/60">
							스팸/개인정보는 금지입니다.
						</div>
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={!canSubmit}
							className="text-sm px-4 py-2 rounded border border-black/10 bg-black/90 text-white disabled:opacity-50"
						>
							제출
						</button>
					</div>
				</form>
			)}
		</div>
	);
}
