#!/bin/bash

# MexGo — Test detallado de itinerario
# Requiere: npm run dev corriendo en http://localhost:3000

BASE="http://localhost:3000/api/itinerary"

green="\033[0;32m"
red="\033[0;31m"
yellow="\033[0;33m"
cyan="\033[0;36m"
gray="\033[0;90m"
reset="\033[0m"

PASS=0
FAIL=0
STOP_ID=""

pretty() {
  echo "$1" | python3 -m json.tool 2>/dev/null || echo "$1"
}

step() {
  echo -e "\n${cyan}▶ $1${reset}"
}

check() {
  local label=$1
  local status=$2
  local expected=$3
  if [ "$status" -eq "$expected" ]; then
    echo -e "${green}  ✓ $label (HTTP $status)${reset}"
    PASS=$((PASS + 1))
  else
    echo -e "${red}  ✗ $label (HTTP $status, esperado $expected)${reset}"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "══════════════════════════════════════════"
echo "  MexGo — Itinerary API Test"
echo "══════════════════════════════════════════"

# ── 1. GET vacío ──────────────────────────────────────────────────────────────
step "1. Leer itinerario vacío"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE")
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "GET /api/itinerary" "$STATUS" 200
echo -e "${gray}  $(pretty "$BODY")${reset}"

# ── 2. Agregar primera parada ─────────────────────────────────────────────────
step "2. Agregar primera parada — Tacos El Güero"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{"negocio_id":"neg-001","nombre":"Tacos El Güero","dia":"2026-06-15","hora":"13:00"}')
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/itinerary" "$STATUS" 201
echo -e "${gray}  $(pretty "$BODY")${reset}"
STOP_ID=$(echo "$BODY" | python3 -c 'import json,sys; print(json.load(sys.stdin)["data"]["id"])' 2>/dev/null)
echo -e "  → stop_id guardado: ${yellow}$STOP_ID${reset}"

# ── 3. Agregar segunda parada ─────────────────────────────────────────────────
step "3. Agregar segunda parada — Taquería La Familia"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE" \
  -H "Content-Type: application/json" \
  -d '{"negocio_id":"neg-002","nombre":"Taquería La Familia","dia":"2026-06-15","hora":"20:00"}')
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "POST /api/itinerary" "$STATUS" 201
echo -e "${gray}  $(pretty "$BODY")${reset}"

# ── 4. Leer itinerario con paradas ────────────────────────────────────────────
step "4. Leer itinerario (2 paradas)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE")
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "GET /api/itinerary" "$STATUS" 200
echo -e "${gray}  $(pretty "$BODY")${reset}"

# ── 5. Editar primera parada ──────────────────────────────────────────────────
step "5. Editar primera parada — cambiar hora a 14:30"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE/$STOP_ID" \
  -H "Content-Type: application/json" \
  -d '{"hora":"14:30"}')
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "PATCH /api/itinerary/$STOP_ID" "$STATUS" 200
echo -e "${gray}  $(pretty "$BODY")${reset}"

# ── 6. Editar id inexistente ──────────────────────────────────────────────────
step "6. Editar parada inexistente (debe dar 404)"
RESPONSE=$(curl -s -w "\n%{http_code}" -X PATCH "$BASE/stop-fake-123" \
  -H "Content-Type: application/json" \
  -d '{"hora":"10:00"}')
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "PATCH /api/itinerary/stop-fake-123" "$STATUS" 404
echo -e "${gray}  $(pretty "$BODY")${reset}"

# ── 7. Eliminar primera parada ────────────────────────────────────────────────
step "7. Eliminar primera parada"
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE/$STOP_ID")
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "DELETE /api/itinerary/$STOP_ID" "$STATUS" 200
echo -e "${gray}  $(pretty "$BODY")${reset}"

# ── 8. Leer itinerario final ──────────────────────────────────────────────────
step "8. Leer itinerario final (solo 1 parada)"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE")
BODY=$(echo "$RESPONSE" | sed '$d')
STATUS=$(echo "$RESPONSE" | tail -n 1)
check "GET /api/itinerary" "$STATUS" 200
echo -e "${gray}  $(pretty "$BODY")${reset}"

# ── Resumen ───────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
echo -e "  ${green}Passed: $PASS${reset}   ${red}Failed: $FAIL${reset}"
echo "══════════════════════════════════════════"
echo ""
