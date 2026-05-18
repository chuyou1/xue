import { useState, useEffect } from 'react'
import '../styles/VicePresident.css'
import { User, getAttendanceRecords, AttendanceRecord, getSupervisionRecords, SupervisionRecord, classroomsByFloor, users, getUniqueSupervisionRecords, getUniqueAttendanceRecords } from '../data'
import { exportSupervisionRecordsToExcel } from '../utils/exportExcel'

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

function VicePresident({ user, onLogout }: VicePresidentProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [supervisionRecords, setSupervisionRecords] = useState<SupervisionRecord[]>([])
  const [currentDate, setCurrentDate] = useState('')
  const [currentTimeSlot, setCurrentTimeSlot] = useState('')
  const [currentDisplayTimeSlot, setCurrentDisplayTimeSlot] = useState('')
  const [selectedSummaryDate, setSelectedSummaryDate] = useState<string | null>(null)
  const [selectedSummaryTimeSlot, setSelectedSummaryTimeSlot] = useState<string | null>(null)

  // 获取显示的时段信息（星期几第几节）
  const getDisplayTimeSlot = () => {
    const now = new Date()
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
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

  const loadData = () => {
    setAttendanceRecords(getAttendanceRecords())
    setSupervisionRecords(getSupervisionRecords())
  }

  // 刷新数据当切换标签时
  useEffect(() => {
    loadData()
  }, [activeTab])

  // 格式化时段显示
  const formatTimeSlot = (timeSlot: string) => {
    return timeSlot === '上午' ? '第1、2节' : '第5、6节'
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
    
    // 平均学风分
    let avgScore = '-'
    const todaySupervisions = supervisionRecords.filter(r => r.date === currentDate && r.timeSlot === currentTimeSlot)
    if (todaySupervisions.length > 0) {
      const totalScore = todaySupervisions.reduce((sum, r) => sum + r.score, 0)
      avgScore = (totalScore / todaySupervisions.length).toFixed(1)
    }
    
    return {
      checkedClassrooms,
      pendingClassrooms,
      avgScore
    }
  }

  const stats = getStats()

  // 获取所有有记录的日期和时段组合
  const getAllDateSlots = () => {
    const dateSlots = new Set<string>()
    supervisionRecords.forEach(record => {
      dateSlots.add(`${record.date}_${record.timeSlot}`)
    })
    return Array.from(dateSlots).map(key => {
      const [date, timeSlot] = key.split('_')
      return { date, timeSlot }
    }).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.timeSlot.localeCompare(b.timeSlot)
    })
  }

  // 检查某个日期时段是否有记录
  const getSlotStats = (date: string, timeSlot: string) => {
    const slotRecords = supervisionRecords.filter(r => r.date === date && r.timeSlot === timeSlot)
    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords).filter(r => r.date === date && r.timeSlot === timeSlot)
    const avgScore = slotRecords.length > 0 
      ? (slotRecords.reduce((sum, r) => sum + r.score, 0) / slotRecords.length).toFixed(1)
      : '-'
    return {
      count: uniqueRecords.length,
      avgScore
    }
  }

  const handleExportExcel = () => {
    const date = selectedSummaryDate || currentDate
    const timeSlot = selectedSummaryTimeSlot || currentTimeSlot
    const displayTimeSlot = selectedSummaryTimeSlot ? formatTimeSlot(selectedSummaryTimeSlot) : currentDisplayTimeSlot
    
    const records = selectedSummaryDate && selectedSummaryTimeSlot 
      ? getUniqueSupervisionRecords(supervisionRecords).filter(r => r.date === date && r.timeSlot === timeSlot)
      : getUniqueSupervisionRecords(supervisionRecords)
    
    if (records.length === 0) {
      alert('暂无督查记录可导出！');
      return;
    }
    
    const filename = `督查记录表_${date}_${timeSlot}.xlsx`;
    exportSupervisionRecordsToExcel(records, filename, {
      date: date,
      timeSlot: displayTimeSlot
    });
  };

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <h2>计科院学风建设督查系统 - 学生会副会长</h2>
          {user.name && <span style={{ color: '#666', marginRight: '16px' }}>欢迎，{user.name}</span>}
          <button className="logout-btn" onClick={onLogout}>退出登录</button>
        </div>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          全局总览
        </button>
        <button
          className={`tab ${activeTab === 'management' ? 'active' : ''}`}
          onClick={() => setActiveTab('management')}
        >
          信息管理
        </button>
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
        <button
          className={`tab ${activeTab === 'super' ? 'active' : ''}`}
          onClick={() => setActiveTab('super')}
        >
          超级后台
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'overview' && (
          <div className="card">
            <h3>全局考勤总览</h3>
            
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.checkedClassrooms}</div>
                <div className="stat-label">已提交教室</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.pendingClassrooms}</div>
                <div className="stat-label">待提交教室</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgScore}</div>
                <div className="stat-label">平均学风分</div>
              </div>
            </div>

            <div className="section">
              <h4>考勤明细</h4>
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
                      const uniqueSupervisionRecords = getUniqueSupervisionRecords(supervisionRecords)
                        .filter(r => r.date === currentDate && r.timeSlot === currentTimeSlot);
                      if (uniqueSupervisionRecords.length === 0) {
                        return (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                              暂无考勤记录
                            </td>
                          </tr>
                        );
                      }
                      return uniqueSupervisionRecords.map((record) => {
                        // 筛选违纪情况，排除迟到
                        const filteredViolations = record.violations.filter(v => v.type !== 'late')
                        
                        // 统计违纪情况
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
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'management' && (
          <div className="card">
            <h3>信息管理汇总</h3>
            
            <div className="section">
              <h4>督查表列表</h4>
              <div className="report-table">
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th colSpan={7} className="table-title">
                        计科院学风建设督查表
                      </th>
                    </tr>
                    <tr>
                      <th>日期</th>
                      <th>时段</th>
                      <th>班级</th>
                      <th>教室</th>
                      <th>检查人</th>
                      <th>提交时间</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords);
                      if (uniqueRecords.length === 0) {
                        return (
                          <tr>
                            <td colSpan={7} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                              暂无督查记录
                            </td>
                          </tr>
                        );
                      }
                      return uniqueRecords.map((record) => (
                        <tr key={record.id}>
                          <td>{record.date}</td>
                          <td>{formatTimeSlot(record.timeSlot)}</td>
                          <td>{record.className}</td>
                          <td>{record.classroom}</td>
                          <td>{record.inspector}</td>
                          <td>{new Date(record.createdAt).toLocaleString('zh-CN')}</td>
                          <td style={{ color: '#4caf50' }}>已提交</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="card">
            <h3>全院汇总督查报表</h3>
            
            {/* 如果没有选择具体日期时段，显示日期盒子列表 */}
            {!selectedSummaryDate || !selectedSummaryTimeSlot ? (
              <div className="section">
                <h4>选择日期和时段查看详情</h4>
                <div className="classroom-overview">
                  {(() => {
                    const allDateSlots = getAllDateSlots()
                    if (allDateSlots.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                          暂无督查记录
                        </div>
                      )
                    }
                    return (
                      <div className="floor-container">
                        {allDateSlots.map((slot, index) => {
                          const slotStats = getSlotStats(slot.date, slot.timeSlot)
                          const isCurrent = slot.date === currentDate && slot.timeSlot === currentTimeSlot
                          return (
                            <div 
                              key={index}
                              className={`classroom-item ${isCurrent ? 'checked' : ''}`}
                              onClick={() => {
                                setSelectedSummaryDate(slot.date)
                                setSelectedSummaryTimeSlot(slot.timeSlot)
                              }}
                            >
                              <div className="classroom-info">
                                <div className="classroom-number">{slot.date}</div>
                                <div className="classroom-status">{formatTimeSlot(slot.timeSlot)}</div>
                              </div>
                              <div style={{ fontSize: 'var(--font-size-base)', color: '#666', marginTop: '8px' }}>
                                {slotStats.count}个班级
                              </div>
                              {slotStats.avgScore !== '-' && (
                                <div style={{ fontSize: 'var(--font-size-base)', color: '#4caf50', marginTop: '4px' }}>
                                  平均分：{slotStats.avgScore}分
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>
            ) : (
              /* 已选择日期时段，显示具体考勤表 */
              <>
                <div className="section" style={{ marginBottom: '20px' }}>
                  <button 
                    className="secondary-btn"
                    onClick={() => {
                      setSelectedSummaryDate(null)
                      setSelectedSummaryTimeSlot(null)
                    }}
                    style={{ marginBottom: '16px' }}
                  >
                    返回列表
                  </button>
                  <h4>考勤汇总 - {selectedSummaryDate} {formatTimeSlot(selectedSummaryTimeSlot)}</h4>
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
                                const dateParts = selectedSummaryDate.split('-')
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
                                    <span>{selectedSummaryTimeSlot === '上午' ? '1、2' : '5、6'}</span>
                                    <span>节</span>
                                    <span style={{ marginLeft: '20px' }}>检查人：</span>
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
                            .filter(r => r.date === selectedSummaryDate && r.timeSlot === selectedSummaryTimeSlot)
                          if (uniqueRecords.length === 0) {
                            return (
                              <tr>
                                <td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                                  暂无汇总数据
                                </td>
                              </tr>
                            )
                          }
                          return uniqueRecords.map((record) => {
                            // 筛选违纪情况，排除迟到
                            const filteredViolations = record.violations.filter(v => v.type !== 'late')
                            
                            // 统计违纪情况
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
              </>
            )}

            <div className="section">
              <h4>违纪照片展示</h4>
              <div className="violation-photos" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '20px',
                padding: '20px 0'
              }}>
                {(() => {
                  // 收集所有违纪记录（有照片和没有照片的），使用去重后的记录
                  let uniqueRecords = getUniqueSupervisionRecords(supervisionRecords);
                  // 如果在汇总报表页面且选择了日期时段，则只显示该时段的照片
                  if (activeTab === 'summary' && selectedSummaryDate && selectedSummaryTimeSlot) {
                    uniqueRecords = uniqueRecords.filter(r => r.date === selectedSummaryDate && r.timeSlot === selectedSummaryTimeSlot);
                  }
                  const allViolations = uniqueRecords.flatMap(record => {
                    return record.violations.map(v => ({
                      ...v,
                      className: record.className,
                      instructor: record.instructor,
                      date: record.date,
                      typeName: violationTypeMap[v.type] || v.type
                    }))
                  }).filter(v => v.type !== 'late'); // 排除迟到
                  
                  if (allViolations.length === 0) {
                    return <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>暂无违纪照片</div>
                  }
                  
                  return allViolations.map((v, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      padding: '10px',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                        {/* 使用示例图片来演示 */}
                        <img 
                          src={`https://picsum.photos/seed/vp${index}/200/200`}
                          alt={`${v.name}的违纪照片`} 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#333', 
                        textAlign: 'center',
                        lineHeight: '1.6'
                      }}>
                        {v.name}<br/>
                        {v.className}<br/>
                        {v.instructor}<br/>
                        {v.date}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>

            <div className="form-actions">
              <button 
                className="secondary-btn" 
                onClick={handleExportExcel}
              >
                导出归档
              </button>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="card">
            <h3>账户管理中心</h3>
            <div className="report-table">
              <table>
                <thead>
                  <tr>
                    <th>账号</th>
                    <th>姓名</th>
                    <th>角色</th>
                    <th>班级/部门</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, index) => {
                    let roleDisplay = ''
                    switch(u.role) {
                      case 'classMonitor': roleDisplay = '学委'; break
                      case 'secretary': roleDisplay = '学习部干事'; break
                      case 'cadre': roleDisplay = '学习部干部'; break
                      case 'vicePresident': roleDisplay = '学生会副会长'; break
                    }
                    return (
                      <tr key={index}>
                        <td>{u.username}</td>
                        <td>{u.name}</td>
                        <td>{roleDisplay}</td>
                        <td>{u.className || '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'super' && (
          <div className="card">
            <h3>超级后台数据</h3>
            
            <div className="section">
              <h4>所有考勤记录 ({getUniqueAttendanceRecords(attendanceRecords).length}条)</h4>
              <div className="report-table" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th colSpan={5} className="table-title">
                        计科院学风建设督查表
                      </th>
                    </tr>
                    <tr>
                      <th>班级</th>
                      <th>教室</th>
                      <th>日期</th>
                      <th>时段</th>
                      <th>提交时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const uniqueRecords = getUniqueAttendanceRecords(attendanceRecords);
                      return uniqueRecords.slice(0, 10).map((record) => (
                        <tr key={record.id}>
                          <td>{record.className}</td>
                          <td>{record.classroom}</td>
                          <td>{record.date}</td>
                          <td>{formatTimeSlot(record.timeSlot)}</td>
                          <td>{new Date(record.submittedAt).toLocaleString('zh-CN')}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="section">
              <h4>所有督查记录 ({getUniqueSupervisionRecords(supervisionRecords).length}条)</h4>
              <div className="report-table" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <table className="standard-table">
                  <thead>
                    <tr>
                      <th colSpan={5} className="table-title">
                        计科院学风建设督查表
                      </th>
                    </tr>
                    <tr>
                      <th>班级</th>
                      <th>教室</th>
                      <th>检查人</th>
                      <th>日期</th>
                      <th>提交时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords);
                      return uniqueRecords.slice(0, 10).map((record) => (
                        <tr key={record.id}>
                          <td>{record.className}</td>
                          <td>{record.classroom}</td>
                          <td>{record.inspector}</td>
                          <td>{record.date}</td>
                          <td>{new Date(record.createdAt).toLocaleString('zh-CN')}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="section">
              <h4>违纪照片展示</h4>
              <div className="violation-photos" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
                gap: '20px',
                padding: '20px 0'
              }}>
                {(() => {
                  // 收集所有违纪记录，使用去重后的记录
                  const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords);
                  const allViolations = uniqueRecords.flatMap(record => {
                    return record.violations.map(v => ({
                      ...v,
                      className: record.className,
                      instructor: record.instructor,
                      date: record.date,
                      typeName: violationTypeMap[v.type] || v.type
                    }))
                  }).filter(v => v.type !== 'late'); // 排除迟到
                  
                  if (allViolations.length === 0) {
                    return <div style={{ textAlign: 'center', color: '#999', padding: '40px' }}>暂无违纪照片</div>
                  }
                  
                  return allViolations.map((v, index) => (
                    <div key={index} style={{ 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '8px', 
                      padding: '10px',
                      backgroundColor: '#fff'
                    }}>
                      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
                        {/* 使用示例图片来演示 */}
                        <img 
                          src={`https://picsum.photos/seed/vp${index}/200/200`}
                          alt={`${v.name}的违纪照片`} 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            objectFit: 'contain',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#333', 
                        textAlign: 'center',
                        lineHeight: '1.6'
                      }}>
                        {v.name}<br/>
                        {v.className}<br/>
                        {v.instructor}<br/>
                        {v.date}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default VicePresident
