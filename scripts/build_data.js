#!/usr/bin/env node
/*
  Build script to merge two KR CSV sources into service-usable JSON.
  - Input 1: "제목 없는 스프레드시트 - 국토교통부_기내반입금지 물품_20200928.csv"
      Columns: GUBUN, CARRY_BAN, CABIN, TRUST, SEQ
  - Input 2: "제목 없는 스프레드시트 - 시트1.csv"
      Columns: 번호, 금지물품(한글), 금지물품(영문), 금지물품 대분류, 검색건수
  - Output:
      data/items.kr.json
      data/autocomplete.kr.json
*/

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

function ensureDirSync(dirPath) {
	if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function readCsvSync(absPath) {
	const buf = fs.readFileSync(absPath);
	// Handle possible BOM
	let text = buf.toString('utf8');
	if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
	return parse(text, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
	});
}

function normalizeKo(str) {
	return (str || '')
		.replace(/\s+/g, ' ')
		.replace(/[\"\u201C\u201D]/g, '')
		.trim()
		.toLowerCase();
}

function toSlugPreferEnglish(nameEn, nameKo) {
	const base = (nameEn && nameEn.trim()) || (nameKo && nameKo.trim()) || '';
	// Keep Unicode letters/numbers, replace spaces and slashes with '-'
	return base
		.toLowerCase()
		.replace(/[\(\)\[\]\{\}\"\'`]/g, '')
		.replace(/[\/|]/g, '-')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$|\.-$/g, '');
}

function boolFromCircleCross(v) {
	const s = (v || '').toString().trim();
	// Common variants: '○' or 'O' for allow, '×' or 'X' for deny
	if (s === '○' || s.toLowerCase() === 'o') return true;
	if (s === '×' || s.toLowerCase() === 'x') return false;
	// Fallback: treat empty as false
	return false;
}

function mapGubunToCategory(gubun) {
	const g = (gubun || '').replace(/[\"\s]+/g, ' ').trim();
	if (g.includes('액체') || g.toLowerCase().includes('gel'))
		return 'liquids_gels';
	if (g.includes('끝이 뾰족') || g.includes('날카로운')) return 'sharp_objects';
	if (g.includes('둔기')) return 'blunt_objects';
	if (g.includes('화기') || g.includes('총기') || g.includes('무기'))
		return 'weapons';
	if (g.includes('화학물질') || g.includes('유독성')) return 'chemical_toxic';
	if (g.includes('폭발물') || g.includes('인화성'))
		return 'explosives_flammable';
	if (g.includes('경계경보') || g.includes('고위험'))
		return 'security_high_alert';
	return 'other';
}

function main() {
	const root = process.cwd();
	const csv1Path = path.resolve(
		root,
		'제목 없는 스프레드시트 - 국토교통부_기내반입금지 물품_20200928.csv'
	);
	const csv2Path = path.resolve(root, '제목 없는 스프레드시트 - 시트1.csv');

	if (!fs.existsSync(csv1Path)) {
		console.error('Missing CSV:', csv1Path);
		process.exit(1);
	}
	if (!fs.existsSync(csv2Path)) {
		console.error('Missing CSV:', csv2Path);
		process.exit(1);
	}

	const motRows = readCsvSync(csv1Path); // KR authority list
	const termRows = readCsvSync(csv2Path); // Search terms

	// Build KO term index from CSV2 for quick matching
	const koTermIndex = new Map(); // normalized ko -> array of entries
	const allTerms = []; // for autocomplete
	for (const r of termRows) {
		const termKo = (r['금지물품(한글)'] || '').trim();
		const termEn = (r['금지물품(영문)'] || '').trim();
		const bigCatKo = (r['금지물품 대분류'] || '').trim();
		const freq = parseInt((r['검색건수'] || '0').toString().trim(), 10) || 0;
		if (!termKo) continue;
		const key = normalizeKo(termKo);
		const entry = { termKo, termEn, bigCatKo, freq };
		if (!koTermIndex.has(key)) koTermIndex.set(key, []);
		koTermIndex.get(key).push(entry);
		allTerms.push({ term: termKo, freq });
		if (termEn)
			allTerms.push({
				term: termEn,
				freq: Math.max(1, Math.floor(freq * 0.2)),
			});
	}

	// Substring matching is disabled to avoid wrong mappings (e.g., '물' vs '물질').

	const itemsByKoName = new Map(); // normalized ko name -> item object

	// Numeric item_id will be assigned after assembling and sorting items

	for (const r of motRows) {
		const gubun = (r['GUBUN'] || '').trim();
		const itemKo = (r['CARRY_BAN'] || '').trim();
		const cabin = boolFromCircleCross(r['CABIN']);
		const checked = boolFromCircleCross(r['TRUST']);
		if (!itemKo) continue;

		const normKo = normalizeKo(itemKo);
		if (itemsByKoName.has(normKo)) {
			// Duplicate name within CSV1: skip additional entries
			continue;
		}

		// Try to find a matching KO term from CSV2 by exact match only
		let matched = null;
		if (koTermIndex.has(normKo)) {
			const arr = koTermIndex.get(normKo);
			matched = arr && arr.length ? arr[0] : null;
		}

		const nameEn = matched && matched.termEn ? matched.termEn : null;
		const bigCatKo = matched && matched.bigCatKo ? matched.bigCatKo : null;

		const primaryCategory = mapGubunToCategory(gubun);
		const tags = Array.from(
			new Set(
				[primaryCategory, bigCatKo ? bigCatKo : null, gubun || null].filter(
					Boolean
				)
			)
		);

		const item = {
			// Temporary placeholder; will be overwritten with a numeric id later
			item_id: 0,
			name_ko: itemKo,
			name_en: nameEn,
			primary_category: primaryCategory,
			tags,
			rules_summary: {
				KR: {
					carry_on: cabin ? '허용' : '금지',
					checked: checked ? '허용' : '금지',
				},
			},
			rules_sources: {
				KR: ['국토교통부(2020-09-28)'],
			},
			published: true,
			source_last_checked: null,
		};

		itemsByKoName.set(normKo, item);
	}

	const items = Array.from(itemsByKoName.values()).sort((a, b) =>
		a.name_ko.localeCompare(b.name_ko, 'ko')
	);

	// Assign stable numeric item_id (1-based index after sorting by Korean name)
	for (let i = 0; i < items.length; i++) {
		items[i].item_id = i + 1;
	}

	// Build autocomplete: merge all terms with items' ko/en names
	const autocompleteMap = new Map(); // term -> freq
	for (const t of allTerms) {
		if (!t.term) continue;
		const key = t.term.trim();
		const prev = autocompleteMap.get(key) || 0;
		autocompleteMap.set(key, Math.max(prev, t.freq || 0));
	}
	for (const it of items) {
		const baseFreq = 1;
		const ko = it.name_ko && it.name_ko.trim();
		const en = it.name_en && it.name_en.trim();
		if (ko)
			autocompleteMap.set(ko, Math.max(autocompleteMap.get(ko) || 0, baseFreq));
		if (en)
			autocompleteMap.set(
				en,
				Math.max(autocompleteMap.get(en) || 0, Math.floor(baseFreq * 0.5))
			);
	}

	const autocomplete = Array.from(autocompleteMap.entries())
		.map(([term, freq]) => ({ term, freq }))
		.sort((a, b) => b.freq - a.freq || a.term.localeCompare(b.term, 'ko'));

	// Write outputs
	const outDir = path.resolve(root, 'data');
	ensureDirSync(outDir);
	const itemsPath = path.resolve(outDir, 'items.kr.json');
	const acPath = path.resolve(outDir, 'autocomplete.kr.json');
	fs.writeFileSync(
		itemsPath,
		JSON.stringify({ country: 'KR', items }, null, 2)
	);
	fs.writeFileSync(
		acPath,
		JSON.stringify({ country: 'KR', terms: autocomplete }, null, 2)
	);

	console.log(`Generated ${items.length} items -> ${itemsPath}`);
	console.log(`Generated ${autocomplete.length} terms -> ${acPath}`);
}

main();
