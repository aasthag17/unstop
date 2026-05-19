import React, { useState, useEffect } from 'react';
import { getGoals, saveGoals, initialUsers, computeScore } from '../data';
import { CheckCircle, XCircle, Edit2, MessageSquare, ChevronDown, ChevronUp, User, Link } from 'lucide-react';

export default function ManagerDashboard({ currentUser }) {
  const [teamGoals, setTeamGoals] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null);
  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const teamMembers = initialUsers.filter(u => u.managerId === currentUser.id);

  useEffect(() => {
    refreshGoals();
  }, []);

  const refreshGoals = () => {
    const allGoals = getGoals();
    const teamMemberIds = teamMembers.map(u => u.id);
    setTeamGoals(allGoals.filter(g => teamMemberIds.includes(g.employeeId)));
  };

  const handleAction = (goalId, action, updates = {}) => {
    const allGoals = getGoals();
    const updatedGoals = allGoals.map(g => {
      if (g.id === goalId) {
        return { ...g, status: action, ...updates };
      }
      return g;
    });
    saveGoals(updatedGoals);
    refreshGoals();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'var(--info)';
      case 'Approved': return 'var(--success)';
      case 'Returned': return 'var(--warning)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="animate-fade-in delay-100">
      <div className="flex-between mb-6">
        <div>
          <h2>Team Dashboard</h2>
          <p className="text-muted text-sm mt-1">Review team goals and perform quarterly check-ins</p>
        </div>
        <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Cycle: </span>
          <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{activeQuarter} Check-in</span>
        </div>
      </div>

      <div className="grid" style={{ gap: '1rem' }}>
        {teamMembers.map((member, idx) => {
          const memberGoals = teamGoals.filter(g => g.employeeId === member.id);
          const isExpanded = expandedUser === member.id;
          const hasSubmitted = memberGoals.some(g => g.status === 'Submitted');

          return (
            <div key={member.id} className={`glass-panel animate-fade-in delay-${(idx + 1) * 100}`} style={{ overflow: 'hidden' }}>
              <div 
                className="flex-between" 
                style={{ padding: '1.5rem', cursor: 'pointer', backgroundColor: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }}
                onClick={() => setExpandedUser(isExpanded ? null : member.id)}
              >
                <div className="flex-center" style={{ gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem' }}>{member.name}</h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>{member.department} • {memberGoals.length} Goals</p>
                  </div>
                </div>
                <div className="flex-center" style={{ gap: '1rem' }}>
                  {hasSubmitted && <span className="badge badge-submitted" style={{ animation: 'pulse 2s infinite' }}>Action Required</span>}
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  {memberGoals.length === 0 ? (
                    <p className="text-muted text-center py-4">No goals submitted yet.</p>
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Goal</th>
                            <th>Target & UoM</th>
                            <th>Weightage</th>
                            <th>Status</th>
                            <th>{activeQuarter} Actual</th>
                            <th>Progress Score</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberGoals.map(goal => {
                            const checkin = goal.checkIns?.find(c => c.quarter === activeQuarter) || {};
                            const score = computeScore(goal.uom, goal.target, checkin.actual);
                            
                            return (
                              <tr key={goal.id}>
                                <td>
                                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {goal.title}
                                    {goal.isShared && <Link size={12} className="text-muted" />}
                                  </div>
                                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{goal.thrustArea}</div>
                                </td>
                                <td>{goal.target} {goal.uom !== 'Numeric' ? goal.uom : ''}</td>
                                <td>{goal.weightage}%</td>
                                <td>
                                  <span style={{ color: getStatusColor(goal.status), fontWeight: 500, fontSize: '0.875rem' }}>
                                    {goal.status}
                                  </span>
                                </td>
                                <td>
                                  {goal.status === 'Approved' ? (
                                    <div style={{ fontSize: '0.875rem' }}>
                                      <div style={{ fontWeight: 600 }}>{checkin.actual || '-'}</div>
                                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{checkin.status || 'Not Started'}</div>
                                    </div>
                                  ) : '-'}
                                </td>
                                <td>
                                  {goal.status === 'Approved' && checkin.actual ? (
                                    <div className="badge" style={{ display: 'inline-block', backgroundColor: score >= 100 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: score >= 100 ? 'var(--success)' : 'var(--warning)' }}>
                                      {score}%
                                    </div>
                                  ) : '-'}
                                </td>
                                <td>
                                  {goal.status === 'Submitted' && (
                                    <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                                      <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleAction(goal.id, 'Approved')}>
                                        <CheckCircle size={14} /> Approve
                                      </button>
                                      <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', color: 'var(--warning)', borderColor: 'var(--warning)' }} onClick={() => handleAction(goal.id, 'Returned')}>
                                        <XCircle size={14} /> Return
                                      </button>
                                    </div>
                                  )}
                                  {goal.status === 'Approved' && (
                                    <button className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => {
                                      const comment = prompt("Enter manager check-in feedback:");
                                      if (comment !== null) {
                                        const checkIns = [...(goal.checkIns || [])];
                                        const existingIdx = checkIns.findIndex(c => c.quarter === activeQuarter);
                                        const newCheckin = { quarter: activeQuarter, actual: checkin.actual, comment, status: checkin.status, date: new Date().toISOString(), managerComment: comment };
                                        if (existingIdx > -1) checkIns[existingIdx] = newCheckin;
                                        else checkIns.push(newCheckin);
                                        handleAction(goal.id, 'Approved', { checkIns });
                                      }
                                    }}>
                                      <MessageSquare size={14} /> Check-in Feedback
                                    </button>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
