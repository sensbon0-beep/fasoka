const express = require('express');
const router = express.Router();
const { signup, confirmAccount, login } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/confirm', confirmAccount);
router.post('/login', login);

module.exports = router;
