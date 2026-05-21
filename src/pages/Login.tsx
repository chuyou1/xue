import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Login.css'
import { User } from '../data'
import { api } from '../services/api'

interface LoginProps {
  onLogin: (user: User) => void
}

function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !password) {
      setError('请填写账号和密码')
      setLoading(false)
      return
    }

    try {
      const user = await api.auth.login(username, password)
      onLogin(user)
      
      switch (user.role) {
        case 'classMonitor':
          navigate('/class-monitor')
          break
        case 'secretary':
          navigate('/secretary')
          break
        case 'cadre':
          navigate('/cadre')
          break
        case 'vicePresident':
          navigate('/vice-president')
          break
      }
    } catch (err) {
      setError('账号或密码错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>计科院学风建设督查系统</h1>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">账号</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入账号"
              autoComplete="off"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-button">登录</button>
        </form>
        

      </div>
    </div>
  )
}

export default Login
