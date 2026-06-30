const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const SECRET_KEY = process.env.JWT_SECRET || 'rahasia_nusa';

// Handler Register
async function register(req, res) {
    const username = (req.body.username || '').trim();
    const password = (req.body.password || '').trim();

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password wajib diisi' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query('INSERT INTO users (username, password, role) VALUES (?, ?, "user")', [username, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ message: 'Username sudah dipakai, coba username lain' });
                }

                if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_BAD_DB_ERROR') {
                    return res.status(503).json({ message: 'Database tidak tersedia. Pastikan MySQL aktif dan database sudah dibuat.' });
                }

                console.error('Register error:', err);
                return res.status(500).json({ message: 'Gagal mendaftar' });
            }

            res.status(201).json({ message: 'User berhasil terdaftar' });
        });
    } catch (error) {
        console.error('Register hashing error:', error);
        res.status(500).json({ message: 'Gagal memproses password' });
    }
}

// Handler Login
function login(req, res) {
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
}

module.exports = {
    register,
    login
};
