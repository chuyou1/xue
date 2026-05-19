import express from 'express'
import { dbOperations } from '../database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const records = dbOperations.anomalies.getAll()
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/date/:date', async (req, res) => {
  try {
    const records = dbOperations.anomalies.getByDate(req.params.date)
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/today-count', async (req, res) => {
  try {
    const count = dbOperations.anomalies.getTodayCount()
    res.json(count)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { date, timeSlot, classroom, className, instructor, inspector, type, originalData, editedData, leaveStudents, lateStudents, absentStudents, notInClassroomStudents, notInClassroomReason, reason, createdAt, hasAnomaly } = req.body
    
    const newRecord = dbOperations.anomalies.create({
      date,
      timeSlot,
      classroom,
      className,
      instructor,
      inspector,
      type,
      originalData,
      editedData,
      leaveStudents,
      lateStudents,
      absentStudents,
      notInClassroomStudents,
      notInClassroomReason,
      reason,
      createdAt,
      hasAnomaly: Boolean(hasAnomaly)
    })

    res.json(newRecord)
  } catch (err) {
    console.error('创建异常记录失败:', err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router