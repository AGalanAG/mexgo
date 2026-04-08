#!/bin/bash

# MexGo — API Test Script
# Requiere: npm run dev corriendo en http://localhost:3000

BASE="http://localhost:3000"
PASS=0
FAIL=0

green="\033[0;32m"
red="\033[0;31m"
yellow="\033[0;33m"
reset="\033[0m"

check() {
  local label=$1
  local status=$2
  local expected=$3
  if [ "$status" -eq "$expected" ]; then
    echo -e "${green}✓ $label (HTTP $status)${reset}"
    PASS=$((PASS + 1))
  else
    echo -e "${red}✗ $label (HTTP $status, esperado $expected)${reset}"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "══════════════════════════════════════════"
echo "  MexGo API Tests — $BASE"
echo "══════════════════════════════════════════"

# ── GET /api/itinerary ────────────────────────────────────────────────────────
echo -e "\n${yellow}── Itinerario ──${reset}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/itinerary")
check "GET /api/itinerary (vacío)" "$STATUS" 200

# ── POST /api/itinerary ───────────────────────────────────────────────────────
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/itinerary" \
  -H "Content-Type: application/json" \
  -d '{"negocio_id":"neg-001","nombre":"Tacos El Güero","dia":"2026-06-15","hora":"14:00"}')

BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/itinerary (agregar parada)" "$STATUS" 201

# Extrae el id de la parada creada
STOP_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "   → stop id: $STOP_ID"

# ── GET /api/itinerary (con datos) ───────────────────────────────────────────
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/api/itinerary")
check "GET /api/itinerary (con parada)" "$STATUS" 200

# ── PATCH /api/itinerary/[id] ────────────────────────────────────────────────
if [ -n "$STOP_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$BASE/api/itinerary/$STOP_ID" \
    -H "Content-Type: application/json" \
    -d '{"hora":"16:00"}')
  check "PATCH /api/itinerary/$STOP_ID (cambiar hora)" "$STATUS" 200
else
  echo -e "${red}✗ PATCH saltado — no se obtuvo stop id${reset}"
  FAIL=$((FAIL + 1))
fi

# ── DELETE /api/itinerary/[id] ───────────────────────────────────────────────
if [ -n "$STOP_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/itinerary/$STOP_ID")
  check "DELETE /api/itinerary/$STOP_ID" "$STATUS" 200
else
  echo -e "${red}✗ DELETE saltado — no se obtuvo stop id${reset}"
  FAIL=$((FAIL + 1))
fi

# ── 404 en id inexistente ────────────────────────────────────────────────────
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$BASE/api/itinerary/stop-inexistente")
check "DELETE /api/itinerary/stop-inexistente (404)" "$STATUS" 404

# ── POST /api/recommend ───────────────────────────────────────────────────────
echo -e "\n${yellow}── Recomendaciones ──${reset}"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "location": { "lat": 19.4326, "lng": -99.1332 },
    "questionnaire": { "travelStyle": "cultural", "foodPreferences": ["tacos"] }
  }')
check "POST /api/recommend" "$STATUS" 200

# ── POST /api/chat ────────────────────────────────────────────────────────────
echo -e "\n${yellow}── Chat (requiere GEMINI_API_KEY) ──${reset}"

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"mensaje":"Hola, qué taquerías me recomiendas?"}')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/chat" "$STATUS" 200

# ── Resumen ───────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo -e "  ${green}Passed: $PASS${reset}   ${red}Failed: $FAIL${reset}"
echo "══════════════════════════════════════════"
echo ""
