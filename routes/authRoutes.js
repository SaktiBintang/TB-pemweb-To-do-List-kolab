const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Router Register
router.post('/register', authController.register);

// Router Login
router.post('/login', authController.login);

module.exports = router;
