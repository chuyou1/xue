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
  const hashedPassword = await bcrypt.hash('123456', 10)
  
  db.users = [
    { id: '1', username: 'class1', password: hashedPassword, role: 'classMonitor', className: '计科2201班', name: '张三' },
    { id: '2', username: 'class2', password: hashedPassword, role: 'classMonitor', className: '计科2202班', name: '李四' },
    { id: '3', username: 'secretary', password: hashedPassword, role: 'secretary', name: '王五' },
    { id: '4', username: 'cadre', password: hashedPassword, role: 'cadre', name: '赵六' },
    { id: '5', username: 'vp', password: hashedPassword, role: 'vicePresident', name: '钱七' }
  ]

  db.classes = [
    { id: '1', name: '计科2201班', instructor: '李老师', department: '计算机科学与技术' },
    { id: '2', name: '计科2202班', instructor: '王老师', department: '计算机科学与技术' },
    { id: '3', name: '计科2203班', instructor: '张老师', department: '计算机科学与技术' },
    { id: '4', name: '计科2204班', instructor: '刘老师', department: '计算机科学与技术' },
    { id: '5', name: '计科2301班', instructor: '陈老师', department: '计算机科学与技术' },
    { id: '6', name: '计科2302班', instructor: '杨老师', department: '计算机科学与技术' }
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