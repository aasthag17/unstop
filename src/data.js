export const initialUsers = [
  { id: 1, name: 'Alex Johnson', role: 'Employee', managerId: 2, department: 'Engineering' },
  { id: 2, name: 'Sarah Miller', role: 'Manager', department: 'Engineering' },
  { id: 3, name: 'David Chen', role: 'Admin', department: 'HR' }
];

export const initialGoals = [
  {
    id: 101,
    employeeId: 1,
    title: 'Launch New Web Portal',
    description: 'Complete the development and deployment of the new goal tracking portal.',
    thrustArea: 'Technology Innovation',
    uom: 'Timeline',
    target: '2026-06-30',
    weightage: 40,
    status: 'Approved',
    checkIns: [
      { quarter: 'Q1', actual: 'Development 50% complete', status: 'On Track', comment: 'Good progress.', date: '2026-04-15' }
    ]
  },
  {
    id: 102,
    employeeId: 1,
    title: 'Reduce System Downtime',
    description: 'Decrease average system downtime per month.',
    thrustArea: 'Operational Excellence',
    uom: 'Zero',
    target: '0',
    weightage: 30,
    status: 'Approved',
    checkIns: []
  },
  {
    id: 103,
    employeeId: 1,
    title: 'Code Review Coverage',
    description: 'Ensure code reviews are completed for all PRs.',
    thrustArea: 'Quality',
    uom: '%',
    target: '100',
    weightage: 30,
    status: 'Draft',
    checkIns: []
  }
];

// Helper to init localStorage
export const initStorage = () => {
  if (!localStorage.getItem('aq_users')) {
    localStorage.setItem('aq_users', JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem('aq_goals')) {
    localStorage.setItem('aq_goals', JSON.stringify(initialGoals));
  }
};

export const getGoals = () => JSON.parse(localStorage.getItem('aq_goals') || '[]');
export const saveGoals = (goals) => localStorage.setItem('aq_goals', JSON.stringify(goals));
