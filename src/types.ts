export type UserRole = 'admin' | 'candidate';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: number;
}

export type CandidateStatus = 'New' | 'Interview' | 'Selected' | 'Rejected' | 'Blacklisted';
export type JobCategory = 'Driver' | 'Developer' | 'Delivery Boy' | 'Data Entry' | 'Receptionist' | 'Technical Assistant' | 'Security' | 'Housekeeping' | 'Other';

export interface Candidate {
  id: string;
  uid?: string; // Linked user ID if they registered
  name: string;
  phone: string;
  email: string;
  category: JobCategory;
  skills: string[];
  experience: string;
  resumeUrl?: string;
  photoUrl?: string;
  documents?: {
    aadharCardUrl?: string;
    panCardUrl?: string;
    passportUrl?: string;
    drivingLicenceUrl?: string;
  };
  status: CandidateStatus;
  createdAt: number;
  updatedAt: number;
}

export interface Client {
  id: string;
  companyName: string;
  industry: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  createdAt: number;
}

export type JobStatus = 'Open' | 'Closed' | 'Paused';

export interface Job {
  id: string;
  title: string;
  clientId: string;
  clientName?: string;
  category: JobCategory;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  salary: string;
  location: string;
  openings: number;
  status: JobStatus;
  imageUrl?: string;
  createdAt: number;
}

export interface Application {
  id: string;
  candidateId: string;
  jobId: string;
  status: 'Applied' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  appliedAt: number;
  updatedAt: number;
}

export interface HistoryRecord {
  id: string;
  candidateId: string;
  company: string;
  role: string;
  joiningDate: string;
  leavingDate?: string;
  performanceRating: number;
  exitReason: string;
  eligibleForRehire: boolean;
  confidentialNotes?: string; // Admin only
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
}
