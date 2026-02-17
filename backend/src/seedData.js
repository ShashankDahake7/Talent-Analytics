/**
 * Seed data for Talent Analytics: job roles, learning items, employees, users.
 * 50 employees (8 managers + 42 ICs), 6 departments, multiple roles.
 */

export const JOB_ROLES = [
  { roleId: 'ENG_SWE_2', title: 'Software Engineer', jobFamily: 'Engineering', level: 'L2', requiredSkills: [{ name: 'JavaScript', minLevel: 3 }, { name: 'React', minLevel: 3 }, { name: 'Node.js', minLevel: 3 }] },
  { roleId: 'ENG_SWE_3', title: 'Senior Software Engineer', jobFamily: 'Engineering', level: 'L3', requiredSkills: [{ name: 'JavaScript', minLevel: 4 }, { name: 'React', minLevel: 4 }, { name: 'Node.js', minLevel: 4 }] },
  { roleId: 'ENG_LEAD_4', title: 'Engineering Manager', jobFamily: 'Engineering', level: 'L4', requiredSkills: [{ name: 'Leadership', minLevel: 4 }, { name: 'System Design', minLevel: 3 }, { name: 'Agile', minLevel: 3 }] },
  { roleId: 'HR_BP_2', title: 'HR Business Partner', jobFamily: 'HR', level: 'L2', requiredSkills: [{ name: 'Employee Relations', minLevel: 3 }, { name: 'Policy', minLevel: 3 }, { name: 'Communication', minLevel: 4 }] },
  { roleId: 'HR_MGR_3', title: 'HR Manager', jobFamily: 'HR', level: 'L3', requiredSkills: [{ name: 'Employee Relations', minLevel: 4 }, { name: 'Policy', minLevel: 4 }, { name: 'Leadership', minLevel: 4 }] },
  { roleId: 'FIN_ANALYST_2', title: 'Financial Analyst', jobFamily: 'Finance', level: 'L2', requiredSkills: [{ name: 'Excel', minLevel: 4 }, { name: 'Financial Modeling', minLevel: 3 }, { name: 'SQL', minLevel: 3 }] },
  { roleId: 'FIN_MGR_3', title: 'Finance Manager', jobFamily: 'Finance', level: 'L3', requiredSkills: [{ name: 'Financial Modeling', minLevel: 4 }, { name: 'Leadership', minLevel: 4 }, { name: 'Compliance', minLevel: 3 }] },
  { roleId: 'OPS_COORD_2', title: 'Operations Coordinator', jobFamily: 'Operations', level: 'L2', requiredSkills: [{ name: 'Process Design', minLevel: 3 }, { name: 'Excel', minLevel: 3 }, { name: 'Communication', minLevel: 3 }] },
  { roleId: 'OPS_MGR_3', title: 'Operations Manager', jobFamily: 'Operations', level: 'L3', requiredSkills: [{ name: 'Process Design', minLevel: 4 }, { name: 'Leadership', minLevel: 4 }, { name: 'Vendor Management', minLevel: 3 }] },
  { roleId: 'MKT_SPEC_2', title: 'Marketing Specialist', jobFamily: 'Marketing', level: 'L2', requiredSkills: [{ name: 'Digital Marketing', minLevel: 3 }, { name: 'Content', minLevel: 3 }, { name: 'Analytics', minLevel: 3 }] },
  { roleId: 'MKT_MGR_3', title: 'Marketing Manager', jobFamily: 'Marketing', level: 'L3', requiredSkills: [{ name: 'Digital Marketing', minLevel: 4 }, { name: 'Leadership', minLevel: 4 }, { name: 'Strategy', minLevel: 4 }] },
  { roleId: 'DSG_UI_2', title: 'UI Designer', jobFamily: 'Design', level: 'L2', requiredSkills: [{ name: 'Figma', minLevel: 4 }, { name: 'UX', minLevel: 3 }, { name: 'Visual Design', minLevel: 4 }] },
  { roleId: 'DSG_LEAD_3', title: 'Design Lead', jobFamily: 'Design', level: 'L3', requiredSkills: [{ name: 'Figma', minLevel: 4 }, { name: 'UX', minLevel: 4 }, { name: 'Leadership', minLevel: 4 }] },
];

export const LEARNING_ITEMS = [
  { itemId: 'COURSE_REACT_ADV', title: 'Advanced React Patterns', type: 'course', skillsTargeted: ['React'], level: 'advanced', durationHours: 8, provider: 'Internal Academy' },
  { itemId: 'COURSE_NODE_API', title: 'Building Scalable Node.js APIs', type: 'course', skillsTargeted: ['Node.js', 'API design'], level: 'intermediate', durationHours: 6, provider: 'Internal Academy' },
  { itemId: 'COURSE_LEADERSHIP', title: 'People Leadership Fundamentals', type: 'course', skillsTargeted: ['Leadership', 'Communication'], level: 'intermediate', durationHours: 12, provider: 'Internal Academy' },
  { itemId: 'COURSE_EXCEL_ADV', title: 'Advanced Excel & Financial Modeling', type: 'course', skillsTargeted: ['Excel', 'Financial Modeling'], level: 'advanced', durationHours: 10, provider: 'Internal Academy' },
  { itemId: 'COURSE_DIGITAL_MKT', title: 'Digital Marketing & Analytics', type: 'course', skillsTargeted: ['Digital Marketing', 'Analytics'], level: 'intermediate', durationHours: 8, provider: 'Internal Academy' },
  { itemId: 'COURSE_FIGMA', title: 'Figma for Product Design', type: 'course', skillsTargeted: ['Figma', 'UX'], level: 'intermediate', durationHours: 6, provider: 'Internal Academy' },
  { itemId: 'PROJ_MENTOR', title: 'Engineering Mentorship Program', type: 'mentoring', skillsTargeted: ['Leadership', 'JavaScript'], level: 'intermediate', durationHours: 20, provider: 'Internal' },
  { itemId: 'ARTICLE_AGILE', title: 'Agile at Scale', type: 'article', skillsTargeted: ['Agile'], level: 'beginner', provider: 'Internal Wiki' },
];

/** Departments and their manager employeeIds */
export const DEPARTMENTS = [
  { id: 'ENG', name: 'Engineering', managerIds: ['M001', 'M002'] },
  { id: 'HR', name: 'Human Resources', managerIds: ['M003'] },
  { id: 'FIN', name: 'Finance', managerIds: ['M004'] },
  { id: 'OPS', name: 'Operations', managerIds: ['M005'] },
  { id: 'MKT', name: 'Marketing', managerIds: ['M006'] },
  { id: 'DSG', name: 'Design', managerIds: ['M007', 'M008'] },
];

const LOCATIONS = ['Bangalore', 'Hyderabad', 'Mumbai', 'Delhi', 'Pune', 'Chennai'];

const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30;
const baseDate = () => new Date(Date.now() - 36 * MS_PER_MONTH);
const monthsAgo = (m) => new Date(Date.now() - m * MS_PER_MONTH);

/** 8 managers: M001–M008. Low attrition risk: low leave, low overtime, promoted. */
export function getManagers() {
  const shared = {
    leaveDaysLast12Months: 8,
    overtimeHoursPerMonth: 4,
    lastPromotionDate: monthsAgo(14),
  };
  return [
    { employeeId: 'M001', name: 'Priya Sharma', email: 'priya.sharma@company.com', departmentId: 'ENG', roleId: 'ENG_LEAD_4', location: 'Bangalore', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Leadership', level: 5, yearsExperience: 8 }, { name: 'System Design', level: 4, yearsExperience: 6 }, { name: 'Agile', level: 4, yearsExperience: 5 }], performanceRating: 4.5, potentialRating: 5, engagementScore: 4.5, promotionsCount: 2, salaryPercentile: 85 },
    { employeeId: 'M002', name: 'Rahul Verma', email: 'rahul.verma@company.com', departmentId: 'ENG', roleId: 'ENG_LEAD_4', location: 'Hyderabad', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Leadership', level: 4, yearsExperience: 6 }, { name: 'Node.js', level: 5, yearsExperience: 7 }, { name: 'Agile', level: 4, yearsExperience: 4 }], performanceRating: 4, potentialRating: 4.5, engagementScore: 4, promotionsCount: 1, salaryPercentile: 75 },
    { employeeId: 'M003', name: 'Anita Desai', email: 'anita.desai@company.com', departmentId: 'HR', roleId: 'HR_MGR_3', location: 'Bangalore', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Employee Relations', level: 5, yearsExperience: 10 }, { name: 'Policy', level: 5, yearsExperience: 8 }, { name: 'Leadership', level: 5, yearsExperience: 6 }], performanceRating: 5, potentialRating: 5, engagementScore: 4.5, promotionsCount: 3, salaryPercentile: 80 },
    { employeeId: 'M004', name: 'Vikram Nair', email: 'vikram.nair@company.com', departmentId: 'FIN', roleId: 'FIN_MGR_3', location: 'Mumbai', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Financial Modeling', level: 5, yearsExperience: 9 }, { name: 'Leadership', level: 4, yearsExperience: 5 }, { name: 'Compliance', level: 4, yearsExperience: 6 }], performanceRating: 4.5, potentialRating: 4.5, engagementScore: 4, promotionsCount: 2, salaryPercentile: 82 },
    { employeeId: 'M005', name: 'Kavita Reddy', email: 'kavita.reddy@company.com', departmentId: 'OPS', roleId: 'OPS_MGR_3', location: 'Delhi', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Process Design', level: 5, yearsExperience: 7 }, { name: 'Leadership', level: 4, yearsExperience: 5 }, { name: 'Vendor Management', level: 4, yearsExperience: 6 }], performanceRating: 4, potentialRating: 4, engagementScore: 4, promotionsCount: 1, salaryPercentile: 70 },
    { employeeId: 'M006', name: 'Arjun Mehta', email: 'arjun.mehta@company.com', departmentId: 'MKT', roleId: 'MKT_MGR_3', location: 'Bangalore', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Digital Marketing', level: 5, yearsExperience: 8 }, { name: 'Leadership', level: 4, yearsExperience: 4 }, { name: 'Strategy', level: 4, yearsExperience: 6 }], performanceRating: 4.5, potentialRating: 4.5, engagementScore: 4.5, promotionsCount: 2, salaryPercentile: 78 },
    { employeeId: 'M007', name: 'Sneha Iyer', email: 'sneha.iyer@company.com', departmentId: 'DSG', roleId: 'DSG_LEAD_3', location: 'Bangalore', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Figma', level: 5, yearsExperience: 6 }, { name: 'UX', level: 5, yearsExperience: 7 }, { name: 'Leadership', level: 4, yearsExperience: 4 }], performanceRating: 5, potentialRating: 5, engagementScore: 4.5, promotionsCount: 2, salaryPercentile: 80 },
    { employeeId: 'M008', name: 'Rohan Kapoor', email: 'rohan.kapoor@company.com', departmentId: 'DSG', roleId: 'DSG_LEAD_3', location: 'Mumbai', status: 'active', dateOfJoining: baseDate(), ...shared, skills: [{ name: 'Figma', level: 4, yearsExperience: 5 }, { name: 'UX', level: 4, yearsExperience: 6 }, { name: 'Visual Design', level: 5, yearsExperience: 7 }], performanceRating: 4, potentialRating: 4.5, engagementScore: 4, promotionsCount: 1, salaryPercentile: 72 },
  ];
}

/** Jitter for variation within tier: base + (idx % (2*delta+1)) - delta */
const j = (base, delta, idx) => base + (idx % (2 * delta + 1)) - delta;

/** Risk profiles for ICs: low / medium / high. ML uses these to produce distinct bands. */
function riskLow(idx) {
  return {
    leaveDaysLast12Months: Math.max(0, j(8, 2, idx)),
    overtimeHoursPerMonth: Math.max(0, j(5, 2, idx)),
    lastPromotionDate: monthsAgo(10 + (idx % 6)),
    performanceRating: 4 + (idx % 2) * 0.5,
    engagementScore: 4 + (idx % 2) * 0.5,
    promotionsCount: 1,
    salaryPercentile: 58 + (idx % 14),
    tenureMonths: 24 + (idx % 10),
  };
}
function riskMed(idx) {
  const tenure = 18 + (idx % 10);
  return {
    leaveDaysLast12Months: 10 + (idx % 5),
    overtimeHoursPerMonth: 8 + (idx % 5),
    lastPromotionDate: monthsAgo(tenure), // Never promoted, but treating start date as reference avoids "999" penalty
    performanceRating: 3.2 + (idx % 2) * 0.3,
    engagementScore: 3.2 + (idx % 2) * 0.3,
    promotionsCount: 0,
    salaryPercentile: 48 + (idx % 12),
    tenureMonths: tenure,
  };
}
function riskHigh(idx) {
  return {
    leaveDaysLast12Months: 20 + (idx % 8),
    overtimeHoursPerMonth: 18 + (idx % 8),
    lastPromotionDate: null,
    performanceRating: 2 + (idx % 2) * 0.4,
    engagementScore: 2 + (idx % 2) * 0.4,
    promotionsCount: 0,
    salaryPercentile: 32 + (idx % 12),
    tenureMonths: 8 + (idx % 8),
  };
}

/** 42 ICs: E001–E042. Explicit mix: 14 low, 14 medium, 14 high risk (for ML to identify). */
export function getICs() {
  const roleIds = { ENG: ['ENG_SWE_2', 'ENG_SWE_3'], HR: ['HR_BP_2'], FIN: ['FIN_ANALYST_2'], OPS: ['OPS_COORD_2'], MKT: ['MKT_SPEC_2'], DSG: ['DSG_UI_2'] };
  const names = [
    'Alice Johnson', 'Bob Singh', 'Catherine Lee', 'David Park', 'Emma Wilson', 'Frank Brown', 'Grace Chen', 'Henry Davis',
    'Isha Patel', 'James Taylor', 'Kriti Nanda', 'Leo Martinez', 'Maya Krishnan', 'Neil Obrien', 'Olivia White', 'Prakash Kumar',
    'Qi Zhang', 'Rachel Green', 'Sam Thomas', 'Tina Agarwal', 'Uma Rao', 'Victor Lopez', 'Wendy Kim', 'Xavier Jones',
    'Yuki Tanaka', 'Zara Khan', 'Aditya Joshi', 'Bhavya Sree', 'Chiranjeev Das', 'Divya Menon', 'Eshaan Gupta', 'Farhan Sheikh',
    'Gayatri Pillai', 'Harsh Varma', 'Ira Malhotra', 'Jai Bhatnagar', 'Kiran Chopra', 'Lakshmi Rajan', 'Manish Dubey', 'Naina Kohli',
    'Omar Hassan', 'Pooja Saxena',
  ];
  const ics = [];
  const assignments = [
    { managerId: 'M001', dept: 'ENG', n: 6 }, { managerId: 'M002', dept: 'ENG', n: 6 },
    { managerId: 'M003', dept: 'HR', n: 6 }, { managerId: 'M004', dept: 'FIN', n: 6 },
    { managerId: 'M005', dept: 'OPS', n: 6 }, { managerId: 'M006', dept: 'MKT', n: 6 },
    { managerId: 'M007', dept: 'DSG', n: 3 }, { managerId: 'M008', dept: 'DSG', n: 3 },
  ];
  let idx = 0;
  const locs = [...LOCATIONS];
  const riskTier = (i) => (i < 14 ? 'low' : i < 28 ? 'med' : 'high');
  for (const { managerId, dept, n } of assignments) {
    const rids = roleIds[dept];
    for (let i = 0; i < n; i++) {
      const tier = riskTier(idx);
      const r = tier === 'low' ? riskLow(idx) : tier === 'med' ? riskMed(idx) : riskHigh(idx);
      const name = names[idx % names.length];
      const email = `e${String(idx + 1).padStart(3, '0')}@company.com`;
      const empId = `E${String(idx + 1).padStart(3, '0')}`;
      const roleId = rids[i % rids.length];
      let status = 'active';
      if (idx === 38) status = 'resigned';
      if (idx === 40) status = 'on_notice';
      const l = (min, max) => Math.min(5, Math.max(1, min + (idx % (max - min + 1))));
      const skills = roleId.startsWith('ENG')
        ? [{ name: 'JavaScript', level: l(3, 5), yearsExperience: 2 + (idx % 4) }, { name: 'React', level: l(2, 4), yearsExperience: 1 + (idx % 3) }, { name: 'Node.js', level: l(2, 4), yearsExperience: 1 + (idx % 3) }]
        : roleId.startsWith('HR')
          ? [{ name: 'Employee Relations', level: l(3, 5), yearsExperience: 2 + (idx % 4) }, { name: 'Communication', level: 4, yearsExperience: 3 }]
          : roleId.startsWith('FIN')
            ? [{ name: 'Excel', level: 4, yearsExperience: 3 }, { name: 'Financial Modeling', level: l(3, 5), yearsExperience: 2 + (idx % 3) }]
            : roleId.startsWith('OPS')
              ? [{ name: 'Process Design', level: l(3, 5), yearsExperience: 2 }, { name: 'Excel', level: 3, yearsExperience: 2 }]
              : roleId.startsWith('MKT')
                ? [{ name: 'Digital Marketing', level: l(3, 5), yearsExperience: 2 + (idx % 3) }, { name: 'Analytics', level: 3, yearsExperience: 2 }]
                : [{ name: 'Figma', level: l(3, 5), yearsExperience: 2 + (idx % 3) }, { name: 'UX', level: 3, yearsExperience: 2 }];
      ics.push({
        employeeId: empId,
        name,
        email,
        managerId,
        departmentId: dept,
        roleId,
        status,
        location: locs[idx % locs.length],
        skills,
        performanceRating: r.performanceRating,
        potentialRating: tier === 'low' ? 4.5 : tier === 'med' ? 3.5 : 2.5,
        engagementScore: r.engagementScore,
        promotionsCount: r.promotionsCount,
        salaryPercentile: r.salaryPercentile,
        leaveDaysLast12Months: r.leaveDaysLast12Months,
        overtimeHoursPerMonth: r.overtimeHoursPerMonth,
        lastPromotionDate: r.lastPromotionDate,
        dateOfJoining: new Date(Date.now() - r.tenureMonths * MS_PER_MONTH),
      });
      idx += 1;
    }
  }
  return ics;
}

/** Users: 1 HR_ADMIN, 8 MANAGER (M001–M008), 12 EMPLOYEE (E001–E012). All use password Admin@123. */
export function getUsers(passwordHash) {
  const hr = { email: 'hr@example.com', passwordHash, role: 'HR_ADMIN' };
  const managers = [
    { email: 'priya.sharma@company.com', role: 'MANAGER', employeeId: 'M001' },
    { email: 'rahul.verma@company.com', role: 'MANAGER', employeeId: 'M002' },
    { email: 'anita.desai@company.com', role: 'MANAGER', employeeId: 'M003' },
    { email: 'vikram.nair@company.com', role: 'MANAGER', employeeId: 'M004' },
    { email: 'kavita.reddy@company.com', role: 'MANAGER', employeeId: 'M005' },
    { email: 'arjun.mehta@company.com', role: 'MANAGER', employeeId: 'M006' },
    { email: 'sneha.iyer@company.com', role: 'MANAGER', employeeId: 'M007' },
    { email: 'rohan.kapoor@company.com', role: 'MANAGER', employeeId: 'M008' },
  ].map((u) => ({ ...u, passwordHash }));
  const employees = [
    'e001@company.com', 'e002@company.com', 'e003@company.com', 'e004@company.com', 'e005@company.com', 'e006@company.com',
    'e007@company.com', 'e008@company.com', 'e009@company.com', 'e010@company.com', 'e011@company.com', 'e012@company.com',
  ].map((email, i) => ({
    email,
    passwordHash,
    role: 'EMPLOYEE',
    employeeId: `E${String(i + 1).padStart(3, '0')}`,
  }));
  return { hr, managers, employees };
}

/** Sample feedback for a few employees (for Feedback Summary AI) */
export function getFeedback() {
  return [
    { employeeId: 'E001', source: 'survey', text: 'Great team culture and work-life balance. Would appreciate more clarity on promotion criteria.' },
    { employeeId: 'E001', source: 'manager', text: 'Alice consistently delivers high-quality work and mentors juniors effectively.' },
    { employeeId: 'E002', source: 'peer', text: 'Bob is reliable and collaborative. Sometimes needs more time for complex tasks.' },
    { employeeId: 'E005', source: 'survey', text: 'Enjoy working here. Career growth could be faster.' },
    { employeeId: 'E010', source: 'manager', text: 'Strong performer. Ready for more ownership.' },
    { employeeId: 'E015', source: 'survey', text: 'HR policies are clear. Benefits are competitive.' },
    { employeeId: 'E020', source: 'exit', text: 'Leaving for a better opportunity. Grateful for the learning.' },
  ];
}
