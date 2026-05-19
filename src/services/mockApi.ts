import { User, ClassInfo, AttendanceRecord, SupervisionRecord, Notification, AnomalyRecord, classes, users } from '../data'

let mockAttendanceRecords: AttendanceRecord[] = []
let mockSupervisionRecords: SupervisionRecord[] = []
let mockNotifications: Notification[] = []
let mockAnomalyRecords: AnomalyRecord[] = []

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockApi = {
  auth: {
    login: async (username: string, password: string): Promise<User> => {
      await delay(200)
      const user = users.find(u => u.username === username && u.password === password)
      if (!user) throw new Error('账号或密码错误')
      return { ...user, id: username }
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      await delay(200)
      return users.map(u => ({ ...u, id: u.username }))
    },
    getById: async (id: string): Promise<User> => {
      await delay(200)
      const user = users.find(u => u.username === id)
      if (!user) throw new Error('用户不存在')
      return { ...user, id }
    },
    create: async (user: Omit<User, 'id'>): Promise<User> => {
      await delay(200)
      const newUser = { ...user, id: user.username }
      return newUser
    },
    update: async (userId: string, user: Partial<User>): Promise<User> => {
      await delay(200)
      const existing = users.find(u => u.username === userId)
      if (!existing) throw new Error('用户不存在')
      return { ...existing, ...user, id: userId }
    },
    delete: async (_id: string): Promise<void> => {
      await delay(200)
    }
  },

  classes: {
    getAll: async (): Promise<ClassInfo[]> => {
      await delay(200)
      return classes
    },
    getById: async (id: string): Promise<ClassInfo> => {
      await delay(200)
      const cls = classes.find(c => c.id === id || c.name === id)
      if (!cls) throw new Error('班级不存在')
      return cls
    }
  },

  attendance: {
    getAll: async (): Promise<AttendanceRecord[]> => {
      await delay(200)
      return [...mockAttendanceRecords]
    },
    getByClassroom: async (classroom: string, date?: string, timeSlot?: string): Promise<AttendanceRecord[]> => {
      await delay(200)
      return mockAttendanceRecords.filter(r => {
        let match = r.classroom === classroom
        if (date) match = match && r.date === date
        if (timeSlot) match = match && r.timeSlot === timeSlot
        return match
      })
    },
    getByClass: async (className: string): Promise<AttendanceRecord[]> => {
      await delay(200)
      const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
      return mockAttendanceRecords.filter(r => r.className === className && r.date === today)
    },
    create: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
      await delay(200)
      const newRecord: AttendanceRecord = { ...record, id: Date.now().toString() }
      mockAttendanceRecords.unshift(newRecord)
      return newRecord
    },
    update: async (id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
      await delay(200)
      const index = mockAttendanceRecords.findIndex(r => r.id === id)
      if (index < 0) throw new Error('记录不存在')
      mockAttendanceRecords[index] = { ...mockAttendanceRecords[index], ...record }
      return mockAttendanceRecords[index]
    },
    delete: async (id: string): Promise<void> => {
      await delay(200)
      mockAttendanceRecords = mockAttendanceRecords.filter(r => r.id !== id)
    }
  },

  supervision: {
    getAll: async (): Promise<SupervisionRecord[]> => {
      await delay(200)
      return [...mockSupervisionRecords]
    },
    getByClassroom: async (classroom: string, date?: string, timeSlot?: string): Promise<SupervisionRecord[]> => {
      await delay(200)
      return mockSupervisionRecords.filter(r => {
        let match = r.classroom === classroom
        if (date) match = match && r.date === date
        if (timeSlot) match = match && r.timeSlot === timeSlot
        return match
      })
    },
    create: async (record: Omit<SupervisionRecord, 'id'>): Promise<SupervisionRecord> => {
      await delay(200)
      const newRecord: SupervisionRecord = { ...record, id: Date.now().toString() }
      mockSupervisionRecords.unshift(newRecord)
      return newRecord
    },
    update: async (id: string, record: Partial<SupervisionRecord>): Promise<SupervisionRecord> => {
      await delay(200)
      const index = mockSupervisionRecords.findIndex(r => r.id === id)
      if (index < 0) throw new Error('记录不存在')
      mockSupervisionRecords[index] = { ...mockSupervisionRecords[index], ...record }
      return mockSupervisionRecords[index]
    },
    delete: async (id: string): Promise<void> => {
      await delay(200)
      mockSupervisionRecords = mockSupervisionRecords.filter(r => r.id !== id)
    }
  },

  notifications: {
    getAll: async (): Promise<Notification[]> => {
      await delay(200)
      return [...mockNotifications]
    },
    create: async (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Promise<Notification> => {
      await delay(200)
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        isRead: false
      }
      mockNotifications.unshift(newNotification)
      return newNotification
    },
    markAsRead: async (id: string): Promise<Notification> => {
      await delay(200)
      const notification = mockNotifications.find(n => n.id === id)
      if (!notification) throw new Error('通知不存在')
      notification.isRead = true
      return notification
    },
    delete: async (id: string): Promise<void> => {
      await delay(200)
      mockNotifications = mockNotifications.filter(n => n.id !== id)
    }
  },

  anomalies: {
    getAll: async (): Promise<AnomalyRecord[]> => {
      await delay(200)
      return [...mockAnomalyRecords]
    },
    getByDate: async (date: string): Promise<AnomalyRecord[]> => {
      await delay(200)
      return mockAnomalyRecords.filter(r => r.date === date)
    },
    create: async (record: Omit<AnomalyRecord, 'id'>): Promise<AnomalyRecord> => {
      await delay(200)
      const newRecord: AnomalyRecord = { ...record, id: Date.now().toString() }
      mockAnomalyRecords.unshift(newRecord)
      return newRecord
    },
    getTodayCount: async (): Promise<number> => {
      await delay(200)
      const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
      return mockAnomalyRecords.filter(r => r.date === today && r.hasAnomaly).length
    }
  },

  upload: {
    image: async (file: File): Promise<{ url: string }> => {
      await delay(500)
      return { url: URL.createObjectURL(file) }
    }
  }
}