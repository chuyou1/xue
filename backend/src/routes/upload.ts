import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dbOperations } from '../database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsDir = path.join(__dirname, '../../uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}${ext}`
    cb(null, filename)
  }
})

const upload = multer({ storage })
const router = express.Router()

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传图片文件' })
    }

    const { filename, originalname } = req.file
    const url = `http://localhost:4000/uploads/${filename}`
    const createdAt = new Date().toISOString()

    dbOperations.images.create({
      filename,
      originalName: originalname,
      url,
      createdAt
    })

    res.json({ url })
  } catch (err) {
    console.error('图片上传失败:', err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router