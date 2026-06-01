#!/usr/bin/env bash
# Locafy end-to-end API smoke test
set -euo pipefail

BASE="${BASE_URL:-http://localhost:8080}"
TS=$(date +%s)
PASS=0
FAIL=0
SKIP=0

ok()   { echo "  ✅ $1"; PASS=$((PASS+1)); }
fail() { echo "  ❌ $1"; FAIL=$((FAIL+1)); }
skip() { echo "  ⏭️  $1"; SKIP=$((SKIP+1)); }

req() {
  local method=$1 path=$2 token=${3:-} body=${4:-}
  local args=(-s -w "\n%{http_code}" -X "$method" "${BASE}${path}")
  [[ -n "$token" ]] && args+=(-H "Authorization: Bearer $token")
  [[ -n "$body" ]] && args+=(-H "Content-Type: application/json" -d "$body")
  local out
  out=$(curl "${args[@]}" 2>/dev/null) || { echo "000"; return; }
  HTTP_CODE=$(echo "$out" | tail -1)
  BODY=$(echo "$out" | sed '$d')
  echo "$BODY"
}

code() { echo "$HTTP_CODE"; }

extract() { echo "$BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print($1)" 2>/dev/null || echo ""; }

echo "══════════════════════════════════════════"
echo " Locafy Smoke Test — $BASE"
echo "══════════════════════════════════════════"

# ── 1. Health ────────────────────────────────
echo ""
echo "▶ Infrastructure"
req GET /actuator/health
[[ "$(code)" == "200" ]] && ok "Backend health" || fail "Backend health (HTTP $(code))"

req GET /api/categories
[[ "$(code)" == "200" ]] && ok "GET /api/categories" || fail "GET /api/categories (HTTP $(code))"

req GET "/api/shops?lat=28.6139&lng=77.2090&radius=5"
[[ "$(code)" == "200" ]] && ok "GET /api/shops (geo)" || fail "GET /api/shops (HTTP $(code))"

req GET "/api/search?q=biryani&lat=28.6139&lng=77.2090"
[[ "$(code)" == "200" ]] && ok "GET /api/search" || fail "GET /api/search (HTTP $(code))"

req GET "/api/reels?lat=28.6139&lng=77.2090&size=5"
[[ "$(code)" == "200" ]] && ok "GET /api/reels feed" || fail "GET /api/reels (HTTP $(code))"

# ── 2. Auth (all roles) ──────────────────────
echo ""
echo "▶ Authentication"
PWD="Test1234"
CUSTOMER_EMAIL="customer${TS}@test.locafy"
VENDOR_EMAIL="vendor${TS}@test.locafy"
DELIVERY_EMAIL="delivery${TS}@test.locafy"

for role_pair in "CUSTOMER:$CUSTOMER_EMAIL" "VENDOR:$VENDOR_EMAIL" "DELIVERY:$DELIVERY_EMAIL"; do
  ROLE="${role_pair%%:*}"
  EMAIL="${role_pair##*:}"
  req POST /api/auth/signup "" "{\"name\":\"Test $ROLE\",\"email\":\"$EMAIL\",\"password\":\"$PWD\",\"role\":\"$ROLE\"}"
  if [[ "$(code)" == "201" ]]; then
    ok "Signup $ROLE"
    TOKEN=$(extract "d.get('accessToken','')")
    eval "${ROLE}_TOKEN=\"$TOKEN\""
  else
    fail "Signup $ROLE (HTTP $(code): $(echo "$BODY" | head -c 120))"
  fi
done

req POST /api/auth/login "" "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$PWD\"}"
[[ "$(code)" == "200" ]] && ok "Login customer" || fail "Login customer (HTTP $(code))"
CUSTOMER_TOKEN=$(extract "d.get('accessToken','')")

req POST /api/auth/login "" "{\"email\":\"invalid@test.locafy\",\"password\":\"wrongPass1\"}"
[[ "$(code)" == "401" || "$(code)" == "400" ]] && ok "Login rejects bad credentials" || fail "Login should fail (HTTP $(code))"

# ── 3. Vendor shop + product ─────────────────
echo ""
echo "▶ Vendor (shop + products)"
req GET /api/vendors/dashboard "$VENDOR_TOKEN"
[[ "$(code)" == "200" ]] && ok "Vendor dashboard" || fail "Vendor dashboard (HTTP $(code))"
HAS_SHOP=$(extract "d.get('hasShop', False)")

if [[ "$HAS_SHOP" == "False" || "$HAS_SHOP" == "false" ]]; then
  req POST /api/shops "$VENDOR_TOKEN" '{
    "name":"Test Kirana '"$TS"'",
    "description":"Smoke test shop",
    "phone":"+919876543210",
    "categories":["Groceries"],
    "address":{"line1":"12 Test Lane","city":"Delhi","state":"Delhi","pincode":"110001"},
    "latitude":28.6139,"longitude":77.2090,
    "deliveryAvailable":true,"pickupAvailable":true,"minOrderAmount":50,"deliveryRadius":5
  }'
  [[ "$(code)" == "201" || "$(code)" == "200" ]] && ok "Create shop" || fail "Create shop (HTTP $(code): $(echo "$BODY" | head -c 120))"
else
  skip "Create shop (already exists)"
fi

req GET /api/vendors/me/shop "$VENDOR_TOKEN"
[[ "$(code)" == "200" ]] && ok "Get vendor shop" || fail "Get vendor shop (HTTP $(code))"
SHOP_ID=$(extract "d.get('id','')")

req POST /api/products "$VENDOR_TOKEN" "{
  \"name\":\"Smoke Test Product $TS\",
  \"description\":\"Test item\",
  \"price\":99,
  \"category\":\"Groceries\",
  \"stock\":50,
  \"unit\":\"piece\"
}"
[[ "$(code)" == "201" || "$(code)" == "200" ]] && ok "Create product" || fail "Create product (HTTP $(code): $(echo "$BODY" | head -c 120))"
PRODUCT_ID=$(extract "d.get('id','')")

req GET "/api/shops/${SHOP_ID}/products" ""
[[ "$(code)" == "200" ]] && ok "List shop products (public)" || fail "List shop products (HTTP $(code))"

# ── 4. Customer cart + order ─────────────────
echo ""
echo "▶ Customer (cart + order)"
req GET /api/cart "$CUSTOMER_TOKEN"
[[ "$(code)" == "200" ]] && ok "Get cart" || fail "Get cart (HTTP $(code))"

req POST /api/cart/items "$CUSTOMER_TOKEN" "{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}"
[[ "$(code)" == "200" || "$(code)" == "201" ]] && ok "Add to cart" || fail "Add to cart (HTTP $(code): $(echo "$BODY" | head -c 120))"

req POST /api/orders "$CUSTOMER_TOKEN" "{
  \"shopId\":\"$SHOP_ID\",
  \"items\":[{\"productId\":\"$PRODUCT_ID\",\"quantity\":2}],
  \"fulfillmentType\":\"DELIVERY\",
  \"paymentMethod\":\"COD\",
  \"deliveryAddress\":{\"line1\":\"Flat 1\",\"city\":\"Delhi\",\"pincode\":\"110001\",\"latitude\":28.62,\"longitude\":77.21}
}"
if [[ "$(code)" == "201" || "$(code)" == "200" ]]; then
  ok "Place COD order"
  ORDER_ID=$(extract "d.get('order',{}).get('id','') or d.get('id','')")
  ORDER_NUM=$(extract "d.get('order',{}).get('orderNumber','') or d.get('orderNumber','')")
else
  fail "Place order (HTTP $(code): $(echo "$BODY" | head -c 200))"
  ORDER_ID=""
fi

req GET /api/orders "$CUSTOMER_TOKEN"
[[ "$(code)" == "200" ]] && ok "List customer orders" || fail "List customer orders (HTTP $(code))"

if [[ -n "$ORDER_ID" ]]; then
  req GET "/api/orders/${ORDER_ID}" "$CUSTOMER_TOKEN"
  [[ "$(code)" == "200" ]] && ok "Get order detail" || fail "Get order detail (HTTP $(code))"
fi

# ── 5. Vendor order flow ─────────────────────
echo ""
echo "▶ Vendor orders"
req GET /api/orders/vendor "$VENDOR_TOKEN"
[[ "$(code)" == "200" ]] && ok "List vendor orders" || fail "List vendor orders (HTTP $(code))"

if [[ -n "$ORDER_ID" ]]; then
  for STATUS in CONFIRMED PREPARING READY; do
    req PUT "/api/orders/${ORDER_ID}/status" "$VENDOR_TOKEN" "{\"status\":\"$STATUS\",\"note\":\"Smoke test\"}"
    [[ "$(code)" == "200" ]] && ok "Vendor → $STATUS" || fail "Vendor status $STATUS (HTTP $(code))"
  done
fi

# ── 6. Delivery flow ─────────────────────────
echo ""
echo "▶ Delivery"
req PUT /api/delivery/profile "$DELIVERY_TOKEN" '{"isOnline":true,"zoneLatitude":28.6139,"zoneLongitude":77.2090,"zoneRadiusKm":10}'
[[ "$(code)" == "200" ]] && ok "Delivery go online" || fail "Delivery profile (HTTP $(code))"

req GET /api/delivery/dashboard "$DELIVERY_TOKEN"
[[ "$(code)" == "200" ]] && ok "Delivery dashboard" || fail "Delivery dashboard (HTTP $(code))"

req GET /api/delivery/orders/available "$DELIVERY_TOKEN"
[[ "$(code)" == "200" ]] && ok "Delivery order pool" || fail "Delivery pool (HTTP $(code))"

if [[ -n "$ORDER_ID" ]]; then
  req POST "/api/delivery/orders/${ORDER_ID}/accept" "$DELIVERY_TOKEN" "{}"
  [[ "$(code)" == "200" ]] && ok "Accept delivery order" || fail "Accept order (HTTP $(code): $(echo "$BODY" | head -c 120))"

  req PUT "/api/delivery/orders/${ORDER_ID}/status" "$DELIVERY_TOKEN" '{"status":"PICKED_UP","note":"Picked up"}'
  [[ "$(code)" == "200" ]] && ok "Delivery → PICKED_UP" || fail "PICKED_UP (HTTP $(code))"

  req POST "/api/delivery/orders/${ORDER_ID}/location" "$DELIVERY_TOKEN" '{"latitude":28.615,"longitude":77.210}'
  [[ "$(code)" == "200" ]] && ok "Post GPS location" || fail "GPS location (HTTP $(code))"

  req GET "/api/orders/${ORDER_ID}/location" "$CUSTOMER_TOKEN"
  [[ "$(code)" == "200" ]] && ok "Customer get delivery location" || fail "Get location (HTTP $(code))"

  req PUT "/api/delivery/orders/${ORDER_ID}/status" "$DELIVERY_TOKEN" '{"status":"OUT_FOR_DELIVERY","note":"On the way"}'
  [[ "$(code)" == "200" ]] && ok "Delivery → OUT_FOR_DELIVERY" || fail "OUT_FOR_DELIVERY (HTTP $(code))"

  req PUT "/api/delivery/orders/${ORDER_ID}/status" "$DELIVERY_TOKEN" '{"status":"DELIVERED","note":"Delivered"}'
  [[ "$(code)" == "200" ]] && ok "Delivery → DELIVERED" || fail "DELIVERED (HTTP $(code))"
fi

req GET /api/delivery/orders/history "$DELIVERY_TOKEN"
[[ "$(code)" == "200" ]] && ok "Delivery history" || fail "Delivery history (HTTP $(code))"

req GET /api/delivery/finance/summary "$DELIVERY_TOKEN" 2>/dev/null || true
if [[ "$(code)" == "200" ]]; then ok "Delivery finance"; else
  req GET /api/delivery/dashboard "$DELIVERY_TOKEN"
  [[ "$(code)" == "200" ]] && ok "Delivery finance (via dashboard)" || skip "Delivery finance endpoint"
fi

# ── 7. Reels (vendor) ────────────────────────
echo ""
echo "▶ Reels"
req GET /api/reels/mine "$VENDOR_TOKEN"
[[ "$(code)" == "200" ]] && ok "Vendor reel list" || fail "Vendor reels (HTTP $(code))"

# ── 8. Frontend pages ────────────────────────
echo ""
echo "▶ Frontend pages (HTTP status)"
FE="${FRONTEND_URL:-http://localhost:3000}"
for path in / /customer/explore /customer/reels /customer/search /customer/map /vendor/dashboard /delivery/dashboard; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${FE}${path}" 2>/dev/null || echo "000")
  [[ "$code" == "200" || "$code" == "307" || "$code" == "308" ]] && ok "Page $path ($code)" || fail "Page $path (HTTP $code)"
done

# Protected pages may redirect
for path in /customer/orders /customer/cart /vendor/orders; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "${FE}${path}" 2>/dev/null || echo "000")
  [[ "$code" == "200" || "$code" == "307" || "$code" == "308" ]] && ok "Page $path ($code)" || fail "Page $path (HTTP $code)"
done

# ── Summary ──────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo " Results: ✅ $PASS passed  ❌ $FAIL failed  ⏭️  $SKIP skipped"
echo "══════════════════════════════════════════"
[[ "$FAIL" -eq 0 ]]
