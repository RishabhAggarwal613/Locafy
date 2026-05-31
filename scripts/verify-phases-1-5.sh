#!/usr/bin/env bash
# Locafy Phase 1–5 verification script
set -uo pipefail

BASE="${BASE_URL:-http://localhost:8080}"
PASS=0
FAIL=0
SKIP=0

pass() { echo "  ✅ $1"; PASS=$((PASS + 1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL + 1)); }
skip() { echo "  ⏭️  $1"; SKIP=$((SKIP + 1)); }

assert_status() {
  local name="$1" expected="$2" actual="$3"
  if [[ "$actual" == "$expected" ]]; then pass "$name (HTTP $actual)"
  else fail "$name — expected HTTP $expected, got $actual"; fi
}

assert_json_field() {
  local name="$1" json="$2" jq_expr="$3"
  if echo "$json" | jq -e "$jq_expr" >/dev/null 2>&1; then pass "$name"
  else fail "$name — jq '$jq_expr' failed"; fi
}

echo "═══════════════════════════════════════════"
echo " Locafy Verification — Phases 1–5"
echo " Backend: $BASE"
echo "═══════════════════════════════════════════"

# ── Phase 1: Foundation ─────────────────────
echo ""
echo "▶ Phase 1 — Foundation"
HEALTH=$(curl -sf "$BASE/actuator/health" 2>/dev/null || echo "")
if [[ -n "$HEALTH" ]]; then
  assert_json_field "Actuator health UP" "$HEALTH" '.status == "UP"'
else
  fail "Actuator health — backend unreachable at $BASE"
  echo ""
  echo "Cannot continue without backend. Start with: cd backend && mvn spring-boot:run"
  exit 1
fi

UNKNOWN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/nonexistent-route-xyz")
assert_status "Unknown route returns 404" "404" "$UNKNOWN"

# ── Phase 2: Authentication ─────────────────
echo ""
echo "▶ Phase 2 — Authentication"
TS=$(date +%s)
CUSTOMER_EMAIL="verify-customer-$TS@test.local"
VENDOR_EMAIL="verify-vendor-$TS@test.local"
PASSWORD="TestPass123!"

C_SIGNUP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Verify Customer\",\"role\":\"CUSTOMER\"}")
C_BODY=$(echo "$C_SIGNUP" | sed '$d')
C_CODE=$(echo "$C_SIGNUP" | tail -1)
assert_status "Customer signup" "201" "$C_CODE"
CUSTOMER_TOKEN=$(echo "$C_BODY" | jq -r '.accessToken // empty')
[[ -n "$CUSTOMER_TOKEN" ]] && pass "Customer signup returns accessToken" || fail "Customer signup missing accessToken"

V_SIGNUP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$VENDOR_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Verify Vendor\",\"role\":\"VENDOR\"}")
V_BODY=$(echo "$V_SIGNUP" | sed '$d')
V_CODE=$(echo "$V_SIGNUP" | tail -1)
assert_status "Vendor signup" "201" "$V_CODE"
VENDOR_TOKEN=$(echo "$V_BODY" | jq -r '.accessToken // empty')

DUP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"Dup\",\"role\":\"CUSTOMER\"}")
assert_status "Duplicate signup rejected" "409" "$DUP"

BAD_LOGIN=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"WrongPass123!\"}")
assert_status "Bad password rejected" "401" "$BAD_LOGIN"

LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$PASSWORD\"}")
LOGIN_BODY=$(echo "$LOGIN" | sed '$d')
LOGIN_CODE=$(echo "$LOGIN" | tail -1)
assert_status "Customer login" "200" "$LOGIN_CODE"
CUSTOMER_TOKEN=$(echo "$LOGIN_BODY" | jq -r '.accessToken // empty')

NO_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/vendors/dashboard")
assert_status "Protected route without token → 401" "401" "$NO_AUTH"

WITH_AUTH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/vendors/dashboard" \
  -H "Authorization: Bearer $CUSTOMER_TOKEN")
assert_status "Customer cannot access vendor dashboard → 403" "403" "$WITH_AUTH"

# ── Phase 4: Vendor Core ──────────────────────
echo ""
echo "▶ Phase 4 — Vendor Core"
SHOP=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/shops" \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Verify Test Shop",
    "description":"Phase 5 verification shop",
    "categories":["Grocery"],
    "address":{"line1":"Connaught Place","city":"Delhi","state":"Delhi","pincode":"110001"},
    "latitude":28.6315,
    "longitude":77.2167,
    "deliveryAvailable":true,
    "pickupAvailable":true
  }')
SHOP_BODY=$(echo "$SHOP" | sed '$d')
SHOP_CODE=$(echo "$SHOP" | tail -1)
assert_status "Vendor create shop" "201" "$SHOP_CODE"
SHOP_ID=$(echo "$SHOP_BODY" | jq -r '.id // empty')
[[ -n "$SHOP_ID" ]] && pass "Shop ID returned" || fail "Shop ID missing"

PRODUCT=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/products" \
  -H "Authorization: Bearer $VENDOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Verify Test Product",
    "description":"Test item for discovery",
    "price":99,
    "discountedPrice":79,
    "category":"Grocery",
    "stock":50,
    "unit":"piece",
    "isAvailable":true
  }')
PRODUCT_BODY=$(echo "$PRODUCT" | sed '$d')
PRODUCT_CODE=$(echo "$PRODUCT" | tail -1)
assert_status "Vendor create product" "201" "$PRODUCT_CODE"
PRODUCT_ID=$(echo "$PRODUCT_BODY" | jq -r '.id // empty')

DASH=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/vendors/dashboard" \
  -H "Authorization: Bearer $VENDOR_TOKEN")
assert_status "Vendor dashboard" "200" "$DASH"

SHOP_GET=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/shops/$SHOP_ID")
assert_status "Public GET shop by ID" "200" "$SHOP_GET"

# ── Phase 5: Customer Core ────────────────────
echo ""
echo "▶ Phase 5 — Customer Core"
LAT=28.6139
LNG=77.2090
RADIUS=10

CATS=$(curl -s -w "\n%{http_code}" "$BASE/api/categories")
CATS_BODY=$(echo "$CATS" | sed '$d')
CATS_CODE=$(echo "$CATS" | tail -1)
assert_status "GET categories" "200" "$CATS_CODE"
CAT_COUNT=$(echo "$CATS_BODY" | jq 'length')
if [[ "$CAT_COUNT" -ge 8 ]]; then pass "Categories seeded ($CAT_COUNT)"
else fail "Expected ≥8 categories, got $CAT_COUNT"; fi

NEARBY=$(curl -s -w "\n%{http_code}" "$BASE/api/shops?lat=$LAT&lng=$LNG&radius=$RADIUS&size=20")
NEARBY_BODY=$(echo "$NEARBY" | sed '$d')
NEARBY_CODE=$(echo "$NEARBY" | tail -1)
assert_status "Geo shop discovery" "200" "$NEARBY_CODE"
NEARBY_COUNT=$(echo "$NEARBY_BODY" | jq '.content | length')
if [[ "$NEARBY_COUNT" -ge 1 ]]; then pass "Nearby shops found ($NEARBY_COUNT)"
else fail "No shops found near Delhi — test shop may be outside radius"; fi

SEARCH=$(curl -s -w "\n%{http_code}" "$BASE/api/search?lat=$LAT&lng=$LNG&radius=$RADIUS&q=Verify")
SEARCH_BODY=$(echo "$SEARCH" | sed '$d')
SEARCH_CODE=$(echo "$SEARCH" | tail -1)
assert_status "Unified search" "200" "$SEARCH_CODE"
assert_json_field "Search returns shops or products" "$SEARCH_BODY" '(.shops | length > 0) or (.products | length > 0)'

AUTO=$(curl -s -w "\n%{http_code}" "$BASE/api/search/autocomplete?lat=$LAT&lng=$LNG&radius=$RADIUS&q=Verify")
AUTO_BODY=$(echo "$AUTO" | sed '$d')
AUTO_CODE=$(echo "$AUTO" | tail -1)
assert_status "Search autocomplete" "200" "$AUTO_CODE"
AUTO_COUNT=$(echo "$AUTO_BODY" | jq 'length')
if [[ "$AUTO_COUNT" -ge 1 ]]; then pass "Autocomplete suggestions ($AUTO_COUNT)"
else fail "Autocomplete returned no suggestions"; fi

RECENT=$(curl -s -w "\n%{http_code}" "$BASE/api/products/recent?lat=$LAT&lng=$LNG&radius=$RADIUS&limit=5")
RECENT_BODY=$(echo "$RECENT" | sed '$d')
RECENT_CODE=$(echo "$RECENT" | tail -1)
assert_status "Recent products" "200" "$RECENT_CODE"
RECENT_COUNT=$(echo "$RECENT_BODY" | jq 'length')
if [[ "$RECENT_COUNT" -ge 1 ]]; then pass "Recent products found ($RECENT_COUNT)"
else fail "No recent products near Delhi"; fi

PROD_GET=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/products/$PRODUCT_ID")
assert_status "Public GET product by ID" "200" "$PROD_GET"

SHOP_PRODUCTS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/shops/$SHOP_ID/products?page=0&size=10")
assert_status "Shop product listing" "200" "$SHOP_PRODUCTS"

# ── Summary ───────────────────────────────────
echo ""
echo "═══════════════════════════════════════════"
echo " Results: ✅ $PASS passed  ❌ $FAIL failed  ⏭️  $SKIP skipped"
echo "═══════════════════════════════════════════"
[[ "$FAIL" -eq 0 ]] && exit 0 || exit 1
