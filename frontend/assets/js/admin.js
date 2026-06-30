// Proteksi: Hanya admin yang boleh akses
const role = localStorage.getItem('role');
if (role !== 'admin') {
    alert('Akses ditolak!');
    window.location.href = 'index.html';
}

// Ambil data tugas
function loadAdminTasks() {
    fetch(`${API_BASE_URL}/admin/tasks`)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('admin-task-list');
            if (!list) return;
            
            list.innerHTML = ''; 
            data.forEach(task => {
                const dateText = task.due_date ? task.due_date.split('T')[0] : '-';
                list.innerHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong class="text-primary">${task.username}</strong> membuat tugas: 
                            <span class="fw-semibold">${task.title}</span>
                        </div>
                        <span class="badge-deadline">Deadline: ${dateText}</span>
                    </li>`;
            });
        })
        .catch(err => console.error('Gagal memuat data monitoring admin:', err));
}

// Load admin tasks initial call
document.addEventListener("DOMContentLoaded", function() {
    loadAdminTasks();
});
