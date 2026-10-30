// ============================================================
// MASID - TypeScript Type Definitions
// ============================================================

// ---- User & Auth ----
export type UserRole = 'admin' | 'staff' | 'resident';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  profilePhoto?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  securityQuestion1?: string;
  securityAnswer1?: string;
  securityQuestion2?: string;
  securityAnswer2?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ---- Resident ----
export type Gender = 'male' | 'female' | 'other';
export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated';

export interface Resident {
  id: number;
  userId?: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  address: string;
  contactNumber?: string;
  birthdate?: string;
  gender?: Gender;
  civilStatus?: CivilStatus;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
}

// ---- Beneficiary ----
export type BeneficiaryCategory = 'senior_citizen' | 'pwd' | 'solo_parent' | '4ps' | 'indigent' | 'other';
export type BeneficiaryStatus = 'active' | 'inactive' | 'archived';

export interface Beneficiary {
  id: number;
  residentId: number;
  resident?: Resident;
  beneficiaryCode: string;
  category: BeneficiaryCategory;
  status: BeneficiaryStatus;
  dateRegistered: string;
  notes?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Payout ----
export type PayoutProgramCategory = 'financial' | 'food' | 'medical' | 'educational' | 'livelihood' | 'other';
export type PayoutProgramStatus = 'active' | 'completed' | 'cancelled' | 'draft';
export type PayoutScheduleStatus = 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
export type PayoutTransactionStatus = 'pending' | 'claimed' | 'unclaimed' | 'cancelled';

export interface PayoutProgram {
  id: number;
  name: string;
  description?: string;
  category: PayoutProgramCategory;
  budget?: number;
  amountPerBeneficiary?: number;
  status: PayoutProgramStatus;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  schedulesCount?: number;
}

export interface PayoutSchedule {
  id: number;
  programId: number;
  program?: PayoutProgram;
  name: string;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
  status: PayoutScheduleStatus;
  isPublic: boolean;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  transactionsCount?: number;
  claimedCount?: number;
  pendingCount?: number;
}

export interface PayoutTransaction {
  id: number;
  scheduleId: number;
  schedule?: PayoutSchedule;
  beneficiaryId: number;
  beneficiary?: Beneficiary;
  amount: number;
  status: PayoutTransactionStatus;
  claimedAt?: string;
  notes?: string;
  recordedBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Resource ----
export type ResourceCategory = 'food' | 'medicine' | 'hygiene' | 'clothing' | 'equipment' | 'other';
export type ResourceStatus = 'available' | 'low_stock' | 'out_of_stock';

export interface Resource {
  id: number;
  name: string;
  category: ResourceCategory;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  dateAdded: string;
  expirationDate?: string;
  description?: string;
  status: ResourceStatus;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ---- Resource Distribution ----
export interface ResourceDistribution {
  id: number;
  resourceId: number;
  resource?: Resource;
  beneficiaryId?: number;
  beneficiary?: Beneficiary;
  recipientName?: string;
  quantity: number;
  distributionDate: string;
  purpose?: string;
  notes?: string;
  distributedBy?: number;
  distributor?: User;
  createdAt: string;
}

// ---- Announcement ----
export type AnnouncementCategory = 'health' | 'community' | 'emergency' | 'livelihood' | 'general' | 'youth' | 'senior' | 'environmental';
export type ContentStatus = 'draft' | 'published' | 'archived';

export interface Announcement {
  id: number;
  title: string;
  category: AnnouncementCategory;
  content: string;
  shortDescription?: string;
  imageUrl?: string;
  authorId?: number;
  author?: User;
  status: ContentStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Event ----
export type EventCategory = 'assembly' | 'health' | 'sports' | 'youth' | 'senior' | 'livelihood' | 'environmental' | 'cultural' | 'other';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export interface BarangayEvent {
  id: number;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  category: EventCategory;
  imageUrl?: string;
  status: EventStatus;
  maxParticipants?: number;
  createdBy?: number;
  creator?: User;
  createdAt: string;
  updatedAt: string;
}

// ---- Notification ----
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'payout' | 'resource' | 'announcement' | 'event';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  referenceType?: string;
  referenceId?: number;
  isRead: boolean;
  createdAt: string;
}

// ---- Audit Log ----
export interface AuditLog {
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  module: string;
  recordId?: number;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

// ---- Dashboard Stats ----
export interface DashboardStats {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  upcomingPayouts: number;
  pendingTransactions: number;
  totalResources: number;
  lowStockItems: number;
  outOfStockItems: number;
  distributedThisMonth: number;
  upcomingEvents: number;
  publishedAnnouncements: number;
  payoutsByStatus: { status: string; count: number }[];
  resourcesByCategory: { category: string; quantity: number }[];
  monthlyAssistance: { month: string; amount: number; count: number }[];
  recentAuditLogs: AuditLog[];
}

// ---- API Response ----
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// ---- Filters & Queries ----
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BeneficiaryQuery extends PaginationQuery {
  category?: BeneficiaryCategory;
  status?: BeneficiaryStatus;
}

export interface PayoutQuery extends PaginationQuery {
  status?: PayoutTransactionStatus | PayoutScheduleStatus;
  programId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface ResourceQuery extends PaginationQuery {
  category?: ResourceCategory;
  status?: ResourceStatus;
}

export interface AnnouncementQuery extends PaginationQuery {
  category?: AnnouncementCategory;
  status?: ContentStatus;
}

export interface EventQuery extends PaginationQuery {
  category?: EventCategory;
  status?: EventStatus;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogQuery extends PaginationQuery {
  module?: string;
  action?: string;
  userId?: number;
  dateFrom?: string;
  dateTo?: string;
}

// ---- Report ----
export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  status?: string;
  format?: 'pdf' | 'excel';
}
