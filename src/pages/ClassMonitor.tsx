import { useState, useEffect, useRef } from 'react'
import '../styles/ClassMonitor.css'
import { User, getClassInfo, ClassInfo, AttendanceRecord as GlobalAttendanceRecord, LeaveStudentInfo, StudentNameInfo, SubmissionStage } from '../data'
import { mockApi } from '../services/mockApi'

interface ClassMonitorProps {
  user: User
  onLogout: () => void
}

interface LeaveStudent {
  name: string
  photo?: File
  photoPreview?: string
  specialNote?: string
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
  stage: SubmissionStage
  leaveStudents?: LeaveStudentInfo[]
  lateStudents?: StudentNameInfo[]
  absentStudents?: StudentNameInfo[]
}



function ClassMonitor({ user, onLogout }: ClassMonitorProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [classroom, setClassroom] = useState('')
  const [present, setPresent] = useState('')
  const [leave, setLeave] = useState('')
  const [late, setLate] = useState('')
  const [absent, setAbsent] = useState('')
  const [leaveStudents, setLeaveStudents] = useState<LeaveStudent[]>([])
  const [lateStudents, setLateStudents] = useState<StudentNameInfo[]>([])
  const [absentStudents, setAbsentStudents] = useState<StudentNameInfo[]>([])
  const [validationError, setValidationError] = useState('')
  const [activeTab, setActiveTab] = useState('attendance')
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [showSpecialNoteModal, setShowSpecialNoteModal] = useState(false)
  const [specialNotes, setSpecialNotes] = useState<{ [key: string]: string }>({})
  const [studentsWithoutPhoto, setStudentsWithoutPhoto] = useState<string[]>([])
  const [batchNamesInput, setBatchNamesInput] = useState('')
  const [batchLateNamesInput, setBatchLateNamesInput] = useState('')
  const [batchAbsentNamesInput, setBatchAbsentNamesInput] = useState('')

  const [todayRecordId, setTodayRecordId] = useState<string | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const successModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const classInfo: ClassInfo | undefined = user.className ? getClassInfo(user.className) : undefined
  const total = classInfo ? classInfo.count.toString() : '30'

  // 获取当前时段和时间状态
  const getTimeStatus = () => {
    const hour = currentTime.getHours()
    const minute = currentTime.getMinutes()
    
    // 判断是否在课前10分钟（上午8:10上课，下午14:30上课）
    const isBeforeClass10 = 
      (hour === 7 && minute >= 50) || 
      (hour === 14 && minute >= 10 && minute < 20)
    
    // 判断是否在课前阶段（上课前10分钟到上课时间）
    const isBeforeClass = 
      (hour === 8 && minute >= 0 && minute < 10) || 
      (hour === 14 && minute >= 20 && minute < 30)
    
    // 判断是否在上课后半小时内
    const isDuringClass = 
      (hour === 8 && minute >= 10 && minute < 40) || 
      (hour === 14 && minute >= 30 && minute <= 59) || (hour === 15 && minute === 0)
    
    const timeSlot = hour < 12 ? '上午' : '下午'
    
    return { isBeforeClass10, isBeforeClass, isDuringClass, timeSlot }
  }

  // 检查今天是否已有初始提交
  useEffect(() => {
    const loadTodayRecord = async () => {
      if (user.className) {
        const todayRecords = await mockApi.attendance.getByClass(user.className)
        const initialRecord = todayRecords.find(r => r.stage === 'initial')
        if (initialRecord) {
          setTodayRecordId(initialRecord.id)
          setClassroom(initialRecord.classroom)
          setPresent(initialRecord.present)
          setLeave(initialRecord.leave)
          setLate(initialRecord.late || '')
          setAbsent(initialRecord.absent || '')
        }
      }
    }
    loadTodayRecord()
  }, [user.className])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 获取根据时间变化的问候语
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  // 格式化时间，包含时分秒
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }

  // 自动关闭验证错误弹窗
  useEffect(() => {
    if (validationError) {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
      autoCloseTimerRef.current = setTimeout(() => {
        setValidationError('')
      }, 3000)
    }
    return () => {
      if (autoCloseTimerRef.current) {
        clearTimeout(autoCloseTimerRef.current)
      }
    }
  }, [validationError])

  // 清理成功弹窗定时器
  useEffect(() => {
    return () => {
      if (successModalTimerRef.current) {
        clearTimeout(successModalTimerRef.current)
      }
    }
  }, [])

  // 从API加载历史记录
  useEffect(() => {
    const loadAttendanceRecords = async () => {
      if (user.className) {
        const allRecords = await mockApi.attendance.getAll()
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
            stage: r.stage,
            leaveStudents: r.leaveStudents,
            lateStudents: r.lateStudents,
            absentStudents: r.absentStudents
          }))
        setAttendanceRecords(classRecords)
      }
    }
    loadAttendanceRecords()
  }, [user.className])

  // 当请假人数变化时，初始化学生数组
  useEffect(() => {
    const leaveCount = parseInt(leave) || 0
    setLeaveStudents(prev => {
      const newLeaveStudents: LeaveStudent[] = []
      for (let i = 0; i < leaveCount; i++) {
        if (prev[i]) {
          newLeaveStudents.push(prev[i])
        } else {
          newLeaveStudents.push({ name: '' })
        }
      }
      return newLeaveStudents
    })
  }, [leave])

  // 当迟到人数变化时，初始化学生数组
  useEffect(() => {
    const lateCount = parseInt(late) || 0
    setLateStudents(prev => {
      const newLateStudents: StudentNameInfo[] = []
      for (let i = 0; i < lateCount; i++) {
        if (prev[i]) {
          newLateStudents.push(prev[i])
        } else {
          newLateStudents.push({ name: '' })
        }
      }
      return newLateStudents
    })
  }, [late])

  // 当旷课人数变化时，初始化学生数组
  useEffect(() => {
    const absentCount = parseInt(absent) || 0
    setAbsentStudents(prev => {
      const newAbsentStudents: StudentNameInfo[] = []
      for (let i = 0; i < absentCount; i++) {
        if (prev[i]) {
          newAbsentStudents.push(prev[i])
        } else {
          newAbsentStudents.push({ name: '' })
        }
      }
      return newAbsentStudents
    })
  }, [absent])

  // 批量解析姓名（非汉字作为分隔符）
  const parseNames = (input: string): string[] => {
    // 匹配所有汉字序列
    const nameRegex = /[\u4e00-\u9fa5]+/g
    const matches = input.match(nameRegex)
    return matches || []
  }

  // 处理批量姓名输入
  const handleBatchNamesInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value
    setBatchNamesInput(input)
    
    const names = parseNames(input)
    const leaveCount = parseInt(leave) || 0
    
    if (names.length > 0) {
      const newStudents = [...leaveStudents]
      for (let i = 0; i < Math.min(names.length, leaveCount); i++) {
        newStudents[i] = { ...newStudents[i], name: names[i] }
      }
      setLeaveStudents(newStudents)
    }
  }

  // 处理批量迟到姓名输入
  const handleBatchLateNamesInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value
    setBatchLateNamesInput(input)
    
    const names = parseNames(input)
    const lateCount = parseInt(late) || 0
    
    if (names.length > 0) {
      const newStudents = [...lateStudents]
      for (let i = 0; i < Math.min(names.length, lateCount); i++) {
        newStudents[i] = { ...newStudents[i], name: names[i] }
      }
      setLateStudents(newStudents)
    }
  }

  // 处理批量旷课姓名输入
  const handleBatchAbsentNamesInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value
    setBatchAbsentNamesInput(input)
    
    const names = parseNames(input)
    const absentCount = parseInt(absent) || 0
    
    if (names.length > 0) {
      const newStudents = [...absentStudents]
      for (let i = 0; i < Math.min(names.length, absentCount); i++) {
        newStudents[i] = { ...newStudents[i], name: names[i] }
      }
      setAbsentStudents(newStudents)
    }
  }

  // 处理批量图片上传
  const handleBatchPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    
    const newStudents = [...leaveStudents]
    let photoIndex = 0
    
    // 为没有照片的学生分配照片
    for (let i = 0; i < newStudents.length && photoIndex < files.length; i++) {
      if (!newStudents[i].photo) {
        const file = files[photoIndex]
        const reader = new FileReader()
        reader.onload = (event) => {
          newStudents[i] = {
            ...newStudents[i],
            photo: file,
            photoPreview: event.target?.result as string
          }
          setLeaveStudents([...newStudents])
        }
        reader.readAsDataURL(file)
        photoIndex++
      }
    }
  }

  // 验证考勤人数
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

  // 检查是否需要显示特殊情况说明弹窗
  const checkSpecialNoteNeeded = () => {
    const leaveCount = parseInt(leave) || 0
    if (leaveCount === 0) return false
    
    // 检查姓名数量
    const validNames = leaveStudents.filter(s => s.name.trim()).length
    if (validNames !== leaveCount) {
      setValidationError(`请假人数为${leaveCount}，请确保输入${leaveCount}个姓名`)
      return false
    }
    
    // 检查照片数量
    const studentsWithPhoto = leaveStudents.filter(s => s.photo).length
    if (studentsWithPhoto < leaveCount) {
      const missingPhotos = leaveStudents
        .filter(s => !s.photo)
        .map(s => s.name)
      setStudentsWithoutPhoto(missingPhotos)
      setSpecialNotes({})
      return true
    }
    
    return false
  }

  // 处理提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    getTimeStatus()
    
    if (!classroom.trim()) {
      setValidationError('请填写教室编号')
      return
    }
    if (!present.trim()) {
      setValidationError('请填写实到人数')
      return
    }
    if (!validateAttendance()) return
    
    // 验证请假姓名
    const leaveCount = parseInt(leave) || 0
    if (leaveCount > 0) {
      const validLeaveNames = leaveStudents.filter(s => s.name.trim()).length
      if (validLeaveNames !== leaveCount) {
        setValidationError(`请假人数为${leaveCount}，请确保输入${leaveCount}个姓名`)
        return
      }
    }
    
    // 验证迟到姓名
    const lateCount = parseInt(late) || 0
    if (lateCount > 0) {
      const validLateNames = lateStudents.filter(s => s.name.trim()).length
      if (validLateNames !== lateCount) {
        setValidationError(`迟到人数为${lateCount}，请确保输入${lateCount}个姓名`)
        return
      }
    }
    
    // 验证旷课姓名
    const absentCount = parseInt(absent) || 0
    if (absentCount > 0) {
      const validAbsentNames = absentStudents.filter(s => s.name.trim()).length
      if (validAbsentNames !== absentCount) {
        setValidationError(`旷课人数为${absentCount}，请确保输入${absentCount}个姓名`)
        return
      }
    }
    
    const needSpecialNote = checkSpecialNoteNeeded()
    if (needSpecialNote) {
      setShowSpecialNoteModal(true)
      return
    }
    
    submitAttendance(todayRecordId ? 'update' : 'initial')
  }

  // 提交考勤（带或不带特殊情况说明）
  const submitAttendance = async (stage: SubmissionStage) => {
    const leaveCount = parseInt(leave) || 0
    const lateCount = parseInt(late) || 0
    const absentCount = parseInt(absent) || 0
    const { timeSlot } = getTimeStatus()
    
    const leaveStudentInfos: LeaveStudentInfo[] = leaveStudents.map(student => ({
      name: student.name,
      hasPhoto: !!student.photo,
      specialNote: specialNotes[student.name]
    }))
    
    const lateStudentInfos: StudentNameInfo[] = lateStudents.map(student => ({
      name: student.name
    }))
    
    const absentStudentInfos: StudentNameInfo[] = absentStudents.map(student => ({
      name: student.name
    }))
    
    const newRecord: Omit<GlobalAttendanceRecord, 'id'> = {
      date: currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-'),
      timeSlot,
      classroom,
      present,
      leave,
      late,
      absent,
      submittedAt: new Date().toISOString(),
      stage: stage,
      leaveStudents: leaveCount > 0 ? leaveStudentInfos : undefined,
      lateStudents: lateCount > 0 ? lateStudentInfos : undefined,
      absentStudents: absentCount > 0 ? absentStudentInfos : undefined,
      className: user.className || '未知班级',
      instructor: classInfo?.instructor || '未知',
      source: 'classMonitor'
    }
    
    try {
      const savedRecord = await mockApi.attendance.create(newRecord)
      
      const hasException = (lateCount > 0 || absentCount > 0)
      if (hasException) {
        const parts: string[] = []
        if (lateCount > 0) {
          parts.push(`迟到${lateCount}人（${lateStudents.map(s => s.name).join('、')}）`)
        }
        if (absentCount > 0) {
          parts.push(`旷课${absentCount}人（${absentStudents.map(s => s.name).join('、')}）`)
        }
        const notificationType: 'attendance_update' | 'late_update' | 'absent_update' = 
          lateCount > 0 && absentCount > 0 ? 'attendance_update' : (lateCount > 0 ? 'late_update' : 'absent_update')
        const message = `${user.className} 提交考勤：${parts.join('，')}`
        
        await mockApi.notifications.create({
          type: notificationType,
          className: user.className || '未知班级',
          message
        })
      }
      
      setTodayRecordId(savedRecord.id)
      setAttendanceRecords([{
        id: savedRecord.id,
        date: savedRecord.date,
        timeSlot: savedRecord.timeSlot,
        classroom: savedRecord.classroom,
        present: savedRecord.present,
        leave: savedRecord.leave,
        late: savedRecord.late,
        absent: savedRecord.absent,
        submittedAt: savedRecord.submittedAt,
        stage: savedRecord.stage,
        leaveStudents: savedRecord.leaveStudents,
        lateStudents: savedRecord.lateStudents,
        absentStudents: savedRecord.absentStudents
      }, ...attendanceRecords])
      
      setShowSpecialNoteModal(false)
      setShowSuccessModal(true)
      
      if (successModalTimerRef.current) {
        clearTimeout(successModalTimerRef.current)
      }
      successModalTimerRef.current = setTimeout(() => {
        setShowSuccessModal(false)
      }, 3000)
    } catch (err) {
      setValidationError('提交失败，请重试')
    }
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
          {user.className && <h2>{getGreeting()}，{user.className}</h2>}
          <button className="logout-btn" onClick={onLogout}>退出</button>
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

            {/* 时间状态提示 */}
            <div className="time-status">
              {(() => {
                const { isBeforeClass10, isBeforeClass, isDuringClass, timeSlot } = getTimeStatus();
                if (isBeforeClass10) {
                  return (
                    <div className="status-info">
                      <span className="status-icon">📋</span>
                      <span className="status-text">
                        课前10分钟截止（{timeSlot === '上午' ? '8:00' : '14:20'}）：请提交考勤
                      </span>
                    </div>
                  );
                } else if (isBeforeClass) {
                  return (
                    <div className="status-info">
                      <span className="status-icon">⏰</span>
                      <span className="status-text">
                        课前阶段（{timeSlot === '上午' ? '8:00-8:10' : '14:20-14:30'}）：请提交迟到信息
                      </span>
                    </div>
                  );
                } else if (isDuringClass) {
                  return (
                    <div className="status-info">
                      <span className="status-icon">📝</span>
                      <span className="status-text">
                        上课阶段（{timeSlot === '上午' ? '8:10-8:40' : '14:30-15:00'}）：请提交旷课信息
                      </span>
                    </div>
                  );
                } else {
                  return (
                    <div className="status-info">
                      <span className="status-icon">📋</span>
                      <span className="status-text">
                        课前10分钟截止（{timeSlot === '上午' ? '8:00' : '14:20'}）：请提交考勤
                      </span>
                    </div>
                  );
                }
              })()}
            </div>

            <form className="attendance-form" onSubmit={handleSubmit}>
              {/* 始终显示所有字段 */}
              <div className="form-row">
                <div className="form-group">
                  <label>教室编号</label>
                  <input
                    type="text"
                    value={classroom}
                    onChange={(e) => setClassroom(e.target.value)}
                    placeholder="请输入教室编号"
                  />
                </div>
                <div className="form-group">
                  <label>应到人数</label>
                  <input
                    type="number"
                    value={total}
                    readOnly
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
                    placeholder="实到人数"
                  />
                </div>
                <div className="form-group">
                  <label>请假人数</label>
                  <input
                    type="number"
                    value={leave}
                    onChange={(e) => setLeave(e.target.value)}
                    placeholder="请假人数"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>迟到人数</label>
                  <input
                    type="number"
                    value={late}
                    onChange={(e) => setLate(e.target.value)}
                    placeholder="迟到人数"
                  />
                </div>
                <div className="form-group">
                  <label>旷课人数</label>
                  <input
                    type="number"
                    value={absent}
                    onChange={(e) => setAbsent(e.target.value)}
                    placeholder="旷课人数"
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

              {/* 始终显示所有学生输入 */}
              {leaveStudents.length > 0 && (
                <div className="leave-students-container">
                  <div className="leave-students-section">
                    <label>输入请假学生姓名</label>
                    <textarea
                      value={batchNamesInput}
                      onChange={handleBatchNamesInput}
                      placeholder="例如：张三 李四,王五/赵六"
                      rows={3}
                    />
                    <div className="names-preview">
                      {leaveStudents.map((student, index) => (
                        <span key={index} className="name-tag">
                          {student.name || '未填写'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="leave-students-section">
                    <label>上传请假证明</label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBatchPhotoUpload}
                    />
                    <div className="photos-preview">
                      {leaveStudents.map((student, index) => (
                        <div key={index} className="photo-item">
                          <span className="photo-label">第{index + 1}位</span>
                          {student.photoPreview ? (
                            <img src={student.photoPreview} alt="请假证明" className="photo-preview" />
                          ) : (
                            <span className="photo-status">未上传</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {lateStudents.length > 0 && (
                <div className="leave-students-container">
                  <div className="leave-students-section">
                    <label>输入迟到学生姓名</label>
                    <textarea
                      value={batchLateNamesInput}
                      onChange={handleBatchLateNamesInput}
                      placeholder="例如：张三 李四,王五/赵六"
                      rows={3}
                    />
                    <div className="names-preview">
                      {lateStudents.map((student, index) => (
                        <span key={index} className="name-tag">
                          {student.name || '未填写'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {absentStudents.length > 0 && (
                <div className="leave-students-container">
                  <div className="leave-students-section">
                    <label>输入旷课学生姓名</label>
                    <textarea
                      value={batchAbsentNamesInput}
                      onChange={handleBatchAbsentNamesInput}
                      placeholder="例如：张三 李四,王五/赵六"
                      rows={3}
                    />
                    <div className="names-preview">
                      {absentStudents.map((student, index) => (
                        <span key={index} className="name-tag">
                          {student.name || '未填写'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  提交
                </button>
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
                      <span>{formatDateTime(record.submittedAt)}</span>
                      <span>教室：{record.classroom}</span>
                      <span>实到：{record.present}</span>
                      <span>请假：{record.leave && record.leave !== '0' ? record.leave : '-'}</span>
                      <span>迟到：{record.late && record.late !== '0' ? record.late : '-'}</span>
                      <span>旷课：{record.absent && record.absent !== '0' ? record.absent : '-'}</span>
                    </div>
                    {record.leaveStudents && record.leaveStudents.length > 0 && (
                      <div className="history-students">
                        <span className="history-students-label">请假：</span>
                        {record.leaveStudents.map((s, i) => (
                          <span key={i} className="history-student-tag">{s.name}</span>
                        ))}
                      </div>
                    )}
                    {record.lateStudents && record.lateStudents.length > 0 && (
                      <div className="history-students">
                        <span className="history-students-label">迟到：</span>
                        {record.lateStudents.map((s, i) => (
                          <span key={i} className="history-student-tag">{s.name}</span>
                        ))}
                      </div>
                    )}
                    {record.absentStudents && record.absentStudents.length > 0 && (
                      <div className="history-students">
                        <span className="history-students-label">旷课：</span>
                        {record.absentStudents.map((s, i) => (
                          <span key={i} className="history-student-tag">{s.name}</span>
                        ))}
                      </div>
                    )}
                    <div className="history-actions">
                      <span className="history-status">已提交</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 特殊情况说明弹窗 */}
      {showSpecialNoteModal && (
        <div className="modal-overlay" onClick={() => setShowSpecialNoteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>特殊情况说明</h3>
            </div>
            <div className="modal-body">
              <p>以下学生缺少请假证明，请说明特殊情况：</p>
              {studentsWithoutPhoto.map((name, index) => (
                <div key={index} className="special-note-item">
                  <label>{name}</label>
                  <textarea
                    value={specialNotes[name] || ''}
                    onChange={(e) => setSpecialNotes({ ...specialNotes, [name]: e.target.value })}
                    placeholder="请说明特殊情况"
                    rows={2}
                  />
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowSpecialNoteModal(false)}>
                取消
              </button>
              <button className="confirm-btn" onClick={() => submitAttendance('update')}>
                确认提交
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提交成功弹窗 */}
      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => {
          setShowSuccessModal(false)
          if (successModalTimerRef.current) {
            clearTimeout(successModalTimerRef.current)
          }
        }}>
          <div className="modal success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>提交成功！</h3>
            </div>
            <div className="modal-footer">
              <button className="confirm-btn" onClick={() => {
                setShowSuccessModal(false)
                if (successModalTimerRef.current) {
                  clearTimeout(successModalTimerRef.current)
                }
              }}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassMonitor
