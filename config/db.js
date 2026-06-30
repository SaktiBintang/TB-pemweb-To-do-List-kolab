const mysql = require('mysql2');

// Konfigurasi koneksi MySQL dengan fallback nilai default
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'db_todo_list'
});

connection.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke database: ' + err.stack);
    return;
  }
  console.log('Berhasil terhubung ke database MySQL!');
});

module.exports = connection;
