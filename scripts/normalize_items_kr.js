const fs = require('fs');
const path = require('path');

function mapFlag(value) {
	if (typeof value === 'boolean') return value;
	if (typeof value === 'string') {
		const v = value.trim();
		if (v === '허용') return true;
		if (v === '금지') return false;
		if (
			v.toLowerCase &&
			(v.toLowerCase() === 'true' || v.toLowerCase() === 'false')
		) {
			return v.toLowerCase() === 'true';
		}
	}
	return null;
}

function normalizeItem(item) {
	const nameKo = item.name_ko ?? null;
	const nameEn = item.name_en ?? null;
	const primaryCategory = item.primary_category ?? null;
	const subCategory = Object.prototype.hasOwnProperty.call(item, 'sub_category')
		? item.sub_category
		: null;
	const description = Object.prototype.hasOwnProperty.call(item, 'description')
		? item.description
		: null;
	const tags = Array.isArray(item.tags) ? item.tags : [];

	const carryOn = item?.rules_summary?.KR
		? mapFlag(item.rules_summary.KR.carry_on)
		: null;
	const checked = item?.rules_summary?.KR
		? mapFlag(item.rules_summary.KR.checked)
		: null;

	const rulesSummary = {
		KR: {
			carry_on: carryOn,
			checked: checked,
		},
	};

	const rulesSources = {
		KR: Array.isArray(item?.rules_sources?.KR) ? item.rules_sources.KR : [],
	};

	const published =
		typeof item.published === 'boolean'
			? item.published
			: Boolean(item.published);
	const sourceLastChecked = Object.prototype.hasOwnProperty.call(
		item,
		'source_last_checked'
	)
		? item.source_last_checked
		: null;

	// Ensure key order similar to item_id: 1 example
	return {
		item_id: item.item_id,
		name_ko: nameKo,
		name_en: nameEn,
		primary_category: primaryCategory,
		sub_category: subCategory,
		description: description,
		tags,
		rules_summary: rulesSummary,
		rules_sources: rulesSources,
		published,
		source_last_checked: sourceLastChecked,
	};
}

function main() {
	const inputPath =
		process.argv[2] || path.join(__dirname, '..', 'data', 'items.kr.json');
	const resolved = path.resolve(inputPath);

	const content = fs.readFileSync(resolved, 'utf8');
	const json = JSON.parse(content);

	if (!Array.isArray(json.items)) {
		throw new Error('Invalid JSON: expected items array');
	}

	const normalizedItems = json.items.map(normalizeItem);

	const output = {
		country: json.country ?? 'KR',
		items: normalizedItems,
	};

	// Write pretty JSON with trailing newline
	fs.writeFileSync(resolved, JSON.stringify(output, null, 2) + '\n', 'utf8');
	console.log(`Normalized ${normalizedItems.length} items in ${resolved}`);
}

if (require.main === module) {
	try {
		main();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
}
