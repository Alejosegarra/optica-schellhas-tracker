import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { JobList } from './components/JobList';
import { NewJobModal } from './components/NewJobModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PlusIcon, SearchIcon, FilterIcon, FlagIcon } from './components/Icons';
import { LoginScreen } from './components/LoginScreen';
import { AdminPanel } from './components/AdminPanel';
import { MetricsPanel } from './components/MetricsPanel';
import { Toast } from './components/Toast';
import type { Job, User, JobStatus, ToastType, JobFlag, Note, ConfirmationState, Action, ActivityLog } from './types';
import { INITIAL_JOBS, USERS, ALL_STATUSES, ALL_FLAGS, getNextAction } from './constants';
import { supabase } from './services/supabaseClient';

type AdminView = 'dashboard' | 'adminPanel' | 'metrics' | 'archive';

const transformJob = (job: any): Job => ({
  ...job,
  creationDate: new Date(job.creationDate),
  history: (job.history || []).map((h: any) => ({ ...h, timestamp: new Date(h.timestamp) })),
  notes: (job.notes || []).map((n: any) => ({ ...n, timestamp: new Date(n.timestamp) })),
});

export default function App() {
  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Session and UI state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminView, setAdminView] = useState<AdminView>('metrics');
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string | 'all'>('all');
  const [flagFilter, setFlagFilter] = useState<JobFlag | 'all'>('all');

  // Bulk actions state
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([]);
  
  // --- EFFECTS ---

  // Initial data load and seeding from Supabase
  useEffect(() => {
    const fetchAndSeedData = async () => {
      setIsLoading(true);

      // Fetch users, seed if necessary
      let { data: existingUsers } = await supabase.from('users').select('*');
      if (existingUsers && existingUsers.length === 0) {
        const { data: seededUsers, error: seedError } = await supabase.from('users').insert(USERS).select();
        if (seedError) console.error('Error seeding users:', seedError);
        else setUsers(seededUsers || []);
      } else {
        setUsers(existingUsers || []);
      }

      // Fetch jobs, seed if necessary
      let { data: existingJobs } = await supabase.from('jobs').select('*');
      if (existingJobs && existingJobs.length === 0) {
        const { data: seededJobs, error: seedError } = await supabase.from('jobs').insert(INITIAL_JOBS.map(({id, ...rest}) => rest)).select();
        if (seedError) console.error('Error seeding jobs:', seedError);
        else setJobs((seededJobs || []).map(transformJob));
      } else {
        setJobs((existingJobs || []).map(transformJob));
      }
      
      setIsLoading(false);
    };

    fetchAndSeedData();
  }, []);

  // Realtime Supabase subscriptions
  useEffect(() => {
    const jobsChannel = supabase.channel('jobs-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, payload => {
          const transformedPayload = transformJob(payload.new);
          if (payload.eventType === 'INSERT') {
            setJobs(currentJobs => [transformedPayload, ...currentJobs]);
          }
          if (payload.eventType === 'UPDATE') {
            setJobs(currentJobs => currentJobs.map(j => j.id === transformedPayload.id ? transformedPayload : j));
          }
          if (payload.eventType === 'DELETE') {
             setJobs(currentJobs => currentJobs.filter(j => j.id !== (payload.old as Job).id));
          }
        }
      )
      .subscribe();

     const usersChannel = supabase.channel('users-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
          if (payload.eventType === 'INSERT') {
            setUsers(currentUsers => [...currentUsers, payload.new as User]);
          }
          if (payload.eventType === 'UPDATE') {
            setUsers(currentUsers => currentUsers.map(u => u.id === (payload.new as User).id ? (payload.new as User) : u));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobsChannel);
      supabase.removeChannel(usersChannel);
    };
  }, []);
  
  // Filter loading effect
  useEffect(() => {
    if (!isLoading) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, statusFilter, branchFilter, flagFilter, adminView]);

  // Clear selection when filters or view changes
  useEffect(() => {
      setSelectedJobIds([]);
  }, [searchTerm, statusFilter, branchFilter, flagFilter, adminView, currentUser]);


  // --- HANDLERS AND CALLBACKS ---

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = (id: string, pass: string): boolean => {
    const user = users.find(u => u.id.toLowerCase() === id.toLowerCase() && u.password === pass);
    if (user) {
      setCurrentUser(user);
      setAdminView(user.role === 'admin' ? 'metrics' : 'dashboard');
      showToast(`Bienvenido, ${user.name}`, 'success');
      return true;
    }
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Sesión cerrada con éxito.', 'info');
  };
  
  const handleUpdateUser = async (userId: string, newPassword?: string) => {
    const { error } = await supabase.from('users').update({ password: newPassword }).eq('id', userId);
    if (error) {
        showToast('Error al actualizar la contraseña.', 'error');
        console.error(error);
    } else {
        showToast('Contraseña actualizada con éxito.', 'success');
    }
  };

  const handleAddUser = async (newUser: User) => {
    if (users.some(u => u.id.toLowerCase() === newUser.id.toLowerCase())) {
        showToast('Error: El ID de usuario ya existe. Por favor, elija otro.', 'error');
        return false;
    }
    const { error } = await supabase.from('users').insert(newUser);
    if (error) {
        showToast('Error al crear el usuario.', 'error');
        console.error(error);
        return false;
    }
    showToast(`Usuario ${newUser.name} creado con éxito.`, 'success');
    return true;
  };
  
  const handleAddJob = async (newJobData: { orderNumber: string; note: string; }) => {
    if (!currentUser || currentUser.role !== 'branch' || !currentUser.branchName) return;

    if (jobs.some(j => j.orderNumber.toLowerCase() === newJobData.orderNumber.toLowerCase())) {
      showToast('Error: El número de trabajo ya existe.', 'error');
      return;
    }
    
    const creationTime = new Date();
    const history: ActivityLog[] = [{ action: 'Trabajo Creado', user: currentUser.name, timestamp: creationTime }];
    const notes: Note[] = [];

    if (newJobData.note.trim()) {
      notes.push({
        text: newJobData.note.trim(),
        author: currentUser.name,
        timestamp: creationTime,
      });
      history.push({ action: 'Nota añadida', user: currentUser.name, timestamp: creationTime });
    }

    const jobToInsert = {
      orderNumber: newJobData.orderNumber,
      branch: currentUser.branchName,
      status: 'En Sucursal' as JobStatus,
      flag: 'none' as JobFlag,
      isArchived: false,
      notes,
      history,
    };

    const { error } = await supabase.from('jobs').insert(jobToInsert);
    
    if (error) {
        showToast('Error al crear el trabajo.', 'error');
        console.error(error);
    } else {
        setIsModalOpen(false);
        showToast(`Trabajo ${newJobData.orderNumber} creado con éxito.`, 'success');
    }
  };

  const updateJobStatus = async (jobIds: string[], newStatus: JobStatus) => {
    if (!currentUser) return;
    
    const jobsToUpdate = jobs.filter(job => jobIds.includes(job.id));
    const updates = jobsToUpdate.map(job => {
        const newHistory = [...job.history, { action: `Estado cambiado a "${newStatus}"`, user: currentUser.name, timestamp: new Date() }];
        return supabase.from('jobs').update({ status: newStatus, history: newHistory }).eq('id', job.id);
    });

    const results = await Promise.all(updates);
    const hasError = results.some(res => res.error);

    if (hasError) {
        showToast('Error al actualizar uno o más trabajos.', 'error');
        console.error(results.map(r => r.error).filter(Boolean));
    } else {
        setSelectedJobIds([]);
        showToast(`Estado de ${jobIds.length} ${jobIds.length > 1 ? 'trabajos actualizados' : 'trabajo actualizado'} a "${newStatus}".`, 'info');
    }
  };

  const handleRequestStatusUpdate = (jobId: string, newStatus: JobStatus) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || !currentUser) return;

    if (currentUser.role === 'admin') {
        const title = 'Confirmar Cambio de Estado (Admin)';
        const message = `Como administrador, estás a punto de cambiar el estado de ${job.orderNumber} a "${newStatus}". ¿Deseas continuar?`;
        
        setConfirmation({
            title,
            message,
            onConfirm: () => {
                updateJobStatus([jobId], newStatus);
                setConfirmation(null);
            },
        });
    } else {
        updateJobStatus([jobId], newStatus);
    }
  };
  
  const updateJobFlag = async (jobId: string, newFlag: JobFlag) => {
    if (!currentUser) return;
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const newHistory = [...job.history, { action: `Alerta cambiada a "${newFlag}"`, user: currentUser.name, timestamp: new Date() }];
    const { error } = await supabase.from('jobs').update({ flag: newFlag, history: newHistory }).eq('id', jobId);

    if (error) {
        showToast('Error al actualizar la alerta.', 'error');
    } else {
        showToast(`Alerta del trabajo actualizada.`, 'info');
    }
  };

  const handleArchiveJobs = async (jobIds: string[]) => {
      if (!currentUser) return;
      const updates = jobs.filter(j => jobIds.includes(j.id)).map(job => {
        const newHistory = [...job.history, { action: `Trabajo archivado`, user: currentUser!.name, timestamp: new Date() }];
        return supabase.from('jobs').update({ isArchived: true, history: newHistory }).eq('id', job.id);
      });
      
      const results = await Promise.all(updates);
      if (results.some(r => r.error)) {
        showToast('Error al archivar trabajos.', 'error');
      } else {
        setSelectedJobIds([]);
        showToast(`${jobIds.length} ${jobIds.length > 1 ? 'trabajos archivados' : 'trabajo archivado'}.`, 'success');
      }
  };
  
  const handleRestoreJobs = async (jobIds: string[]) => {
      if (!currentUser) return;
      const updates = jobs.filter(j => jobIds.includes(j.id)).map(job => {
        const newHistory = [...job.history, { action: `Trabajo restaurado`, user: currentUser!.name, timestamp: new Date() }];
        return supabase.from('jobs').update({ isArchived: false, history: newHistory }).eq('id', job.id);
      });

      const results = await Promise.all(updates);
      if (results.some(r => r.error)) {
        showToast('Error al restaurar trabajos.', 'error');
      } else {
        setSelectedJobIds([]);
        showToast(`${jobIds.length} ${jobIds.length > 1 ? 'trabajos restaurados' : 'trabajo restaurado'}.`, 'success');
      }
  };

  const handleToggleSelection = useCallback((jobId: string) => {
    setSelectedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  }, []);

  const filteredJobs = useMemo(() => {
    if (!currentUser) return [];
    
    const isArchivedView = currentUser.role === 'admin' && adminView === 'archive';
    
    let jobsToShow = jobs.filter(j => !!j.isArchived === isArchivedView);

    // Role-based view filtering
    if (!isArchivedView) {
        switch (currentUser.role) {
          case 'admin':
            break;
          case 'lab':
            jobsToShow = jobsToShow.filter(job => 
              ['En camino al Laboratorio', 'En Laboratorio', 'En camino a Sucursal'].includes(job.status)
            );
            break;
          case 'branch':
            jobsToShow = jobsToShow.filter(job => job.branch === currentUser.branchName);
            break;
          default:
            return [];
        }
    }
    
    // Apply dashboard filters
    if (statusFilter !== 'all') {
      jobsToShow = jobsToShow.filter(job => job.status === statusFilter);
    }
    if (flagFilter !== 'all') {
      jobsToShow = jobsToShow.filter(job => job.flag === flagFilter);
    }
    if (currentUser.role === 'admin' && branchFilter !== 'all') {
      jobsToShow = jobsToShow.filter(job => job.branch === branchFilter);
    }
    if (searchTerm) {
      jobsToShow = jobsToShow.filter(job => 
        job.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return jobsToShow;
  }, [jobs, currentUser, searchTerm, statusFilter, branchFilter, flagFilter, adminView]);
  
  const uniqueBranches = useMemo(() => [...new Set(users.filter(u => u.role === 'branch').map(u => u.branchName!))], [users]);
  const activeJobs = useMemo(() => jobs.filter(j => !j.isArchived), [jobs]);

  // --- BULK ACTION LOGIC ---
  const bulkActions = useMemo(() => {
    if (selectedJobIds.length === 0 || !currentUser) {
      return { commonAction: null, canArchive: false };
    }

    const selectedJobs = jobs.filter(j => selectedJobIds.includes(j.id));
    if (selectedJobs.length === 0) {
      return { commonAction: null, canArchive: false };
    }
    
    let commonAction: Action | null = null;
    const firstJobNextAction = getNextAction(selectedJobs[0].status, currentUser.role);
    if (firstJobNextAction) {
        const isCommon = selectedJobs.every(j => {
            const nextAction = getNextAction(j.status, currentUser.role);
            return nextAction?.nextStatus === firstJobNextAction.nextStatus;
        });
        if (isCommon) {
            commonAction = firstJobNextAction;
        }
    }
    
    const canArchive = selectedJobs.every(j => j.status === 'Listo para Retirar');

    return { commonAction, canArchive };
  }, [selectedJobIds, jobs, currentUser]);

  // --- RENDER LOGIC ---

  if (isLoading && !currentUser) {
    return <div className="flex items-center justify-center min-h-screen bg-slate-100"><p>Conectando...</p></div>;
  }
  
  if (!currentUser) {
    return <LoginScreen onLogin={handleLogin} users={users} />;
  }

  const getPageTitle = () => {
      if (adminView === 'adminPanel') return 'Panel de Administración';
      if (adminView === 'metrics') return 'Métricas y Estadísticas';
      if (adminView === 'archive') return 'Archivo de Trabajos';
      if (currentUser.role === 'lab') return 'Panel del Laboratorio';
      if (currentUser.role === 'branch') return `Panel de ${currentUser.branchName}`;
      return 'Panel de Trabajos';
  };
  
  const renderContent = () => {
    if (currentUser.role === 'admin') {
      switch (adminView) {
        case 'metrics': return <MetricsPanel jobs={activeJobs} users={users} />;
        case 'adminPanel': return <AdminPanel users={users} onUpdateUser={handleUpdateUser} onAddUser={handleAddUser} showToast={showToast} />;
        case 'dashboard':
        case 'archive':
           break; // render dashboard below
      }
    }
    
    // Default dashboard view
    return (
      <>
        {/* Bulk Actions Bar */}
        {selectedJobIds.length > 0 && (
            <div className="sticky top-20 z-10 mb-4 bg-sky-100 border border-sky-300 text-sky-800 rounded-xl p-3 shadow-lg flex justify-between items-center animate-fade-in-down">
                <p className="font-semibold">{selectedJobIds.length} {selectedJobIds.length > 1 ? 'trabajos seleccionados' : 'trabajo seleccionado'}</p>
                <div className="flex items-center gap-2">
                    {bulkActions.commonAction && (
                        <button 
                            onClick={() => updateJobStatus(selectedJobIds, bulkActions.commonAction!.nextStatus)}
                            className="px-3 py-1.5 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-700"
                        >
                            {bulkActions.commonAction.label}
                        </button>
                    )}
                    {bulkActions.canArchive && (
                         <button 
                            onClick={() => handleArchiveJobs(selectedJobIds)}
                            className="px-3 py-1.5 bg-slate-500 text-white text-sm font-semibold rounded-md hover:bg-slate-600"
                        >
                            Archivar
                        </button>
                    )}
                    <button onClick={() => setSelectedJobIds([])} className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 text-sm font-semibold rounded-md hover:bg-slate-100">
                        Deseleccionar
                    </button>
                </div>
            </div>
        )}

        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{getPageTitle()}</h1>
            <p className="text-slate-500 mt-1">
              {!isLoading && (
                  `${filteredJobs.length} ${filteredJobs.length === 1 ? 'trabajo coincide' : 'trabajos coinciden'}.`
              )}
            </p>
          </div>
          {currentUser.role === 'branch' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200"
              aria-label="Crear nuevo trabajo"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Nuevo Trabajo</span>
            </button>
          )}
        </div>

        <div className="mb-6 bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:flex-1">
            <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por N° de Trabajo..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white text-slate-900"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto flex-wrap">
            <div className="relative flex-1">
              <FilterIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select 
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as JobStatus | 'all')}
                className="w-full appearance-none pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">Todos los estados</option>
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             {currentUser.role === 'admin' && (
              <>
                <div className="relative flex-1">
                    <FlagIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                     <select 
                        value={flagFilter}
                        onChange={e => setFlagFilter(e.target.value as JobFlag | 'all')}
                        className="w-full appearance-none pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="all">Todas las alertas</option>
                        <option value="urgent">Urgente</option>
                        <option value="delayed">Demorado</option>
                        <option value="none">Sin Alerta</option>
                      </select>
                  </div>
                <div className="relative flex-1">
                  <FilterIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                   <select 
                      value={branchFilter}
                      onChange={e => setBranchFilter(e.target.value)}
                      className="w-full appearance-none pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="all">Todas las sucursales</option>
                      {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
              </>
            )}
          </div>
        </div>

        <JobList 
            jobs={filteredJobs} 
            isLoading={isLoading}
            onRequestStatusUpdate={handleRequestStatusUpdate}
            user={currentUser} 
            updateJobFlag={updateJobFlag} 
            selectedJobIds={selectedJobIds}
            onToggleSelection={handleToggleSelection}
            onArchiveJob={(jobId) => handleArchiveJobs([jobId])}
            onRestoreJob={(jobId) => handleRestoreJobs([jobId])}
            isArchivedView={adminView === 'archive'}
        />

        {!isLoading && filteredJobs.length === 0 && (
             <div className="text-center py-16 px-6 bg-white rounded-xl shadow-sm">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-slate-900">No hay trabajos para mostrar</h3>
                <p className="mt-1 text-sm text-slate-500">
                    {adminView === 'archive' ? "No hay trabajos archivados que coincidan con los filtros." : "Cree un nuevo trabajo o ajuste sus filtros."}
                </p>
            </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800">
       {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
       {confirmation && (
          <ConfirmationModal 
              {...confirmation}
              onClose={() => setConfirmation(null)} 
          />
       )}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        currentView={adminView}
        onSwitchView={setAdminView}
      />
      
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      <NewJobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddJob={handleAddJob}
        branch={currentUser.role === 'branch' ? currentUser.branchName! : ''}
        allJobs={jobs}
        showToast={showToast}
      />
    </div>
  );
}