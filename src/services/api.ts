import { User, ClassInfo, AttendanceRecord, SupervisionRecord, Notification, AnomalyRecord } from '../data'

const BASE_URL = 'http://localhost:3001/api'

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '请求失败')
  }
  return response.json()
}

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<User> => {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      return handleResponse<User>(response)
    }
  },

  users: {
    getAll: async (): Promise<User[]> => {
      const response = await fetch(`${BASE_URL}/users`)
      return handleResponse<User[]>(response)
    },
    getById: async (id: string): Promise<User> => {
      const response = await fetch(`${BASE_URL}/users/${id}`)
      return handleResponse<User>(response)
    },
    create: async (user: Omit<User, 'id'>): Promise<User> => {
      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })
      return handleResponse<User>(response)
    },
    update: async (id: string, user: Partial<User>): Promise<User> => {
      const response = await fetch(`${BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })
      return handleResponse<User>(response)
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE' })
      return handleResponse<void>(response)
    }
  },

  classes: {
    getAll: async (): Promise<ClassInfo[]> => {
      const response = await fetch(`${BASE_URL}/classes`)
      return handleResponse<ClassInfo[]>(response)
    },
    getById: async (id: string): Promise<ClassInfo> => {
      const response = await fetch(`${BASE_URL}/classes/${id}`)
      return handleResponse<ClassInfo>(response)
    }
  },

  attendance: {
    getAll: async (): Promise<AttendanceRecord[]> => {
      const response = await fetch(`${BASE_URL}/attendance`)
      return handleResponse<AttendanceRecord[]>(response)
    },
    getByClassroom: async (classroom: string, date?: string, timeSlot?: string): Promise<AttendanceRecord[]> => {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (timeSlot) params.append('timeSlot', timeSlot)
      const response = await fetch(`${BASE_URL}/attendance/classroom/${classroom}?${params}`)
      return handleResponse<AttendanceRecord[]>(response)
    },
    getByClass: async (className: string): Promise<AttendanceRecord[]> => {
      const response = await fetch(`${BASE_URL}/attendance/class/${className}`)
      return handleResponse<AttendanceRecord[]>(response)
    },
    create: async (record: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> => {
      const response = await fetch(`${BASE_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
      return handleResponse<AttendanceRecord>(response)
    },
    update: async (id: string, record: Partial<AttendanceRecord>): Promise<AttendanceRecord> => {
      const response = await fetch(`${BASE_URL}/attendance/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
      return handleResponse<AttendanceRecord>(response)
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${BASE_URL}/attendance/${id}`, { method: 'DELETE' })
      return handleResponse<void>(response)
    }
  },

  supervision: {
    getAll: async (): Promise<SupervisionRecord[]> => {
      const response = await fetch(`${BASE_URL}/supervision`)
      return handleResponse<SupervisionRecord[]>(response)
    },
    getByClassroom: async (classroom: string, date?: string, timeSlot?: string): Promise<SupervisionRecord[]> => {
      const params = new URLSearchParams()
      if (date) params.append('date', date)
      if (timeSlot) params.append('timeSlot', timeSlot)
      const response = await fetch(`${BASE_URL}/supervision/classroom/${classroom}?${params}`)
      return handleResponse<SupervisionRecord[]>(response)
    },
    create: async (record: Omit<SupervisionRecord, 'id'>): Promise<SupervisionRecord> => {
      const response = await fetch(`${BASE_URL}/supervision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
      return handleResponse<SupervisionRecord>(response)
    },
    update: async (id: string, record: Partial<SupervisionRecord>): Promise<SupervisionRecord> => {
      const response = await fetch(`${BASE_URL}/supervision/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
      return handleResponse<SupervisionRecord>(response)
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${BASE_URL}/supervision/${id}`, { method: 'DELETE' })
      return handleResponse<void>(response)
    }
  },

  notifications: {
    getAll: async (): Promise<Notification[]> => {
      const response = await fetch(`${BASE_URL}/notifications`)
      return handleResponse<Notification[]>(response)
    },
    create: async (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>): Promise<Notification> => {
      const response = await fetch(`${BASE_URL}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notification)
      })
      return handleResponse<Notification>(response)
    },
    markAsRead: async (id: string): Promise<Notification> => {
      const response = await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PUT' })
      return handleResponse<Notification>(response)
    },
    delete: async (id: string): Promise<void> => {
      const response = await fetch(`${BASE_URL}/notifications/${id}`, { method: 'DELETE' })
      return handleResponse<void>(response)
    }
  },

  anomalies: {
    getAll: async (): Promise<AnomalyRecord[]> => {
      const response = await fetch(`${BASE_URL}/anomalies`)
      return handleResponse<AnomalyRecord[]>(response)
    },
    getByDate: async (date: string): Promise<AnomalyRecord[]> => {
      const response = await fetch(`${BASE_URL}/anomalies/date/${date}`)
      return handleResponse<AnomalyRecord[]>(response)
    },
    create: async (record: Omit<AnomalyRecord, 'id'>): Promise<AnomalyRecord> => {
      const response = await fetch(`${BASE_URL}/anomalies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record)
      })
      return handleResponse<AnomalyRecord>(response)
    },
    getTodayCount: async (): Promise<number> => {
      const response = await fetch(`${BASE_URL}/anomalies/today-count`)
      return handleResponse<number>(response)
    }
  },

  upload: {
    image: async (file: File): Promise<{ url: string }> => {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch(`${BASE_URL}/upload/image`, {
        method: 'POST',
        body: formData
      })
      return handleResponse<{ url: string }>(response)
    }
  }
}