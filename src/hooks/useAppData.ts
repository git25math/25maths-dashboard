import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { MOCK_TIMETABLE, MOCK_STUDENTS, MOCK_IDEAS, MOCK_SOPS, MOCK_TEACHING_UNITS, MOCK_SCHOOL_EVENTS, MOCK_GOALS, MOCK_WORK_LOGS, MOCK_CLASSES } from '../constants';
import { TimetableEntry, Student, TeachingUnit, ClassProfile, StudentStatusRecord, StudentRequest, Idea, SOP, WorkLog, Goal, SchoolEvent } from '../types';
import { studentService } from '../services/studentService';
import { teachingService } from '../services/teachingService';
import { classService } from '../services/classService';
import { useLocalStorage } from './useLocalStorage';
import { useToast, Toast } from './useToast';

export function useAppData() {
  const { toasts, toast } = useToast();

  // --- State ---
  const [timetable, setTimetable] = useLocalStorage<TimetableEntry[]>('dashboard-timetable', MOCK_TIMETABLE);
  const [students, setStudents] = useLocalStorage<Student[]>('dashboard-students', MOCK_STUDENTS);
  const [teachingUnits, setTeachingUnits] = useLocalStorage<TeachingUnit[]>('dashboard-teaching-units', MOCK_TEACHING_UNITS);
  const [classes, setClasses] = useLocalStorage<ClassProfile[]>('dashboard-classes', MOCK_CLASSES);
  const [ideas, setIdeas] = useLocalStorage<Idea[]>('dashboard-ideas', MOCK_IDEAS);
  const [sops, setSops] = useLocalStorage<SOP[]>('dashboard-sops', MOCK_SOPS);
  const [goals] = useLocalStorage<Goal[]>('dashboard-goals', MOCK_GOALS);
  const [schoolEvents] = useLocalStorage<SchoolEvent[]>('dashboard-school-events', MOCK_SCHOOL_EVENTS);
  const [workLogs, setWorkLogs] = useLocalStorage<WorkLog[]>('dashboard-work-logs', MOCK_WORK_LOGS);

  // --- Data Fetching ---

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const data = await studentService.getAllStudents();
        if (data.length > 0) setStudents(data);
      } catch (error) {
        // fallback to localStorage data
      }
      try {
        const data = await teachingService.getAllUnits();
        if (data.length > 0) setTeachingUnits(data);
      } catch (error) {
        // fallback to localStorage data
      }
      try {
        const data = await classService.getAllClasses();
        if (data.length > 0) setClasses(data);
      } catch (error) {
        // fallback to localStorage data
      }
    };
    fetchAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Student CRUD ---

  const saveStudent = useCallback(async (studentData: Omit<Student, 'id'> | Student) => {
    try {
      if ('id' in studentData) {
        const updated = await studentService.updateStudent(studentData.id, studentData);
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
        toast.success('Student updated');
      } else {
        const created = await studentService.createStudent(studentData);
        setStudents(prev => [...prev, created]);
        toast.success('Student added');
      }
    } catch (error) {
      toast.error('Failed to save student');
      throw error;
    }
  }, [setStudents, toast]);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      await studentService.deleteStudent(id);
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted');
    } catch (error) {
      toast.error('Failed to delete student');
    }
  }, [setStudents, toast]);

  const addStatusRecord = useCallback(async (studentId: string, content: string, category: StudentStatusRecord['category'] = 'academic') => {
    const newRecord: StudentStatusRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      category,
      content,
    };
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        status_records: [...(student.status_records || []), newRecord],
      });
    }
  }, [students, saveStudent]);

  const addStudentRequest = useCallback(async (studentId: string, content: string) => {
    const newRequest: StudentRequest = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      content,
      status: 'pending',
    };
    const student = students.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: [...(student.requests || []), newRequest],
      });
    }
  }, [students, saveStudent]);

  // --- Teaching Unit CRUD ---

  const saveTeachingUnit = useCallback(async (unitData: Omit<TeachingUnit, 'id'> | TeachingUnit) => {
    try {
      if ('id' in unitData) {
        const updated = await teachingService.updateUnit(unitData.id, unitData);
        setTeachingUnits(prev => prev.map(u => u.id === updated.id ? updated : u));
        toast.success('Unit updated');
      } else {
        const created = await teachingService.createUnit(unitData);
        setTeachingUnits(prev => [...prev, created]);
        toast.success('Unit added');
      }
    } catch (error) {
      toast.error('Failed to save teaching unit');
      throw error;
    }
  }, [setTeachingUnits, toast]);

  const deleteTeachingUnit = useCallback(async (id: string) => {
    try {
      await teachingService.deleteUnit(id);
      setTeachingUnits(prev => prev.filter(u => u.id !== id));
      toast.success('Unit deleted');
    } catch (error) {
      toast.error('Failed to delete teaching unit');
    }
  }, [setTeachingUnits, toast]);

  // --- Class CRUD ---

  const saveClass = useCallback(async (classData: Omit<ClassProfile, 'id'> | ClassProfile) => {
    try {
      if ('id' in classData) {
        const updated = await classService.updateClass(classData.id, classData);
        setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
        toast.success('Class updated');
      } else {
        const created = await classService.createClass(classData);
        setClasses(prev => [...prev, created]);
        toast.success('Class added');
      }
    } catch (error) {
      toast.error('Failed to save class');
      throw error;
    }
  }, [setClasses, toast]);

  const deleteClass = useCallback(async (id: string) => {
    try {
      await classService.deleteClass(id);
      setClasses(prev => prev.filter(c => c.id !== id));
      toast.success('Class deleted');
    } catch (error) {
      toast.error('Failed to delete class');
    }
  }, [setClasses, toast]);

  const updateClassProgress = useCallback(async (classId: string, lessonId: string, completed: boolean) => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return;
    const newCompletedIds = completed
      ? [...(cls.completed_lesson_ids || []), lessonId]
      : (cls.completed_lesson_ids || []).filter(id => id !== lessonId);
    await saveClass({ ...cls, completed_lesson_ids: newCompletedIds });
  }, [classes, saveClass]);

  // --- Timetable ---

  const updateTimetableEntry = useCallback((updatedEntry: TimetableEntry) => {
    setTimetable(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
  }, [setTimetable]);

  const addTimetableEntry = useCallback((newEntry: TimetableEntry) => {
    setTimetable(prev => [...prev, newEntry]);
    toast.success('Entry added to schedule');
  }, [setTimetable, toast]);

  // --- Ideas ---

  const addIdea = useCallback((data: { title: string; content: string; category: Idea['category']; priority: Idea['priority'] }) => {
    const newIdea: Idea = {
      id: `idea-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      ...data,
    };
    setIdeas(prev => [...prev, newIdea]);
    toast.success('Idea saved');
  }, [setIdeas, toast]);

  const updateIdea = useCallback((id: string, updates: Partial<Idea>) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
    toast.success('Idea updated');
  }, [setIdeas, toast]);

  const deleteIdea = useCallback((id: string) => {
    setIdeas(prev => prev.filter(i => i.id !== id));
    toast.success('Idea deleted');
  }, [setIdeas, toast]);

  const toggleIdeaStatus = useCallback((id: string) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: i.status === 'pending' ? 'processed' : 'pending' } : i));
    toast.success('Idea status updated');
  }, [setIdeas, toast]);

  // --- SOPs ---

  const addSOP = useCallback((data: { title: string; category: string; content: string }) => {
    const newSOP: SOP = {
      id: `sop-${Date.now()}`,
      ...data,
    };
    setSops(prev => [...prev, newSOP]);
    toast.success('SOP added');
  }, [setSops, toast]);

  const updateSOP = useCallback((id: string, updates: Partial<SOP>) => {
    setSops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    toast.success('SOP updated');
  }, [setSops, toast]);

  const deleteSOP = useCallback((id: string) => {
    setSops(prev => prev.filter(s => s.id !== id));
    toast.success('SOP deleted');
  }, [setSops, toast]);

  // --- Work Logs ---

  const addWorkLog = useCallback((data: { content: string; category: WorkLog['category']; tags?: string[] }) => {
    const newLog: WorkLog = {
      id: `wl-${Date.now()}`,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
      ...data,
    };
    setWorkLogs(prev => [newLog, ...prev]);
    toast.success('Work log added');
  }, [setWorkLogs, toast]);

  const updateWorkLog = useCallback((id: string, updates: Partial<WorkLog>) => {
    setWorkLogs(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    toast.success('Work log updated');
  }, [setWorkLogs, toast]);

  const deleteWorkLog = useCallback((id: string) => {
    setWorkLogs(prev => prev.filter(l => l.id !== id));
    toast.success('Work log deleted');
  }, [setWorkLogs, toast]);

  // --- QuickCapture ---

  const quickCapture = useCallback((text: string, category: 'work' | 'student' | 'startup') => {
    if (category === 'startup') {
      addIdea({ title: text.slice(0, 50), content: text, category: 'startup', priority: 'medium' });
    } else {
      addWorkLog({ content: text, category: category === 'student' ? 'tutor' : 'teaching', tags: [category] });
    }
  }, [addIdea, addWorkLog]);

  return {
    // State
    timetable, students, teachingUnits, classes,
    ideas, sops, goals, schoolEvents, workLogs,
    toasts,

    // Student
    saveStudent, deleteStudent, addStatusRecord, addStudentRequest,

    // Teaching
    saveTeachingUnit, deleteTeachingUnit,

    // Class
    saveClass, deleteClass, updateClassProgress,

    // Timetable
    updateTimetableEntry, addTimetableEntry,

    // Ideas / SOPs / WorkLogs
    addIdea, updateIdea, deleteIdea, toggleIdeaStatus,
    addSOP, updateSOP, deleteSOP,
    addWorkLog, updateWorkLog, deleteWorkLog,

    // QuickCapture
    quickCapture,

    // Toast
    toast,
  };
}
