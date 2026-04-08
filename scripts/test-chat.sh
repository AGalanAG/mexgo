#!/bin/bash

# MexGo — Simulación de conversación con Gemini
# Requiere: npm run dev corriendo en http://localhost:3000

BASE="http://localhost:3000/api/chat"

green="\033[0;32m"
blue="\033[0;34m"
yellow="\033[0;33m"
gray="\033[0;90m"
reset="\033[0m"

# Historial acumulado (JSON array)
HISTORIAL="[]"

chat() {
  local MENSAJE=$1
  local LABEL=$2

  echo -e "\n${blue}Turista:${reset} $MENSAJE"

  PAYLOAD=$(printf '{"mensaje": %s, "historial": %s}' \
    "$(echo "$MENSAJE" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')" \
    "$HISTORIAL")

  RESPONSE=$(curl -s -X POST "$BASE" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")

  RESPUESTA=$(echo "$RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("respuesta",""))' 2>/dev/null)
  EVENTO=$(echo "$RESPONSE" | python3 -c 'import json,sys; d=json.load(sys.stdin); e=d.get("eventoAgregado"); print(json.dumps(e) if e else "")' 2>/dev/null)

  echo -e "${green}Gemini:${reset}  $RESPUESTA"

  if [ -n "$EVENTO" ] && [ "$EVENTO" != "null" ]; then
    echo -e "${yellow}  → Evento agregado: $EVENTO${reset}"
  fi

  # Agrega al historial
  HISTORIAL=$(echo "$HISTORIAL" | python3 -c "
import json, sys
h = json.load(sys.stdin)
h.append({'role': 'user', 'text': '$MENSAJE'})
h.append({'role': 'model', 'text': $(echo "$RESPUESTA" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read().strip()))')})
print(json.dumps(h))
" 2>/dev/null)
}

echo ""
echo "══════════════════════════════════════════"
echo "  MexGo — Simulación de conversación"
echo "══════════════════════════════════════════"
echo -e "${gray}(Turista japonés llegando a CDMX para el Mundial)${reset}"

chat "Hola! I just arrived in Mexico City. What taquerias do you recommend near the city center?"
sleep 1

chat "The first one sounds great! Can you add it to my itinerary for tomorrow June 15th at 1pm?"
sleep 1

chat "Actually, can you change it to 2pm instead?"
sleep 1

chat "Perfect. What else is in my itinerary so far?"
sleep 1

chat "Actually, please remove that taquería from my itinerary."

echo ""
echo "══════════════════════════════════════════"
echo "  Fin de la conversación"
echo "══════════════════════════════════════════"
echo ""
