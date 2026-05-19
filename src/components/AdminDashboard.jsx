import React, { useState, useEffect } from 'react';
import { getGoals, initialUsers } from '../data';
import { Download, Users, Settings, Activity, FileText } from 'lucide-react';

export default function AdminDashboard() {
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    setGoals(getGoals());
  }, []);

  const totalEmployees = initialUsers.filter(u => u.role === 'Employee').length;
  const employeesWithGoals = new Set(goals.map(g => g.employeeId)).size;
  const completionRate = totalEmployees ? Math.round((employeesWithGoals / totalEmployees) * 100) : 0;

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

  return (
    <div className="animate-fade-in delay-100">
      <div className="flex-between mb-6">
        <div>
          <h2>Admin Control Center</h2>
          <p className="text-muted text-sm mt-1">Platform governance and reporting</p>
        </div>
        <button className="btn btn-primary" onClick={downloadCSV}>
          <Download size={16} /> Export Report
        </button>
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
                <td>2026-05-19 10:15 AM</td>
                <td>David Chen (Admin)</td>
                <td>Cycle Activated</td>
                <td>Q1 2026 Check-in</td>
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
              <tr>
                <td>2026-05-15 02:20 PM</td>
                <td>David Chen (Admin)</td>
                <td>System Config</td>
                <td>Max Goals Limit Set (8)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
