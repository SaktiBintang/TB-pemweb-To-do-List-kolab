const express = require('express');
const fs = require('fs'); // Ini untuk membaca file di komputer
const app = express();
const port = 3000;

// Endpoint untuk menampilkan semua data tugas
app.get('/tasks', (req, res) => {
  fs.readFile('tasks.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Gagal membaca data');
    } else {
      res.json(JSON.parse(data)); // Mengirim data ke browser dalam format JSON
    }
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});