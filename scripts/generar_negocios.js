const fs = require('fs');

const categorias = ['Fonda', 'Artesanías', 'Cafetería', 'Hostal', 'Taller Local'];
const zonas = [
  { nombre: 'Centro Histórico', lat: 19.4326, lng: -99.1332 },
  { nombre: 'Cerca Estadio Azteca', lat: 19.3029, lng: -99.1505 },
  { nombre: 'Cerca Estadio Akron (GDL)', lat: 20.6811, lng: -103.4627 }
];

const negocios = Array.from({ length: 50 }, (_, i) => {
  const zona = zonas[Math.floor(Math.random() * zonas.length)];
  return {
    id: i + 1,
    nombre: `${categorias[Math.floor(Math.random() * categorias.length)]} ${i + 1}`,
    lat: zona.lat + (Math.random() - 0.5) * 0.01,
    lng: zona.lng + (Math.random() - 0.5) * 0.01,
    categoria: categorias[Math.floor(Math.random() * categorias.length)],
    verificado_ola_mexico: Math.random() > 0.3, // 70% verificados
    saturacion_actual: 0
  };
});

fs.writeFileSync('negocios_seed.json', JSON.stringify(negocios, null, 2));
console.log('✅ Archivo negocios_seed.json generado con 50 locales.');