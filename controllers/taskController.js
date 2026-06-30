const db = require('../config/db');

// Ambil data tugas (dengan filter & sorting)
function getTasks(req, res) {
    const { user_id, role, status, category_id, sort } = req.query;
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    let params = [];

    if (role !== 'admin') {
        sql += ' AND user_id = ?';
        params.push(user_id);
    }

    if (status) {
        sql += ' AND status = ?';
        params.push(status);
    }

    if (category_id) {
        sql += ' AND category_id = ?';
        params.push(parseInt(category_id));
    }

    if (sort === 'due_date') {
        sql += ' ORDER BY due_date IS NULL ASC, due_date ASC';
    } else if (sort === 'priority') {
        sql += ' ORDER BY priority ASC';
    } else {
        sql += ' ORDER BY created_at DESC';
    }
    
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send('Gagal mengambil data');
        }
        res.json(results);
    });
}

// Ambil semua tugas (Monitoring Admin)
function getAdminTasks(req, res) {
    const query = "SELECT tasks.*, users.username FROM tasks JOIN users ON tasks.user_id = users.id";
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
}

// Tambah tugas baru
function addTask(req, res) {
    const { title, due_date, user_id, category_id, priority } = req.body;
    const sql = 'INSERT INTO tasks (title, due_date, user_id, category_id, priority, status) VALUES (?, ?, ?, ?, ?, "pending")';
    db.query(sql, [title, due_date ? due_date : null, user_id, category_id, priority || 3], (err) => {
        if (err) {
            console.error('Error adding task:', err);
            return res.status(500).send('Gagal menambah data');
        }
        res.status(201).send('Tugas berhasil ditambahkan');
    });
}

// Hapus tugas berdasarkan ID
function deleteTask(req, res) {
    db.query('DELETE FROM tasks WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).send('Gagal menghapus data');
        res.status(200).send('Tugas berhasil dihapus');
    });
}

// Update tugas (Bisa update judul/due_date/kategori/prioritas atau hanya status selesai)
function updateTask(req, res) {
    const { status, title, due_date, category_id, priority } = req.body;
    const taskId = req.params.id;

    if (status !== undefined && title === undefined) {
        db.query('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId], (err) => {
            if (err) return res.status(500).send('Gagal update status');
            return res.status(200).send('Status berhasil diupdate');
        });
    } else {
        const sql = 'UPDATE tasks SET title = ?, due_date = ?, category_id = ?, priority = ? WHERE id = ?';
        db.query(sql, [title, due_date ? due_date : null, category_id, priority, taskId], (err) => {
            if (err) {
                console.error('Error updating task:', err);
                return res.status(500).send('Gagal update data');
            }
            return res.status(200).send('Tugas berhasil diupdate');
        });
    }
}

module.exports = {
    getTasks,
    getAdminTasks,
    addTask,
    deleteTask,
    updateTask
};
