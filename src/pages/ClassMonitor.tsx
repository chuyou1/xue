import { useState, useEffect, useRef } from 'react'
import '../styles/ClassMonitor.css'
import { User, getClassInfo, ClassInfo, saveAttendanceRecord, getAttendanceRecords, AttendanceRecord as GlobalAttendanceRecord } from '../data'

interface ClassMonitorProps {
  user: User
  onLogout: () => void
}

interface LeaveStudent {
  name: string
  photo?: File
  photoPreview?: string
}

interface AttendanceRecord {
  id: string
  date: string
  timeSlot: string
  classroom: string
  present: string
  leave: string
  late: string
  absent: string
  submittedAt: string
}

function ClassMonitor({ user, onLogout }: ClassMonitorProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [classroom, setClassroom] = useState('')
  const [present, setPresent] = useState('')
  const [leave, setLeave] = useState('')
  const [late, setLate] = useState('')
  const [absent, setAbsent] = useState('')
  const [leaveStudents, setLeaveStudents] = useState<LeaveStudent[]>([])
  const [validationError, setValidationError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('attendance')
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null)

  const classInfo: ClassInfo | undefined = user.className ? getClassInfo(user.className) : undefined
  const total = classInfo ? classInfo.count.toString() : '30'

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 自动关闭验证错误弹窗
  useEffect(() => {
    if (validationError) {
      // 清除之前的定时器
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
      // 设置新的定时器，3秒后自动关闭
      autoCloseTimerRef.current = setTimeout(() => {
        setValidationError('')
      }, 3000)
    }
    // 清理函数
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [validationError])

  // 从全局存储加载历史记录
  useEffect(() => {
    if (user.className) {
      const allRecords = getAttendanceRecords()
      const classRecords = allRecords
        .filter(r => r.className === user.className && r.source === 'classMonitor')
        .map(r => ({
          id: r.id,
          date: r.date,
          timeSlot: r.timeSlot,
          classroom: r.classroom,
          present: r.present,
          leave: r.leave,
          late: r.late,
          absent: r.absent,
          submittedAt: r.submittedAt,
        }))
      setAttendanceRecords(classRecords)
    }
  }, [user.className])

  useEffect(() => {
    const leaveCount = parseInt(leave) || 0
    const newLeaveStudents: LeaveStudent[] = []
    for (let i = 0; i < leaveCount; i++) {
      newLeaveStudents.push({ name: leaveStudents[i]?.name || '' })
    }
    setLeaveStudents(newLeaveStudents)
  }, [leave])

  const validateAttendance = () => {
    const p = parseInt(present) || 0
    const l = parseInt(leave) || 0
    const t = parseInt(total) || 0
    if (p + l !== t) {
      setValidationError(`实到(${p}) + 请假(${l}) ≠ 应到(${t})人数，请检查`)
      return false
    }
    setValidationError('')
    return true
  }

  const validateLeaveStudents = () => {
    const leaveCount = parseInt(leave) || 0
    if (leaveCount === 0) return true
    
    for (let i = 0; i < leaveCount; i++) {
      const student = leaveStudents[i]
      if (!student || !student.name.trim()) {
        setValidationError(`请填写第 ${i + 1} 位请假学生的姓名`)
        return false
      }
      if (!student.photo) {
        setValidationError(`请为第 ${i + 1} 位请假学生上传照片`)
        return false
      }
    }
    setValidationError('')
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAttendance()) return
    if (!validateLeaveStudents()) return
    
    const newRecord: AttendanceRecord = {
      id: editingRecordId || Date.now().toString(),
      date: currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
      timeSlot: getTimeSlot(),
      classroom,
      present,
      leave,
      late,
      absent,
      submittedAt: new Date().toISOString(),
    }
    
    // 保存到全局存储
    const globalRecord: GlobalAttendanceRecord = {
      ...newRecord,
      className: user.className || '未知班级',
      instructor: classInfo?.instructor || '未知',
      source: 'classMonitor'
    }
    saveAttendanceRecord(globalRecord)
    
    if (editingRecordId) {
      setAttendanceRecords(attendanceRecords.map(r => r.id === editingRecordId ? newRecord : r))
    } else {
      setAttendanceRecords([newRecord, ...attendanceRecords])
    }
    
    setSubmitted(true)
    setEditingRecordId(null)
  }

  const handleEdit = () => {
    setSubmitted(false)
  }

  const editRecord = (record: AttendanceRecord) => {
    setClassroom(record.classroom)
    setPresent(record.present)
    setLeave(record.leave)
    setLate(record.late)
    setAbsent(record.absent)
    setEditingRecordId(record.id)
    setSubmitted(false)
    setActiveTab('attendance')
  }

  const resetForm = () => {
    setClassroom('')
    setPresent('')
    setLeave('')
    setLate('')
    setAbsent('')
    setLeaveStudents([])
    setValidationError('')
    setSubmitted(false)
    setEditingRecordId(null)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getTimeSlot = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '上午'
    return '下午'
  }

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <h2>计科院学风建设督查系统 - 班级学委</h2>
          <button className="logout-btn" onClick={onLogout}>退出登录</button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          本班考勤录入
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史考勤记录
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'attendance' ? (
          <div className="card">
            <div className="card-header">
              <div className="header-info">
                <span className="info-item">所属班级：{user.className || '未知班级'}</span>
                <span className="info-item">系统时间：{formatTime(currentTime)}</span>
                <span className="info-item">当前时段：{getTimeSlot()}</span>
                {classInfo && <span className="info-item">辅导员：{classInfo.instructor}</span>}
              </div>
            </div>

            <form className="attendance-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>教室编号</label>
                  <input
                    type="text"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="请输入教室编号"
                    disabled={submitted && !editingRecordId}
                  />
                </div>
                <div className="form-group">
                  <label>应到人数</label>
                  <input
                    type="number"
                    value={total}
                    readOnly
                    disabled
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>实到人数</label>
                  <input
                    type="number"
                    value={present}
                    onChange={(e) => setPresent(e.target.value)}
                    onBlur={validateAttendance}
                    placeholder="实到人数"
                    disabled={submitted && !editingRecordId}
                  />
                </div>
                <div className="form-group">
                  <label>请假人数</label>
                  <input
                    type="number"
                    value={leave}
                    onChange={(e) => setLeave(e.target.value)}
                    onBlur={validateAttendance}
                    placeholder="请假人数"
                    disabled={submitted && !editingRecordId}
                  />
                </div>
                <div className="form-group">
                  <label>迟到人数</label>
                  <input
                    type="number"
                    value={late}
                    onChange={(e) => setLate(e.target.value)}
                    placeholder="迟到人数"
                    disabled={submitted && !editingRecordId}
                  />
                </div>
                <div className="form-group">
                  <label>旷课人数</label>
                  <input
                    type="number"
                    value={absent}
                    onChange={(e) => setAbsent(e.target.value)}
                    placeholder="旷课人数"
                    disabled={submitted && !editingRecordId}
                  />
                </div>
              </div>

              {validationError && (
                <div className="validation-error">
                  <span>{validationError}</span>
                  <button 
                    className="validation-error-close"
                    onClick={() => setValidationError('')}
                    aria-label="关闭"
                  >
                    ×
                  </button>
                </div>
              )}

              {leaveStudents.length > 0 && (
                <div className="form-row">
                  <div className="leave-students-section">
                    <label>请假人员信息</label>
                    <input
                      type="text"
                      placeholder="请输入请假学生姓名"
                      value={leaveStudents[0]?.name || ''}
                      onChange={(e) => {
                        const newStudents = [...leaveStudents]
                        newStudents[0].name = e.target.value
                        setLeaveStudents(newStudents)
                      }}
                      disabled={submitted && !editingRecordId}
                    />
                  </div>
                  <div className="leave-students-section">
                    <label>请假证明</label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={submitted && !editingRecordId}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          const newStudents = [...leaveStudents]
                          newStudents[0].photo = file
                          const reader = new FileReader()
                          reader.onload = (event) => {
                            newStudents[0].photoPreview = event.target?.result as string
                            setLeaveStudents(newStudents)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    {leaveStudents[0]?.photoPreview && (
                      <img src={leaveStudents[0].photoPreview} alt="请假证明照片" className="photo-preview" />
                    )}
                  </div>
                </div>
              )}

              <div className="form-actions">
                {!submitted ? (
                  <>
                    {editingRecordId && (
                      <button type="button" className="secondary-btn" onClick={resetForm}>
                        取消编辑
                      </button>
                    )}
                    <button type="submit" className="submit-btn">
                      {editingRecordId ? '保存修改' : '提交考勤'}
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="secondary-btn" onClick={resetForm}>
                      新增考勤
                    </button>
                    <button type="button" className="edit-btn" onClick={handleEdit}>
                      编辑当前
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        ) : (
          <div className="card">
            {attendanceRecords.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                暂无历史考勤记录
              </div>
            ) : (
              <div className="history-list">
                {attendanceRecords.map((record) => (
                  <div key={record.id} className="history-item">
                    <div className="history-info">
                      <span>{record.date} {record.timeSlot}</span>
                      <span>教室：{record.classroom}</span>
                      <span>实到：{record.present}</span>
                      <span>请假：{record.leave}</span>
                      <span>迟到：{record.late}</span>
                      <span>旷课：{record.absent}</span>
                    </div>
                    <div className="history-actions">
                      <span className="history-status">已提交</span>
                      <button className="table-btn" onClick={() => editRecord(record)}>编辑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default ClassMonitor
