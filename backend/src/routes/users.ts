import express from 'express'
import { dbOperations, bcrypt } from '../database.js'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const users = dbOperations.users.getAll().map(u => ({
      id: u.id,
      username: u.username,
      role: u.role,
      className: u.className,
      name: u.name
    }))
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const user = dbOperations.users.getById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      className: user.className,
      name: user.name
    })
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.post('/', async (req, res) => {
  try {
    const { username, password, role, className, name } = req.body
    
    const existing = dbOperations.users.getByUsername(username)
    if (existing) {
      return res.status(400).json({ message: '用户名已存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = dbOperations.users.create({
      username,
      password: hashedPassword,
      role: role as any,
      className,
      name
    })

    res.json({ id: newUser.id, username, role, className, name })
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { username, role, className, name } = req.body
    
    const updated = dbOperations.users.update(req.params.id, {
      username,
      role: role as any,
      className,
      name
    })

    if (!updated) {
      return res.status(404).json({ message: '用户不存在' })
    }

    res.json({
      id: updated.id,
      username: updated.username,
      role: updated.role,
      className: updated.className,
      name: updated.name
    })
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const success = dbOperations.users.delete(req.params.id)
    if (!success) {
      return res.status(404).json({ message: '用户不存在' })
    }
    res.status(204).send()
  } catch (err) {
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router