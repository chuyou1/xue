import { useState, useEffect } from 'react'
import '../styles/Secretary.css'
import { User, classroomsByFloor, getAttendanceByClassroom, AttendanceRecord as GlobalAttendanceRecord, classes, saveSupervisionRecord, SupervisionRecord, getSupervisionRecords, isClassroomChecked, getUniqueAttendanceRecords, getUniqueSupervisionRecords } from '../data'
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

  // 获取显示的时段信息（星期几第几节）
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

  // 初始化当前日期和时段
  useEffect(() => {
    const now = new Date()
    const date = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
    const timeSlot = now.getHours() < 12 ? '上午' : '下午'
    setCurrentDate(date)
    setCurrentTimeSlot(timeSlot)
    setCurrentDisplayTimeSlot(getDisplayTimeSlot())
    
    // 加载督查记录
    setSupervisionRecords(getSupervisionRecords())
  }, [])

  // 提交成功后刷新记录
  useEffect(() => {
    if (activeTab === 'report') {
      setSupervisionRecords(getSupervisionRecords())
    }
  }, [activeTab])

  // 当选择教室时，加载该教室的考勤记录
  useEffect(() => {
    if (selectedClassroom && currentDate && currentTimeSlot) {
      const records = getAttendanceByClassroom(selectedClassroom.number, currentDate, currentTimeSlot)
      setClassAttendanceRecords(records)
    }
  }, [selectedClassroom, currentDate, currentTimeSlot])

  const toggleFloor = (floorName: string) => {
    setExpandedFloor(expandedFloor === floorName ? null : floorName)
  }

  const selectClassroom = (classroom: Classroom) => {
    setSelectedClassroom(classroom)
    setActiveTab('detail')
    setViolations([])
    setLeaveVerified(false)
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

  const calculateScore = () => {
    let score = 100
    violations.forEach(v => {
      if (v.type === 'absent') {
      } else {
        score -= 0.5
      }
    })
    return score
  }

  const handleSubmit = () => {
    if (!selectedClassroom) {
      showModal({
        title: '提示',
        message: '请先选择教室！',
        type: 'warning'
      });
      return;
    }

    if (!inspector) {
      showModal({
        title: '提示',
        message: '请填写检查人姓名！',
        type: 'warning'
      });
      return;
    }

    // 检查违纪记录
    for (let i = 0; i < violations.length; i++) {
      const v = violations[i];
      if (!v.name || v.name.trim() === '') {
        showModal({
          title: '提示',
          message: `第 ${i + 1} 条违纪记录的学生姓名未填写！`,
          type: 'warning'
        });
        return;
      }
      // 检查是否上传了违纪照片
      if (!v.hasPhoto) {
        showModal({
          title: '警告',
          message: `请上传第 ${i + 1} 条违纪记录（${v.name}）的违纪情况图片！`,
          type: 'warning'
        });
        return;
      }
    }

    // 获取班级信息
    const classRecord = classAttendanceRecords[0];
    
    const doSubmit = () => {
      // 从学委考勤记录中提取信息
      let classAttendanceInfo
      if (classRecord) {
        classAttendanceInfo = {
          shouldAttend: (parseInt(classRecord.present) || 0) + (parseInt(classRecord.leave) || 0),
          present: parseInt(classRecord.present) || 0,
          leave: parseInt(classRecord.leave) || 0,
          late: parseInt(classRecord.late) || 0,
          absent: parseInt(classRecord.absent) || 0
        }
      }

      // 创建督查记录
      const newRecord: SupervisionRecord = {
        id: Date.now().toString(),
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
      };

      // 保存到全局存储
      saveSupervisionRecord(newRecord);
      
      showModal({
        title: '成功',
        message: '督查记录提交成功！',
        type: 'success'
      });
      
      // 重置表单
      setViolations([]);
      setLeaveVerified(false);
      // 刷新记录 - 触发重新渲染，更新教室状态
      setSupervisionRecords([...getSupervisionRecords()]);
    };

    if (!classRecord) {
      showModal({
        title: '警告',
        message: '该教室暂无学委提交的考勤记录，是否继续提交？',
        type: 'warning',
        showCancel: true,
        onConfirm: doSubmit
      });
    } else {
      doSubmit();
    }
  };

  const handleExportExcel = () => {
    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords);
    if (uniqueRecords.length === 0) {
      showModal({
        title: '提示',
        message: '暂无督查记录可导出！',
        type: 'warning'
      });
      return;
    }
    
    const filename = `督查记录表_${currentDate}_${currentTimeSlot}.xlsx`;
    exportSupervisionRecordsToExcel(uniqueRecords, filename, {
      date: currentDate,
      timeSlot: currentDisplayTimeSlot,
      inspector: inspector || '未填写'
    });
  };

  return (
    <div className="page-container">
      <header className="header">
        <div className="header-content">
          <h2>计科院学风建设督查系统 - 学习部干事</h2>
          {user.name && <span style={{ color: '#666', marginRight: '16px' }}>欢迎，{user.name}</span>}
          <button className="logout-btn" onClick={onLogout}>退出登录</button>
        </div>
      </header>

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

      <main className="main-content">
        {activeTab === 'classrooms' && (
          <div className="card">
            <div className="floor-controls">
              <div className="form-group">
                <label>督查检查人</label>
                <input
                  type="text"
                  value={inspector}
                  onChange={(e) => setInspector(e.target.value)}
                  placeholder="请输入检查人姓名"
                />
              </div>
            </div>

            <div className="floors-list">
              {Object.entries(classroomsByFloor).map(([floorName, rooms]) => (
                <div key={floorName} className="floor-item">
                  <div
                    className={`floor-header ${expandedFloor === floorName ? 'expanded' : ''}`}
                    onClick={() => toggleFloor(floorName)}
                  >
                    <span className="floor-name">{floorName}</span>
                  </div>
                  {expandedFloor === floorName && (
                    <div className="classrooms-grid">
                      {rooms.map((room) => {
                        const checked = isClassroomChecked(room, currentDate, currentTimeSlot)
                        return (
                          <div
                            key={room}
                            className="classroom-item"
                            onClick={() => selectClassroom({ id: room, floor: floorName, number: room, status: checked ? 'submitted' : 'pending' })}
                            style={{
                              backgroundColor: checked ? '#e8f5e9' : 'white',
                              borderColor: checked ? '#4caf50' : '#e0e0e0'
                            }}
                          >
                            {room}
                            <span 
                              className="status-badge" 
                              style={{ color: checked ? '#4caf50' : '#999', fontWeight: checked ? 'bold' : 'normal' }}
                            >
                              {checked ? '已查' : '未查'}
                            </span>
                          </div>
                        )
                      })}
                      {(floorName === '9F' || floorName === '6-8F') && (
                        <button className="add-classroom-btn">+ 新增教室</button>
                      )}
                      {rooms.length === 0 && (
                        <div className="empty-state">该楼层可添加教室</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="leave-verified-section-bottom">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={leaveVerified}
                  onChange={(e) => setLeaveVerified(e.target.checked)}
                />
                请假条均已核实
              </label>
            </div>
          </div>
        )}

        {activeTab === 'detail' && selectedClassroom && (
          <div className="card">
            <h3>{selectedClassroom.number} - 考勤详情</h3>
            <div className="section">
              <div className="info-row" style={{ marginBottom: '16px' }}>
                <span>日期：{currentDate}</span>
                <span>时段：{currentTimeSlot}</span>
              </div>
            </div>
            
            <div className="section">
              <h4>学委考勤核对</h4>
              <div className="attendance-preview">
                {(() => {
                  const uniqueRecords = getUniqueAttendanceRecords(classAttendanceRecords);
                  if (uniqueRecords.length === 0) {
                    return (
                      <div className="info-row" style={{ color: '#999' }}>
                        暂无该教室考勤数据
                      </div>
                    );
                  }
                  return uniqueRecords.map((record) => {
                    const classInfo = classes.find(c => c.name === record.className);
                    const leave = parseInt(record.leave) || 0;
                    const late = parseInt(record.late) || 0;
                    const absent = parseInt(record.absent) || 0;
                    
                    return (
                      <div key={record.id} className="attendance-record-card">
                        <div className="record-header">
                          <span className="class-name">{record.className}</span>
                          <span className="instructor">辅导员：{record.instructor}</span>
                        </div>
                        <div className="record-details">
                          <div className="detail-item">
                            <span className="label">应到：</span>
                            <span className="value">{classInfo?.count || (parseInt(record.present) || 0) + leave}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">实到：</span>
                            <span className="value">{record.present}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">请假：</span>
                            <span className="value">{leave || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">迟到：</span>
                            <span className="value">{late || '-'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">旷课：</span>
                            <span className="value">{absent || '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="section">
              <h4>违纪与扣分登记</h4>
              <div className="violations-list">
                {violations.length === 0 && (
                  <div style={{ color: '#999', padding: '20px 0' }}>暂无违纪记录</div>
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
                      <option value="absent">旷课</option>
                    </select>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => handleFileChange(index, e)} 
                    />
                    {!violation.hasPhoto && <span style={{ color: '#e74c3c', fontSize: 'var(--font-size-base)' }}>（需上传照片）</span>}
                    <button className="remove-btn" onClick={() => removeViolation(index)}>删除</button>
                  </div>
                ))}
                <button className="add-violation-btn" onClick={addViolation}>+ 添加违纪记录</button>
              </div>
            </div>

            <div className="section">
              <h4>学风分数</h4>
              <div className="score-display">
                <span className="score-label">班级学风分数：</span>
                <span className="score-value" style={{ color: '#333' }}>{calculateScore()}</span>
                <span className="score-unit">分</span>
              </div>
            </div>

            <div className="form-actions">
              <button className="submit-btn" onClick={handleSubmit}>提交督查</button>
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
                        <span>{inspector || '未填写'}</span>
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
                    const uniqueRecords = getUniqueSupervisionRecords(supervisionRecords);
                    if (uniqueRecords.length === 0) {
                      return (
                        <tr>
                          <td colSpan={9} style={{ textAlign: 'center', color: '#999', padding: '40px' }}>
                            暂无督查记录
                          </td>
                        </tr>
                      );
                    }
                    return uniqueRecords.map((record) => {
                      // 筛选违纪情况，排除迟到
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
                              // 按违纪类型统计人数
                              const typeCount: { [key: string]: number } = {}
                              filteredViolations.forEach(v => {
                                const type = violationTypeMap[v.type] || v.type
                                typeCount[type] = (typeCount[type] || 0) + 1
                              })
                              // 转换为显示格式
                              return Object.entries(typeCount)
                                .map(([type, count]) => `${type}：${count}`)
                                .join('，')
                            })()}
                          </td>
                          <td>{record.score}分</td>
                        </tr>
                      )
                    });
                  })()}
                </tbody>
              </table>
            </div>
            <div className="form-actions">
              <button 
                className="secondary-btn" 
                onClick={handleExportExcel}
              >
                导出 Excel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Secretary
