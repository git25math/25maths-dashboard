import { Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { format } from 'date-fns';
import { randomAlphaId } from '../../lib/id';
import { studentService } from '../../services/studentService';
import { taskService } from '../../services/taskService';
import { hpAwardService } from '../../services/hpAwardService';
import { Student, StudentStatusRecord, StudentRequest, StudentWeakness, ExamRecord, ParentCommunication, ParentCommMethod, ParentCommFollowUp, HPAwardLog, Task, ToastApi } from '../../types';

interface UseStudentActionsParams {
  students: Student[];
  setStudents: Dispatch<SetStateAction<Student[]>>;
  hpAwardLogs: HPAwardLog[];
  setHpAwardLogs: Dispatch<SetStateAction<HPAwardLog[]>>;
  setTasks: Dispatch<SetStateAction<Task[]>>;
  toast: ToastApi;
}

export function useStudentActions({
  students,
  setStudents,
  setHpAwardLogs,
  setTasks,
  toast,
}: UseStudentActionsParams) {
  const studentsRef = useRef(students);       studentsRef.current = students;

  const saveStudent = useCallback(async (studentData: Omit<Student, 'id'> | Student) => {
    try {
      if ('id' in studentData) {
        // Detect direct HP edit → auto-create award log
        const oldStudent = studentsRef.current.find(s => s.id === studentData.id);
        const hpDelta = oldStudent ? studentData.house_points - oldStudent.house_points : 0;

        const updated = await studentService.updateStudent(studentData.id, studentData);
        setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));

        if (hpDelta !== 0 && oldStudent) {
          try {
            const logEntry = await hpAwardService.create({
              date: format(new Date(), 'yyyy-MM-dd'),
              student_id: updated.id,
              student_name: updated.name,
              class_name: updated.class_name,
              points: hpDelta,
              reason: hpDelta > 0 ? 'Manual HP adjustment' : 'Manual HP deduction',
              source: 'batch' as const,
            });
            setHpAwardLogs(prev => [...prev, logEntry]);
          } catch {
            // silent — don't block save if log fails
          }
        }

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
  }, [setStudents, toast, setHpAwardLogs]);

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
      id: randomAlphaId(),
      date: new Date().toISOString().split('T')[0],
      category,
      content,
    };
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        status_records: [...(student.status_records || []), newRecord],
      });
    }
  }, [saveStudent]);

  const updateStatusRecord = useCallback(async (studentId: string, recordId: string, content: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        status_records: (student.status_records || []).map(r => r.id === recordId ? { ...r, content } : r),
      });
    }
  }, [saveStudent]);

  const deleteStatusRecord = useCallback(async (studentId: string, recordId: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        status_records: (student.status_records || []).filter(r => r.id !== recordId),
      });
    }
  }, [saveStudent]);

  const addWeakness = useCallback(async (studentId: string, weakness: StudentWeakness) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        weaknesses: [...(student.weaknesses || []), weakness],
      });
    }
  }, [saveStudent]);

  const updateWeakness = useCallback(async (studentId: string, index: number, weakness: StudentWeakness) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        weaknesses: (student.weaknesses || []).map((w, i) => i === index ? weakness : w),
      });
    }
  }, [saveStudent]);

  const deleteWeakness = useCallback(async (studentId: string, index: number) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        weaknesses: (student.weaknesses || []).filter((_, i) => i !== index),
      });
    }
  }, [saveStudent]);

  const addStudentRequest = useCallback(async (studentId: string, content: string) => {
    const newRequest: StudentRequest = {
      id: randomAlphaId(),
      date: new Date().toISOString().split('T')[0],
      content,
      status: 'pending',
    };
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: [...(student.requests || []), newRequest],
      });
      // Auto-create GTD Task for student request
      try {
        const task = await taskService.create({
          title: `[学生诉求] ${student.name}: ${content.slice(0, 60)}`,
          status: 'inbox',
          priority: 'medium',
          source_type: 'student-request',
          source_id: `${student.id}:${newRequest.id}`,
          tags: ['学生诉求'],
          created_at: new Date().toISOString(),
        });
        setTasks(prev => [...prev, task]);
        toast.success('已创建待办事项');
      } catch {
        // silent — don't block request creation if task fails
      }
    }
  }, [saveStudent, setTasks, toast]);

  const updateStudentRequest = useCallback(async (studentId: string, requestId: string, content: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: (student.requests || []).map(r => r.id === requestId ? { ...r, content } : r),
      });
    }
  }, [saveStudent]);

  const updateRequestDate = useCallback(async (studentId: string, requestId: string, field: 'date' | 'resolved_date', value: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: (student.requests || []).map(r =>
          r.id === requestId ? { ...r, [field]: value || undefined } : r
        ),
      });
    }
  }, [saveStudent]);

  const deleteStudentRequest = useCallback(async (studentId: string, requestId: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        requests: (student.requests || []).filter(r => r.id !== requestId),
      });
    }
  }, [saveStudent]);

  const toggleRequestStatus = useCallback(async (studentId: string, requestId: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      const today = format(new Date(), 'yyyy-MM-dd');
      await saveStudent({
        ...student,
        requests: (student.requests || []).map(r =>
          r.id === requestId ? {
            ...r,
            status: r.status === 'pending' ? 'resolved' as const : 'pending' as const,
            resolved_date: r.status === 'pending' ? today : undefined,
          } : r
        ),
      });
    }
  }, [saveStudent]);

  const createFollowUpTask = useCallback(async (
    student: Student, commId: string, method: ParentCommMethod, content: string, followUpPlan: string
  ) => {
    try {
      const cleanData = Object.fromEntries(
        Object.entries({
          title: `[家校沟通] ${student.name}: ${followUpPlan.slice(0, 60)}`,
          description: `学生: ${student.name} (${student.class_name})\n沟通方式: ${method}\n沟通内容: ${content}\n\n跟进计划: ${followUpPlan}`,
          status: 'next',
          priority: 'medium',
          source_type: 'parent-comm',
          source_id: `${student.id}:${commId}`,
          tags: ['家校沟通'],
        }).filter(([, v]) => v !== undefined)
      ) as Omit<Task, 'id' | 'created_at'>;
      const created = await taskService.create({ ...cleanData, created_at: new Date().toISOString() } as Omit<Task, 'id'>);
      setTasks(prev => [...prev, created]);
      return created.id;
    } catch {
      return undefined;
    }
  }, [setTasks]);

  const addParentCommunication = useCallback(async (
    studentId: string,
    data: { date: string; method: ParentCommMethod; content: string; needs_follow_up: boolean; follow_up_plan?: string }
  ) => {
    const commId = randomAlphaId();
    const student = studentsRef.current.find(s => s.id === studentId);
    if (!student) return;

    let taskId: string | undefined;
    if (data.needs_follow_up && data.follow_up_plan) {
      taskId = await createFollowUpTask(student, commId, data.method, data.content, data.follow_up_plan);
    }

    const newComm: ParentCommunication = {
      id: commId,
      date: data.date,
      method: data.method,
      content: data.content,
      status: data.needs_follow_up ? 'pending' : 'resolved',
      needs_follow_up: data.needs_follow_up,
      follow_up_plan: data.follow_up_plan,
      follow_up_task_id: taskId,
    };
    await saveStudent({
      ...student,
      parent_communications: [...(student.parent_communications || []), newComm],
    });
    if (taskId) toast.success('已创建跟进待办事项');
  }, [saveStudent, createFollowUpTask, toast]);

  const updateParentCommunication = useCallback(async (
    studentId: string,
    commId: string,
    data: { date: string; method: ParentCommMethod; content: string; needs_follow_up: boolean; follow_up_plan?: string }
  ) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (!student) return;
    const existing = (student.parent_communications || []).find(c => c.id === commId);
    if (!existing) return;

    let taskId = existing.follow_up_task_id;
    if (data.needs_follow_up && data.follow_up_plan && !taskId) {
      taskId = await createFollowUpTask(student, commId, data.method, data.content, data.follow_up_plan);
      if (taskId) toast.success('已创建跟进待办事项');
    }

    await saveStudent({
      ...student,
      parent_communications: (student.parent_communications || []).map(c =>
        c.id === commId ? {
          ...c,
          date: data.date,
          method: data.method,
          content: data.content,
          needs_follow_up: data.needs_follow_up,
          follow_up_plan: data.follow_up_plan,
          follow_up_task_id: taskId,
        } : c
      ),
    });
  }, [saveStudent, createFollowUpTask, toast]);

  const addParentCommFollowUp = useCallback(async (studentId: string, commId: string, followUpContent: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (!student) return;
    const newFollowUp: ParentCommFollowUp = {
      date: format(new Date(), 'yyyy-MM-dd'),
      content: followUpContent,
    };
    await saveStudent({
      ...student,
      parent_communications: (student.parent_communications || []).map(c =>
        c.id === commId ? { ...c, follow_ups: [...(c.follow_ups || []), newFollowUp] } : c
      ),
    });
  }, [saveStudent]);

  const updateParentCommDate = useCallback(async (studentId: string, commId: string, field: 'date' | 'resolved_date', value: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        parent_communications: (student.parent_communications || []).map(c =>
          c.id === commId ? { ...c, [field]: value || undefined } : c
        ),
      });
    }
  }, [saveStudent]);

  const deleteParentCommunication = useCallback(async (studentId: string, commId: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        parent_communications: (student.parent_communications || []).filter(c => c.id !== commId),
      });
    }
  }, [saveStudent]);

  const toggleParentCommunicationStatus = useCallback(async (studentId: string, commId: string) => {
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      const today = format(new Date(), 'yyyy-MM-dd');
      await saveStudent({
        ...student,
        parent_communications: (student.parent_communications || []).map(c =>
          c.id === commId ? {
            ...c,
            status: c.status === 'pending' ? 'resolved' as const : 'pending' as const,
            resolved_date: c.status === 'pending' ? today : undefined,
          } : c
        ),
      });
    }
  }, [saveStudent]);

  const addExamRecord = useCallback(async (studentId: string, record: Omit<ExamRecord, 'id'>) => {
    const newRecord: ExamRecord = {
      id: randomAlphaId(),
      ...record,
    };
    const student = studentsRef.current.find(s => s.id === studentId);
    if (student) {
      await saveStudent({
        ...student,
        exam_records: [...(student.exam_records || []), newRecord],
      });
    }
  }, [saveStudent]);

  const applyHousePointDeltas = useCallback(async (deltas: Map<string, number>) => {
    for (const [studentId, delta] of deltas) {
      const student = studentsRef.current.find(s => s.id === studentId);
      if (student) {
        await saveStudent({
          ...student,
          house_points: Math.max(0, student.house_points + delta),
        });
      }
    }
  }, [saveStudent]);

  const batchAwardHP = useCallback(async (
    awards: { student_id: string; points: number; reason: string }[]
  ) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      for (const award of awards) {
        const student = studentsRef.current.find(s => s.id === award.student_id);
        if (student) {
          await saveStudent({
            ...student,
            house_points: student.house_points + award.points,
          });
        }
      }
      // Create HP award logs
      const logEntries: Omit<HPAwardLog, 'id'>[] = awards.map(award => {
        const student = studentsRef.current.find(s => s.id === award.student_id);
        return {
          date: today,
          student_id: award.student_id,
          student_name: student?.name || 'Unknown',
          class_name: student?.class_name || '',
          points: award.points,
          reason: award.reason || 'House Points Award',
          source: 'batch' as const,
        };
      });
      const createdLogs = await hpAwardService.createBatch(logEntries);
      setHpAwardLogs(prev => [...prev, ...createdLogs]);

      const totalPoints = awards.reduce((sum, a) => sum + a.points, 0);
      toast.success(`Awarded ${totalPoints} HP to ${awards.length} student${awards.length !== 1 ? 's' : ''}`);
    } catch (error) {
      toast.error('Failed to award house points');
    }
  }, [saveStudent, toast, setHpAwardLogs]);

  const deleteHPAwardLog = useCallback(async (id: string) => {
    try {
      await hpAwardService.delete(id);
      setHpAwardLogs(prev => prev.filter(l => l.id !== id));
      toast.success('HP award log deleted');
    } catch (error) {
      toast.error('Failed to delete HP award log');
    }
  }, [setHpAwardLogs, toast]);

  return {
    saveStudent,
    deleteStudent,
    addStatusRecord,
    updateStatusRecord,
    deleteStatusRecord,
    addWeakness,
    updateWeakness,
    deleteWeakness,
    addStudentRequest,
    updateStudentRequest,
    updateRequestDate,
    deleteStudentRequest,
    toggleRequestStatus,
    addParentCommunication,
    updateParentCommunication,
    addParentCommFollowUp,
    updateParentCommDate,
    deleteParentCommunication,
    toggleParentCommunicationStatus,
    addExamRecord,
    applyHousePointDeltas,
    batchAwardHP,
    deleteHPAwardLog,
  };
}
