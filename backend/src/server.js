require('dotenv').config()
const app = require('./app')
const config = require('./config')
const { seedPermissions, seedRolePermissions } = require('./controllers/roleController')

const server = app.listen(config.port, async () => {
  await seedPermissions()
  await seedRolePermissions()
  console.log(`Bharat Bhoomi Backend running on port ${config.port}`)
  console.log(`Environment: ${config.nodeEnv}`)
  console.log(`Frontend URL: ${config.frontendUrl}`)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
  })
})
