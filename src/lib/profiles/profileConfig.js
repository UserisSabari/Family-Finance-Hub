export const FINANCIAL_PROFILES = {
  student: {
    id: 'student',
    label: 'Student',
    emoji: '🎓',
    tagline: 'Pocket money, hostel mess, travel, and campus essentials',
    quickAmounts: [10, 20, 50, 100, 200, 500],
    expenseCategories: [
      'Chai & Snacks',
      'Mess & Food',
      'Travel / Auto',
      'Print & Stationery',
      'Hostel & Fees',
      'Groceries',
      'Shopping',
      'Entertainment',
      'Medical',
    ],
    incomeCategories: [
      'Pocket Money',
      'Scholarship',
      'Part-time / Stipend',
      'Gift / Relatives',
    ],
    features: {
      enablePeerSplits: true,
      enablePocketMoneyPace: true,
      enableAcademicPassThrough: true,
    },
  },
  salaried: {
    id: 'salaried',
    label: 'Salaried',
    emoji: '💼',
    tagline: 'Monthly salary, rent, bills, groceries, and wealth building',
    quickAmounts: [100, 200, 500, 1000, 2000],
    expenseCategories: [
      'Groceries',
      'Food & Dining',
      'Rent',
      'Utilities',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Medical',
      'Investment / EMI',
    ],
    incomeCategories: [
      'Salary',
      'Bonus',
      'Investments / Dividend',
      'Other Income',
    ],
    features: {
      enablePeerSplits: false,
      enablePocketMoneyPace: false,
      enableAcademicPassThrough: false,
    },
  },
  freelancer: {
    id: 'freelancer',
    label: 'Freelancer',
    emoji: '💻',
    tagline: 'Irregular client payouts, project expenses, and tax buffers',
    quickAmounts: [100, 500, 1000, 2000, 5000],
    expenseCategories: [
      'Work Tools & Software',
      'Client Meetings & Dining',
      'Workspace & Internet',
      'Equipment & Hardware',
      'Tax & Accounting',
      'Groceries & Living',
      'Healthcare',
    ],
    incomeCategories: [
      'Client Invoices',
      'Retainers',
      'Project Milestones',
      'Royalties / Affiliate',
    ],
    features: {
      enablePeerSplits: false,
      enablePocketMoneyPace: false,
      enableAcademicPassThrough: false,
    },
  },
  family: {
    id: 'family',
    label: 'Family / Household',
    emoji: '👨‍👩‍👧',
    tagline: 'Shared home expenses, kids education, groceries, and savings',
    quickAmounts: [200, 500, 1000, 2000, 5000],
    expenseCategories: [
      'Groceries & Supplies',
      'Housing & Maintenance',
      'Children Education',
      'Utilities & Bills',
      'Healthcare & Insurance',
      'Family Dining',
      'Household Help',
    ],
    incomeCategories: [
      'Primary Income',
      'Partner Income',
      'Rental / Property',
      'Other Family Inflow',
    ],
    features: {
      enablePeerSplits: false,
      enablePocketMoneyPace: false,
      enableAcademicPassThrough: false,
    },
  },
};

export const DEFAULT_PROFILE_ID = 'salaried';

export function listFinancialProfiles() {
  return Object.values(FINANCIAL_PROFILES);
}

export function getProfileConfig(profileId) {
  if (profileId && FINANCIAL_PROFILES[profileId]) {
    return FINANCIAL_PROFILES[profileId];
  }
  return FINANCIAL_PROFILES[DEFAULT_PROFILE_ID];
}
