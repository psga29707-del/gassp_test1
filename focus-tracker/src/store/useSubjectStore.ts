import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Subject } from '../types';

interface SubjectState {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subject: Partial<Omit<Subject, 'id'>>) => void;
  deleteSubject: (id: string) => void;
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: '1', name: '高等数学', color: '#3b82f6' }, // Blue
  { id: '2', name: '英语听力', color: '#ec4899' }, // Pink
  { id: '3', name: 'Python编程', color: '#10b981' }, // Green
];

export const useSubjectStore = create<SubjectState>()(
  persist(
    (set) => ({
      subjects: DEFAULT_SUBJECTS,
      addSubject: (subject) =>
        set((state) => ({
          subjects: [
            ...state.subjects,
            { ...subject, id: crypto.randomUUID() },
          ],
        })),
      updateSubject: (id, updatedFields) =>
        set((state) => ({
          subjects: state.subjects.map((s) =>
            s.id === id ? { ...s, ...updatedFields } : s
          ),
        })),
      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'focus-tracker-subjects',
    }
  )
);
