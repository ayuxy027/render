export interface Case {
    id: string;
    title: string;
    court: string;
    nextHearing: string;
    status: 'upcoming' | 'completed' | 'pending';
    documents: string[];
    notes: string;
  }
  
  export interface Reminder {
    id: string;
    title: string;
    date: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
  }
  
  export interface Event extends Reminder {
    type: 'hearing' | 'meeting' | 'deadline' | 'appointment' | 'reminder';
  }