import React, { useState, useEffect } from 'react';
import { initialUsers, initStorage } from './data';
import EmployeeDashboard from './components/EmployeeDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import AdminDashboard from './components/AdminDashboard';
import { Target, Zap } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState(initialUsers[0]);

  useEffect(() => {
    initStorage();
  }, []);

  return (
    <div className="container">
      <header className="app-header glass-panel" style={{ padding: '1rem 2rem', borderBottom: 'none', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="flex-center" style={{ gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'var(--primary-color)', padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0 0 15px rgba(79, 70, 229, 0.5)' }}>
            <Zap color="white" size={24} />
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>AtomQuest</h1>
        </div>
        <div className="flex-center" style={{ gap: '1rem' }}>
          <span className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Demo Persona:</span>
          <select 
            className="form-select" 
            style={{ width: '220px', backgroundColor: 'rgba(0,0,0,0.3)' }}
            value={currentUser.id} 
            onChange={(e) => setCurrentUser(initialUsers.find(u => u.id === Number(e.target.value)))}
          >
            {initialUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </header>

      <main>
        {currentUser.role === 'Employee' && <EmployeeDashboard currentUser={currentUser} />}
        {currentUser.role === 'Manager' && <ManagerDashboard currentUser={currentUser} />}
        {currentUser.role === 'Admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
