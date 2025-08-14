# CanIBringOnBoard — DB & API 설계서 (Next.js + Supabase)

**버전:** 1.0  
**작성일:** 2025-08-10

---

## 요약

이 문서는 '데이터 유지비 절감형' 설계(범위 축소 + 자동화 + 커뮤니티 제보)를 기반으로 한 **PostgreSQL(JSONB) 테이블 구조, 인덱스, Supabase 연동, 그리고 Next.js API 라우트 예시**를 제공합니다.  
목표는 빠른 MVP 구현, 낮은 운영비, 실용성 확보입니다.

---

## 아키텍처 개요

- Frontend: Next.js (App Router, Typescript)
- Backend: Supabase(Postgres, Auth, Storage, Edge Functions optional)
- 배포: Vercel (Next.js)
- 데이터 갱신: 자동 크롤러(주 1회) + 사용자 제보 워크플로우
- 범위: TOP 항공사/국가 중심의 요약 규정(출처 URL 포함)

---

## DB 설계

### items 테이블 (요약 규정 중심)

- 목적: 각 물품에 대해 핵심 규정(요약)과 출처 링크만 저장

```sql
CREATE TABLE public.items (
  id bigserial PRIMARY KEY,
  item_id text NOT NULL UNIQUE,       -- ex: 'powerbank'
  name_en text,
  name_ko text,
  primary_category text,              -- ex: 'electronics'
  tags text[] DEFAULT '{}',           -- ex: ['battery','lithium']
  -- rules 간소화: rules_summary는 핵심 텍스트, rules_sources는 출처 배열
  rules_summary jsonb NOT NULL,       -- { "KR": {"carry_on": "...", "checked": "...", "carrier_notes": {"KoreanAir": "..."}}}
  rules_sources jsonb NOT NULL,       -- { "KR": ["https://..."], "US": ["https://..."]}
  published boolean DEFAULT true,
  source_last_checked timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**예시 row (rules_summary/rules_sources 구조)**

```json
{
	"rules_summary": {
		"KR": {
			"carry_on": "100Wh 이하 기내 반입 가능",
			"checked": "위탁 불가",
			"carrier_notes": {
				"KoreanAir": "100Wh 초과 시 사전승인 필요"
			}
		},
		"US": {
			"carry_on": "FAA 지침에 따름",
			"checked": "위탁 불가"
		}
	},
	"rules_sources": {
		"KR": ["https://www.koreanair.com/battery-policy"],
		"US": ["https://www.faa.gov/batteries"]
	}
}
```

---

### reports 테이블 (사용자 제보 저장)

- 목적: 사용자로부터 들어온 규정 제보를 저장하고 검수 워크플로우에 활용

```sql
CREATE TABLE public.reports (
  id bigserial PRIMARY KEY,
  item_id text NOT NULL,
  reporter_id uuid NULL,        -- Supabase Auth user id
  report_type text,             -- 'url'|'text'|'correction'
  payload jsonb,                -- { "url": "..."} or { "text": "..."}
  status text DEFAULT 'pending',-- 'pending'|'accepted'|'rejected'
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz NULL,
  reviewer_id uuid NULL
);
```

---

### autocomplete_terms (자동완성)

```sql
CREATE TABLE public.autocomplete_terms (
  term text PRIMARY KEY,
  freq bigint DEFAULT 1,
  last_used timestamptz DEFAULT now()
);
```

---

## 인덱스 권장

성능을 위해 아래 인덱스 적용 권장:

```sql
-- item_id 조회 최적화
CREATE UNIQUE INDEX idx_items_item_id ON public.items (item_id);

-- tags, primary_category 빠른 검색
CREATE INDEX idx_items_tags ON public.items USING GIN (tags);
CREATE INDEX idx_items_primary_category ON public.items (primary_category);

-- rules_summary/rules_sources에서 국가 필터가 잦다면 GIN 인덱스
CREATE INDEX idx_items_rules_summary ON public.items USING GIN (rules_summary);

-- autocomplete trgm (부분일치 최적화)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_autocomplete_trgm ON public.autocomplete_terms USING GIN (term gin_trgm_ops);
```

---

## 데이터 수집/갱신 파이프라인 (간소화된 흐름)

1. **소스 목록 구성**: 우선 관리자가 선정한 TOP 출처(항공사 규정 페이지, IATA, 정부기관 등) 목록 유지.
2. **크롤러**: 각 소스의 HTML에서 핵심 텍스트 및 메타정보(날짜)를 스크래핑. (셀렉터 기반)
3. **변경 감지**: 이전 스냅샷과 비교하여 변경사항 발생 시 Slack/관리자 이메일로 알림.
4. **자동 요약(옵션)**: 크롤링된 긴 규정 텍스트는 서버에서 간단 키포인트만 추출(정규표현식 + 룰 기반).
5. **관리자 승인**: 변경 내용 검토 후 `items.rules_summary` 및 `rules_sources` 업데이트.
6. **커뮤니티 제보 처리**: 사용자가 `/report`로 제출 → `reports` 레코드 생성 → 관리자가 검수.

자동화 레벨 목표: **주 1회 크롤링, 변경 알림만 수동 승인**.

---

## API 설계 (Next.js 서버리스 라우트 + Supabase)

### 인증 & 보안

- 공개 API: 검색, 항목 조회, 자동완성, 제보 제출 (인증 불필요)
- 관리자 API: 아이템 CRUD, 제보 승인/거절 (Supabase Auth + admin role 필요)
- Supabase Service Role Key: 서버 사이드(Next.js)에서만 사용

---

### 엔드포인트 목록 (간소화)

| Method |                                        Path | 설명                                        |
| ------ | ------------------------------------------: | ------------------------------------------- |
| GET    | `/api/items?q=&country=&carrier=&category=` | 검색 (q: query)                             |
| GET    |              `/api/items/:item_id?country=` | 특정 항목의 요약 규정(선택 국가)            |
| GET    |                      `/api/autocomplete?q=` | 자동완성                                    |
| POST   |                               `/api/report` | 사용자 제보 제출                            |
| GET    |                        `/api/admin/reports` | (admin) 제보 목록                           |
| POST   |                          `/api/admin/items` | (admin) 아이템 생성/업데이트                |
| POST   |                         `/api/sync/sources` | (admin) 강제 동기화/크롤러 트리거 (webhook) |

---

## 예시: Next.js API (TypeScript) — `/app/api/items/route.ts`

```ts
// route.ts (Next.js app router)
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
	const url = new URL(req.url);
	const q = url.searchParams.get('q') || '';
	const country = url.searchParams.get('country') || null;
	const carrier = url.searchParams.get('carrier') || null;
	const category = url.searchParams.get('category') || null;
	const limit = Number(url.searchParams.get('limit') || '20');
	const offset = Number(url.searchParams.get('offset') || '0');

	// Supabase에서는 복잡한 검색을 RPC로 구현하는 게 좋음, 여기선 간단 예시
	// 1) tags / primary_category 필터 우선
	// 2) ILIKE 기반 부분일치 (pg_trgm 인덱스로 최적화)
	const filters: string[] = [];
	if (category) filters.push(`primary_category=eq.${category}`);
	let query = supabase
		.from('items')
		.select('*')
		.limit(limit)
		.range(offset, offset + limit - 1);

	// 단순 q 검색: item_id, name_en, name_ko, tags
	if (q) {
		query = query.or(
			`item_id.ilike.%${q}%,name_en.ilike.%${q}%,name_ko.ilike.%${q}%,tags.cs.{${q}}`
		);
	}

	const { data, error } = await query;
	if (error)
		return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ results: data });
}
```

> 참고: 복잡한 검색(우선순위 결합, score 등)은 Postgres RPC 함수로 만들어 Next.js는 `supabase.rpc('search_items', { p_query: q, ... })` 형태로 호출하는 것을 권장합니다.

---

## 예시: 제보 제출 API — `/app/api/report/route.ts`

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
	process.env.SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
	const body = await req.json();
	const { item_id, report_type, payload, reporter_id } = body;
	const { data, error } = await supabase
		.from('reports')
		.insert([{ item_id, report_type, payload, reporter_id }]);

	if (error)
		return NextResponse.json({ error: error.message }, { status: 500 });
	return NextResponse.json({ result: data[0] });
}
```

---

## 관리자 워크플로우 (간단)

1. 관리자는 `/admin` 대시보드에서 `reports` 목록을 확인
2. 보고서 확인 후 `accept` → 해당 `items` 레코드 업데이트, `reports.status` -> 'accepted'
3. `rules_sources`에 출처 URL 자동 추가, `source_last_checked` 갱신

---

## 자동완성 구현

- `autocomplete_terms` 테이블에 사용자가 검색한 용어를 upsert
- API: `/api/autocomplete?q=po` → `SELECT term FROM autocomplete_terms WHERE term ILIKE 'po%' ORDER BY freq DESC LIMIT 10;`

---

## 배포 & 운영 체크리스트

1. Supabase 프로젝트 설정: 테이블 생성, 확장(pg_trgm) 활성화
2. Vercel 환경변수 설정: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
3. Next.js 앱 배포 (Server-side API 사용)
4. 크롤러 배포(간단한 Node.js script, Cron job 또는 Cloud Function)
5. Slack / Email 알림 연동
6. 모니터링: Supabase 쿼리 레이턴시, 에러 모니터링

---

## 추가 권장사항 (운영 효율화)

- 출처 URL을 우선으로 제공하여 정확도 신뢰성 확보
- 컨트리뷰터 보상(포인트/바우처)으로 사용자 제보 활성화
- 주요 항공사에 B2B 제휴 제안 (공식 규정 피드 제공 요청)
- 테스트 데이터셋: 샘플 50건으로 초기 롤아웃 후 확장

---
