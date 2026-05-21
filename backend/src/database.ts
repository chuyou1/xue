import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = path.join(__dirname, '../data')

interface User {
  id: string
  username: string
  password: string
  role: 'classMonitor' | 'secretary' | 'cadre' | 'vicePresident'
  className?: string
  name?: string
}

interface ClassInfo {
  id: string
  name: string
  instructor: string
  department: string
  count: number
}

interface AttendanceRecord {
  id: string
  date: string
  timeSlot: string
  classroom: string
  present: string
  leave: string
  late?: string
  absent?: string
  submittedAt: string
  stage: string
  leaveStudents?: any[]
  lateStudents?: any[]
  absentStudents?: any[]
  className: string
  instructor?: string
  source: string
}

interface SupervisionRecord {
  id: string
  date: string
  timeSlot: string
  classroom: string
  className?: string
  instructor?: string
  inspector: string
  leaveVerified: boolean
  violations: any[]
  score: number
  status: string
  createdAt: string
  classAttendance?: any
}

interface Notification {
  id: string
  type: string
  className?: string
  message: string
  timestamp: string
  isRead: boolean
}

interface AnomalyRecord {
  id: string
  date: string
  timeSlot: string
  classroom: string
  className: string
  instructor?: string
  inspector: string
  type: string
  originalData?: any
  editedData?: any
  leaveStudents?: any[]
  lateStudents?: any[]
  absentStudents?: any[]
  notInClassroomStudents?: any[]
  notInClassroomReason?: string
  reason: string
  createdAt: string
  hasAnomaly: boolean
}

interface ImageRecord {
  id: string
  filename: string
  originalName: string
  url: string
  createdAt: string
}

interface Database {
  users: User[]
  classes: ClassInfo[]
  attendance: AttendanceRecord[]
  supervision: SupervisionRecord[]
  notifications: Notification[]
  anomalies: AnomalyRecord[]
  images: ImageRecord[]
}

let db: Database = {
  users: [],
  classes: [],
  attendance: [],
  supervision: [],
  notifications: [],
  anomalies: [],
  images: []
}

export async function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  const dbPath = path.join(DB_DIR, 'database.json')
  
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf-8')
    db = JSON.parse(data)
  } else {
    await initDefaultData()
    saveDB()
  }

  console.log('数据库初始化完成')
}

async function initDefaultData() {
  const hashedPassword123 = await bcrypt.hash('123', 10)
  const hashedPassword666 = await bcrypt.hash('666', 10)
  const hashedPassword888 = await bcrypt.hash('888', 10)
  const hashedPasswordXu123 = await bcrypt.hash('xu123', 10)
  
  db.users = [
    { id: 'dsj2401', username: 'dsj2401', password: hashedPassword123, role: 'classMonitor', className: '大数据2401' },
    { id: 'ds2401', username: 'ds2401', password: hashedPassword123, role: 'classMonitor', className: '电商2401' },
    { id: 'ds2402', username: 'ds2402', password: hashedPassword123, role: 'classMonitor', className: '电商2402' },
    { id: 'ds2403', username: 'ds2403', password: hashedPassword123, role: 'classMonitor', className: '电商2403' },
    { id: 'jw2401', username: 'jw2401', password: hashedPassword123, role: 'classMonitor', className: '计网2401' },
    { id: 'jw2402', username: 'jw2402', password: hashedPassword123, role: 'classMonitor', className: '计网2402' },
    { id: 'jw2403', username: 'jw2403', password: hashedPassword123, role: 'classMonitor', className: '计网2403' },
    { id: 'jw2404', username: 'jw2404', password: hashedPassword123, role: 'classMonitor', className: '计网2404' },
    { id: 'rj2401', username: 'rj2401', password: hashedPassword123, role: 'classMonitor', className: '软件2401' },
    { id: 'rj2402', username: 'rj2402', password: hashedPassword123, role: 'classMonitor', className: '软件2402' },
    { id: 'sn2401', username: 'sn2401', password: hashedPassword123, role: 'classMonitor', className: '室内2401' },
    { id: 'sn2402', username: 'sn2402', password: hashedPassword123, role: 'classMonitor', className: '室内2402' },
    { id: 'sm2401', username: 'sm2401', password: hashedPassword123, role: 'classMonitor', className: '数媒2401' },
    { id: 'sm2402', username: 'sm2402', password: hashedPassword123, role: 'classMonitor', className: '数媒2402' },
    { id: 'sm2403', username: 'sm2403', password: hashedPassword123, role: 'classMonitor', className: '数媒2403' },
    { id: 'wz2401', username: 'wz2401', password: hashedPassword123, role: 'classMonitor', className: '网直2401' },
    { id: 'dsj2501', username: 'dsj2501', password: hashedPassword123, role: 'classMonitor', className: '大数据2501' },
    { id: 'ds2501', username: 'ds2501', password: hashedPassword123, role: 'classMonitor', className: '电商2501' },
    { id: 'ds2502', username: 'ds2502', password: hashedPassword123, role: 'classMonitor', className: '电商2502' },
    { id: 'ds2503', username: 'ds2503', password: hashedPassword123, role: 'classMonitor', className: '电商2503' },
    { id: 'jw2501', username: 'jw2501', password: hashedPassword123, role: 'classMonitor', className: '计网2501' },
    { id: 'jw2502', username: 'jw2502', password: hashedPassword123, role: 'classMonitor', className: '计网2502' },
    { id: 'jw2503', username: 'jw2503', password: hashedPassword123, role: 'classMonitor', className: '计网2503' },
    { id: 'jw2504', username: 'jw2504', password: hashedPassword123, role: 'classMonitor', className: '计网2504' },
    { id: 'jw2505', username: 'jw2505', password: hashedPassword123, role: 'classMonitor', className: '计网2505' },
    { id: 'ai2501', username: 'ai2501', password: hashedPassword123, role: 'classMonitor', className: 'AI2501' },
    { id: 'ai2502', username: 'ai2502', password: hashedPassword123, role: 'classMonitor', className: 'AI2502' },
    { id: 'rj2501', username: 'rj2501', password: hashedPassword123, role: 'classMonitor', className: '软件2501' },
    { id: 'sn2501', username: 'sn2501', password: hashedPassword123, role: 'classMonitor', className: '室内2501' },
    { id: 'sm2501', username: 'sm2501', password: hashedPassword123, role: 'classMonitor', className: '数媒2501' },
    { id: 'sm2502', username: 'sm2502', password: hashedPassword123, role: 'classMonitor', className: '数媒2502' },
    { id: 'wz2501', username: 'wz2501', password: hashedPassword123, role: 'classMonitor', className: '网直2501' },
    { id: 'wz2502', username: 'wz2502', password: hashedPassword123, role: 'classMonitor', className: '网直2502' },
    { id: 'wz2503', username: 'wz2503', password: hashedPassword123, role: 'classMonitor', className: '网直2503' },
    { id: 'wt', username: 'wt', password: hashedPassword666, role: 'secretary', name: '王婷' },
    { id: 'wsx', username: 'wsx', password: hashedPassword666, role: 'secretary', name: '王帅鑫' },
    { id: 'wcc', username: 'wcc', password: hashedPassword666, role: 'secretary', name: '吴川川' },
    { id: 'chr', username: 'chr', password: hashedPassword666, role: 'secretary', name: '陈皓然' },
    { id: 'dyh', username: 'dyh', password: hashedPassword666, role: 'secretary', name: '杜雨含' },
    { id: 'yxl', username: 'yxl', password: hashedPassword666, role: 'secretary', name: '袁晓灵' },
    { id: 'lhy', username: 'lhy', password: hashedPassword666, role: 'secretary', name: '刘宏玥' },
    { id: 'zjd', username: 'zjd', password: hashedPassword666, role: 'secretary', name: '钟建党' },
    { id: 'dss', username: 'dss', password: hashedPassword666, role: 'secretary', name: '邓霜霜' },
    { id: 'tjy', username: 'tjy', password: hashedPassword666, role: 'secretary', name: '田佳钰' },
    { id: 'yx', username: 'yx', password: hashedPassword666, role: 'secretary', name: '袁祥' },
    { id: 'zxy', username: 'zxy', password: hashedPassword666, role: 'secretary', name: '周新月' },
    { id: 'dt', username: 'dt', password: hashedPassword888, role: 'cadre', name: '邓婷' },
    { id: 'lx', username: 'lx', password: hashedPassword888, role: 'cadre', name: '罗霞' },
    { id: 'lsy', username: 'lsy', password: hashedPassword888, role: 'cadre', name: '李双艳' },
    { id: 'xh', username: 'xh', password: hashedPasswordXu123, role: 'vicePresident', name: '徐航' }
  ]

  db.classes = [
    { id: 'dsj2401', name: '大数据2401', instructor: '汪财源', department: '计算机科学与技术', count: 30 },
    { id: 'ds2401', name: '电商2401', instructor: '陈果', department: '计算机科学与技术', count: 36 },
    { id: 'ds2402', name: '电商2402', instructor: '陈果', department: '计算机科学与技术', count: 33 },
    { id: 'ds2403', name: '电商2403', instructor: '陈果', department: '计算机科学与技术', count: 43 },
    { id: 'jw2401', name: '计网2401', instructor: '王浩然', department: '计算机科学与技术', count: 42 },
    { id: 'jw2402', name: '计网2402', instructor: '周焕哲', department: '计算机科学与技术', count: 44 },
    { id: 'jw2403', name: '计网2403', instructor: '王悦', department: '计算机科学与技术', count: 37 },
    { id: 'jw2404', name: '计网2404', instructor: '王悦', department: '计算机科学与技术', count: 37 },
    { id: 'rj2401', name: '软件2401', instructor: '周焕哲', department: '计算机科学与技术', count: 34 },
    { id: 'rj2402', name: '软件2402', instructor: '周焕哲', department: '计算机科学与技术', count: 37 },
    { id: 'sn2401', name: '室内2401', instructor: '王浩然', department: '计算机科学与技术', count: 27 },
    { id: 'sn2402', name: '室内2402', instructor: '王浩然', department: '计算机科学与技术', count: 28 },
    { id: 'sm2401', name: '数媒2401', instructor: '汪财源', department: '计算机科学与技术', count: 26 },
    { id: 'sm2402', name: '数媒2402', instructor: '汪财源', department: '计算机科学与技术', count: 29 },
    { id: 'sm2403', name: '数媒2403', instructor: '汪财源', department: '计算机科学与技术', count: 28 },
    { id: 'wz2401', name: '网直2401', instructor: '汪财源', department: '计算机科学与技术', count: 24 },
    { id: 'dsj2501', name: '大数据2501', instructor: '龚世儒', department: '计算机科学与技术', count: 18 },
    { id: 'ds2501', name: '电商2501', instructor: '黄青', department: '计算机科学与技术', count: 28 },
    { id: 'ds2502', name: '电商2502', instructor: '黄青', department: '计算机科学与技术', count: 28 },
    { id: 'ds2503', name: '电商2503', instructor: '董雨豪', department: '计算机科学与技术', count: 42 },
    { id: 'jw2501', name: '计网2501', instructor: '杨克寒', department: '计算机科学与技术', count: 38 },
    { id: 'jw2502', name: '计网2502', instructor: '杨克寒', department: '计算机科学与技术', count: 37 },
    { id: 'jw2503', name: '计网2503', instructor: '杨克寒', department: '计算机科学与技术', count: 36 },
    { id: 'jw2504', name: '计网2504', instructor: '李家勇', department: '计算机科学与技术', count: 34 },
    { id: 'jw2505', name: '计网2505', instructor: '李家勇', department: '计算机科学与技术', count: 35 },
    { id: 'ai2501', name: 'AI2501', instructor: '龚世儒', department: '计算机科学与技术', count: 40 },
    { id: 'ai2502', name: 'AI2502', instructor: '龚世儒', department: '计算机科学与技术', count: 40 },
    { id: 'rj2501', name: '软件2501', instructor: '李家勇', department: '计算机科学与技术', count: 41 },
    { id: 'sn2501', name: '室内2501', instructor: '金佳玉', department: '计算机科学与技术', count: 26 },
    { id: 'sm2501', name: '数媒2501', instructor: '金佳玉', department: '计算机科学与技术', count: 35 },
    { id: 'sm2502', name: '数媒2502', instructor: '金佳玉', department: '计算机科学与技术', count: 37 },
    { id: 'wz2501', name: '网直2501', instructor: '高岚', department: '计算机科学与技术', count: 36 },
    { id: 'wz2502', name: '网直2502', instructor: '高岚', department: '计算机科学与技术', count: 41 },
    { id: 'wz2503', name: '网直2503', instructor: '董雨豪', department: '计算机科学与技术', count: 42 }
  ]
}

function saveDB() {
  const dbPath = path.join(DB_DIR, 'database.json')
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

export const dbOperations = {
  users: {
    getAll: (): User[] => db.users,
    getByUsername: (username: string): User | undefined => 
      db.users.find(u => u.username === username),
    getById: (id: string): User | undefined => 
      db.users.find(u => u.id === id),
    create: (user: Omit<User, 'id'>): User => {
      const newUser: User = { ...user, id: Date.now().toString() }
      db.users.push(newUser)
      saveDB()
      return newUser
    },
    update: (id: string, data: Partial<User>): User | undefined => {
      const index = db.users.findIndex(u => u.id === id)
      if (index === -1) return undefined
      db.users[index] = { ...db.users[index], ...data }
      saveDB()
      return db.users[index]
    },
    delete: (id: string): boolean => {
      const index = db.users.findIndex(u => u.id === id)
      if (index === -1) return false
      db.users.splice(index, 1)
      saveDB()
      return true
    }
  },

  classes: {
    getAll: (): ClassInfo[] => db.classes,
    getById: (id: string): ClassInfo | undefined => 
      db.classes.find(c => c.id === id || c.name === id)
  },

  attendance: {
    getAll: (): AttendanceRecord[] => db.attendance,
    getByClassroom: (classroom: string, date?: string, timeSlot?: string): AttendanceRecord[] => {
      return db.attendance.filter(r => {
        let match = r.classroom === classroom
        if (date) match = match && r.date === date
        if (timeSlot) match = match && r.timeSlot === timeSlot
        return match
      })
    },
    getByClass: (className: string): AttendanceRecord[] => {
      const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
      return db.attendance.filter(r => r.className === className && r.date === today)
    },
    create: (record: Omit<AttendanceRecord, 'id'>): AttendanceRecord => {
      const newRecord: AttendanceRecord = { ...record, id: Date.now().toString() }
      db.attendance.unshift(newRecord)
      saveDB()
      return newRecord
    },
    update: (id: string, data: Partial<AttendanceRecord>): AttendanceRecord | undefined => {
      const index = db.attendance.findIndex(r => r.id === id)
      if (index === -1) return undefined
      db.attendance[index] = { ...db.attendance[index], ...data }
      saveDB()
      return db.attendance[index]
    },
    delete: (id: string): boolean => {
      const index = db.attendance.findIndex(r => r.id === id)
      if (index === -1) return false
      db.attendance.splice(index, 1)
      saveDB()
      return true
    }
  },

  supervision: {
    getAll: (): SupervisionRecord[] => db.supervision,
    getByClassroom: (classroom: string, date?: string, timeSlot?: string): SupervisionRecord[] => {
      return db.supervision.filter(r => {
        let match = r.classroom === classroom
        if (date) match = match && r.date === date
        if (timeSlot) match = match && r.timeSlot === timeSlot
        return match
      })
    },
    create: (record: Omit<SupervisionRecord, 'id'>): SupervisionRecord => {
      const newRecord: SupervisionRecord = { ...record, id: Date.now().toString() }
      db.supervision.unshift(newRecord)
      saveDB()
      return newRecord
    },
    update: (id: string, data: Partial<SupervisionRecord>): SupervisionRecord | undefined => {
      const index = db.supervision.findIndex(r => r.id === id)
      if (index === -1) return undefined
      db.supervision[index] = { ...db.supervision[index], ...data }
      saveDB()
      return db.supervision[index]
    },
    delete: (id: string): boolean => {
      const index = db.supervision.findIndex(r => r.id === id)
      if (index === -1) return false
      db.supervision.splice(index, 1)
      saveDB()
      return true
    }
  },

  notifications: {
    getAll: (): Notification[] => db.notifications,
    create: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Notification => {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false
      }
      db.notifications.unshift(newNotification)
      saveDB()
      return newNotification
    },
    markAsRead: (id: string): Notification | undefined => {
      const notification = db.notifications.find(n => n.id === id)
      if (!notification) return undefined
      notification.isRead = true
      saveDB()
      return notification
    },
    delete: (id: string): boolean => {
      const index = db.notifications.findIndex(n => n.id === id)
      if (index === -1) return false
      db.notifications.splice(index, 1)
      saveDB()
      return true
    }
  },

  anomalies: {
    getAll: (): AnomalyRecord[] => db.anomalies,
    getByDate: (date: string): AnomalyRecord[] => 
      db.anomalies.filter(r => r.date === date),
    getTodayCount: (): number => {
      const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
      return db.anomalies.filter(r => r.date === today && r.hasAnomaly).length
    },
    create: (record: Omit<AnomalyRecord, 'id'>): AnomalyRecord => {
      const newRecord: AnomalyRecord = { ...record, id: Date.now().toString() }
      db.anomalies.unshift(newRecord)
      saveDB()
      return newRecord
    }
  },

  images: {
    create: (image: Omit<ImageRecord, 'id'>): ImageRecord => {
      const newImage: ImageRecord = { ...image, id: Date.now().toString() }
      db.images.push(newImage)
      saveDB()
      return newImage
    }
  }
}

export { bcrypt }