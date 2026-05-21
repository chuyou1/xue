import { useState, useEffect, useRef } from 'react'
import '../styles/Secretary.css'
import { 
  User, 
  classroomsByFloor, 
  AttendanceRecord as GlobalAttendanceRecord, 
  classes, 
  SupervisionRecord, 
  getUniqueAttendanceRecords, 
  getUniqueSupervisionRecords, 
  Notification, 
  AnomalyRecord,
  AnomalyStudent,
  addClassroom
} from '../data'
import { api } from '../services/api'
import { useModal } from '../contexts/ModalContext'
import { exportSupervisionRecordsToExcel } from '../utils/exportExcel'

interface SecretaryProps {
  user: User
  onLogout: () => void
}

interface Classroom {
  id: string
  floor: string
  number: string
  status: 'pending' | 'submitted'
}

function Secretary({ user, onLogout }: SecretaryProps) {
  const { showModal } = useModal()
  const [activeTab, setActiveTab] = useState('classrooms')
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null)
  const [inspector, setInspector] = useState(user.name || '')
  const [leaveVerified, setLeaveVerified] = useState(false)
  const [violations, setViolations] = useState<{ name: string; type: string; photo?: File; hasPhoto: boolean }[]>([])
  const [currentDate, setCurrentDate] = useState('')
  const [currentTimeSlot, setCurrentTimeSlot] = useState('')
  const [currentDisplayTimeSlot, setCurrentDisplayTimeSlot] = useState('')
  const [classAttendanceRecords, setClassAttendanceRecords] = useState<GlobalAttendanceRecord[]>([])
  const [supervisionRecords, setSupervisionRecords] = useState<SupervisionRecord[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notifications, setNotifications] = useState<Notification[]>([])
  
  // 新增教室相关状态
  const [showAddClassroomModal, setShowAddClassroomModal] = useState(false)
  const [newClassroomNumber, setNewClassroomNumber] = useState('')
  const [currentFloor, setCurrentFloor] = useState<string | null>(null)
  
  // 强制重新渲染教室列表
  const [classroomsKey, setClassroomsKey] = useState(0)
  
  // 编辑模式相关状态
  const [isEditing, setIsEditing] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState({
    present: '',
    leave: '',
    late: '',
    absent: '',
    notInClassroom: ''
  })
  const [originalData, setOriginalData] = useState({
    present: '',
    leave: '',
    late: '',
    absent: ''
  })
  const [leaveStudents, setLeaveStudents] = useState<AnomalyStudent[]>([])
  const [lateStudents, setLateStudents] = useState<AnomalyStudent[]>([])
  const [absentStudents, setAbsentStudents] = useState<AnomalyStudent[]>([])
  const [notInClassroomStudents, setNotInClassroomStudents] = useState<AnomalyStudent[]>([])
  const [notInClassroomReason, setNotInClassroomReason] = useState('')

  // 获取根据时间变化的问候语
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  // 违纪类型中文映射
  const violationTypeMap: { [key: string]: string } = {
    'sleep': '睡觉',
    'food': '带餐',
    'dye': '染发',
    'no-book': '未带书',
    'phone': '玩手机',
    'hygiene': '卫生差'
  }

  const getDisplayTimeSlot = () => {
    const now = new Date()
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const dayName = dayNames[now.getDay()]
    const hour = now.getHours()
    let period = ''
    
    if (hour < 12) {
      period = '第1、2节'
    } else {
      period = '第5、6节'
    }
    
    return `${dayName} ${period}`
  }

  // 初始化当前日期和时段
  useEffect(() => {
    const loadData = async () => {
      const now = new Date()
      const date = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
      const timeSlot = now.getHours() < 12 ? '上午' : '下午'
      setCurrentDate(date)
      setCurrentTimeSlot(timeSlot)
      setCurrentDisplayTimeSlot(getDisplayTimeSlot())
      
      const [supervision, notifications] = await Promise.all([
        api.supervision.getAll(),
        api.notifications.getAll()
      ])
      setSupervisionRecords(supervision)
      setNotifications(notifications)
    }
    loadData()
  }, [])

  // 每秒更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 提交成功后刷新记录
  useEffect(() => {
    const loadSupervisionRecords = async () => {
      if (activeTab === 'report') {
        const records = await api.supervision.getAll()
        setSupervisionRecords(records)
      }
    }
    loadSupervisionRecords()
  }, [activeTab])

  // 当选择教室时，加载该教室的考勤记录
  useEffect(() => {
    const loadAttendanceRecords = async () => {
      if (selectedClassroom && currentDate && currentTimeSlot) {
        const records = await api.attendance.getByClassroom(selectedClassroom.number, currentDate, currentTimeSlot)
        setClassAttendanceRecords(records)
      }
    }
    loadAttendanceRecords()
  }, [selectedClassroom, currentDate, currentTimeSlot])

  const toggleFloor = (floorName: string) => {
    setExpandedFloor(expandedFloor === floorName ? null : floorName)
  }
  
  // 处理新增教室按钮点击
  const handleAddClassroomClick = (floorName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentFloor(floorName)
    setNewClassroomNumber('')
    setShowAddClassroomModal(true)
  }
  
  // 确认添加教室
  const handleConfirmAddClassroom = () => {
    if (!currentFloor || !newClassroomNumber.trim()) {
      showModal({
        title: '提示',
        message: '请输入教室编号',
        type: 'warning'
      })
      return
    }
    
    const roomNumber = newClassroomNumber.trim()
    
    // 检查教室是否已存在
    if (classroomsByFloor[currentFloor]?.includes(roomNumber)) {
      showModal({
        title: '提示',
        message: '该教室已存在',
        type: 'warning'
      })
      return
    }
    
    // 添加教室
    addClassroom(currentFloor, roomNumber)
    setClassroomsKey(prev => prev + 1) // 强制重新渲染
    setShowAddClassroomModal(false)
    setNewClassroomNumber('')
    setCurrentFloor(null)
    
    showModal({
      title: '成功',
      message: `教室 ${roomNumber} 已添加`,
      type: 'success'
    })
  }

  const selectClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom)
    setActiveTab('detail')
    setViolations([])
    setLeaveVerified(false)
    setIsEditing(false)
    setEditingRecordId(null)
  }

  const addViolation = () => {
    setViolations([...violations, { name: '', type: 'sleep', hasPhoto: false }])
  }

  const updateViolation = (index: number, field: string, value: any) => {
    const newViolations = [...violations]
    newViolations[index] = { ...newViolations[index], [field]: value }
    setViolations(newViolations)
  }

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const newViolations = [...violations]
    newViolations[index] = { 
      ...newViolations[index], 
      photo: file,
      hasPhoto: !!file
    }
    setViolations(newViolations)
  }

  const removeViolation = (index: number) => {
    setViolations(violations.filter((_, i) => i !== index))
  }

  // 格式化通知时间
  const formatNotificationTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attendance_update':
        return '📋'
      case 'late_update':
        return '⏰'
      case 'absent_update':
        return '📝'
      default:
        return '🔔'
    }
  }

  // 关闭通知
  const handleCloseNotification = async (id: string) => {
    await api.notifications.markAsRead(id)
    const updated = await api.notifications.getAll()
    setNotifications(updated)
  }

  // 开始编辑模式
  const startEditing = (record: GlobalAttendanceRecord) => {
    // 如果有有效值就保留，否则设为空字符串
    const leave = record.leave && record.leave !== '0' ? record.leave : ''
    const late = record.late && record.late !== '0' ? record.late : ''
    const absent = record.absent && record.absent !== '0' ? record.absent : ''
    const present = record.present && record.present !== '0' ? record.present : ''
    
    setOriginalData({
      present,
      leave,
      late,
      absent
    })
    
    setEditedData({
      present,
      leave,
      late,
      absent,
      notInClassroom: ''
    })
    
    setLeaveStudents([])
    setLateStudents([])
    setAbsentStudents([])
    setNotInClassroomStudents([])
    setNotInClassroomReason('')
    
    setEditingRecordId(record.id)
    setIsEditing(true)
  }

  // 取消编辑
  const cancelEditing = () => {
    setIsEditing(false)
    setEditingRecordId(null)
  }

  // 添加异常学生
  const addAnomalyStudent = (setter: React.Dispatch<React.SetStateAction<AnomalyStudent[]>>) => {
    setter(prev => [...prev, { name: '', hasPhoto: false }])
  }

  // 更新异常学生
  const updateAnomalyStudent = (
    setter: React.Dispatch<React.SetStateAction<AnomalyStudent[]>>,
    index: number,
    field: string,
    value: any
  ) => {
    setter(prev => {
      const newStudents = [...prev]
      newStudents[index] = { ...newStudents[index], [field]: value }
      return newStudents
    })
  }

  // 删除异常学生
  const removeAnomalyStudent = (
    setter: React.Dispatch<React.SetStateAction<AnomalyStudent[]>>,
    index: number
  ) => {
    setter(prev => prev.filter((_, i) => i !== index))
  }

  // 处理异常学生照片上传
  const handleAnomalyPhotoChange = (
    setter: React.Dispatch<React.SetStateAction<AnomalyStudent[]>>,
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0]
    setter(prev => {
      const newStudents = [...prev]
      newStudents[index] = { 
        ...newStudents[index], 
        photo: file,
        hasPhoto: !!file
      }
      return newStudents
    })
  }

  // 防止滚轮触发输入
  const preventWheel = (e: React.WheelEvent) => {
    e.preventDefault()
  }

  // 检查是否为异常编辑
  const checkIsAnomaly = () => {
    const presentChanged = editedData.present !== originalData.present
    const leaveChanged = editedData.leave !== originalData.leave
    const lateChanged = editedData.late !== originalData.late
    const absentChanged = editedData.absent !== originalData.absent
    const notInClassroomHasCount = editedData.notInClassroom !== '' && parseInt(editedData.notInClassroom) >= 1
    
    return presentChanged || leaveChanged || lateChanged || absentChanged || notInClassroomHasCount
  }

  // 确定异常类型
  const getAnomalyType = () => {
    if (editedData.notInClassroom >= 1) return 'not_in_classroom'
    if (editedData.leave !== originalData.leave) return 'leave_change'
    if (editedData.late !== originalData.late) return 'late_change'
    if (editedData.absent !== originalData.absent) return 'absent_change'
    if (editedData.present !== originalData.present) return 'present_change'
    return 'not_in_classroom'
  }

  // 生成原因描述
  const generateReason = () => {
    const reasons: string[] = []
    if (editedData.leave !== originalData.leave) {
      reasons.push(`请假人数从 ${originalData.leave} 变更为 ${editedData.leave}`)
    }
    if (editedData.late !== originalData.late) {
      reasons.push(`迟到人数从 ${originalData.late} 变更为 ${editedData.late}`)
    }
    if (editedData.absent !== originalData.absent) {
      reasons.push(`旷课人数从 ${originalData.absent} 变更为 ${editedData.absent}`)
    }
    if (editedData.present !== originalData.present) {
      reasons.push(`实到人数从 ${originalData.present} 变更为 ${editedData.present}`)
    }
    if (editedData.notInClassroom >= 1) {
      reasons.push(`未在教室 ${editedData.notInClassroom} 人，原因：${notInClassroomReason || '未说明'}`)
    }
    return reasons.join('；')
  }

  // 保存编辑和异常记录
  const saveEditing = async (originalRecord: GlobalAttendanceRecord) => {
    const validateStudents = (students: AnomalyStudent[], type: string, needPhoto: boolean = true) => {
      for (let i = 0; i < students.length; i++) {
        if (!students[i].name || students[i].name.trim() === '') {
          showModal({
            title: '提示',
            message: `${type}学生${i + 1}的姓名未填写！`,
            type: 'warning'
          })
          return false
        }
        if (needPhoto && !students[i].hasPhoto) {
          showModal({
            title: '提示',
            message: `请上传${type}学生${students[i].name}的照片！`,
            type: 'warning'
          })
          return false
        }
      }
      return true
    }

    if (editedData.leave !== '' && parseInt(editedData.leave) >= 1 && !validateStudents(leaveStudents, '请假', true)) return
    if (editedData.late !== '' && parseInt(editedData.late) >= 1 && !validateStudents(lateStudents, '迟到', false)) return
    if (editedData.absent !== '' && parseInt(editedData.absent) >= 1 && !validateStudents(absentStudents, '旷课', false)) return

    const hasAnomaly = checkIsAnomaly()

    try {
      // 1. 创建新的考勤记录
      const newAttendanceRecord: Omit<GlobalAttendanceRecord, 'id'> = {
        date: currentDate,
        timeSlot: currentTimeSlot,
        classroom: selectedClassroom?.number || '',
        className: originalRecord.className,
        instructor: originalRecord.instructor,
        present: editedData.present,
        leave: editedData.leave,
        late: editedData.late,
        absent: editedData.absent,
        submittedAt: new Date().toISOString(),
        source: 'secretary',
        stage: 'update',
        leaveStudents: leaveStudents.map(s => ({ name: s.name, hasPhoto: s.hasPhoto, specialNote: s.specialNote })),
        lateStudents: lateStudents.map(s => ({ name: s.name })),
        absentStudents: absentStudents.map(s => ({ name: s.name })),
      }
      
      // 2. 保存新的考勤记录
      await api.attendance.create(newAttendanceRecord)
      
      // 3. 如果有异常数据，也保存异常记录
      if (hasAnomaly) {
        const anomalyRecord: Omit<AnomalyRecord, 'id'> = {
          date: currentDate,
          timeSlot: currentTimeSlot,
          classroom: selectedClassroom?.number || '',
          className: originalRecord.className,
          instructor: originalRecord.instructor,
          inspector: inspector,
          type: getAnomalyType(),
          originalData,
          editedData,
          leaveStudents,
          lateStudents,
          absentStudents,
          notInClassroomStudents,
          notInClassroomReason,
          reason: generateReason(),
          createdAt: new Date().toISOString(),
          hasAnomaly: true
        }
        
        await api.anomalies.create(anomalyRecord)
      }
      
      // 4. 重新加载考勤记录，更新页面显示
      if (selectedClassroom) {
        const records = await api.attendance.getByClassroom(selectedClassroom.number, currentDate, currentTimeSlot)
        setClassAttendanceRecords(records)
      }
      
      showModal({
        title: '成功',
        message: '考勤编辑已保存！',
        type: 'success'
      })
    } catch (err) {
      showModal({
        title: '错误',
        message: '保存失败，请重试',
        type: 'warning'
      })
    }
    
    cancelEditing()
  }

  const calculateScore = () => {
    let score = 100
    
    // 违纪记录扣分（每个违纪扣0.5分）
    violations.forEach(v => {
      score -= 0.5
    })
    
    // 考勤记录扣分（迟到每人扣0.5分，旷课每人扣1分）
    const uniqueRecords = getUniqueAttendanceRecords(classAttendanceRecords)
    uniqueRecords.forEach(record => {
      const late = record.late && record.late !== '' ? parseInt(record.late) : 0
      const absent = record.absent && record.absent !== '' ? parseInt(record.absent) : 0
      score -= late * 0.5
      score -= absent * 1
    })
    
    // 确保分数不低于0
    return Math.max(0, score)
  }

  const handleSubmit = () => {
    if (!selectedClassroom) {
      showModal({
        title: '提示',
        message: '请先选择教室！',
        type: 'warning'
      })
      return
    }

    if (!inspector) {
      showModal({
        title: '提示',
        message: '请填写检查人姓名！',
        type: 'warning'
      })
      return
    }

    // 检查违纪记录
    for (let i = 0; i < violations.length; i++) {
      const v = violations[i]
      if (!v.name || v.name.trim() === '') {
        showModal({
          title: '提示',
          message: `第 ${i + 1} 条违纪记录的学生姓名未填写！`,
          type: 'warning'
        })
        return
      }
      // 检查是否上传了违纪照片
      if (!v.hasPhoto) {
        showModal({
          title: '警告',
          message: `请上传第 ${i + 1} 条违纪记录（${v.name}）的违纪情况照片！`,
          type: 'warning'
        })
        return
      }
    }

    // 获取班级信息
    const classRecord = classAttendanceRecords[0]
    
    const doSubmit = async () => {
      let classAttendanceInfo
      if (classRecord) {
        const present = classRecord.present && classRecord.present !== '' ? parseInt(classRecord.present) : 0
        const leave = classRecord.leave && classRecord.leave !== '' ? parseInt(classRecord.leave) : 0
        const late = classRecord.late && classRecord.late !== '' ? parseInt(classRecord.late) : 0
        const absent = classRecord.absent && classRecord.absent !== '' ? parseInt(classRecord.absent) : 0
        
        classAttendanceInfo = {
          shouldAttend: present + leave,
          present,
          leave,
          late,
          absent
        }
      }

      const newRecord: Omit<SupervisionRecord, 'id'> = {
        date: currentDate,
        timeSlot: currentTimeSlot,
        classroom: selectedClassroom.number,
        className: classRecord?.className || '未知班级',
        instructor: classRecord?.instructor || '未知',
        inspector: inspector,
        leaveVerified: leaveVerified,
        violations: violations.map(v => ({ name: v.name, type: v.type })),
        score: calculateScore(),
        status: 'submitted',
        createdAt: new Date().toISOString(),
        classAttendance: classAttendanceInfo
      }

      try {
        await api.supervision.create(newRecord)
        
        showModal({
          title: '成功',
          message: '督查记录提交成功！',
          type: 'success'
        })
        
        setViolations([])
        setLeaveVerified(false)
        const updated = await api.supervision.getAll()
        setSupervisionRecords(updated)
      } catch (err) {
        showModal({
          title: '错误',
          message: '提交失败，请重试',
          type: 'warning'
        })
      }
    }

    if (!classRecord) {
      showModal({
        title: '警告',
        message: '该教室暂无学委提交的考勤记录，是否继续提交？',
        type: 'warning',
        showCancel: true,
        onConfirm: doSubmit
      })
    } else {
      doSubmit()
    }
  }

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          {user.name && <h2>{getGreeting()}，{user.name}</h2>}
          <button className="logout-btn" onClick={onLogout}>退出</button>
        </div>
      </header>

      {/* 通知区域 */}
      {notifications.length > 0 && (
        <div className="notification-container">
          <div className="notification-list">
            {notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              >
                <span className="notification-icon">
                  {getNotificationIcon(notification.type)}
                </span>
                <div className="notification-content">
                  <div className="notification-class">{notification.className}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">
                    {formatNotificationTime(notification.timestamp)}
                  </div>
                </div>
                <button 
                  className="notification-close"
                  onClick={() => handleCloseNotification(notification.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs">
        <button
          className={`tab ${activeTab === 'classrooms' ? 'active' : ''}`}
          onClick={() => { setActiveTab('classrooms'); setSelectedClassroom(null) }}
        >
          教室总览
        </button>
        {selectedClassroom && (
          <button
            className={`tab ${activeTab === 'detail' ? 'active' : ''}`}
            onClick={() => setActiveTab('detail')}
          >
            {selectedClassroom.number} 详情
          </button>
        )}
        <button
          className={`tab ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          督查表生成
        </button>
        </div>
      </div>

      <main className="main-content">
        {activeTab === 'classrooms' && (
          <div className="card">
            <div className="floor-controls">
              <div className="form-group">
                <label style={{ fontSize: '16px' }}>督查检查人</label>
                <input
                  type="text"
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  placeholder="请输入检查人姓名"
                  style={{ height: '32px', fontSize: '16px' }}
                />
              </div>
            </div>

            <div className="floors-list">
              {Object.entries(classroomsByFloor).map(([floorName, rooms]) => (
                <div key={`${floorName}-${classroomsKey}`} className="floor-item">
                  <div
                    className={`floor-header ${expandedFloor === floorName ? 'expanded' : ''}`}
                    onClick={() => toggleFloor(floorName)}
                  >
                    <span className="floor-name" style={{ fontSize: '16px' }}>{floorName}</span>
                  </div>
                  {expandedFloor === floorName && (
                    <div className="classrooms-grid">
                      {rooms.map((room) => {
                        const checked = supervisionRecords.some(r => r.classroom === room && r.date === currentDate && r.timeSlot === currentTimeSlot)
                        return (
                          <div
                            key={`${room}-${classroomsKey}`}
                            className="classroom-item"
                            onClick={() => selectClassroom({ id: room, floor: floorName, number: room, status: checked ? 'submitted' : 'pending' })}
                            style={{
                              backgroundColor: checked ? '#e8f5e9' : 'white',
                              borderColor: checked ? '#4caf50' : '#e0e0e0'
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>{room}</span>
                            <span 
                              className="status-badge" 
                              style={{ color: checked ? '#4caf50' : '#999', fontWeight: checked ? 'bold' : 'normal', fontSize: '16px' }}
                            >
                              {checked ? '已查' : '未查'}
                            </span>
                          </div>
                        )
                      })}
                      {(floorName === '9F' || floorName === '6-8F') && (
                        <button 
                          className="add-classroom-btn" 
                          style={{ fontSize: '24px', height: 'auto' }}
                          onClick={(e) => handleAddClassroomClick(floorName, e)}
                        >
                          +
                        </button>
                      )}
                      {rooms.length === 0 && floorName !== '6-8F' && (
                        <div className="empty-state" style={{ fontSize: '16px' }}>该教室可添加</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div 
              className="leave-verified-section-bottom"
              onClick={() => setLeaveVerified(!leaveVerified)}
              style={{ cursor: 'pointer' }}
            >
              <label className="checkbox-label" style={{ fontSize: '16px', pointerEvents: 'none' }}>
                <input
                  type="checkbox"
                  checked={leaveVerified}
                  onChange={(e) => setLeaveVerified(e.target.checked)}
                  style={{ pointerEvents: 'auto' }}
                />
                请假条均已核实
              </label>
            </div>
          </div>
        )}

        {activeTab === 'detail' && selectedClassroom && (
          <div className="card">
            <h3 style={{ fontSize: '16px' }}>{selectedClassroom.number} - 考勤详情</h3>
            <div className="section">
              <div className="info-row" style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '16px' }}>日期：{currentDate}</span>
                <span style={{ fontSize: '16px' }}>时段：{currentTimeSlot}</span>
              </div>
            </div>
            
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', margin: 0 }}>学委考勤核对</h4>
                {(() => {
                  const uniqueRecords = getUniqueAttendanceRecords(classAttendanceRecords)
                  if (uniqueRecords.length > 0 && !isEditing) {
                    return (
                      <button
                        className="secondary-btn"
                        style={{
                          fontSize: '16px',
                          height: '32px',
                          padding: '0 12px'
                        }}
                        onClick={() => startEditing(uniqueRecords[0])}
                      >
                        编辑
                      </button>
                    )
                  }
                  return null
                })()}
              </div>
              <div className="attendance-preview">
                {(() => {
                  const uniqueRecords = getUniqueAttendanceRecords(classAttendanceRecords)
                  if (uniqueRecords.length === 0) {
                    return (
                      <div className="info-row" style={{ color: '#999' }}>
                        暂无该教室考勤数据
                      </div>
                    )
                  }
                  return uniqueRecords.map((record) => {
                    const classInfo = classes.find(c => c.name === record.className)
                    const leave = parseInt(record.leave) || 0
                    const late = parseInt(record.late) || 0
                    const absent = parseInt(record.absent) || 0
                    const isCurrentlyEditing = isEditing && editingRecordId === record.id
                    
                    return (
                      <div key={record.id} className="attendance-record-card">
                        
                        {isCurrentlyEditing ? (
                          // 编辑模式
                          <div>
                            <div className="record-header">
                              <span className="class-name" style={{ fontSize: '16px' }}>{record.className}</span>
                              <span className="instructor" style={{ fontSize: '16px' }}>辅导员：{record.instructor}</span>
                            </div>
                            
                            <div className="form-group" style={{ marginTop: '16px' }}>
                              <label style={{ fontSize: '16px' }}>实到人数</label>
                              <input
                                type="text"
                                value={editedData.present}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d]/g, '')
                                  setEditedData({...editedData, present: val})
                                }}
                                onWheel={preventWheel}
                                style={{ height: '32px' }}
                              />
                            </div>
                            
                            <div className="form-group">
                              <label style={{ fontSize: '16px' }}>请假人数</label>
                              <input
                                type="text"
                                value={editedData.leave}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d]/g, '')
                                  setEditedData({...editedData, leave: val})
                                }}
                                onWheel={preventWheel}
                                style={{ height: '32px' }}
                              />
                              {editedData.leave !== '' && parseInt(editedData.leave) >= 1 && (
                                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                  <h5 style={{ marginBottom: '8px', fontSize: '16px' }}>请假学生信息</h5>
                                  {leaveStudents.map((student, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                      <input
                                        type="text"
                                        placeholder="学生姓名"
                                        value={student.name}
                                        onChange={(e) => updateAnomalyStudent(setLeaveStudents, index, 'name', e.target.value)}
                                        style={{ flex: 1, padding: '6px', height: '32px', fontSize: '16px' }}
                                      />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleAnomalyPhotoChange(setLeaveStudents, index, e)}
                                        style={{ flex: 1, height: '32px' }}
                                      />
                                      <button
                                        className="remove-btn"
                                        onClick={() => removeAnomalyStudent(setLeaveStudents, index)}
                                      >
                                        删除
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="secondary-btn"
                                    onClick={() => addAnomalyStudent(setLeaveStudents)}
                                    style={{ fontSize: '16px', height: '32px', padding: '0 12px', marginTop: '8px' }}
                                  >
                                    + 添加学生
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="form-group">
                              <label style={{ fontSize: '16px' }}>迟到人数</label>
                              <input
                                type="text"
                                value={editedData.late}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d]/g, '')
                                  setEditedData({...editedData, late: val})
                                }}
                                onWheel={preventWheel}
                                style={{ height: '32px', fontSize: '16px' }}
                              />
                              {editedData.late !== '' && parseInt(editedData.late) >= 1 && (
                                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                  <h5 style={{ marginBottom: '8px', fontSize: '16px' }}>迟到学生信息</h5>
                                  {lateStudents.map((student, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                      <input
                                        type="text"
                                        placeholder="学生姓名"
                                        value={student.name}
                                        onChange={(e) => updateAnomalyStudent(setLateStudents, index, 'name', e.target.value)}
                                        style={{ flex: 1, padding: '6px', height: '32px', fontSize: '16px' }}
                                      />
                                      <button
                                        className="remove-btn"
                                        onClick={() => removeAnomalyStudent(setLateStudents, index)}
                                        style={{ fontSize: '16px', height: '32px' }}
                                      >
                                        删除
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="secondary-btn"
                                    onClick={() => addAnomalyStudent(setLateStudents)}
                                    style={{ fontSize: '16px', height: '32px', padding: '0 12px', marginTop: '8px' }}
                                  >
                                    + 添加学生
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="form-group">
                              <label style={{ fontSize: '16px' }}>旷课人数</label>
                              <input
                                type="text"
                                value={editedData.absent}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d]/g, '')
                                  setEditedData({...editedData, absent: val})
                                }}
                                onWheel={preventWheel}
                                style={{ height: '32px', fontSize: '16px' }}
                              />
                              {editedData.absent !== '' && parseInt(editedData.absent) >= 1 && (
                                <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                                  <h5 style={{ marginBottom: '8px', fontSize: '16px' }}>旷课学生信息</h5>
                                  {absentStudents.map((student, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'center' }}>
                                      <input
                                        type="text"
                                        placeholder="学生姓名"
                                        value={student.name}
                                        onChange={(e) => updateAnomalyStudent(setAbsentStudents, index, 'name', e.target.value)}
                                        style={{ flex: 1, padding: '6px', height: '32px', fontSize: '16px' }}
                                      />
                                      <button
                                        className="remove-btn"
                                        onClick={() => removeAnomalyStudent(setAbsentStudents, index)}
                                        style={{ fontSize: '16px', height: '32px' }}
                                      >
                                        删除
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    className="secondary-btn"
                                    onClick={() => addAnomalyStudent(setAbsentStudents)}
                                    style={{ fontSize: '16px', height: '32px', padding: '0 12px', marginTop: '8px' }}
                                  >
                                    + 添加学生
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            <div className="form-group">
                              <label style={{ fontSize: '16px' }}>未在教室人数</label>
                              <input
                                type="text"
                                value={editedData.notInClassroom}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/[^\d]/g, '')
                                  setEditedData({...editedData, notInClassroom: val})
                                }}
                                onWheel={preventWheel}
                                style={{ height: '32px' }}
                              />
                            </div>
                            
                            {editedData.notInClassroom !== '' && parseInt(editedData.notInClassroom) >= 1 && (
                              <div>
                                <div className="form-group">
                                  <label style={{ fontSize: '16px' }}>未在教室原因</label>
                                  <input
                                    type="text"
                                    value={notInClassroomReason}
                                    onChange={(e) => setNotInClassroomReason(e.target.value)}
                                    placeholder="请输入具体原因"
                                    style={{ height: '32px', fontSize: '16px' }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            <div className="form-actions" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                              <button className="secondary-btn" style={{ fontSize: '16px', height: '32px' }} onClick={cancelEditing}>取消</button>
                              <button className="submit-btn" style={{ fontSize: '16px', height: '32px' }} onClick={() => saveEditing(record)}>保存</button>
                            </div>
                          </div>
                        ) : (
                          // 显示模式
                          <div>
                            <div className="record-header">
                              <span className="class-name" style={{ fontSize: '16px' }}>{record.className}</span>
                              <span className="instructor" style={{ fontSize: '16px' }}>辅导员：{record.instructor}</span>
                            </div>
                            <div className="record-details">
                              <div className="detail-item">
                                <span className="label" style={{ fontSize: '16px' }}>应到：</span>
                                <span className="value" style={{ fontSize: '16px' }}>{classInfo?.count || (record.present && record.present !== '' ? parseInt(record.present) : 0) + (record.leave && record.leave !== '' ? parseInt(record.leave) : 0)}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label" style={{ fontSize: '16px' }}>实到：</span>
                                <span className="value" style={{ fontSize: '16px' }}>{record.present || '-'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label" style={{ fontSize: '16px' }}>请假：</span>
                                <span className="value" style={{ fontSize: '16px' }}>{record.leave || '-'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label" style={{ fontSize: '16px' }}>迟到：</span>
                                <span className="value" style={{ fontSize: '16px' }}>{record.late || '-'}</span>
                              </div>
                              <div className="detail-item">
                                <span className="label" style={{ fontSize: '16px' }}>旷课：</span>
                                <span className="value" style={{ fontSize: '16px' }}>{record.absent || '-'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            </div>

            <div className="section">
              <h4 style={{ fontSize: '16px' }}>违纪与扣分登记</h4>
              <div className="violations-list">
                {violations.length === 0 && (
                  <div style={{ color: '#999', padding: '20px 0', fontSize: '16px' }}>暂无违纪记录</div>
                )}
                {violations.map((violation, index) => (
                  <div key={index} className="violation-item">
                    <input
                      type="text"
                      placeholder="学生姓名"
                      value={violation.name}
                      onChange={(e) => updateViolation(index, 'name', e.target.value)}
                    />
                    <select
                      value={violation.type}
                      onChange={(e) => updateViolation(index, 'type', e.target.value)}
                    >
                      <option value="sleep">睡觉</option>
                      <option value="food">带餐</option>
                      <option value="dye">染发</option>
                      <option value="no-book">未带书</option>
                      <option value="phone">玩手机</option>
                      <option value="hygiene">卫生差</option>
                    </select>
                    <label className="file-upload-label">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(index, e)} 
                        className="file-upload-input"
                      />
                      {violation.hasPhoto ? (
                        <span className="file-upload-text file-uploaded">已上传</span>
                      ) : (
                        <span className="file-upload-text">上传照片</span>
                      )}
                    </label>
                    {!violation.hasPhoto && <span>（需上传照片）</span>}
                    <button className="remove-btn" onClick={() => removeViolation(index)}>删除</button>
                  </div>
                ))}
                <button className="add-violation-btn" style={{ fontSize: '14px', height: '40px' }} onClick={addViolation}>+ 添加违纪记录</button>
              </div>
            </div>

            <div className="section">
              <h4 style={{ fontSize: '16px' }}>学风分数</h4>
              <div className="score-display">
                <span className="score-label" style={{ fontSize: '16px' }}>班级学风分数：</span>
                <span className="score-value" style={{ color: '#333', fontSize: '16px' }}>{calculateScore()}</span>
                <span className="score-unit" style={{ fontSize: '16px' }}>分</span>
              </div>
            </div>

            <div className="form-actions">
              <button className="submit-btn" style={{ fontSize: '16px', height: '38px' }} onClick={handleSubmit}>提交督查</button>
            </div>
          </div>
        )}

        {activeTab === 'report' && (
          <div className="card">
            <div className="report-table">
              <table className="standard-table">
                <thead>
                  <tr>
                    <th colSpan={9} className="table-combined-header">
                      <div className="table-title-row">
                        计科院学风建设督查表
                      </div>
                      <div className="table-info-row">
                        <span>2026</span>
                        <span>年</span>
                        <span>{new Date().getMonth() + 1}</span>
                        <span>月</span>
                        <span>{new Date().getDate()}</span>
                        <span>日</span>
                        <span>星期{['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]}</span>
                        <span>第</span>
                        <span>{currentTimeSlot === '上午' ? '1、2' : '5、6'}</span>
                        <span>节</span>
                        <span style={{ marginLeft: '20px' }}>检查人：</span>
                        <span>{(() => {
                          const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords)
                          if (uniqueRecords.length > 0) {
                            const inspectors = Array.from(new Set(uniqueRecords.map(r => r.inspector))).filter(Boolean)
                            return inspectors.join('、') || '未填写'
                          }
                          return inspector || '未填写'
                        })()}</span>
                      </div>
                    </th>
                  </tr>
                  <tr>
                    <th rowSpan={2}>班级</th>
                    <th rowSpan={2}>辅导员</th>
                    <th colSpan={5}>考勤情况</th>
                    <th rowSpan={2}>违纪情况</th>
                    <th rowSpan={2}>总分</th>
                  </tr>
                  <tr>
                    <th>应到</th>
                    <th>实到</th>
                    <th>请假</th>
                    <th>旷课</th>
                    <th>迟到</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords)
                    if (uniqueRecords.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                            暂无督查记录
                          </td>
                        </tr>
                      )
                    }
                    return uniqueRecords.map((record) => {
                      const filteredViolations = record.violations.filter(v => v.type !== 'late')
                      
                      return (
                        <tr key={record.id}>
                          <td>{record.className}</td>
                          <td>{record.instructor}</td>
                          <td>{record.classAttendance?.shouldAttend || '-'}</td>
                          <td>{record.classAttendance?.present || '-'}</td>
                          <td>{record.classAttendance && record.classAttendance.leave > 0 ? record.classAttendance.leave : '-'}</td>
                          <td>{record.classAttendance && record.classAttendance.absent > 0 ? record.classAttendance.absent : '-'}</td>
                          <td>{record.classAttendance && record.classAttendance.late > 0 ? record.classAttendance.late : '-'}</td>
                          <td>
                            {filteredViolations.length === 0 ? '无' : (() => {
                              const typeCount: { [key: string]: number } = {}
                              filteredViolations.forEach(v => {
                                const type = violationTypeMap[v.type] || v.type
                                typeCount[type] = (typeCount[type] || 0) + 1
                              })
                              return Object.entries(typeCount)
                                .map(([type, count]) => `${type}：${count}`)
                                .join('，')
                            })()}
                          </td>
                          <td>{record.score}分</td>
                        </tr>
                      )
                    })
                  })()}
                </tbody>
              </table>
            </div>
            <div className="form-actions">
              <button 
                className="secondary-btn" 
                onClick={() => {
                  const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords)
                  let exportInspector = inspector
                  if (uniqueRecords.length > 0) {
                    const inspectors = Array.from(new Set(uniqueRecords.map(r => r.inspector))).filter(Boolean)
                    exportInspector = inspectors.join('、')
                  }
                  const filename = `督查记录表_${currentDate}_${currentTimeSlot}.xlsx`
                  exportSupervisionRecordsToExcel(uniqueRecords, filename, {
                    date: currentDate,
                    timeSlot: currentDisplayTimeSlot,
                    inspector: exportInspector
                  })
                }}
              >
                导出 Excel
              </button>
            </div>
          </div>
        )}
      </main>
      
      {/* 新增教室弹窗 */}
      {showAddClassroomModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>新增教室</h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
                当前楼层：{currentFloor}
              </label>
              <input
                type="text"
                value={newClassroomNumber}
                onChange={(e) => setNewClassroomNumber(e.target.value)}
                placeholder="请输入教室编号（如：601）"
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmAddClassroom()
                  }
                }}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowAddClassroomModal(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                取消
              </button>
              <button
                onClick={handleConfirmAddClassroom}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#36B37E',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Secretary
