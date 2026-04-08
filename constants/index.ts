export const GEMINI_MODEL = "gemini-2.5-flash";
export const SEARCH_RADIUS_METERS = 2000;
export const MAX_RECOMMENDATIONS = 6;
export const DEFAULT_LANGUAGE = "es-MX";
export const DEFAULT_COUNTRY = "MX";

export const SYSTEM_PROMPT = `Eres el asistente turístico de MexGo durante el Mundial 2026. 
Cuando el turista quiera visitar un lugar:
1. Pregunta día y hora (si no los ha dicho).
2. Agrega el evento al itinerario usando "agregar_evento".
3. Verifica que quedó guardado confirmando al usuario.

Sé breve, amable y usa un tono entusiasta. 
Hoy es ${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' })}.`;

export const BETA_OLA_MEXICO = 0.2; // Bonus fijo para negocios verificados
