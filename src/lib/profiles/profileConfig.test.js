import { describe, expect, it } from 'vitest';
import {
  FINANCIAL_PROFILES,
  getProfileConfig,
  listFinancialProfiles,
} from './profileConfig';

describe('profileConfig', () => {
  it('exposes predefined financial profiles for student, salaried, freelancer, and family', () => {
    const profiles = listFinancialProfiles();
    expect(profiles.map((p) => p.id)).toEqual(['student', 'salaried', 'freelancer', 'family']);
  });

  it('provides student-tailored quick amounts and categories', () => {
    const student = getProfileConfig('student');
    expect(student.label).toBe('Student');
    expect(student.quickAmounts).toEqual([10, 20, 50, 100, 200, 500]);
    expect(student.expenseCategories).toContain('Chai & Snacks');
    expect(student.expenseCategories).toContain('Mess & Food');
    expect(student.expenseCategories).toContain('Print & Stationery');
    expect(student.incomeCategories).toContain('Pocket Money');
    expect(student.incomeCategories).toContain('Scholarship');
  });

  it('provides salaried-tailored quick amounts and categories', () => {
    const salaried = getProfileConfig('salaried');
    expect(salaried.label).toBe('Salaried');
    expect(salaried.quickAmounts).toEqual([100, 200, 500, 1000, 2000]);
    expect(salaried.expenseCategories).toContain('Rent');
    expect(salaried.expenseCategories).toContain('Groceries');
    expect(salaried.incomeCategories).toContain('Salary');
  });

  it('falls back gracefully to salaried profile when given invalid or missing profile id', () => {
    expect(getProfileConfig(null).id).toBe('salaried');
    expect(getProfileConfig(undefined).id).toBe('salaried');
    expect(getProfileConfig('nonexistent_profile').id).toBe('salaried');
  });
});
