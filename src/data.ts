export interface ClassInfo {
  id: string
  name: string
  instructor: string
  count: number
}

export interface User {
  id?: string
  username: string
  password: string
  role: 'classMonitor' | 'secretary' | 'cadre' | 'vicePresident'
  className?: string
  name?: string
}

export const classes: ClassInfo[] = [
  { id: 'dsj2401', name: '大数据2401', instructor: '汪财源', count: 30 },
  { id: 'ds2401', name: '电商2401', instructor: '陈果', count: 36 },
  { id: 'ds2402', name: '电商2402', instructor: '陈果', count: 33 },
  { id: 'ds2403', name: '电商2403', instructor: '陈果', count: 43 },
  { id: 'jw2401', name: '计网2401', instructor: '王浩然', count: 42 },
  { id: 'jw2402', name: '计网2402', instructor: '周焕哲', count: 44 },
  { id: 'jw2403', name: '计网2403', instructor: '王悦', count: 37 },
  { id: 'jw2404', name: '计网2404', instructor: '王悦', count: 37 },
  { id: 'rj2401', name: '软件2401', instructor: '周焕哲', count: 34 },
  { id: 'rj2402', name: '软件2402', instructor: '周焕哲', count: 37 },
  { id: 'sn2401', name: '室内2401', instructor: '王浩然', count: 27 },
  { id: 'sn2402', name: '室内2402', instructor: '王浩然', count: 28 },
  { id: 'sm2401', name: '数媒2401', instructor: '汪财源', count: 26 },
  { id: 'sm2402', name: '数媒2402', instructor: '汪财源', count: 29 },
  { id: 'sm2403', name: '数媒2403', instructor: '汪财源', count: 28 },
  { id: 'wz2401', name: '网直2401', instructor: '汪财源', count: 24 },
  { id: 'dsj2501', name: '大数据2501', instructor: '龚世儒', count: 18 },
  { id: 'ds2501', name: '电商2501', instructor: '黄青', count: 28 },
  { id: 'ds2502', name: '电商2502', instructor: '黄青', count: 28 },
  { id: 'ds2503', name: '电商2503', instructor: '董雨豪', count: 42 },
  { id: 'jw2501', name: '计网2501', instructor: '杨克寒', count: 38 },
  { id: 'jw2502', name: '计网2502', instructor: '杨克寒', count: 37 },
  { id: 'jw2503', name: '计网2503', instructor: '杨克寒', count: 36 },
  { id: 'jw2504', name: '计网2504', instructor: '李家勇', count: 34 },
  { id: 'jw2505', name: '计网2505', instructor: '李家勇', count: 35 },
  { id: 'ai2501', name: 'AI2501', instructor: '龚世儒', count: 40 },
  { id: 'ai2502', name: 'AI2502', instructor: '龚世儒', count: 40 },
  { id: 'rj2501', name: '软件2501', instructor: '李家勇', count: 41 },
  { id: 'sn2501', name: '室内2501', instructor: '金佳玉', count: 26 },
  { id: 'sm2501', name: '数媒2501', instructor: '金佳玉', count: 35 },
  { id: 'sm2502', name: '数媒2502', instructor: '金佳玉', count: 37 },
  { id: 'wz2501', name: '网直2501', instructor: '高岚', count: 36 },
  { id: 'wz2502', name: '网直2502', instructor: '高岚', count: 41 },
  { id: 'wz2503', name: '网直2503', instructor: '董雨豪', count: 42 },
]

export const users: User[] = [
  { username: 'dsj2401', password: '123', role: 'classMonitor', className: '大数据2401' },
  { username: 'ds2401', password: '123', role: 'classMonitor', className: '电商2401' },
  { username: 'ds2402', password: '123', role: 'classMonitor', className: '电商2402' },
  { username: 'ds2403', password: '123', role: 'classMonitor', className: '电商2403' },
  { username: 'jw2401', password: '123', role: 'classMonitor', className: '计网2401' },
  { username: 'jw2402', password: '123', role: 'classMonitor', className: '计网2402' },
  { username: 'jw2403', password: '123', role: 'classMonitor', className: '计网2403' },
  { username: 'jw2404', password: '123', role: 'classMonitor', className: '计网2404' },
  { username: 'rj2401', password: '123', role: 'classMonitor', className: '软件2401' },
  { username: 'rj2402', password: '123', role: 'classMonitor', className: '软件2402' },
  { username: 'sn2401', password: '123', role: 'classMonitor', className: '室内2401' },
  { username: 'sn2402', password: '123', role: 'classMonitor', className: '室内2402' },
  { username: 'sm2401', password: '123', role: 'classMonitor', className: '数媒2401' },
  { username: 'sm2402', password: '123', role: 'classMonitor', className: '数媒2402' },
  { username: 'sm2403', password: '123', role: 'classMonitor', className: '数媒2403' },
  { username: 'wz2401', password: '123', role: 'classMonitor', className: '网直2401' },
  { username: 'dsj2501', password: '123', role: 'classMonitor', className: '大数据2501' },
  { username: 'ds2501', password: '123', role: 'classMonitor', className: '电商2501' },
  { username: 'ds2502', password: '123', role: 'classMonitor', className: '电商2502' },
  { username: 'ds2503', password: '123', role: 'classMonitor', className: '电商2503' },
  { username: 'jw2501', password: '123', role: 'classMonitor', className: '计网2501' },
  { username: 'jw2502', password: '123', role: 'classMonitor', className: '计网2502' },
  { username: 'jw2503', password: '123', role: 'classMonitor', className: '计网2503' },
  { username: 'jw2504', password: '123', role: 'classMonitor', className: '计网2504' },
  { username: 'jw2505', password: '123', role: 'classMonitor', className: '计网2505' },
  { username: 'ai2501', password: '123', role: 'classMonitor', className: 'AI2501' },
  { username: 'ai2502', password: '123', role: 'classMonitor', className: 'AI2502' },
  { username: 'rj2501', password: '123', role: 'classMonitor', className: '软件2501' },
  { username: 'sn2501', password: '123', role: 'classMonitor', className: '室内2501' },
  { username: 'sm2501', password: '123', role: 'classMonitor', className: '数媒2501' },
  { username: 'sm2502', password: '123', role: 'classMonitor', className: '数媒2502' },
  { username: 'wz2501', password: '123', role: 'classMonitor', className: '网直2501' },
  { username: 'wz2502', password: '123', role: 'classMonitor', className: '网直2502' },
  { username: 'wz2503', password: '123', role: 'classMonitor', className: '网直2503' },
  { username: 'wt', password: '666', role: 'secretary', name: '王婷' },
  { username: 'wsx', password: '666', role: 'secretary', name: '王帅鑫' },
  { username: 'wcc', password: '666', role: 'secretary', name: '吴川川' },
  { username: 'chr', password: '666', role: 'secretary', name: '陈皓然' },
  { username: 'dyh', password: '666', role: 'secretary', name: '杜雨含' },
  { username: 'yxl', password: '666', role: 'secretary', name: '袁晓灵' },
  { username: 'lhy', password: '666', role: 'secretary', name: '刘宏玥' },
  { username: 'zjd', password: '666', role: 'secretary', name: '钟建党' },
  { username: 'dss', password: '666', role: 'secretary', name: '邓霜霜' },
  { username: 'tjy', password: '666', role: 'secretary', name: '田佳钰' },
  { username: 'yx', password: '666', role: 'secretary', name: '袁祥' },
  { username: 'zxy', password: '666', role: 'secretary', name: '周新月' },
  { username: 'dt', password: '888', role: 'cadre', name: '邓婷' },
  { username: 'lx', password: '888', role: 'cadre', name: '罗霞' },
  { username: 'lsy', password: '888', role: 'cadre', name: '李双艳' },
  { username: 'xh', password: 'xu123', role: 'vicePresident', name: '徐航' },
]

export const findUser = (username: string, password: string): User | undefined => {
  return users.find(u => u.username === username && u.password === password)
}

export const getClassInfo = (className: string): ClassInfo | undefined => {
  return classes.find(c => c.name === className)
}

export let classroomsByFloor = {
  '9F': ['903', '904'],
  '6-8F': [],
  '5F': ['501', '502', '503', '504', '505', '506', '507'],
  '4F': ['401', '402', '403', '404', '405', '406'],
  '3F': ['301', '302', '303', '304', '305', '307'],
  '2F': ['202', '204', '207a', '207b', '208', '209', '210a', '210b'],
}

// 新增教室
export const addClassroom = (floorName: string, roomNumber: string) => {
  if (!classroomsByFloor[floorName]) {
    classroomsByFloor[floorName] = []
  }
  if (!classroomsByFloor[floorName].includes(roomNumber)) {
    classroomsByFloor[floorName].push(roomNumber)
    saveClassroomsToStorage()
  }
}

// 从localStorage加载自定义教室
const loadClassroomsFromStorage = () => {
  try {
    const savedClassrooms = localStorage.getItem('customClassrooms')
    if (savedClassrooms) {
      const customClassrooms = JSON.parse(savedClassrooms)
      Object.keys(customClassrooms).forEach(floor => {
        if (!classroomsByFloor[floor]) {
          classroomsByFloor[floor] = []
        }
        customClassrooms[floor].forEach((room: string) => {
          if (!classroomsByFloor[floor].includes(room)) {
            classroomsByFloor[floor].push(room)
          }
        })
      })
    }
  } catch (e) {
    console.error('Failed to load custom classrooms from localStorage:', e)
  }
}

// 保存自定义教室到localStorage
const saveClassroomsToStorage = () => {
  try {
    const customClassrooms: Record<string, string[]> = {}
    Object.keys(classroomsByFloor).forEach(floor => {
      const standardRooms = {
        '9F': ['903', '904'],
        '6-8F': [],
        '5F': ['501', '502', '503', '504', '505', '506', '507'],
        '4F': ['401', '402', '403', '404', '405', '406'],
        '3F': ['301', '302', '303', '304', '305', '307'],
        '2F': ['202', '204', '207a', '207b', '208', '209', '210a', '210b'],
      }[floor] || []
      
      const customRooms = classroomsByFloor[floor].filter(room => !standardRooms.includes(room))
      if (customRooms.length > 0) {
        customClassrooms[floor] = customRooms
      }
    })
    localStorage.setItem('customClassrooms', JSON.stringify(customClassrooms))
  } catch (e) {
    console.error('Failed to save custom classrooms to localStorage:', e)
  }
}

// 初始化时加载自定义教室
loadClassroomsFromStorage()

// 学生姓名信息接口
export interface StudentNameInfo {
  name: string
}

// 请假学生信息接口
export interface LeaveStudentInfo {
  name: string
  hasPhoto: boolean
  specialNote?: string
}

// 提交阶段类型
export type SubmissionStage = 'initial' | 'late' | 'absent' | 'update'

// 通知接口
export interface Notification {
  id: string
  type: 'attendance_update' | 'late_update' | 'absent_update'
  className: string
  message: string
  timestamp: string
  isRead: boolean
}

// 全局考勤记录接口
export interface AttendanceRecord {
  id: string
  date: string
  timeSlot: string
  classroom: string
  className: string
  instructor: string
  present: string
  leave: string
  late: string
  absent: string
  submittedAt: string
  source: 'classMonitor' | 'secretary'
  stage: SubmissionStage
  leaveStudents?: LeaveStudentInfo[]
  lateStudents?: StudentNameInfo[]
  absentStudents?: StudentNameInfo[]
}

// 督查表记录接口
export interface SupervisionRecord {
  id: string
  date: string
  timeSlot: string
  classroom: string
  className: string
  instructor: string
  inspector: string
  leaveVerified: boolean
  violations: { name: string; type: string; photo?: string }[]
  score: number
  status: 'draft' | 'submitted'
  createdAt: string
  // 学委考勤信息
  classAttendance?: {
    shouldAttend: number
    present: number
    leave: number
    late: number
    absent: number
  }
}

// 全局数据存储
let attendanceRecords: AttendanceRecord[] = []
let supervisionRecords: SupervisionRecord[] = []

// 从 localStorage 加载数据
const loadFromStorage = () => {
  try {
    const savedAttendance = localStorage.getItem('attendanceRecords')
    const savedSupervision = localStorage.getItem('supervisionRecords')
    if (savedAttendance) attendanceRecords = JSON.parse(savedAttendance)
    if (savedSupervision) supervisionRecords = JSON.parse(savedSupervision)
  } catch (e) {
    console.error('Failed to load data from localStorage:', e)
  }
}

// 通知列表
let notifications: Notification[] = []

// 初始化时加载数据
loadFromStorage()
try {
  const savedNotifications = localStorage.getItem('notifications')
  if (savedNotifications) notifications = JSON.parse(savedNotifications)
} catch (e) {
  console.error('Failed to load notifications from localStorage:', e)
}

// 保存到 localStorage
const saveToStorage = () => {
  try {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords))
    localStorage.setItem('supervisionRecords', JSON.stringify(supervisionRecords))
    localStorage.setItem('notifications', JSON.stringify(notifications))
  } catch (e) {
    console.error('Failed to save data to localStorage:', e)
  }
}

// 保存考勤记录
export const saveAttendanceRecord = (record: AttendanceRecord) => {
  const existingIndex = attendanceRecords.findIndex(r => r.id === record.id)
  if (existingIndex >= 0) {
    attendanceRecords[existingIndex] = record
  } else {
    attendanceRecords.unshift(record)
  }
  saveToStorage()
}

// 获取所有考勤记录
export const getAttendanceRecords = () => [...attendanceRecords]

// 按教室和时段获取考勤记录
export const getAttendanceByClassroom = (classroom: string, date?: string, timeSlot?: string) => {
  return attendanceRecords.filter(r => {
    let match = r.classroom === classroom
    if (date) match = match && r.date === date
    if (timeSlot) match = match && r.timeSlot === timeSlot
    return match
  })
}

// 获取某班级今天的考勤记录
export const getTodayAttendanceByClass = (className: string) => {
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
  return attendanceRecords.filter(r => r.className === className && r.date === today)
}

// 添加通知
export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
  const newNotification: Notification = {
    ...notification,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    isRead: false
  }
  notifications.unshift(newNotification)
  saveToStorage()
  return newNotification
}

// 获取通知
export const getNotifications = () => [...notifications]

// 标记通知为已读
export const markNotificationAsRead = (id: string) => {
  const notification = notifications.find(n => n.id === id)
  if (notification) {
    notification.isRead = true
    saveToStorage()
  }
}

// 获取未读通知数量
export const getUnreadNotificationCount = () => {
  return notifications.filter(n => !n.isRead).length
}

// 保存督查记录 - 暂时不保存照片到localStorage（文件太大）
export const saveSupervisionRecord = (record: SupervisionRecord) => {
  const existingIndex = supervisionRecords.findIndex(r => r.id === record.id)
  const recordToSave = { ...record }
  
  // 移除照片数据（File对象无法存储到localStorage）
  recordToSave.violations = record.violations.map(v => {
    const vCopy = { ...v }
    delete vCopy.photo
    return vCopy
  })
  
  if (existingIndex >= 0) {
    supervisionRecords[existingIndex] = recordToSave
  } else {
    supervisionRecords.unshift(recordToSave)
  }
  saveToStorage()
}

// 获取所有督查记录
export const getSupervisionRecords = () => [...supervisionRecords]

// 检查某个教室在指定日期时段是否已提交督查
export const isClassroomChecked = (classroom: string, date: string, timeSlot: string) => {
  return supervisionRecords.some(r => 
    r.classroom === classroom && 
    r.date === date && 
    r.timeSlot === timeSlot
  )
}

// 对考勤记录去重，每个班级只保留最新的一条记录
export const getUniqueAttendanceRecords = (records: AttendanceRecord[]) => {
  const map = new Map<string, AttendanceRecord>()
  records.forEach(record => {
    const key = `${record.className}-${record.date}-${record.timeSlot}`
    const existing = map.get(key)
    if (!existing || new Date(record.submittedAt) > new Date(existing.submittedAt)) {
      map.set(key, record)
    }
  })
  return Array.from(map.values())
}

// 异常记录类型
export type AnomalyType = 'not_in_classroom' | 'leave_change' | 'late_change' | 'absent_change' | 'present_change'

// 异常学生信息
export interface AnomalyStudent {
  name: string
  photo?: File
  hasPhoto: boolean
}

// 异常记录接口
export interface AnomalyRecord {
  id: string
  date: string
  timeSlot: string
  classroom: string
  className: string
  instructor: string
  inspector: string
  type: AnomalyType
  // 原始数据
  originalData: {
    present: string
    leave: string
    late: string
    absent: string
  }
  // 编辑后数据
  editedData: {
    present: string
    leave: string
    late: string
    absent: string
    notInClassroom: string
  }
  // 各类异常学生
  leaveStudents: AnomalyStudent[]
  lateStudents: AnomalyStudent[]
  absentStudents: AnomalyStudent[]
  notInClassroomStudents: AnomalyStudent[]
  // 未在教室原因
  notInClassroomReason: string
  // 原因详情
  reason: string
  createdAt: string
  hasAnomaly: boolean
}

// 异常记录存储
let anomalyRecords: AnomalyRecord[] = []

// 异常统计记录（按日期）
interface AnomalyDayStats {
  date: string
  count: number
  lastResetTime: string
}

let anomalyDayStats: AnomalyDayStats[] = []

// 从 localStorage 加载异常数据
const loadAnomaliesFromStorage = () => {
  try {
    const savedAnomalies = localStorage.getItem('anomalyRecords')
    const savedStats = localStorage.getItem('anomalyDayStats')
    if (savedAnomalies) anomalyRecords = JSON.parse(savedAnomalies)
    if (savedStats) anomalyDayStats = JSON.parse(savedStats)
  } catch (e) {
    console.error('Failed to load anomaly data from localStorage:', e)
  }
}

// 初始化加载异常数据
loadAnomaliesFromStorage()

// 保存异常数据到 localStorage
const saveAnomaliesToStorage = () => {
  try {
    localStorage.setItem('anomalyRecords', JSON.stringify(anomalyRecords))
    localStorage.setItem('anomalyDayStats', JSON.stringify(anomalyDayStats))
  } catch (e) {
    console.error('Failed to save anomaly data to localStorage:', e)
  }
}

// 检查并重置每日统计（12:00和24:00重置）
const checkAndResetDailyStats = (currentDate: string) => {
  const now = new Date()
  const currentHour = now.getHours()
  
  // 查找当天的统计记录
  let dayStat = anomalyDayStats.find(stat => stat.date === currentDate)
  
  if (dayStat) {
    const lastReset = new Date(dayStat.lastResetTime)
    const lastResetHour = lastReset.getHours()
    
    // 如果是12点后且上次重置在12点前，或24点后，重置计数
    if ((currentHour >= 12 && lastResetHour < 12) || currentHour === 0) {
      dayStat.count = 0
      dayStat.lastResetTime = now.toISOString()
      saveAnomaliesToStorage()
    }
  } else {
    // 没有当天记录，创建新记录
    dayStat = {
      date: currentDate,
      count: 0,
      lastResetTime: now.toISOString()
    }
    anomalyDayStats.push(dayStat)
    saveAnomaliesToStorage()
  }
  
  return dayStat
}

// 保存异常记录
export const saveAnomalyRecord = (record: AnomalyRecord) => {
  const existingIndex = anomalyRecords.findIndex(r => r.id === record.id)
  const recordToSave = { ...record }
  
  // 移除照片数据
  const cleanStudent = (s: AnomalyStudent) => {
    const sCopy = { ...s }
    delete sCopy.photo
    return sCopy
  }
  recordToSave.leaveStudents = recordToSave.leaveStudents.map(cleanStudent)
  recordToSave.lateStudents = recordToSave.lateStudents.map(cleanStudent)
  recordToSave.absentStudents = recordToSave.absentStudents.map(cleanStudent)
  recordToSave.notInClassroomStudents = recordToSave.notInClassroomStudents.map(cleanStudent)
  
  if (existingIndex >= 0) {
    anomalyRecords[existingIndex] = recordToSave
  } else {
    anomalyRecords.unshift(recordToSave)
  }
  
  // 如果是新的异常记录，增加当日统计
  if (existingIndex < 0 && record.hasAnomaly) {
    const dayStat = checkAndResetDailyStats(record.date)
    dayStat.count++
  }
  
  saveAnomaliesToStorage()
}

// 获取所有异常记录
export const getAnomalyRecords = () => [...anomalyRecords]

// 获取指定日期的异常记录
export const getAnomalyRecordsByDate = (date: string) => {
  return anomalyRecords.filter(r => r.date === date)
}

// 获取当日异常数
export const getTodayAnomalyCount = () => {
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
  checkAndResetDailyStats(today)
  const dayStat = anomalyDayStats.find(stat => stat.date === today)
  return dayStat?.count || 0
}

// 对督查记录去重，每个班级只保留最新的一条记录
export const getUniqueSupervisionRecords = (records: SupervisionRecord[]) => {
  const map = new Map<string, SupervisionRecord>()
  records.forEach(record => {
    const key = `${record.className}-${record.date}-${record.timeSlot}`
    const existing = map.get(key)
    if (!existing || new Date(record.createdAt) > new Date(existing.createdAt)) {
      map.set(key, record)
    }
  })
  return Array.from(map.values())
}
