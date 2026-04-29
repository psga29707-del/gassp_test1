export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface FocusRecord {
  id: string;
  subjectId: string;
  startTime: number; // Timestamp
  endTime: number;   // Timestamp
  duration: number;  // Duration in minutes
}
