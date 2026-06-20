const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'db_todo_list'
});

connection.connect((err) => {
  if (err) {
    console.error('Gagal terhubung ke database: ' + err.stack);
    return;
  }
  console.log('Berhasil terhubung ke database MySQL!');
});

module.exports = connection;