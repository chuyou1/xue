import { useState, useEffect, useRef } from 'react'
import '../styles/VicePresident.css'
import { User, SupervisionRecord, classroomsByFloor, getUniqueSupervisionRecords, Notification, AnomalyRecord, AttendanceRecord, classes, getUniqueAttendanceRecords, users } from '../data'
import { mockApi } from '../services/mockApi'

interface VicePresidentProps {
  user: User
  onLogout: () => void
}

// 违纪类型中文映射
const violationTypeMap: { [key: string]: string } = {
  'sleep': '睡觉',
  'food': '带餐',
  'dye': '染发',
  'no-book': '未带书',
  'phone': '玩手机',
  'hygiene': '卫生差',
  'absent': '旷课'
}

// 异常类型中文映射
const anomalyTypeMap: { [key: string]: string } = {
  'not_in_classroom': '未在教室',
  'leave_change': '请假变更',
  'late_change': '迟到变更',
  'absent_change': '旷课变更',
  'present_change': '实到变更'
}

function VicePresident({ user, onLogout }: VicePresidentProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [overviewSubTab, setOverviewSubTab] = useState<'attendance' | 'inspection' | 'global'>('global')
  const [supervisionRecords, setSupervisionRecords] = useState<SupervisionRecord[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [currentDate, setCurrentDate] = useState('')
  const [currentTimeSlot, setCurrentTimeSlot] = useState('')
  const [currentDisplayTimeSlot, setCurrentDisplayTimeSlot] = useState('')

  const [currentTime, setCurrentTime] = useState(new Date())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [anomalyCount, setAnomalyCount] = useState(0)
  const [showAnomalyDetail, setShowAnomalyDetail] = useState(false)
  const [todayAnomalyRecords, setTodayAnomalyRecords] = useState<AnomalyRecord[]>([])
  const [showOverviewDropdown, setShowOverviewDropdown] = useState(false)
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null)
  const [selectedAttendanceClassroom, setSelectedAttendanceClassroom] = useState<string | null>(null)
  const [summaryQueryMode, setSummaryQueryMode] = useState<'period' | 'date'>('date')
  const [selectedWeek, setSelectedWeek] = useState<number>(11)
  const [showDateDetail, setShowDateDetail] = useState(false)
  const [selectedDetailDate, setSelectedDetailDate] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState(2026)
  const [selectedMonth, setSelectedMonth] = useState(5)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取根据时间变化的问候语
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  // 获取显示的时段信息（星期几第几节）
  const getDisplayTimeSlot = () => {
    const now = new Date()
    const dayNames = ['日', '一', '二', '三', '四', '五', '六']
    const dayName = dayNames[now.getDay()]
    const hour = now.getHours()
    let period = ''
    
    if (hour < 12) {
      period = '第1、2节'
    } else {
      period = '第5、6节'
    }
    
    return `星期${dayName} ${period}`
  }

  // 初始化数据
  useEffect(() => {
    const now = new Date()
    const date = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    const timeSlot = now.getHours() < 12 ? '上午' : '下午'
    setCurrentDate(date)
    setCurrentTimeSlot(timeSlot)
    setCurrentDisplayTimeSlot(getDisplayTimeSlot())
    
    loadData()
  }, [])

  // 每秒更新时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const loadData = async () => {
    const date = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    const [supervision, attendance, notifications, anomalyCount, anomalies] = await Promise.all([
      mockApi.supervision.getAll(),
      mockApi.attendance.getAll(),
      mockApi.notifications.getAll(),
      mockApi.anomalies.getTodayCount(),
      mockApi.anomalies.getByDate(date)
    ])
    setSupervisionRecords(supervision)
    setAttendanceRecords(attendance)
    setNotifications(notifications)
    setAnomalyCount(anomalyCount)
    setTodayAnomalyRecords(anomalies)
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
    await mockApi.notifications.markAsRead(id)
    const updated = await mockApi.notifications.getAll()
    setNotifications(updated)
  }

  // 刷新数据当切换标签时
  useEffect(() => {
    loadData()
  }, [activeTab])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowOverviewDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 格式化时段显示
  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot === '上午' ? '第1、2节' : '第5、6节'
  }

  // 获取今日有考勤记录的楼层
  const getFloorsWithAttendance = () => {
    const floorsWithRecords: Set<string> = new Set()
    const todayAttendance = attendanceRecords.filter(r => r.date === currentDate && r.timeSlot === currentTimeSlot)
    todayAttendance.forEach(record => {
      Object.entries(classroomsByFloor as Record<string, string[]>).forEach(([floor, rooms]) => {
        if (rooms.includes(record.classroom)) {
          floorsWithRecords.add(floor)
        }
      })
    })
    return Array.from(floorsWithRecords).sort((a, b) => {
      const order = ['9F', '6-8F', '5F', '4F', '3F', '2F']
      return order.indexOf(a) - order.indexOf(b)
    })
  }

  // 获取指定楼层下有考勤记录的教室
  const getClassroomsWithAttendance = (floor: string) => {
    const floorRooms = (classroomsByFloor as Record<string, string[]>)[floor] || []
    const todayAttendance = attendanceRecords.filter(r => r.date === currentDate && r.timeSlot === currentTimeSlot)
    const classroomsWithRecords = new Set(todayAttendance.map(r => r.classroom))
    return floorRooms.filter((room: string) => classroomsWithRecords.has(room))
  }

  // 获取教室的考勤记录详情
  const getClassroomAttendanceRecords = (classroom: string) => {
    const records = attendanceRecords.filter(
      r => r.classroom === classroom && r.date === currentDate && r.timeSlot === currentTimeSlot
    )
    return getUniqueAttendanceRecords(records)
  }

  // 统计数据
  const getStats = () => {
    // 已提交的督查记录
    const checkedClassrooms = new Set(
      supervisionRecords
        .filter(r => r.date === currentDate && r.timeSlot === currentTimeSlot)
        .map(r => r.classroom)
    ).size
    
    // 总教室数
    let totalClassrooms = 0
    Object.values(classroomsByFloor).forEach(rooms => totalClassrooms += rooms.length)
    
    const pendingClassrooms = totalClassrooms - checkedClassrooms
    
    return {
      checkedClassrooms,
      pendingClassrooms,
      anomalyCount
    }
  }

  const stats = getStats()

  // 获取指定年月的日历数据
  const getCalendarDays = () => {
    const days = []
    const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1)
    const dayOfWeek = firstDayOfMonth.getDay()
    
    for (let i = 0; i < dayOfWeek; i++) {
      days.push({ day: 0, isToday: false, hasRecords: false, isFuture: false, isEmpty: true })
    }
    
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const isToday = dateStr === currentDate
      const hasRecords = supervisionRecords.some(r => r.date === dateStr)
      const currentDateObj = new Date(selectedYear, selectedMonth - 1, day)
      const isFuture = currentDateObj > today
      
      days.push({ 
        day, 
        isToday, 
        hasRecords, 
        isFuture,
        isEmpty: false
      })
    }
    
    return days
  }

  // 获取第N周的日期（第11周从2026-05-18开始，5月19日为第11周周二）
  const getWeekDates = (weekNum: number) => {
    const startDateOfWeek11 = new Date(2026, 4, 18)
    const daysOffset = (weekNum - 11) * 7
    const weekStart = new Date(startDateOfWeek11)
    weekStart.setDate(startDateOfWeek11.getDate() + daysOffset)
    
    const weekDates = []
    const dayNames = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      const hasRecords = supervisionRecords.some(r => r.date === dateStr)
      weekDates.push({
        date: dateStr,
        day: date.getDate(),
        dayName: dayNames[i],
        hasRecords
      })
    }
    return weekDates
  }

  // 格式化时间显示
  const formatTime = (timeString: string) => {
    const date = new Date(timeString)
    return date.toLocaleString('zh-CN')
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

      <div className="tabs">
        <div className="tab-dropdown-container" ref={dropdownRef}>
          <button
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => {
              if (activeTab === 'overview') {
                setShowOverviewDropdown(!showOverviewDropdown)
              } else {
                setActiveTab('overview')
              }
            }}
          >
            {overviewSubTab === 'attendance' ? '今日考勤' : overviewSubTab === 'inspection' ? '今日查教' : '全局总览'}
            <span className="dropdown-arrow">▼</span>
          </button>
          {showOverviewDropdown && (
            <div className="tab-dropdown-menu">
              <div
                className={`tab-dropdown-item ${overviewSubTab === 'attendance' ? 'active' : ''}`}
                onClick={() => { setOverviewSubTab('attendance'); setShowOverviewDropdown(false) }}
              >
                今日考勤
              </div>
              <div
                className={`tab-dropdown-item ${overviewSubTab === 'inspection' ? 'active' : ''}`}
                onClick={() => { setOverviewSubTab('inspection'); setShowOverviewDropdown(false) }}
              >
                今日查教
              </div>
              <div
                className={`tab-dropdown-item ${overviewSubTab === 'global' ? 'active' : ''}`}
                onClick={() => { setOverviewSubTab('global'); setShowOverviewDropdown(false) }}
              >
                全局总览
              </div>
            </div>
          )}
        </div>
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          汇总报表
        </button>
        <button
          className={`tab ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          账户管理
        </button>
      </div>

      <main className="main-content">
        {/* 异常详情弹窗 */}
        {showAnomalyDetail && (
          <div className="card">
            <div className="section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3>今日异常详情</h3>
                <button className="secondary-btn" onClick={() => setShowAnomalyDetail(false)}>返回</button>
              </div>
              
              {todayAnomalyRecords.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                  今日暂无异常记录
                </div>
              ) : (
                <div className="report-table">
                  <table className="standard-table">
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th>时段</th>
                        <th>班级</th>
                        <th>检查人</th>
                        <th>异常类型</th>
                        <th>涉及人数</th>
                        <th>原因详情</th>
                        <th>时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todayAnomalyRecords.map((record) => {
                        const totalStudents = 
                          record.leaveStudents.length + 
                          record.lateStudents.length + 
                          record.absentStudents.length + 
                          record.notInClassroomStudents.length
                        
                        return (
                          <tr key={record.id}>
                            <td>{record.date}</td>
                            <td>{formatTimeSlot(record.timeSlot)}</td>
                            <td>{record.className}</td>
                            <td>{record.inspector}</td>
                            <td>{anomalyTypeMap[record.type] || record.type}</td>
                            <td>{totalStudents}</td>
                            <td>{record.reason}</td>
                            <td>{formatTime(record.createdAt)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {!showAnomalyDetail && activeTab === 'overview' && overviewSubTab === 'attendance' && (
          <div className="card overview-card">
            <div className="overview-header">
              <div className="overview-info" style={{ fontSize: '14px', color: '#666' }}>
                {currentDate} {currentDisplayTimeSlot}
              </div>
            </div>

            <div className="floors-list">
              {getFloorsWithAttendance().length === 0 ? (
                <div className="empty-state" style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                  暂无学委提交的考勤记录
                </div>
              ) : (
                getFloorsWithAttendance().map((floor) => (
                  <div key={floor} className="floor-item">
                    <div
                      className={`floor-header ${expandedFloor === floor ? 'expanded' : ''}`}
                      onClick={() => setExpandedFloor(expandedFloor === floor ? null : floor)}
                    >
                      <span className="floor-name" style={{ fontSize: '16px' }}>{floor}</span>
                    </div>
                    {expandedFloor === floor && (
                      <div className="classrooms-grid">
                        {getClassroomsWithAttendance(floor).map((room) => (
                          <div
                            key={room}
                            className="classroom-item"
                            onClick={() => setSelectedAttendanceClassroom(room)}
                            style={{
                              backgroundColor: selectedAttendanceClassroom === room ? '#e8f5e9' : 'white',
                              borderColor: selectedAttendanceClassroom === room ? '#4caf50' : '#e0e0e0'
                            }}
                          >
                            <span style={{ fontSize: '16px' }}>{room}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {selectedAttendanceClassroom && (
              <div className="attendance-detail-modal">
                <div className="attendance-detail-content">
                  <div className="attendance-detail-header">
                    <h4 style={{ fontSize: '16px' }}>{selectedAttendanceClassroom} 考勤详情</h4>
                    <button className="close-btn" onClick={() => setSelectedAttendanceClassroom(null)}>×</button>
                  </div>
                  <div className="attendance-records-list">
                    {getClassroomAttendanceRecords(selectedAttendanceClassroom).map((record) => {
                      const classInfo = classes.find(c => c.name === record.className)
                      return (
                        <div key={record.id} className="attendance-record-item">
                          <div className="record-header">
                            <span className="class-name" style={{ fontSize: '16px', fontWeight: 'bold' }}>{record.className}</span>
                            <span style={{ fontSize: '14px', color: '#666' }}>辅导员：{record.instructor}</span>
                          </div>
                          <div className="record-details" style={{ marginTop: '12px' }}>
                            <div className="detail-item">
                              <span className="label" style={{ fontSize: '14px', color: '#666' }}>应到：</span>
                              <span className="value" style={{ fontSize: '14px' }}>{classInfo?.count || '-'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label" style={{ fontSize: '14px', color: '#666' }}>实到：</span>
                              <span className="value" style={{ fontSize: '14px' }}>{record.present}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label" style={{ fontSize: '14px', color: '#666' }}>请假：</span>
                              <span className="value" style={{ fontSize: '14px' }}>{record.leave || '-'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label" style={{ fontSize: '14px', color: '#666' }}>迟到：</span>
                              <span className="value" style={{ fontSize: '14px' }}>{record.late || '-'}</span>
                            </div>
                            <div className="detail-item">
                              <span className="label" style={{ fontSize: '14px', color: '#666' }}>旷课：</span>
                              <span className="value" style={{ fontSize: '14px' }}>{record.absent || '-'}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {!showAnomalyDetail && activeTab === 'overview' && overviewSubTab === 'inspection' && (
          <div className="card overview-card">
            <div className="overview-header">
              <div className="overview-info" style={{ fontSize: '14px', color: '#666' }}>
                {currentDate} {currentDisplayTimeSlot}
              </div>
            </div>

            <div className="section">
              <div className="report-table">
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th colSpan={9} className="table-combined-header">
                        <div className="table-title-row">
                          计科院学风建设督查表
                        </div>
                        <div className="table-info-row">
                          <span>{new Date().getFullYear()}</span>
                          <span>年</span>
                          <span>{new Date().getMonth() + 1}</span>
                          <span>月</span>
                          <span>{new Date().getDate()}</span>
                          <span>日</span>
                          <span>星期{['日', '一', '二', '三', '四', '五', '六'][new Date().getDay()]}</span>
                          <span>第</span>
                          <span>{currentTimeSlot === '上午' ? '1、2' : '5、6'}</span>
                          <span>节</span>
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
                      const todaySupervisionRecords = getUniqueSupervisionRecords(supervisionRecords)
                        .filter(r => r.date === currentDate && r.timeSlot === currentTimeSlot)
                      if (todaySupervisionRecords.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                              暂无督查记录
                            </td>
                          </tr>
                        )
                      }
                      return todaySupervisionRecords.map((record) => {
                        const filteredViolations = record.violations.filter(v => v.type !== 'late')
                        const typeCount: { [key: string]: number } = {}
                        filteredViolations.forEach(v => {
                          const type = violationTypeMap[v.type] || v.type
                          typeCount[type] = (typeCount[type] || 0) + 1
                        })
                        const violationDisplay = Object.entries(typeCount)
                          .map(([type, count]) => `${type}：${count}`)
                          .join('，') || '无'
                        return (
                          <tr key={record.id}>
                            <td>{record.className}</td>
                            <td>{record.instructor}</td>
                            <td>{record.classAttendance?.shouldAttend || '-'}</td>
                            <td>{record.classAttendance?.present || '-'}</td>
                            <td>{record.classAttendance && record.classAttendance.leave > 0 ? record.classAttendance.leave : '-'}</td>
                            <td>{record.classAttendance && record.classAttendance.absent > 0 ? record.classAttendance.absent : '-'}</td>
                            <td>{record.classAttendance && record.classAttendance.late > 0 ? record.classAttendance.late : '-'}</td>
                            <td>{violationDisplay}</td>
                            <td>{record.score}分</td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!showAnomalyDetail && activeTab === 'overview' && overviewSubTab === 'global' && (
          <div className="card overview-card">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.checkedClassrooms}</div>
                <div className="stat-label">已提交教室</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.pendingClassrooms}</div>
                <div className="stat-label">待提交教室</div>
              </div>
              <div
                className="stat-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setShowAnomalyDetail(true)}
              >
                <div className="stat-value" style={{ color: '#ff6b6b' }}>{anomalyCount}</div>
                <div className="stat-label">今日异常数</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>点击查看详情</div>
              </div>
            </div>
          </div>
        )}

        {!showAnomalyDetail && activeTab === 'summary' && !showDateDetail && (
          <div className="card">
            <div className="query-mode-switch" style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px', 
              padding: '20px 0',
              borderBottom: '1px solid #eee'
            }}>
              <button
                className={`secondary-btn ${summaryQueryMode === 'period' ? 'active' : ''}`}
                onClick={() => {
                  setSummaryQueryMode('period')
                  setSelectedWeek(11)
                }}
              >
                周期查询
              </button>
              <button
                className={`secondary-btn ${summaryQueryMode === 'date' ? 'active' : ''}`}
                onClick={() => {
                  setSummaryQueryMode('date')
                }}
              >
                日期查询
              </button>
            </div>

            {summaryQueryMode === 'period' ? (
              <div className="section">
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>选择周次：</span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {Array.from({ length: 8 }, (_, i) => {
                        const weekNum = i + 11
                        return (
                          <button
                            key={weekNum}
                            className={`week-select-btn ${selectedWeek === weekNum ? 'active' : ''}`}
                            onClick={() => setSelectedWeek(weekNum)}
                          >
                            第{weekNum}周
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                <div className="week-grid">
                  {(() => {
                    const weekDates = getWeekDates(selectedWeek)
                    return weekDates.map((dateInfo, index) => (
                      <div
                        key={index}
                        className={`day-box ${dateInfo.hasRecords ? 'has-records' : ''} ${dateInfo.date === currentDate ? 'today' : ''}`}
                        onClick={() => {
                          setSelectedDetailDate(dateInfo.date)
                          setShowDateDetail(true)
                        }}
                      >
                        <div className="day-name">{dateInfo.dayName}</div>
                        <div className="day-date">{dateInfo.date}</div>
                        {dateInfo.hasRecords && (
                          <div className="record-dot"></div>
                        )}
                      </div>
                    ))
                  })()}
                </div>
              </div>
            ) : (
              <div className="section">
                <div className="date-selector" style={{ 
                  marginBottom: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  gap: '15px', 
                  flexWrap: 'wrap' 
                }}>
                  <div className="month-header" style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                    {selectedYear}年{selectedMonth}月
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => setSelectedMonth(prev => prev === 1 ? 12 : prev - 1)}
                      style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                    >
                      ◀ 上月
                    </button>
                    <div 
                      onClick={() => {
                        const now = new Date()
                        setSelectedYear(now.getFullYear())
                        setSelectedMonth(now.getMonth() + 1)
                      }}
                      style={{ 
                        padding: '6px 16px', 
                        border: '1px solid #4CAF50', 
                        borderRadius: '4px', 
                        background: '#4CAF50', 
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      今天
                    </div>
                    <button 
                      onClick={() => setSelectedMonth(prev => prev === 12 ? 1 : prev + 1)}
                      style={{ padding: '6px 12px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff', cursor: 'pointer' }}
                    >
                      下月 ▶
                    </button>
                  </div>
                </div>
                
                <div className="calendar-grid-header">
                  {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
                    <div key={index} className="calendar-header-cell">{day}</div>
                  ))}
                </div>
                <div className="calendar-grid">
                  {getCalendarDays().map((dayInfo, index) => (
                    <div
                      key={index}
                      className={`calendar-cell ${dayInfo.isEmpty ? 'empty' : ''} ${dayInfo.isToday ? 'today' : ''} ${dayInfo.hasRecords ? 'has-records' : ''}`}
                      onClick={() => {
                        if (!dayInfo.isEmpty) {
                          const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dayInfo.day).padStart(2, '0')}`
                          setSelectedDetailDate(dateStr)
                          setShowDateDetail(true)
                        }
                      }}
                    >
                      {dayInfo.day > 0 && (
                        <>
                          <span className="cell-day">{dayInfo.day}</span>
                          {dayInfo.hasRecords && (
                            <span className="cell-dot"></span>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {showDateDetail && (
          <div className="card date-detail-card">
            <div className="detail-header">
              <button 
                className="back-btn"
                onClick={() => {
                  setShowDateDetail(false)
                  setSelectedDetailDate('')
                }}
              >
                ← 返回
              </button>
              <h3 className="detail-title">{selectedDetailDate} 考勤详情</h3>
            </div>
            
            {(() => {
              const now = new Date()
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
              const [year, month, day] = selectedDetailDate.split('-').map(Number)
              const selectedDate = new Date(year, month - 1, day)
              const isFuture = selectedDate > today
              if (isFuture) {
                return null
              }
            })()}

            <div className="detail-content">
              <div className="attendance-section">
                <h4>{selectedDetailDate} 上午考勤表</h4>
                <div className="report-table">
                  <table className="standard-table">
                    <thead>
                      <tr>
                        <th colSpan={9} className="table-combined-header">
                          <div className="table-title-row">
                            计科院学风建设督查表
                          </div>
                          <div className="table-info-row">
                            {(() => {
                              const dateParts = selectedDetailDate.split('-')
                              const year = dateParts[0]
                              const month = dateParts[1]
                              const day = dateParts[2]
                              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                              const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
                              return (
                                <>
                                  <span>{year}</span>
                                  <span>年</span>
                                  <span>{month}</span>
                                  <span>月</span>
                                  <span>{day}</span>
                                  <span>日</span>
                                  <span>星期{weekday}</span>
                                  <span>第</span>
                                  <span>1、2</span>
                                  <span>节</span>
                                  <span style={{ marginLeft: '20px' }}>检查人：</span>
                                  <span>{(() => {
                                    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords).filter(r => r.date === selectedDetailDate && r.timeSlot === '上午')
                                    if (uniqueRecords.length > 0) {
                                      const inspectors = Array.from(new Set(uniqueRecords.map(r => r.inspector))).filter(Boolean)
                                      return inspectors.join('、') || '未填写'
                                    }
                                    return ''
                                  })()}</span>
                                </>
                              )
                            })()}
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
                          .filter(r => r.date === selectedDetailDate && r.timeSlot === '上午')
                        if (uniqueRecords.length === 0) {
                            const now = new Date()
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                            const [year, month, day] = selectedDetailDate.split('-').map(Number)
                            const selectedDate = new Date(year, month - 1, day)
                            const isFuture = selectedDate > today
                            return (
                              <tr>
                                <td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                  {isFuture ? '暂无上午考勤数据，提交后会自动显示' : '暂无上午考勤数据'}
                                </td>
                              </tr>
                            )
                          }
                        return uniqueRecords.map((record) => {
                          const filteredViolations = record.violations.filter(v => v.type !== 'late')
                          const typeCount: { [key: string]: number } = {}
                          filteredViolations.forEach(v => {
                            const type = violationTypeMap[v.type] || v.type
                            typeCount[type] = (typeCount[type] || 0) + 1
                          })
                          const violationDisplay = Object.entries(typeCount)
                            .map(([type, count]) => `${type}：${count}`)
                            .join('，') || '无'
                          return (
                            <tr key={record.id}>
                              <td>{record.className}</td>
                              <td>{record.instructor}</td>
                              <td>{record.classAttendance?.shouldAttend || '-'}</td>
                              <td>{record.classAttendance?.present || '-'}</td>
                              <td>{record.classAttendance && record.classAttendance.leave > 0 ? record.classAttendance.leave : '-'}</td>
                              <td>{record.classAttendance && record.classAttendance.absent > 0 ? record.classAttendance.absent : '-'}</td>
                              <td>{record.classAttendance && record.classAttendance.late > 0 ? record.classAttendance.late : '-'}</td>
                              <td>{violationDisplay}</td>
                              <td>{record.score}分</td>
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>
                <div className="photos-section">
                  {(() => {
                    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords)
                      .filter(r => r.date === selectedDetailDate && r.timeSlot === '上午')
                    const allPhotos = uniqueRecords.flatMap(record => 
                      record.violations.filter(v => v.photo).map(v => ({ ...v, className: record.className }))
                    )
                    if (allPhotos.length > 0) {
                      return (
                        <>
                          <h5>上午违纪照片</h5>
                          <div className="photos-row">
                            {allPhotos.map((photo, index) => (
                              <div key={index} className="photo-wrapper">
                                <img src={photo.photo} alt="违纪照片" className="detail-photo" />
                                <div className="photo-caption">{photo.className}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>

              <div className="attendance-section">
                <h4>{selectedDetailDate} 下午考勤表</h4>
                <div className="report-table">
                  <table className="standard-table">
                    <thead>
                      <tr>
                        <th colSpan={9} className="table-combined-header">
                          <div className="table-title-row">
                            计科院学风建设督查表
                          </div>
                          <div className="table-info-row">
                            {(() => {
                              const dateParts = selectedDetailDate.split('-')
                              const year = dateParts[0]
                              const month = dateParts[1]
                              const day = dateParts[2]
                              const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
                              const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()]
                              return (
                                <>
                                  <span>{year}</span>
                                  <span>年</span>
                                  <span>{month}</span>
                                  <span>月</span>
                                  <span>{day}</span>
                                  <span>日</span>
                                  <span>星期{weekday}</span>
                                  <span>第</span>
                                  <span>5、6</span>
                                  <span>节</span>
                                  <span style={{ marginLeft: '20px' }}>检查人：</span>
                                  <span>{(() => {
                                    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords).filter(r => r.date === selectedDetailDate && r.timeSlot === '下午')
                                    if (uniqueRecords.length > 0) {
                                      const inspectors = Array.from(new Set(uniqueRecords.map(r => r.inspector))).filter(Boolean)
                                      return inspectors.join('、') || '未填写'
                                    }
                                    return ''
                                  })()}</span>
                                </>
                              )
                            })()}
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
                          .filter(r => r.date === selectedDetailDate && r.timeSlot === '下午')
                        if (uniqueRecords.length === 0) {
                            const now = new Date()
                            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                            const [year, month, day] = selectedDetailDate.split('-').map(Number)
                            const selectedDate = new Date(year, month - 1, day)
                            const isFuture = selectedDate > today
                            return (
                              <tr>
                                <td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                  {isFuture ? '暂无下午考勤数据，提交后会自动显示' : '暂无下午考勤数据'}
                                </td>
                              </tr>
                            )
                          }
                        return uniqueRecords.map((record) => {
                          const filteredViolations = record.violations.filter(v => v.type !== 'late')
                          const typeCount: { [key: string]: number } = {}
                          filteredViolations.forEach(v => {
                            const type = violationTypeMap[v.type] || v.type
                            typeCount[type] = (typeCount[type] || 0) + 1
                          })
                          const violationDisplay = Object.entries(typeCount)
                            .map(([type, count]) => `${type}：${count}`)
                            .join('，') || '无'
                          return (
                            <tr key={record.id}>
                              <td>{record.className}</td>
                              <td>{record.instructor}</td>
                              <td>{record.classAttendance?.shouldAttend || '-'}</td>
                              <td>{record.classAttendance?.present || '-'}</td>
                              <td>{record.classAttendance && record.classAttendance.leave > 0 ? record.classAttendance.leave : '-'}</td>
                              <td>{record.classAttendance && record.classAttendance.absent > 0 ? record.classAttendance.absent : '-'}</td>
                              <td>{record.classAttendance && record.classAttendance.late > 0 ? record.classAttendance.late : '-'}</td>
                              <td>{violationDisplay}</td>
                              <td>{record.score}分</td>
                            </tr>
                          )
                        })
                      })()}
                    </tbody>
                  </table>
                </div>
                <div className="photos-section">
                  {(() => {
                    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords)
                      .filter(r => r.date === selectedDetailDate && r.timeSlot === '下午')
                    const allPhotos = uniqueRecords.flatMap(record => 
                      record.violations.filter(v => v.photo).map(v => ({ ...v, className: record.className }))
                    )
                    if (allPhotos.length > 0) {
                      return (
                        <>
                          <h5>下午违纪照片</h5>
                          <div className="photos-row">
                            {allPhotos.map((photo, index) => (
                              <div key={index} className="photo-wrapper">
                                <img src={photo.photo} alt="违纪照片" className="detail-photo" />
                                <div className="photo-caption">{photo.className}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )
                    }
                    return null
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {!showAnomalyDetail && activeTab === 'accounts' && (
          <div className="card">
            <div className="report-table">
              <table className="standard-table">
                <thead>
                  <tr>
                    <th>账号</th>
                    <th>姓名</th>
                    <th>角色</th>
                    <th>班级/部门</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem, index) => (
                    <tr key={index}>
                      <td>{userItem.username}</td>
                      <td>{userItem.name || '-'}</td>
                      <td>
                        {userItem.role === 'classMonitor' && '学委'}
                        {userItem.role === 'secretary' && '学习部干事'}
                        {userItem.role === 'cadre' && '学习部干部'}
                        {userItem.role === 'vicePresident' && '学生会副会长'}
                      </td>
                      <td>{userItem.className || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default VicePresident
