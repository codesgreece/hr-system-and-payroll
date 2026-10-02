/** Greek labels for enums and shared UI */

const ENUM_LABELS: Record<string, string> = {
  // Roles
  OWNER: "Ιδιοκτήτης",
  HR: "HR",

  // Employee
  ACTIVE: "Ενεργός",
  ON_LEAVE: "Σε άδεια",
  ARCHIVED: "Αρχειοθετημένος",
  FULL_TIME: "Πλήρης απασχόληση",
  PART_TIME: "Μερική απασχόληση",
  CONTRACT: "Σύμβαση",
  INTERN: "Πρακτική",

  // Leave
  ANNUAL: "Κανονική",
  SICK: "Ασθενείας",
  UNPAID: "Άνευ αποδοχών",
  OTHER: "Άλλο",
  PLANNED: "Προγραμματισμένη",
  APPROVED: "Εγκεκριμένη",
  COMPLETED: "Ολοκληρωμένη",
  CANCELLED: "Ακυρωμένη",

  // Documents (CONTRACT already above)
  IDENTIFICATION: "Ταυτοποίηση",
  AGREEMENT: "Συμφωνητικό",
  CERTIFICATE: "Πιστοποιητικό",

  // Candidates
  NEW: "Νέος",
  SCREENING: "Αξιολόγηση",
  INTERVIEW: "Συνέντευξη",
  OFFER: "Προσφορά",
  HIRED: "Προσλήφθηκε",
  REJECTED: "Απορρίφθηκε",

  // Projects
  PLANNING: "Σχεδιασμός",
  // ACTIVE already
  REVIEW: "Αναθεώρηση",
  // COMPLETED, ARCHIVED already

  // Tasks
  TODO: "Προς υλοποίηση",
  IN_PROGRESS: "Σε εξέλιξη",
  // REVIEW, COMPLETED
  LOW: "Χαμηλή",
  MEDIUM: "Μεσαία",
  HIGH: "Υψηλή",
  URGENT: "Επείγουσα",

  // Revenue
  WEBSITE: "Ιστοσελίδα",
  LANDING_PAGE: "Landing Page",
  ECOMMERCE: "E-commerce",
  MAINTENANCE: "Συντήρηση",
  ADVERTISING: "Διαφήμιση",
  CONSULTING: "Συμβουλευτική",
  // OTHER

  // Payment status (revenue)
  PENDING: "Εκκρεμεί",
  PAID: "Εξοφλημένο",
  OVERDUE: "Ληξιπρόθεσμο",
  // CANCELLED

  // Payment methods
  BANK_TRANSFER: "Τραπεζική μεταφορά",
  CARD: "Κάρτα",
  CASH: "Μετρητά",
  PAYPAL: "PayPal",

  // Expenses
  SOFTWARE: "Λογισμικό",
  AI_TOOLS: "AI εργαλεία",
  HOSTING: "Hosting",
  DOMAINS: "Domains",
  EQUIPMENT: "Εξοπλισμός",
  HARDWARE: "Hardware",
  OFFICE: "Γραφείο",
  MARKETING: "Marketing",
  SUBSCRIPTIONS: "Συνδρομές",
  SERVICES: "Υπηρεσίες",
  BANK_FEES: "Τραπεζικά τέλη",
  TRANSPORTATION: "Μετακινήσεις",

  // Recurring
  WEEKLY: "Εβδομαδιαία",
  MONTHLY: "Μηνιαία",
  QUARTERLY: "Τριμηνιαία",
  YEARLY: "Ετήσια",
  BIWEEKLY: "Δεκαπενθήμερη",

  // Payroll
  SALARY: "Μισθός",
  BONUS: "Bonus",
  COMMISSION: "Προμήθεια",
};

// Resolve conflicts for overlapping keys by context-aware helpers when needed.
// For shared keys we pick the most common Greek form above.

export function el(value: string | null | undefined): string {
  if (!value) return "—";
  const key = value.toUpperCase();
  if (ENUM_LABELS[key]) return ENUM_LABELS[key];
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ui = {
  save: "Αποθήκευση",
  saving: "Αποθήκευση…",
  delete: "Διαγραφή",
  edit: "Επεξεργασία",
  view: "Προβολή",
  cancel: "Ακύρωση",
  filter: "Φίλτρο",
  search: "Αναζήτηση",
  actions: "Ενέργειες",
  notes: "Σημειώσεις",
  status: "Κατάσταση",
  type: "Τύπος",
  category: "Κατηγορία",
  date: "Ημερομηνία",
  amount: "Ποσό",
  name: "Όνομα",
  email: "Email",
  phone: "Τηλέφωνο",
  description: "Περιγραφή",
  yes: "Ναι",
  no: "Όχι",
  all: "Όλα",
  confirmDelete: "Είστε σίγουροι;",
  saved: "Αποθηκεύτηκε",
  deleted: "Διαγράφηκε",
  somethingWrong: "Κάτι πήγε στραβά",
  signIn: "Σύνδεση",
  signingIn: "Σύνδεση…",
  signOut: "Αποσύνδεση",
  password: "Κωδικός",
} as const;
