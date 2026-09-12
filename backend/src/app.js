const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const config = require('./config')
const { errorHandler, notFound } = require('./middleware/errorHandler')

const app = express()

app.use(helmet())
app.use(cors({ origin: config.frontendUrl, credentials: true, allowedHeaders: ['Authorization', 'Content-Type', 'Accept', 'Origin', 'X-Requested-With'] }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(morgan('dev'))

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
})

if (config.nodeEnv === 'production') {
  app.use('/api/', limiter)
} else {
  app.use('/api/', (req, res, next) => {
    req.rateLimit = { remaining: 1000, resetTime: Date.now() + 15 * 60 * 1000 }
    next()
  })
}

app.use('/api/public', require('./routes/public'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/users', require('./routes/users'))
app.use('/api/roles', require('./routes/roles'))
app.use('/api/proposals', require('./routes/proposals'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/parcels', require('./routes/parcels'))
app.use('/api/map/parcels', require('./routes/parcels'))
app.use('/api/dashboard', require('./routes/dashboard'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/documents', require('./routes/documents'))
app.use('/api/compensation', require('./routes/compensation'))
app.use('/api/audit-logs', require('./routes/audit'))
app.use('/api/departments', require('./routes/departments'))

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Bharat Bhoomi API is running', timestamp: new Date().toISOString() })
})

app.use(notFound)
app.use(errorHandler)

module.exports = app
