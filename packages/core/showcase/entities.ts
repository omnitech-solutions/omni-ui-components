export const NEW_COMPANY_OPTION = '__new__';
export const NEW_CONTACT_OPTION = '__new__';

export interface CompanyEntity {
  id: string;
  name: string;
  domain: string;
  initials: string;
  color: string;
  avatarUrl: string | null;
  description: string;
  industry: string;
}

export interface ContactEntity {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  initials: string;
  avatarUrl: string | null;
  jobTitle: string;
}

export interface MemberEntity {
  id: string;
  name: string;
  initials: string;
  color: string | null;
  group: 'PROJECT TEAM' | 'TEAM MEMBERS';
}

export interface ProjectEntity {
  id: string;
  name: string;
  organization: string;
  color: string;
  icon: string;
}

export interface TaskEntity {
  id: string;
  name: string;
}

export interface TaxRateEntity {
  id: string;
  label: string;
  percent: number;
}

export interface ExpenseCategoryEntity {
  id: string;
  label: string;
  group: 'ADS & MARKETING' | 'COGS' | 'COMMISSIONS & FEES';
}

export const SHOWCASE_COMPANIES: CompanyEntity[] = [
  { id: 'northstar', name: 'Northstar', domain: 'northstar.com', initials: 'N', color: '#5fd3a6', avatarUrl: null, description: '', industry: '' },
  { id: 'mixpanel', name: 'Mixpanel', domain: 'mixpanel.com', initials: 'M', color: '#7b59d6', avatarUrl: null, description: '', industry: '' },
  { id: 'doppler', name: 'Doppler', domain: 'doppler.com', initials: 'D', color: '#d35fd1', avatarUrl: null, description: '', industry: '' },
  { id: 'cursor', name: 'Cursor', domain: 'cursor.com', initials: 'C', color: '#888', avatarUrl: null, description: '', industry: '' },
  { id: 'mermaid', name: 'Mermaid Chart', domain: 'mermaidchart.com', initials: 'M', color: '#ff007a', avatarUrl: null, description: '', industry: '' },
];

export const SHOWCASE_CONTACTS: ContactEntity[] = [
  { id: 'academyemanabdo', name: 'Academyemanabdo', email: 'academyemanabdo@gmail.com', phoneNumber: '', initials: 'AC', avatarUrl: null, jobTitle: '' },
  { id: 'adrienne', name: 'Adrienne', email: 'adrienne@anicolebydesign.com', phoneNumber: '', initials: 'AD', avatarUrl: null, jobTitle: '' },
  { id: 'amanda', name: 'Amanda', email: 'amanda@abf-coaching.com', phoneNumber: '', initials: 'AM', avatarUrl: null, jobTitle: '' },
  { id: 'amy-gonzalez', name: 'Amy Gonzalez', email: 'amy.gonzalez@cbtcampus.it.com', phoneNumber: '', initials: 'AG', avatarUrl: null, jobTitle: '' },
  { id: 'andrew-daniels', name: 'Andrew Daniels', email: 'adaniels@stripe.com', phoneNumber: '', initials: 'AD', avatarUrl: null, jobTitle: '' },
];

export const SHOWCASE_MEMBERS: MemberEntity[] = [
  { id: 'do', name: "Desmond O'Leary", initials: 'DO', color: null, group: 'PROJECT TEAM' },
  { id: 'tw', name: 'Tyze Whorton', initials: 'TW', color: null, group: 'PROJECT TEAM' },
  { id: 'ld', name: 'Lucas Did', initials: 'LD', color: null, group: 'PROJECT TEAM' },
  { id: 'mn', name: 'Matt Nish', initials: 'MN', color: null, group: 'TEAM MEMBERS' },
  { id: 'mw', name: 'Matt Williams', initials: 'MW', color: null, group: 'TEAM MEMBERS' },
];

export const SHOWCASE_PROJECTS: ProjectEntity[] = [
  { id: 'bugs-w27', name: 'Bugs - Week 27', organization: 'Omni Product Development', color: '#e07a5f', icon: 'bug' },
  { id: 'bugs-w30', name: 'Bugs - Week 30', organization: 'Omni Product Development', color: '#e07a5f', icon: 'bug' },
  { id: 'bugs-w31', name: 'Bugs - Week 31', organization: 'Omni Product Development', color: '#e07a5f', icon: 'bug' },
  { id: 'security', name: 'Security Items', organization: 'Omni Product Development', color: '#808080', icon: 'lock' },
];

export const SHOWCASE_TASKS: TaskEntity[] = [
  { id: 'res-eval', name: 'Resourcing Evaluation' },
  { id: 'create-quote', name: 'Create Proposal/Quote' },
  { id: 'send-quote', name: 'Send Proposal/Quote' },
  { id: 'follow-up', name: 'Schedule Follow Up Call' },
];

export const SHOWCASE_TAX_RATES: TaxRateEntity[] = [
  { id: 'none', label: 'No tax', percent: 0 },
  { id: 'standard_10', label: '10% (Standard Sales Tax)', percent: 0.1 },
  { id: 'state_5', label: '5% (State Tax)', percent: 0.05 },
  { id: 'vat_20', label: '20% (VAT)', percent: 0.2 },
];

export const SHOWCASE_EXPENSE_CATEGORIES: ExpenseCategoryEntity[] = [
  { id: 'advertising', label: 'Advertising', group: 'ADS & MARKETING' },
  { id: 'cost_of_labor', label: 'Cost of Labor', group: 'COGS' },
  { id: 'materials', label: 'Materials & Supplies', group: 'COGS' },
  { id: 'misc_cogs', label: 'Misc COGS', group: 'COGS' },
  { id: 'misc_fees', label: 'Misc Fees', group: 'COMMISSIONS & FEES' },
];
