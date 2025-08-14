import { NextRequest, NextResponse } from 'next/server';
import Fuse from 'fuse.js';
import itemsKr from '../../../../data/items.kr.json';

const fuse = new Fuse(itemsKr.items, {
  keys: ['item_name.KR', 'item_name.EN', 'description.KR', 'description.EN', 'tags'],
  threshold: 0.3,
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(itemsKr);
  }

  const results = fuse.search(query);
  const filteredItems = results.map((result) => result.item);

  return NextResponse.json({ ...itemsKr, items: filteredItems });
}
