const fs = require('fs');
const path = require('path');

// 카테고리 매핑 규칙 정의
const tagToSubCategory = {
  '스포츠용품류': 'sports_equipment',
  '의료용품류': 'medical_equipment',
  '생활용품류': 'household_items',
  '공구류': 'tools',
  '무기류': 'weapons',
  '화기류, 총기류,무기류': 'firearms_weapons',
  '둔기': 'blunt_objects',
  '끝이 뾰족한 무기및 날카로운 물체': 'sharp_objects',
  '폭발물과 인화성 물질': 'explosives_flammable',
  '화학물질 및 유독성 물질': 'chemical_toxic',
  '액체/겔(gel)류 물질': 'liquids_gels',
  '국토해양부장관이 지정한 고위험이 예상되는 비행편 또는 항공보안 등급 경계경보(Orange) 단계이상': 'security_high_alert',
};

function getSubCategory(item) {
  // 1. item_id: 1의 경우 medical_equipment 유지
  if (item.item_id === 1 && item.sub_category === 'medical_equipment') {
    return 'medical_equipment';
  }

  // 2. 태그 기반으로 서브카테고리 찾기
  if (item.tags && Array.isArray(item.tags)) {
    for (const tag of item.tags) {
      if (tagToSubCategory[tag]) {
        return tagToSubCategory[tag];
      }
    }
  }
  
  // 3. 이름에 '배터리' 또는 '리튬'이 포함된 경우
  if (item.name_ko.includes('배터리') || item.name_ko.includes('리튬')) {
    return 'batteries';
  }

  // 4. 적절한 태그가 없으면 primary_category 값을 사용
  return item.primary_category || 'other';
}

function main() {
  const itemsPath = path.join(__dirname, '..', 'data', 'items.kr.json');
  const categoriesPath = path.join(__dirname, '..', 'data', 'categories.kr.json');

  const itemsContent = fs.readFileSync(itemsPath, 'utf8');
  const itemsData = JSON.parse(itemsContent);

  const allCategories = {};

  // 아이템 카테고리 일반화
  itemsData.items.forEach(item => {
    const subCategory = getSubCategory(item);
    item.sub_category = subCategory;

    if (!allCategories[item.primary_category]) {
      allCategories[item.primary_category] = new Set();
    }
    allCategories[item.primary_category].add(subCategory);
  });

  // items.kr.json 파일 업데이트
  fs.writeFileSync(itemsPath, JSON.stringify(itemsData, null, 2) + '\n', 'utf8');
  console.log(`Updated sub_categories in ${itemsPath}`);

  // categories.kr.json 파일 생성
  const categoriesForJson = Object.keys(allCategories).map(primary => {
    return {
      name: primary,
      sub_categories: Array.from(allCategories[primary]).sort()
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(categoriesPath, JSON.stringify({ categories: categoriesForJson }, null, 2) + '\n', 'utf8');
  console.log(`Generated category list at ${categoriesPath}`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
