import express from 'express'
import { dbOperations } from '../database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const records = dbOperations.supervision.getAll()
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/classroom/:classroom', async (req, res) => {
  try {
    const { date, timeSlot } = req.query
    const records = dbOperations.supervision.getByClassroom(
      req.params.classroom,
      date as string,
      timeSlot as string
    )
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { date, timeSlot, classroom, className, instructor, inspector, leaveVerified, violations, score, status, createdAt, classAttendance } = req.body
    
    const newRecord = dbOperations.supervision.create({
      date,
      timeSlot,
      classroom,
      className,
      instructor,
      inspector,
      leaveVerified: Boolean(leaveVerified),
      violations: violations || [],
      score,
      status,
      createdAt,
      classAttendance
    })

    res.json(newRecord)
  } catch (err) {
    console.error('创建督查记录失败:', err)
    res.status(500).json({ message: '服务器错误' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { leaveVerified, violations, score, status } = req.body

    const updated = dbOperations.supervision.update(req.params.id, {
      leaveVerified: Boolean(leaveVerified),
      violations: violations || [],
      score,
      status
    })

    if (!updated) {
      return res.status(404).json({ message: '记录不存在' })
    }

    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const success = dbOperations.supervision.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: '记录不存在' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router