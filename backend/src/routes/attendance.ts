import express from 'express'
import { dbOperations } from '../database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const records = dbOperations.attendance.getAll()
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/classroom/:classroom', async (req, res) => {
  try {
    const { date, timeSlot } = req.query
    const records = dbOperations.attendance.getByClassroom(
      req.params.classroom,
      date as string,
      timeSlot as string
    )
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/class/:className', async (req, res) => {
  try {
    const records = dbOperations.attendance.getByClass(req.params.className)
    res.json(records)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { date, timeSlot, classroom, present, leave, late, absent, submittedAt, stage, leaveStudents, lateStudents, absentStudents, className, instructor, source } = req.body
    
    const newRecord = dbOperations.attendance.create({
      date,
      timeSlot,
      classroom,
      present,
      leave,
      late,
      absent,
      submittedAt,
      stage,
      leaveStudents,
      lateStudents,
      absentStudents,
      className,
      instructor,
      source
    })

    res.json(newRecord)
  } catch (err) {
    console.error('创建考勤记录失败:', err)
    res.status(500).json({ message: '服务器错误' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { present, leave, late, absent, stage, leaveStudents, lateStudents, absentStudents } = req.body

    const updated = dbOperations.attendance.update(req.params.id, {
      present,
      leave,
      late,
      absent,
      stage,
      leaveStudents,
      lateStudents,
      absentStudents
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
    const success = dbOperations.attendance.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: '记录不存在' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router