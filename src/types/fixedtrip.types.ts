export interface Schedule {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  location: string;
  subjectName: string;
}

export interface ComparedSchedule {
  previousSchedule1: Schedule;
  previousSchedule2: Schedule;
  nextSchedule1: Schedule;
  nextSchedule2: Schedule;
  driverId: number;
  driverName: string;
  phoneNumber: string;
  urlPublicAvatar: string; 
}

export interface User {
    id: number;
    fullName: string;
    profile: Profile;
}

export interface FixedTripRequest {
  id: number;
  requester: User;
  requestedDays: string[];
  startTime: string;
  endTime: string;
  startLocation: string;
  destination: string;
  profile: Profile;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  urlPublicAvatar: string | null;
  pathAvatar: string | null;
  phone: string | null;
  dob: string;
  username: string;
  user: {
    id: number;
  };
}

export interface Trip {
  id: number;
  slot: number;
  departureTime: string;
  startLocation: string;
  destination: string;
  dayOfWeek: string;
  status: string; // hoặc TripStatus nếu bạn có enum
  driver: User;
  customers: User[];
  approvedCustomers: User[];
}