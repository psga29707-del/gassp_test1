import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FocusRecord } from '../types';

interface RecordState {
  records: FocusRecord[];
  addRecord: (record: Omit<FocusRecord, 'id'>) => void;
}

export const useRecordStore = create<RecordState>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({
          records: [
            ...state.records,
            { ...record, id: crypto.randomUUID() },
          ],
        })),
    }),
    {
      name: 'focus-tracker-records',
    }
  )
);
