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
    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, "user")', [username, hashedPassword], (err) => {
        if (err) return res.status(500).send('Gagal mendaftar');
        res.status(201).send('User berhasil terdaftar');
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).send('User tidak ditemukan');
        
        const user = results[0]; 
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) return res.status(401).send('Password salah');
        
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        
        res.json({ 
            message: 'Login Berhasil',
            token: token, 
            userId: user.id,
            role: user.role 
        });
    });
});

// --- TASKS (CRUD DENGAN ISOLASI DATA) ---

app.get('/tasks', (req, res) => {
    const { user_id, role } = req.query;
    let sql = 'SELECT * FROM tasks';
    let params = [];

    if (role !== 'admin') {
        sql = 'SELECT * FROM tasks WHERE user_id = ?';
        params = [user_id];
    }
    
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).send('Gagal mengambil data');
        res.json(results);
    });
});

// --- ENDPOINT KHUSUS ADMIN ---

app.get('/admin/tasks', (req, res) => {
    // Mengambil semua tugas beserta nama user pemiliknya menggunakan JOIN
    const query = "SELECT tasks.*, users.username FROM tasks JOIN users ON tasks.user_id = users.id";
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
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