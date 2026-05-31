import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import { seedDatabase } from './lib/seed.js'

const app = express()
const port = process.env['PORT'] || 3001

app.use(cors({ origin: process.env['FRONTEND_URL'] ?? 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Steakz API is running' })
})

app.listen(port, async () => {
  await seedDatabase()
  console.log(`✅ Backend running on http://localhost:${port}`)
})