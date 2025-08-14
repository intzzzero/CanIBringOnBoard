import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import itemsKr from '../../../../data/items.kr.json';

const fuse = new Fuse(itemsKr.items, {
  keys: ['name_ko'],
  threshold: 0.3,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  const results = fuse.search(query);
  const suggestions = results.map((result) => result.item.name_ko);

  return NextResponse.json(suggestions.slice(0, 5));
}
