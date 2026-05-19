import React, { useState, useEffect } from 'react';
import { getGoals, saveGoals, computeScore } from '../data';
import { Plus, Save, Send, Edit, Target, Clock, AlertTriangle, Link } from 'lucide-react';

export default function EmployeeDashboard({ currentUser }) {
  const [goals, setGoals] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const allGoals = getGoals();
    setGoals(allGoals.filter(g => g.employeeId === currentUser.id));
  }, [currentUser]);

  const totalWeightage = goals.reduce((sum, g) => sum + Number(g.weightage), 0);
  
  const handleAddGoal = () => {
    if (goals.length >= 8) {
      setError('Maximum of 8 goals allowed.');
      return;
    }
    const newGoal = {
      id: Date.now(),
      employeeId: currentUser.id,
      title: '',
      description: '',
      thrustArea: 'Business Growth',
      uom: 'Numeric',
      target: '',
      weightage: 10,
      status: 'Draft',
      isShared: false,
      checkIns: []
    };
    setGoals([...goals, newGoal]);
    setIsEditing(true);
  };

  const handleGoalChange = (id, field, value) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
    setError('');
  };

  const handleSaveDraft = () => {
    const allGoals = getGoals().filter(g => g.employeeId !== currentUser.id);
    saveGoals([...allGoals, ...goals]);
    setIsEditing(false);
    setError('');
  };

  const handleSubmit = () => {
    // Validation
    if (totalWeightage !== 100) {
      setError(`Total weightage must be exactly 100%. Current is ${totalWeightage}%.`);
      return;
    }
    const invalidWeightage = goals.some(g => g.weightage < 10);
    if (invalidWeightage) {
      setError('Each goal must have a minimum weightage of 10%.');
      return;
    }
    const emptyFields = goals.some(g => !g.title || !g.target);
    if (emptyFields) {
      setError('Please fill out title and target for all goals.');
      return;
    }

    const updatedGoals = goals.map(g => ({ ...g, status: 'Submitted' }));
    const allGoals = getGoals().filter(g => g.employeeId !== currentUser.id);
    saveGoals([...allGoals, ...updatedGoals]);
    setGoals(updatedGoals);
    setIsEditing(false);
    setError('');
  };

  const [activeQuarter, setActiveQuarter] = useState('Q1');
  const handleCheckIn = (goalId, actual, statusComment, status) => {
      const updated = goals.map(g => {
          if (g.id === goalId) {
              const checkIns = [...g.checkIns];
              const existingIdx = checkIns.findIndex(c => c.quarter === activeQuarter);
              const newCheckin = { quarter: activeQuarter, actual, comment: statusComment, status, date: new Date().toISOString() };
              if (existingIdx > -1) checkIns[existingIdx] = newCheckin;
              else checkIns.push(newCheckin);
              return { ...g, checkIns };
          }
          return g;
      });
      setGoals(updated);
      const allGoals = getGoals().filter(g => g.employeeId !== currentUser.id);
      saveGoals([...allGoals, ...updated]);
  };

  const canEdit = isEditing || goals.some(g => g.status === 'Draft' || g.status === 'Returned');
  const allLocked = goals.length > 0 && goals.every(g => g.status === 'Approved');

  return (
    <div className="animate-fade-in delay-100">
      <div className="flex-between mb-6">
        <div>
          <h2>My Goal Sheet</h2>
          <p className="text-muted text-sm mt-1">Define your objectives and track your progress</p>
        </div>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <div className="glass-panel" style={{ padding: '0.5rem 1rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Weightage: </span>
            <span style={{ fontWeight: 'bold', color: totalWeightage === 100 ? 'var(--success)' : 'var(--warning)' }}>
              {totalWeightage}%
            </span>
          </div>
          {canEdit && (
            <>
              <button className="btn btn-secondary" onClick={handleSaveDraft}>
                <Save size={16} /> Save Draft
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                <Send size={16} /> Submit for Approval
              </button>
            </>
          )}
          {!canEdit && !allLocked && (
             <button className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                <Edit size={16} /> Edit Goals
             </button>
          )}
        </div>
      </div>

      {error && (
        <div className="glass-panel mb-6" style={{ padding: '1rem', borderLeft: '4px solid var(--danger)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', color: 'var(--danger)' }}>
            <AlertTriangle size={18} />
            <span style={{ fontWeight: 500 }}>{error}</span>
          </div>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="glass-panel flex-center" style={{ flexDirection: 'column', padding: '4rem', gap: '1rem' }}>
          <Target size={48} color="var(--text-muted)" opacity={0.5} />
          <h3>No goals defined yet</h3>
          <p className="text-muted">Start by creating your first goal for the current cycle.</p>
          <button className="btn btn-primary mt-4" onClick={handleAddGoal}>
            <Plus size={16} /> Create Goal
          </button>
        </div>
      ) : (
        <div className="grid">
          {goals.map((goal, idx) => {
            const checkin = goal.checkIns?.find(c => c.quarter === activeQuarter) || {};
            const score = computeScore(goal.uom, goal.target, checkin.actual);
            
            return (
              <div key={goal.id} className={`glass-panel animate-fade-in delay-${(idx % 3 + 1) * 100}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                {goal.isShared && (
                   <div style={{ position: 'absolute', top: '-10px', left: '-10px', backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '50%', boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}>
                      <Link size={14} color="white" />
                   </div>
                )}
                
                <div className="flex-between">
                  <span className={`badge badge-${goal.status.toLowerCase()}`}>{goal.status}</span>
                  <div className="flex-center" style={{ gap: '0.5rem' }}>
                    {goal.status === 'Approved' && checkin.actual && (
                      <span className="badge" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>
                        {score}% Score
                      </span>
                    )}
                    <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{goal.weightage}%</span>
                  </div>
                </div>
                
                {canEdit && (goal.status === 'Draft' || goal.status === 'Returned') ? (
                  <>
                    <input 
                      className="form-input" 
                      placeholder="Goal Title" 
                      value={goal.title} 
                      disabled={goal.isShared}
                      style={goal.isShared ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                      onChange={e => handleGoalChange(goal.id, 'title', e.target.value)} 
                    />
                    <textarea 
                      className="form-textarea" 
                      placeholder="Description (Optional)" 
                      rows={2}
                      value={goal.description} 
                      disabled={goal.isShared}
                      style={goal.isShared ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                      onChange={e => handleGoalChange(goal.id, 'description', e.target.value)} 
                    />
                    <div className="grid grid-cols-2">
                      <select className="form-select" disabled={goal.isShared} style={goal.isShared ? { opacity: 0.7, cursor: 'not-allowed' } : {}} value={goal.thrustArea} onChange={e => handleGoalChange(goal.id, 'thrustArea', e.target.value)}>
                        <option value="Business Growth">Business Growth</option>
                        <option value="Operational Excellence">Operational Excellence</option>
                        <option value="Customer Success">Customer Success</option>
                        <option value="Innovation">Innovation</option>
                        <option value="Compliance">Compliance</option>
                      </select>
                      <select className="form-select" disabled={goal.isShared} style={goal.isShared ? { opacity: 0.7, cursor: 'not-allowed' } : {}} value={goal.uom} onChange={e => handleGoalChange(goal.id, 'uom', e.target.value)}>
                        <option value="Numeric">Numeric</option>
                        <option value="%">%</option>
                        <option value="Timeline">Timeline</option>
                        <option value="Zero">Zero-based</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2">
                      <input 
                        className="form-input" 
                        placeholder="Target" 
                        disabled={goal.isShared}
                        style={goal.isShared ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                        value={goal.target} 
                        onChange={e => handleGoalChange(goal.id, 'target', e.target.value)} 
                      />
                      <input 
                        className="form-input" 
                        type="number"
                        placeholder="Weightage (%)" 
                        value={goal.weightage} 
                        onChange={e => handleGoalChange(goal.id, 'weightage', Number(e.target.value))} 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.25rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {goal.title || 'Untitled Goal'}
                      {goal.isShared && <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 400 }}>(Dept. Goal)</span>}
                    </h3>
                    <p className="text-muted" style={{ fontSize: '0.875rem', minHeight: '2.5rem' }}>{goal.description}</p>
                    
                    <div className="grid grid-cols-2" style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', gap: '0.5rem' }}>
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Thrust Area</div>
                        <div style={{ fontSize: '0.875rem' }}>{goal.thrustArea}</div>
                      </div>
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>UoM</div>
                        <div style={{ fontSize: '0.875rem' }}>{goal.uom}</div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Target</div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{goal.target}</div>
                      </div>
                    </div>

                    {allLocked && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} /> Quarterly Check-in ({activeQuarter})
                        </h4>
                        <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                          {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                            <button key={q} 
                              onClick={() => setActiveQuarter(q)}
                              className={`badge ${activeQuarter === q ? 'badge-info' : 'badge-draft'}`}
                              style={{ cursor: 'pointer', border: 'none', background: activeQuarter === q ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)', color: 'white' }}>
                              {q}
                            </button>
                          ))}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <input className="form-input" style={{ padding: '0.4rem 0.75rem' }} placeholder="Actual Achievement" 
                            defaultValue={checkin.actual || ''} 
                            onBlur={(e) => handleCheckIn(goal.id, e.target.value, checkin.comment, checkin.status || 'Not Started')} />
                          <select className="form-select" style={{ padding: '0.4rem 0.75rem' }}
                            defaultValue={checkin.status || 'Not Started'}
                            onChange={(e) => handleCheckIn(goal.id, checkin.actual, checkin.comment, e.target.value)}>
                            <option>Not Started</option>
                            <option>On Track</option>
                            <option>Completed</option>
                          </select>
                          <textarea className="form-textarea" style={{ padding: '0.4rem 0.75rem' }} rows={1} placeholder="Comments" 
                            defaultValue={checkin.comment || ''}
                            onBlur={(e) => handleCheckIn(goal.id, checkin.actual, e.target.value, checkin.status)} />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
          
          {canEdit && goals.length < 8 && (
            <div className="glass-panel flex-center animate-fade-in delay-300" style={{ minHeight: '200px', cursor: 'pointer', borderStyle: 'dashed' }} onClick={handleAddGoal}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <Plus size={32} />
                <span>Add Goal</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
