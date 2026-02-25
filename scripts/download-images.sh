#!/usr/bin/env bash
# ============================================
# 품종별 샘플 이미지 다운로드 스크립트
# ============================================
#
# 사용법:
#   PIXABAY_API_KEY=your_key_here bash scripts/download-images.sh
#
# Pixabay 무료 API로 품종별 대표 이미지 1장씩 다운로드합니다.
# API 키는 https://pixabay.com/api/docs/ 에서 무료로 발급받을 수 있습니다.
#
# 이미지 라이선스: Pixabay License (상업적 사용 가능, 출처표기 불필요)
#

set -euo pipefail

API_KEY="${PIXABAY_API_KEY:-}"
BASE_DIR="src/assets/breeds"

if [ -z "$API_KEY" ]; then
  echo "❌ PIXABAY_API_KEY 환경변수를 설정해주세요."
  echo "   예: PIXABAY_API_KEY=12345678-abcdef bash scripts/download-images.sh"
  exit 1
fi

# 품종별 검색 키워드 매핑
declare -A BREEDS=(
  # 고양이
  ["korean_shorthair"]="tabby+cat+kitten"
  ["persian"]="persian+cat+face"
  ["siamese"]="siamese+cat"
  ["russian_blue"]="russian+blue+cat"
  # 강아지
  ["jindo"]="korean+jindo+dog"
  ["golden_retriever"]="golden+retriever+puppy"
  ["pomeranian"]="pomeranian+dog"
  ["shiba_inu"]="shiba+inu"
  # 도마뱀
  ["leopard_gecko"]="leopard+gecko"
  ["bearded_dragon"]="bearded+dragon+lizard"
  ["crested_gecko"]="crested+gecko"
  ["chameleon"]="chameleon+colorful"
  # 고슴도치
  ["four_toed"]="hedgehog+cute"
  ["algerian"]="hedgehog+large"
  ["egyptian_eared"]="long+eared+hedgehog"
  ["daurian"]="hedgehog+winter"
)

# 성장 단계 (같은 키워드에 다른 이미지를 가져옴)
STAGES=("baby" "teen" "adult")

download_image() {
  local breed=$1 query=$2 stage=$3 page=$4
  local dir="$BASE_DIR/$breed"
  local outfile="$dir/$stage.webp"

  if [ -f "$outfile" ]; then
    echo "  ⏭  $outfile 이미 존재, 건너뜀"
    return
  fi

  local url="https://pixabay.com/api/?key=${API_KEY}&q=${query}&image_type=photo&per_page=3&page=${page}&min_width=400&min_height=400"
  local json
  json=$(curl -s "$url")

  local img_url
  img_url=$(echo "$json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
hits = data.get('hits', [])
if hits:
    print(hits[0]['webformatURL'])
else:
    print('')
" 2>/dev/null || echo "")

  if [ -z "$img_url" ]; then
    echo "  ⚠  $breed/$stage: 이미지를 찾을 수 없습니다."
    return
  fi

  mkdir -p "$dir"
  # webp로 변환이 안되면 원본 확장자로 저장
  local tmpfile="/tmp/pet_img_$$.jpg"
  curl -sL "$img_url" -o "$tmpfile"

  # cwebp가 있으면 webp로 변환, 없으면 jpg로 저장
  if command -v cwebp &>/dev/null; then
    cwebp -q 80 -resize 400 400 "$tmpfile" -o "$outfile" 2>/dev/null
    rm -f "$tmpfile"
  else
    local jpgfile="$dir/$stage.jpg"
    mv "$tmpfile" "$jpgfile"
    echo "    (cwebp 없음 → jpg로 저장: $jpgfile)"
    return
  fi

  echo "  ✅ $outfile"
}

echo "🐾 품종별 이미지 다운로드 시작..."
echo ""

for breed in "${!BREEDS[@]}"; do
  query="${BREEDS[$breed]}"
  echo "📦 $breed ($query)"

  for i in "${!STAGES[@]}"; do
    stage="${STAGES[$i]}"
    page=$((i + 1))
    download_image "$breed" "$query" "$stage" "$page"
  done

  # API rate limit 방지
  sleep 0.5
  echo ""
done

echo "🎉 완료! $BASE_DIR 폴더를 확인하세요."
echo ""
echo "💡 팁: 이미지가 마음에 안 들면 수동으로 교체하세요."
echo "   파일명 규칙: {stage}.webp (baby.webp, teen.webp, adult.webp)"
echo "   추가 옵션:  {stage}_{mood}.webp (baby_happy.webp 등)"
