const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 1. Endpoint untuk mengambil semua data (Tidak berubah)
app.get('/tasks', (req, res) => {
    db.query('SELECT * FROM tasks', (err, results) => {
        if (err) return res.status(500).send('Gagal mengambil data');
        res.json(results);
    });
});

// 2. Endpoint untuk menambah tugas (INI YANG DIUBAH)
app.post('/tasks', (req, res) => {
    // Menangkap title DAN due_date dari body request
    const { title, due_date } = req.body;
    
    // Sesuaikan query SQL untuk memasukkan due_date
    const sql = 'INSERT INTO tasks (title, due_date, status) VALUES (?, ?, "pending")';
    
    db.query(sql, [title, due_date], (err, result) => {
        if (err) {
            console.error(err); // Membantu debugging jika error
            return res.status(500).send('Gagal menambah data');
        }
        res.status(201).send('Tugas berhasil ditambahkan');
    });
});

// 3. Endpoint hapus (Tidak berubah)
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM tasks WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).send('Gagal menghapus data');
        res.status(200).send('Tugas berhasil dihapus');
    });
});

// 4. Endpoint update status (Tidak berubah)
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id], (err, result) => {
        if (err) return res.status(500).send('Gagal update data');
        res.status(200).send('Status berhasil diupdate');
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});