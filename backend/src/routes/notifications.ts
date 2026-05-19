import express from 'express'
import { dbOperations } from '../database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const notifications = dbOperations.notifications.getAll()
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { type, className, message } = req.body
    
    const newNotification = dbOperations.notifications.create({
      type,
      className,
      message
    })

    res.json(newNotification)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.put('/:id/read', async (req, res) => {
  try {
    const updated = dbOperations.notifications.markAsRead(req.params.id)
    
    if (!updated) {
      return res.status(404).json({ message: '通知不存在' })
    }

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const success = dbOperations.notifications.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: '通知不存在' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router