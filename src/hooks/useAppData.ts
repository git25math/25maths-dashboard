import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { MOCK_TIMETABLE, MOCK_STUDENTS, MOCK_IDEAS, MOCK_SOPS, MOCK_TEACHING_UNITS, MOCK_SCHOOL_EVENTS, MOCK_GOALS, MOCK_WORK_LOGS, MOCK_CLASSES } from '../constants';
import { TimetableEntry, Student, TeachingUnit, ClassProfile, StudentStatusRecord, StudentRequest, Idea, SOP, WorkLog, Goal, SchoolEvent } from '../types';
import { studentService } from '../services/studentService';
import { teachingService } from '../services/teachingService';
import { classService } from '../services/classService';
import { ideaService } from '../services/ideaService';
import { sopService } from '../services/sopService';
import { workLogService } from '../services/workLogService';
import { goalService } from '../services/goalService';
import { schoolEventService } from '../services/schoolEventService';
import { timetableService } from '../services/timetableService';
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
  const [goals, setGoals] = useLocalStorage<Goal[]>('dashboard-goals', MOCK_GOALS);
  const [schoolEvents, setSchoolEvents] = useLocalStorage<SchoolEvent[]>('dashboard-school-events', MOCK_SCHOOL_EVENTS);
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
      try {
        const data = await ideaService.getAll();
        if (data.length > 0) setIdeas(data);
      } catch (error) {
        // fallback to localStorage data
      }
      try {
        const data = await sopService.getAll();
        if (data.length > 0) setSops(data);
      } catch (error) {
        // fallback to localStorage data
      }
      try {
        const data = await workLogService.getAll();
        if (data.length > 0) setWorkLogs(data);
      } catch (error) {
        // fallback to localStorage data
      }
      try {
        const data = await goalService.getAll();
        if (data.length > 0) setGoals(data);
      } catch (error) {
        // fallback to localStorage data
      }
      try {
        const data = await schoolEventService.getAll();
        if (data.length > 0) setSchoolEvents(data);
      } catch (error) {
        // fallback to localStorage data
      }
      try {
        const data = await timetableService.getAll();
        if (data.length > 0) setTimetable(data);
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

  const updateTimetableEntry = useCallback(async (updatedEntry: TimetableEntry) => {
    try {
      await timetableService.update(updatedEntry.id, updatedEntry);
      setTimetable(prev => prev.map(e => e.id === updatedEntry.id ? updatedEntry : e));
    } catch (error) {
      toast.error('Failed to update timetable entry');
    }
  }, [setTimetable, toast]);

  const addTimetableEntry = useCallback(async (newEntry: TimetableEntry) => {
    try {
      const created = await timetableService.create(newEntry);
      setTimetable(prev => [...prev, created]);
      toast.success('Entry added to schedule');
    } catch (error) {
      toast.error('Failed to add timetable entry');
    }
  }, [setTimetable, toast]);

  // --- Ideas ---

  const addIdea = useCallback(async (data: { title: string; content: string; category: Idea['category']; priority: Idea['priority'] }) => {
    try {
      const created = await ideaService.create({
        status: 'pending',
        created_at: new Date().toISOString(),
        ...data,
      });
      setIdeas(prev => [...prev, created]);
      toast.success('Idea saved');
    } catch (error) {
      toast.error('Failed to save idea');
    }
  }, [setIdeas, toast]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    try {
      const updated = await ideaService.update(id, updates);
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, ...updated } : i));
      toast.success('Idea updated');
    } catch (error) {
      toast.error('Failed to update idea');
    }
  }, [setIdeas, toast]);

  const deleteIdea = useCallback(async (id: string) => {
    try {
      await ideaService.delete(id);
      setIdeas(prev => prev.filter(i => i.id !== id));
      toast.success('Idea deleted');
    } catch (error) {
      toast.error('Failed to delete idea');
    }
  }, [setIdeas, toast]);

  const toggleIdeaStatus = useCallback(async (id: string) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;
    const newStatus = idea.status === 'pending' ? 'processed' : 'pending';
    try {
      await ideaService.update(id, { status: newStatus });
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      toast.success('Idea status updated');
    } catch (error) {
      toast.error('Failed to update idea status');
    }
  }, [ideas, setIdeas, toast]);

  // --- SOPs ---

  const addSOP = useCallback(async (data: { title: string; category: string; content: string }) => {
    try {
      const created = await sopService.create(data);
      setSops(prev => [...prev, created]);
      toast.success('SOP added');
    } catch (error) {
      toast.error('Failed to add SOP');
    }
  }, [setSops, toast]);

  const updateSOP = useCallback(async (id: string, updates: Partial<SOP>) => {
    try {
      const updated = await sopService.update(id, updates);
      setSops(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s));
      toast.success('SOP updated');
    } catch (error) {
      toast.error('Failed to update SOP');
    }
  }, [setSops, toast]);

  const deleteSOP = useCallback(async (id: string) => {
    try {
      await sopService.delete(id);
      setSops(prev => prev.filter(s => s.id !== id));
      toast.success('SOP deleted');
    } catch (error) {
      toast.error('Failed to delete SOP');
    }
  }, [setSops, toast]);

  // --- Work Logs ---

  const addWorkLog = useCallback(async (data: { content: string; category: WorkLog['category']; tags?: string[] }) => {
    try {
      const created = await workLogService.create({
        timestamp: format(new Date(), 'yyyy-MM-dd HH:mm'),
        ...data,
      });
      setWorkLogs(prev => [created, ...prev]);
      toast.success('Work log added');
    } catch (error) {
      toast.error('Failed to add work log');
    }
  }, [setWorkLogs, toast]);

  const updateWorkLog = useCallback(async (id: string, updates: Partial<WorkLog>) => {
    try {
      const updated = await workLogService.update(id, updates);
      setWorkLogs(prev => prev.map(l => l.id === id ? { ...l, ...updated } : l));
      toast.success('Work log updated');
    } catch (error) {
      toast.error('Failed to update work log');
    }
  }, [setWorkLogs, toast]);

  const deleteWorkLog = useCallback(async (id: string) => {
    try {
      await workLogService.delete(id);
      setWorkLogs(prev => prev.filter(l => l.id !== id));
      toast.success('Work log deleted');
    } catch (error) {
      toast.error('Failed to delete work log');
    }
  }, [setWorkLogs, toast]);

  // --- Goals ---

  const addGoal = useCallback(async (data: Omit<Goal, 'id'>) => {
    try {
      const created = await goalService.create(data);
      setGoals(prev => [...prev, created]);
      toast.success('Goal added');
    } catch (error) {
      toast.error('Failed to add goal');
    }
  }, [setGoals, toast]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    try {
      const updated = await goalService.update(id, updates);
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updated } : g));
      toast.success('Goal updated');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  }, [setGoals, toast]);

  const deleteGoal = useCallback(async (id: string) => {
    try {
      await goalService.delete(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  }, [setGoals, toast]);

  // --- School Events ---

  const addSchoolEvent = useCallback(async (data: Omit<SchoolEvent, 'id'>) => {
    try {
      const created = await schoolEventService.create(data);
      setSchoolEvents(prev => [...prev, created]);
      toast.success('Event added');
    } catch (error) {
      toast.error('Failed to add event');
    }
  }, [setSchoolEvents, toast]);

  const updateSchoolEvent = useCallback(async (id: string, updates: Partial<SchoolEvent>) => {
    try {
      const updated = await schoolEventService.update(id, updates);
      setSchoolEvents(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
      toast.success('Event updated');
    } catch (error) {
      toast.error('Failed to update event');
    }
  }, [setSchoolEvents, toast]);

  const deleteSchoolEvent = useCallback(async (id: string) => {
    try {
      await schoolEventService.delete(id);
      setSchoolEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  }, [setSchoolEvents, toast]);

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

    // Goals
    addGoal, updateGoal, deleteGoal,

    // School Events
    addSchoolEvent, updateSchoolEvent, deleteSchoolEvent,

    // QuickCapture
    quickCapture,

    // Toast
    toast,
  };
}
