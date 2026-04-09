const express = require('express');
const app = express();
const port = 3000;

// Importamos tus 50 negocios (el JSON que tú curaste)
const negocios = require('../scripts/negocios_seed.json');

app.get('/api/negocios', (req, res) => {
  console.log("Solicitud recibida: Alguien quiere ver los negocios.");
  
  // Simulamos la respuesta del contrato definido en API.md
  res.json({
    status: "success",
    total: negocios.length,
    data: negocios
  });
});

app.listen(port, () => {
  console.log(`Servidor de pruebas corriendo en http://localhost:${port}`);
});