const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const app = express();
const port = 3000;
const SECRET_KEY = 'rahasia_nusa';

app.use(cors());
app.use(express.json());

// --- AUTENTIKASI ---

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
        if (err) return res.status(500).send('Gagal mendaftar');
        res.status(201).send('User berhasil terdaftar');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).send('User tidak ditemukan');
        
        const isMatch = await bcrypt.compare(password, results[0].password);
        if (!isMatch) return res.status(401).send('Password salah');
        
        const token = jwt.sign({ id: results[0].id, role: results[0].role }, SECRET_KEY, { expiresIn: '1h' });
        // MENGIRIM userId KE FRONTEND AGAR BISA DISIMPAN DI LOCALSTORAGE
        res.json({ token, userId: results[0].id });
    });
});

// --- TASKS (CRUD DENGAN ISOLASI DATA) ---

// 1. GET Tasks dengan filter user_id
app.get('/tasks', (req, res) => {
    const { user_id } = req.query;
    const sql = user_id ? 'SELECT * FROM tasks WHERE user_id = ?' : 'SELECT * FROM tasks';
    
    db.query(sql, [user_id], (err, results) => {
        if (err) return res.status(500).send('Gagal mengambil data');
        res.json(results);
    });
});

app.post('/tasks', (req, res) => {
    const { title, due_date, user_id, category_id } = req.body;
    const sql = 'INSERT INTO tasks (title, due_date, user_id, category_id, status) VALUES (?, ?, ?, ?, "pending")';
    db.query(sql, [title, due_date, user_id, category_id], (err) => {
        if (err) return res.status(500).send('Gagal menambah data');
        res.status(201).send('Tugas berhasil ditambahkan');
    });
});

app.delete('/tasks/:id', (req, res) => {
    db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send('Gagal menghapus data');
        res.status(200).send('Tugas berhasil dihapus');
    });
});

app.put('/tasks/:id', (req, res) => {
    db.query('UPDATE tasks SET status = ? WHERE id = ?', [req.body.status, req.params.id], (err) => {
        if (err) return res.status(500).send('Gagal update data');
        res.status(200).send('Status berhasil diupdate');
    });
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});