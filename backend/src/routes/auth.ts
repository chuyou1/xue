import express from 'express'
import { dbOperations, bcrypt } from '../database.js'

const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    if (!username || !password) {
      return res.status(400).json({ message: '请填写账号和密码' })
    }

    const user = dbOperations.users.getByUsername(username)
    
    if (!user) {
      return res.status(401).json({ message: '账号或密码错误' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: '账号或密码错误' })
    }

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      className: user.className,
      name: user.name
    })
  } catch (err) {
    console.error('登录失败:', err)
    res.status(500).json({ message: '服务器错误' })
  }
})

export default router