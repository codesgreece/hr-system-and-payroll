export const EMPLOYEE_STATUSES = ["ACTIVE", "ON_LEAVE", "ARCHIVED"] as const;
export const EMPLOYMENT_TYPES = ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"] as const;
export const LEAVE_TYPES = ["ANNUAL", "SICK", "UNPAID", "OTHER"] as const;
export const LEAVE_STATUSES = ["PLANNED", "APPROVED", "COMPLETED", "CANCELLED"] as const;
export const DOCUMENT_CATEGORIES = [
  "CONTRACT",
  "IDENTIFICATION",
  "AGREEMENT",
  "CERTIFICATE",
  "OTHER",
] as const;
export const CANDIDATE_STATUSES = [
  "NEW",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
] as const;
export const PROJECT_STATUSES = [
  "PLANNING",
  "ACTIVE",
  "REVIEW",
  "COMPLETED",
  "ARCHIVED",
] as const;
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const;
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const REVENUE_CATEGORIES = [
  "WEBSITE",
  "LANDING_PAGE",
  "ECOMMERCE",
  "MAINTENANCE",
  "ADVERTISING",
  "CONSULTING",
  "OTHER",
] as const;
export const PAYMENT_STATUSES = ["PENDING", "PAID", "OVERDUE", "CANCELLED"] as const;
export const PAYMENT_METHODS = [
  "BANK_TRANSFER",
  "CARD",
  "CASH",
  "PAYPAL",
  "OTHER",
] as const;
export const EXPENSE_CATEGORIES = [
  "SOFTWARE",
  "AI_TOOLS",
  "HOSTING",
  "DOMAINS",
  "ADVERTISING",
  "EQUIPMENT",
  "HARDWARE",
  "OFFICE",
  "MARKETING",
  "SUBSCRIPTIONS",
  "SERVICES",
  "BANK_FEES",
  "TRANSPORTATION",
  "OTHER",
] as const;
export const RECURRING_FREQUENCIES = ["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
export const SALARY_FREQUENCIES = ["WEEKLY", "BIWEEKLY", "MONTHLY", "YEARLY"] as const;
export const PAYROLL_TYPES = ["SALARY", "BONUS", "COMMISSION", "OTHER"] as const;
export const PAYROLL_STATUSES = ["PENDING", "APPROVED", "PAID", "CANCELLED"] as const;
