import api from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authAPI = {
  async login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.accessToken) {
      await AsyncStorage.setItem('accessToken', data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(email: string, name: string, password: string, role: string = 'Student', studentCode?: string) {
    const { data } = await api.post('/auth/register', { 
      email, 
      name, 
      password, 
      role, 
      ...(studentCode && { studentCode })
    });
    return data;
  },

  async logout() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('user');
  },

  async getMe() {
    const { data } = await api.get('/users/me');
    return data;
  },
};

export const classesAPI = {
  async getAll() {
    const { data } = await api.get('/classes');
    return data;
  },

  async getOne(id: string) {
    const { data } = await api.get(`/classes/${id}`);
    return data;
  },

  async create(name: string, subject?: string) {
    const { data } = await api.post('/classes', { name, subject });
    return data;
  },

  async getStudents(classId: string) {
    const { data } = await api.get(`/classes/${classId}/students`);
    return data;
  },
};

export const sessionsAPI = {
  async getByClass(classId: string) {
    const { data } = await api.get(`/classes/${classId}/sessions`);
    return data;
  },

  async getOne(sessionId: string) {
    const { data } = await api.get(`/sessions/${sessionId}`);
    return data;
  },

  async create(classId: string, date: string, startTime?: string, endTime?: string) {
    const { data } = await api.post(`/classes/${classId}/sessions`, { date, startTime, endTime });
    return data;
  },

  async delete(classId: string, sessionId: string) {
    const { data } = await api.delete(`/classes/${classId}/sessions/${sessionId}`);
    return data;
  },

  async getQRToken(sessionId: string) {
    const { data } = await api.get(`/sessions/${sessionId}/qr-token`);
    return data;
  },
};

export const attendanceAPI = {
  async getBySession(sessionId: string) {
    const { data } = await api.get(`/sessions/${sessionId}/attendance`);
    return data;
  },

  async bulkMark(sessionId: string, defaultStatus: string, overrides: any[]) {
    const { data } = await api.post(`/sessions/${sessionId}/attendance/bulk`, {
      defaultStatus,
      overrides,
    });
    return data;
  },

  async qrScan(code: string, studentId: string, lat?: number, long?: number, accuracy?: number) {
    const requestData = {
      code,
      studentId, // This is actually the user ID, but backend expects 'studentId' in the body
      lat,
      long,
      accuracy,
    };
    
    console.log('Making QR scan API call:', requestData);
    console.log('API endpoint:', '/attendance/qr-scan');
    
    const { data } = await api.post(`/attendance/qr-scan`, requestData);
    return data;
  },

  async update(sessionId: string, recordId: string, status: string, note?: string) {
    const { data } = await api.patch(`/sessions/${sessionId}/attendance/${recordId}`, { status, note });
    return data;
  },
};

export const leaveAPI = {
  async getAll() {
    const { data } = await api.get('/leave');
    return data;
  },

  async create(type: string, start: string, end: string, reason?: string) {
    const { data } = await api.post('/leave', { type, start, end, reason });
    return data;
  },

  async approve(id: string, comment?: string) {
    const { data } = await api.patch(`/leave/${id}/approve`, { comment });
    return data;
  },

  async reject(id: string, comment?: string) {
    const { data } = await api.patch(`/leave/${id}/reject`, { comment });
    return data;
  },
};

export const studentCodeAPI = {
  async validateCode(code: string) {
    const { data } = await api.get(`/student-codes/validate/${code}`);
    return data;
  },

  async generateCodeForClass(classId: string) {
    const { data } = await api.post(`/student-codes/generate-for-class/${classId}`);
    return data;
  },
};

export const studentsAPI = {
  async getMyClasses() {
    const { data } = await api.get('/students/my-classes');
    return data;
  },

  async getMyAttendanceForClass(classId: string) {
    const { data } = await api.get(`/students/attendance/class/${classId}`);
    return data;
  },
};
