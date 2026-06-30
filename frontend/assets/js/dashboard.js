// Ambil data user dari localStorage
const userId = localStorage.getItem('userId');
const role = localStorage.getItem('role');
const username = localStorage.getItem('username') || 'Pengguna';

// Cek Auth Guard
if (!userId) {
    window.location.href = 'landing.html';
}

// Inisialisasi Welcome Message & Panel Admin jika ada
document.addEventListener("DOMContentLoaded", function() {
    const welcomeMsgEl = document.getElementById('welcome-message');
    if (welcomeMsgEl) {
        welcomeMsgEl.innerText = `Halo, ${username}!`;
    }

    const adminPanelEl = document.getElementById('admin-panel');
    if (adminPanelEl && role === 'admin') {
        adminPanelEl.innerHTML = 
            `<button onclick="window.location.href='admin.html'" class="btn btn-primary rounded-pill px-4">Panel Admin</button>`;
    }
});

let allTasks = [];
const catNames = { 1: 'Pekerjaan', 2: 'Pribadi', 3: 'Kuliah' };
const catClasses = { 1: 'bg-pekerjaan', 2: 'bg-pribadi', 3: 'bg-kuliah' };
const prioNames = { 1: 'Tinggi', 2: 'Sedang', 3: 'Rendah' };
const prioClasses = { 1: 'bg-danger text-white', 2: 'bg-warning text-dark', 3: 'bg-secondary text-white' };

let editModal;
document.addEventListener("DOMContentLoaded", function() {
    const modalEl = document.getElementById('editModal');
    if (modalEl) {
        editModal = new bootstrap.Modal(modalEl);
    }
});

// Load tasks from backend API
function loadTasks() {
    const filterStatus = document.getElementById('filter-status').value;
    const filterCategory = document.getElementById('filter-category').value;
    const sortSelect = document.getElementById('sort-select').value;

    let url = `${API_BASE_URL}/tasks?user_id=${userId}&role=${role}`;
    if (filterStatus) url += `&status=${filterStatus}`;
    if (filterCategory) url += `&category_id=${filterCategory}`;
    if (sortSelect) url += `&sort=${sortSelect}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            allTasks = data;
            const list = document.getElementById('task-list');
            if (!list) return;
            
            list.innerHTML = ''; 
            data.forEach(task => {
                const catClass = catClasses[task.category_id] || 'bg-light';
                const prioClass = prioClasses[task.priority] || 'bg-secondary';
                const prioName = prioNames[task.priority] || 'Rendah';
                list.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center task-item">
                    <span>
                        <input type="checkbox" class="form-check-input me-3" ${task.status === 'done' ? 'checked' : ''} onchange="updateStatus(${task.id}, this.checked)"> 
                        <span class="${task.status === 'done' ? 'done' : ''}">
                            <span class="badge rounded-pill ${catClass} px-3 py-1 me-2">${catNames[task.category_id]}</span>
                            <span class="badge rounded-pill ${prioClass} px-2 py-1 me-2" style="font-size: 0.75rem;">${prioName}</span>
                            <span class="fw-semibold">${task.title}</span>
                            <small class="text-muted d-block ms-4" style="font-size: 0.75rem; margin-left: 2.5rem !important;">Tenggat: ${task.due_date ? task.due_date.split('T')[0] : '-'}</small>
                        </span>
                    </span>
                    <div>
                        <button onclick="openEditModal(${task.id})" class="btn btn-sm btn-light text-primary rounded-pill px-3 me-2">Edit</button>
                        <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-light text-danger rounded-pill px-3">Hapus</button>
                    </div>
                </li>`;
            });
            filterTasks();
        })
        .catch(error => {
            console.error('Error saat mengambil data tugas:', error);
        });
}

// Search filter
function filterTasks() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase();
    const items = document.querySelectorAll('#task-list .task-item');
    
    items.forEach(item => {
        const titleSpan = item.querySelector('.fw-semibold');
        if (titleSpan) {
            const text = titleSpan.textContent.toLowerCase();
            if (text.includes(query)) {
                item.classList.remove('d-none');
                item.classList.add('d-flex');
            } else {
                item.classList.add('d-none');
                item.classList.remove('d-flex');
            }
        }
    });
}

// Add new task
async function addTask() {
    const title = document.getElementById('task-input').value.trim();
    const dueDate = document.getElementById('due-date-input').value;
    const categoryId = document.getElementById('category-select').value;
    const priority = document.getElementById('priority-select').value;

    if (!title) {
        return alert('Nama tugas tidak boleh kosong!');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                due_date: dueDate || null,
                user_id: userId,
                category_id: parseInt(categoryId),
                priority: parseInt(priority)
            })
        });

        if (response.ok) {
            document.getElementById('task-input').value = '';
            document.getElementById('due-date-input').value = '';
            document.getElementById('category-select').value = '1';
            document.getElementById('priority-select').value = '3';
            loadTasks();
        } else {
            const text = await response.text();
            alert(text || 'Gagal menambahkan tugas');
        }
    } catch (error) {
        console.error('Error saat menambah tugas:', error);
        alert('Gagal terhubung ke server.');
    }
}

// Open modal for editing task
function openEditModal(id) {
    const task = allTasks.find(t => t.id === id);
    if (!task) return;

    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-due-date').value = task.due_date ? task.due_date.split('T')[0] : '';
    document.getElementById('edit-task-category').value = task.category_id;
    document.getElementById('edit-task-priority').value = task.priority || 3;

    if (editModal) {
        editModal.show();
    }
}

// Save task update
async function saveTaskUpdate() {
    const id = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value.trim();
    const dueDate = document.getElementById('edit-task-due-date').value;
    const categoryId = document.getElementById('edit-task-category').value;
    const priority = document.getElementById('edit-task-priority').value;

    if (!title) {
        return alert('Nama tugas tidak boleh kosong!');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: title,
                due_date: dueDate || null,
                category_id: parseInt(categoryId),
                priority: parseInt(priority)
            })
        });

        if (response.ok) {
            if (editModal) {
                editModal.hide();
            }
            loadTasks();
        } else {
            const text = await response.text();
            alert(text || 'Gagal mengubah tugas');
        }
    } catch (error) {
        console.error('Error saat mengedit tugas:', error);
        alert('Gagal terhubung ke server.');
    }
}

// Delete a task
function deleteTask(id) { 
    fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' })
        .then(() => loadTasks())
        .catch(err => console.error('Error delete task:', err)); 
}

// Toggle done status
function updateStatus(id, isChecked) { 
    fetch(`${API_BASE_URL}/tasks/${id}`, { 
        method: 'PUT', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ status: isChecked ? 'done' : 'pending' }) 
    })
    .then(() => loadTasks())
    .catch(err => console.error('Error updating status:', err)); 
}

// Logout
function logout() { 
    localStorage.clear(); 
    window.location.href = 'login.html'; 
}

// Load tasks initial call
if (userId) {
    loadTasks();
}
