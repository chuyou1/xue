import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDB } from './database.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import attendanceRoutes from './routes/attendance.js'
import supervisionRoutes from './routes/supervision.js'
import notificationRoutes from './routes/notifications.js'
import anomalyRoutes from './routes/anomalies.js'
import classRoutes from './routes/classes.js'
import uploadRoutes from './routes/upload.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/supervision', supervisionRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/anomalies', anomalyRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/upload', uploadRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: '服务器运行正常' })
})

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`)
  })
}).catch(err => {
  console.error('数据库初始化失败:', err)
  process.exit(1)
})