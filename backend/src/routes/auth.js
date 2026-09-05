const express = require('express')
const router = express.Router()
const { login, register, getMe, logout, updateProfile } = require('../controllers/authController')
const { authenticate } = require('../middleware/auth')

router.post('/login', login)
router.post('/register', register)
router.get('/me', authenticate, getMe)
router.put('/me', authenticate, updateProfile)
router.post('/logout', authenticate, logout)

module.exports = router
