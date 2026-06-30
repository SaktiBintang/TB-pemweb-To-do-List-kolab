const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

// Get all tasks (User / Admin)
router.get('/tasks', taskController.getTasks);

// Get all tasks for admin (Monitoring)
router.get('/admin/tasks', taskController.getAdminTasks);

// Add new task
router.post('/tasks', taskController.addTask);

// Delete task by ID
router.delete('/tasks/:id', taskController.deleteTask);

// Update task by ID
router.put('/tasks/:id', taskController.updateTask);

module.exports = router;
