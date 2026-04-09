// ─── LSM Video Data ───────────────────────────────────────────────────────────
// Estructura: id único, label visible, youtubeId (solo la parte del ID de la URL)
// URL completa: https://youtu.be/<youtubeId>
// Para agregar más temas, añade la clave con su array de videos.

export interface LessonVideo {
  id: string;
  label: string;
  youtubeId?: string;
}

export const LSM_VIDEOS: Record<string, LessonVideo[]> = {

  // ── Saludos ────────────────────────────────────────────────────────────────
  saludos: [
    { id: 's1',  label: 'Adiós',                    youtubeId: 'aI1ohGAwVHc' },
    { id: 's2',  label: 'Bienvenida / Bienvenido (1)', youtubeId: 'aI5MouXP1vc' },
    { id: 's3',  label: 'Bienvenida / Bienvenido (2)', youtubeId: 's00Tg5lQ3NY' },
    { id: 's4',  label: 'Buenas Noches',             youtubeId: 'dJN2eCv5nDw' },
    { id: 's5',  label: 'Buenas Tardes',             youtubeId: 'AFFLrwoX-gA' },
    { id: 's6',  label: 'Buenos Días',               youtubeId: 'bY3jLzcPNNo' },
    { id: 's7',  label: 'Gracias',                   youtubeId: 'jAvN4wvvpgY' },
    { id: 's8',  label: 'Hola (1)',                  youtubeId: 'lhrN2iaPdaM' },
    { id: 's9',  label: 'Hola (2)',                  youtubeId: 'LZYCBLDBqhA' },
    { id: 's10', label: 'Mucho Gusto',               youtubeId: 'BAQp_Mhf_Ig' },
    { id: 's11', label: 'Saludo',                    youtubeId: 'pu9H6PemZE8' },
  ],

  // ── Expresiones ───────────────────────────────────────────────────────────
  expresiones: [
    { id: 'e1', label: 'De nada' },
    { id: 'e2', label: 'Perdón' },
    { id: 'e3', label: 'Lo siento' },
    { id: 'e4', label: 'No entiendo' },
    { id: 'e5', label: '¿Me repites?' },
  ],

  // ── Números ───────────────────────────────────────────────────────────────
  numeros: [
    { id: 'n1',  label: '1 — Uno' },
    { id: 'n2',  label: '2 — Dos' },
    { id: 'n3',  label: '3 — Tres' },
    { id: 'n4',  label: '4 — Cuatro' },
    { id: 'n5',  label: '5 — Cinco' },
    { id: 'n6',  label: '6 — Seis' },
    { id: 'n7',  label: '7 — Siete' },
    { id: 'n8',  label: '8 — Ocho' },
    { id: 'n9',  label: '9 — Nueve' },
    { id: 'n10', label: '10 — Diez' },
  ],

  // ── Colores ───────────────────────────────────────────────────────────────
  colores: [
    { id: 'c1', label: 'Rojo' },
    { id: 'c2', label: 'Azul' },
    { id: 'c3', label: 'Verde' },
    { id: 'c4', label: 'Amarillo' },
    { id: 'c5', label: 'Negro' },
    { id: 'c6', label: 'Blanco' },
    { id: 'c7', label: 'Naranja' },
    { id: 'c8', label: 'Morado' },
  ],

  // ── Profesiones ───────────────────────────────────────────────────────────
  profesiones: [
    { id: 'p1', label: 'Doctor / Doctora' },
    { id: 'p2', label: 'Maestra / Maestro' },
    { id: 'p3', label: 'Abogado' },
    { id: 'p4', label: 'Ingeniero' },
    { id: 'p5', label: 'Contador' },
    { id: 'p6', label: 'Enfermera / Enfermero' },
  ],

  // ── Familia ───────────────────────────────────────────────────────────────
  familia: [
    { id: 'f1', label: 'Mamá' },
    { id: 'f2', label: 'Papá' },
    { id: 'f3', label: 'Hermano / Hermana' },
    { id: 'f4', label: 'Abuelo / Abuela' },
    { id: 'f5', label: 'Tío / Tía' },
    { id: 'f6', label: 'Primo / Prima' },
  ],

  // ── Protección Civil ─────────────────────────────────────────────────────
  proteccion: [
    { id: 'pc1', label: 'Evacuación' },
    { id: 'pc2', label: 'Sismo' },
    { id: 'pc3', label: 'Incendio' },
    { id: 'pc4', label: 'Primeros Auxilios' },
    { id: 'pc5', label: 'Punto de Reunión' },
    { id: 'pc6', label: 'Emergencia' },
  ],

  // ── Lugares CDMX ─────────────────────────────────────────────────────────
  lugares: [
    { id: 'l1', label: 'Centro Histórico' },
    { id: 'l2', label: 'Xochimilco' },
    { id: 'l3', label: 'Chapultepec' },
    { id: 'l4', label: 'Coyoacán' },
    { id: 'l5', label: 'Estadio Azteca' },
    { id: 'l6', label: 'Aeropuerto' },
  ],

  // ── Tecnología ───────────────────────────────────────────────────────────
  tecnologia: [
    { id: 't1', label: 'Teléfono' },
    { id: 't2', label: 'Computadora' },
    { id: 't3', label: 'Internet' },
    { id: 't4', label: 'Contraseña' },
    { id: 't5', label: 'Aplicación' },
    { id: 't6', label: 'Red Social' },
  ],

  // ── Verbos ───────────────────────────────────────────────────────────────
  verbos: [
    { id: 'v1', label: 'Comer' },
    { id: 'v2', label: 'Beber' },
    { id: 'v3', label: 'Dormir' },
    { id: 'v4', label: 'Trabajar' },
    { id: 'v5', label: 'Estudiar' },
    { id: 'v6', label: 'Caminar' },
    { id: 'v7', label: 'Correr' },
    { id: 'v8', label: 'Hablar' },
  ],

  // ── Pronombres ───────────────────────────────────────────────────────────
  pronombres: [
    { id: 'pr1', label: 'Yo' },
    { id: 'pr2', label: 'Tú' },
    { id: 'pr3', label: 'Él / Ella' },
    { id: 'pr4', label: 'Nosotros' },
    { id: 'pr5', label: 'Ellos / Ellas' },
    { id: 'pr6', label: 'Usted' },
  ],

  // ── Continentes y países ─────────────────────────────────────────────────
  continentes: [
    { id: 'co1', label: 'México' },
    { id: 'co2', label: 'América' },
    { id: 'co3', label: 'Europa' },
    { id: 'co4', label: 'Asia' },
    { id: 'co5', label: 'África' },
    { id: 'co6', label: 'Arabia Saudita' },
  ],

  // ── Educación ────────────────────────────────────────────────────────────
  educacion: [
    { id: 'ed1', label: 'Escuela' },
    { id: 'ed2', label: 'Universidad' },
    { id: 'ed3', label: 'Libro' },
    { id: 'ed4', label: 'Tarea' },
    { id: 'ed5', label: 'Examen' },
    { id: 'ed6', label: 'Calificación' },
  ],

  // ── Ámbito Jurídico ──────────────────────────────────────────────────────
  juridico: [
    { id: 'j1', label: 'Ley' },
    { id: 'j2', label: 'Derecho' },
    { id: 'j3', label: 'Juez' },
    { id: 'j4', label: 'Tribunal' },
    { id: 'j5', label: 'Contrato' },
    { id: 'j6', label: 'Denuncia' },
  ],

  // ── Gobierno Federal ─────────────────────────────────────────────────────
  gobierno: [
    { id: 'g1', label: 'IMSS' },
    { id: 'g2', label: 'SAT' },
    { id: 'g3', label: 'CDMX' },
    { id: 'g4', label: 'Policía' },
    { id: 'g5', label: 'Cruz Roja' },
    { id: 'g6', label: 'Bomberos' },
  ],

  // ── Personajes Históricos ────────────────────────────────────────────────
  personajes: [
    { id: 'ph1', label: 'Benito Juárez' },
    { id: 'ph2', label: 'Frida Kahlo' },
    { id: 'ph3', label: 'Diego Rivera' },
    { id: 'ph4', label: 'Emiliano Zapata' },
    { id: 'ph5', label: 'Miguel Hidalgo' },
  ],

  // ── Educación para Personas Sordas ───────────────────────────────────────
  sordas: [
    { id: 'so1', label: 'Comunidad Sorda' },
    { id: 'so2', label: 'Intérprete LSM' },
    { id: 'so3', label: 'Audífono' },
    { id: 'so4', label: 'Lectura Labial' },
    { id: 'so5', label: 'Alfabeto Dactilológico' },
  ],

  // ── Temporalidad ─────────────────────────────────────────────────────────
  temporal: [
    { id: 'te1', label: 'Hoy' },
    { id: 'te2', label: 'Ayer' },
    { id: 'te3', label: 'Mañana' },
    { id: 'te4', label: 'Semana' },
    { id: 'te5', label: 'Mes' },
    { id: 'te6', label: 'Año' },
    { id: 'te7', label: 'Hora' },
  ],
};
