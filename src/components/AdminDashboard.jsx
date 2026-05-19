import React, { useState, useEffect } from 'react';
import { getGoals, initialUsers, saveGoals } from '../data';
import { Download, Users, Settings, Activity, FileText, Share2, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const [goals, setGoals] = useState([]);
  const [showSharedModal, setShowSharedModal] = useState(false);
  const [sharedGoalForm, setSharedGoalForm] = useState({ title: '', description: '', target: '', uom: 'Numeric', thrustArea: 'Business Growth' });

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const totalEmployees = initialUsers.filter(u => u.role === 'Employee').length;
  const employeesWithGoals = new Set(goals.map(g => g.employeeId)).size;
  const completionRate = totalEmployees ? Math.round((employeesWithGoals / totalEmployees) * 100) : 0;

  // Chart Data
  const thrustAreaData = Object.entries(
    goals.reduce((acc, g) => ({ ...acc, [g.thrustArea]: (acc[g.thrustArea] || 0) + 1 }), {})
  ).map(([name, value]) => ({ name, value }));

  const statusData = Object.entries(
    goals.reduce((acc, g) => ({ ...acc, [g.status]: (acc[g.status] || 0) + 1 }), {})
  ).map(([name, value]) => ({ name, value }));

  const downloadCSV = () => {
    const headers = ['Employee ID', 'Employee Name', 'Goal Title', 'Thrust Area', 'Weightage', 'Target', 'UoM', 'Status'];
    const rows = goals.map(g => {
      const user = initialUsers.find(u => u.id === g.employeeId);
      return [
        g.employeeId,
        user?.name || 'Unknown',
        `"${g.title}"`,
        g.thrustArea,
        g.weightage,
        `"${g.target}"`,
        g.uom,
        g.status
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "goal_achievement_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pushSharedGoal = () => {
    if (!sharedGoalForm.title || !sharedGoalForm.target) return;
    
    const employees = initialUsers.filter(u => u.role === 'Employee');
    const newGoals = employees.map(emp => ({
      id: Date.now() + Math.random(),
      employeeId: emp.id,
      title: sharedGoalForm.title,
      description: sharedGoalForm.description,
      thrustArea: sharedGoalForm.thrustArea,
      uom: sharedGoalForm.uom,
      target: sharedGoalForm.target,
      weightage: 10, // Default adjustable weightage
      status: 'Draft',
      isShared: true, // Marker for shared goal
      checkIns: []
    }));

    const updatedGoals = [...goals, ...newGoals];
    saveGoals(updatedGoals);
    setGoals(updatedGoals);
    setShowSharedModal(false);
    alert('Departmental goal pushed to all employees successfully!');
  };

  return (
    <div className="animate-fade-in delay-100">
      <div className="flex-between mb-6">
        <div>
          <h2>Admin Control Center</h2>
          <p className="text-muted text-sm mt-1">Governance, Analytics & Cycle Management</p>
        </div>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowSharedModal(true)}>
            <Share2 size={16} /> Push Shared Goal
          </button>
          <button className="btn btn-primary" onClick={downloadCSV}>
            <Download size={16} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 mb-6" style={{ gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--info)', marginBottom: '1rem' }}>
            <Users size={20} />
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Employees</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalEmployees}</div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--success)', marginBottom: '1rem' }}>
            <Activity size={20} />
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Goal Setting Completion</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{completionRate}%</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', marginBottom: '1rem' }}>
            <FileText size={20} />
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Total Goals Tracked</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{goals.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div className="flex-center" style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)', marginBottom: '1rem' }}>
            <Settings size={20} />
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>Active Cycle</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Q1 2026</div>
        </div>
      </div>

      <div className="grid grid-cols-2 mb-6" style={{ gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4" style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} /> Goals by Thrust Area
          </h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={thrustAreaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
                <Bar dataKey="value" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 className="mb-4" style={{ fontSize: '1.125rem' }}>Goal Status Distribution</h3>
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '0.5rem' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 className="mb-4" style={{ fontSize: '1.25rem' }}>System Audit Trail</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{new Date().toLocaleString()}</td>
                <td>David Chen (Admin)</td>
                <td>Viewed Dashboard</td>
                <td>System Analytics</td>
              </tr>
              <tr>
                <td>2026-05-18 04:30 PM</td>
                <td>Sarah Miller (Manager)</td>
                <td>Goal Approved</td>
                <td>Alex Johnson - Goal #101</td>
              </tr>
              <tr>
                <td>2026-05-18 09:00 AM</td>
                <td>Alex Johnson (Employee)</td>
                <td>Goal Submitted</td>
                <td>Alex Johnson (3 Goals)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {showSharedModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '500px', padding: '2rem' }}>
            <h3 className="mb-4">Push Departmental Goal</h3>
            <p className="text-muted mb-4" style={{ fontSize: '0.875rem' }}>This will create a locked-content goal for all employees. They can only adjust the weightage.</p>
            
            <div className="form-group">
              <label className="form-label">Goal Title</label>
              <input className="form-input" value={sharedGoalForm.title} onChange={e => setSharedGoalForm({...sharedGoalForm, title: e.target.value})} placeholder="e.g. Complete Security Training" />
            </div>
            
            <div className="form-group">
              <label className="form-label">Target</label>
              <input className="form-input" value={sharedGoalForm.target} onChange={e => setSharedGoalForm({...sharedGoalForm, target: e.target.value})} placeholder="e.g. 100 or 2026-08-01" />
            </div>

            <div className="grid grid-cols-2 mb-4">
               <div className="form-group">
                  <label className="form-label">UoM</label>
                  <select className="form-select" value={sharedGoalForm.uom} onChange={e => setSharedGoalForm({...sharedGoalForm, uom: e.target.value})}>
                    <option value="Numeric">Numeric</option>
                    <option value="%">%</option>
                    <option value="Timeline">Timeline</option>
                    <option value="Zero">Zero</option>
                  </select>
               </div>
               <div className="form-group">
                  <label className="form-label">Thrust Area</label>
                  <select className="form-select" value={sharedGoalForm.thrustArea} onChange={e => setSharedGoalForm({...sharedGoalForm, thrustArea: e.target.value})}>
                    <option value="Business Growth">Business Growth</option>
                    <option value="Operational Excellence">Operational Excellence</option>
                    <option value="Compliance">Compliance</option>
                  </select>
               </div>
            </div>

            <div className="flex-between mt-6">
              <button className="btn btn-secondary" onClick={() => setShowSharedModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={pushSharedGoal}>Push to All Employees</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
