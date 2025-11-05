
export type AttendanceStatus = 'Present' | 'Absent';

export interface Student {
  id: number;
  name: string;
  imageUrl: string;
  status: AttendanceStatus;
}
