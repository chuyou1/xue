import express from 'express'
import { dbOperations } from '../database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const classes = dbOperations.classes.getAll()
    res.json(classes)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const cls = dbOperations.classes.getById(req.params.id)
    if (!cls) {
      return res.status(404).json({ message: '班级不存在' })
    }
    res.json(cls)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router