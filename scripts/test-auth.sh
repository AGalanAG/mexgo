#!/bin/bash

# MexGo — Auth API Test Script
# Requiere: npm run dev corriendo en http://localhost:3000
# Opcional: AUTH_ADMIN_REGISTRATION_TOKEN para probar registro ADMIN

BASE="${BASE_URL:-http://localhost:3000}"
ADMIN_TOKEN="${AUTH_ADMIN_REGISTRATION_TOKEN:-}"
TS="$(date +%s)"

PASS=0
FAIL=0

green="\033[0;32m"
red="\033[0;31m"
yellow="\033[0;33m"
cyan="\033[0;36m"
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

json_get() {
  # Uso: json_get "$JSON" "ruta.dot"
  local json=$1
  local path=$2
  python3 -c "
import json,sys
obj=json.loads(sys.argv[1])
path=sys.argv[2].split('.')
cur=obj
for p in path:
    if p.isdigit():
        cur=cur[int(p)]
    else:
        cur=cur.get(p)
    if cur is None:
        break
print('' if cur is None else cur)
" "$json" "$path" 2>/dev/null
}

run_flow() {
  local role=$1
  local email="${role,,}.${TS}@example.com"
  local password="Secret123!"
  local full_name="Test ${role} ${TS}"
  local register_payload

  echo -e "\n${cyan}── Flujo ${role} ──${reset}"

  if [ "$role" = "TURISTA" ]; then
    register_payload=$(cat <<EOF
{"email":"$email","password":"$password","fullName":"$full_name","language":"es","countryOfOrigin":"MX","roleCode":"$role"}
EOF
)
  elif [ "$role" = "ADMIN" ]; then
    if [ -z "$ADMIN_TOKEN" ]; then
      echo -e "${yellow}! Registro ADMIN omitido: falta AUTH_ADMIN_REGISTRATION_TOKEN${reset}"
      return
    fi
    register_payload=$(cat <<EOF
{"email":"$email","password":"$password","fullName":"$full_name","roleCode":"$role","adminRegistrationToken":"$ADMIN_TOKEN"}
EOF
)
  else
    register_payload=$(cat <<EOF
{"email":"$email","password":"$password","fullName":"$full_name","roleCode":"$role"}
EOF
)
  fi

  REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "$register_payload")

  REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | sed '$d')
  REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | tail -n 1)

  check "POST /api/auth/register ($role)" "$REGISTER_STATUS" 201

  LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}")

  LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')
  LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n 1)

  check "POST /api/auth/login ($role)" "$LOGIN_STATUS" 200

  ACCESS_TOKEN=$(json_get "$LOGIN_BODY" "data.session.accessToken")
  PRIMARY_ROLE=$(json_get "$LOGIN_BODY" "data.primaryRole")

  if [ -n "$PRIMARY_ROLE" ]; then
    echo "   → primaryRole: $PRIMARY_ROLE"
  fi

  if [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${red}✗ No se obtuvo accessToken en login ($role)${reset}"
    FAIL=$((FAIL + 1))
    return
  fi

  ME_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE/api/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN")

  ME_BODY=$(echo "$ME_RESPONSE" | sed '$d')
  ME_STATUS=$(echo "$ME_RESPONSE" | tail -n 1)

  check "GET /api/auth/me ($role)" "$ME_STATUS" 200

  ME_PRIMARY_ROLE=$(json_get "$ME_BODY" "data.primaryRole")
  if [ -n "$ME_PRIMARY_ROLE" ]; then
    echo "   → me.primaryRole: $ME_PRIMARY_ROLE"
  fi
}

echo ""
echo "══════════════════════════════════════════"
echo "  MexGo Auth Tests — $BASE"
echo "══════════════════════════════════════════"

run_flow "TURISTA"
run_flow "ENCARGADO_NEGOCIO"
run_flow "EMPLEADO_NEGOCIO"
run_flow "ADMIN"

echo -e "\n${yellow}── Pruebas negativas ──${reset}"

BAD_LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nadie@example.com","password":"incorrecta"}')
BAD_LOGIN_STATUS=$(echo "$BAD_LOGIN_RESPONSE" | tail -n 1)
check "POST /api/auth/login (credenciales invalidas)" "$BAD_LOGIN_STATUS" 401

NO_TOKEN_ME_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE/api/auth/me")
check "GET /api/auth/me (sin token)" "$NO_TOKEN_ME_STATUS" 401

echo ""
echo "══════════════════════════════════════════"
echo -e "  ${green}Passed: $PASS${reset}   ${red}Failed: $FAIL${reset}"
echo "══════════════════════════════════════════"
echo ""
