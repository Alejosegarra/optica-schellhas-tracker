import { Role, JobStatus, JobPriority, type User, type Job, type Announcement, type Database, type JobHistoryEntry, type Json } from './database.types.ts';
import { supabase } from './supabaseClient.ts';

// --- Auth ---
export const apiGetLoginUsers = async (): Promise<Pick<User, 'id' | 'username'>[]> => {
    const { data, error } = await supabase.from('users').select('id, username');
    if (error) throw error;
    return (data as unknown as Pick<User, 'id' | 'username'>[]) || [];
};

export const apiLogin = async (username: string, password: string): Promise<User | null> => {
    // ADVERTENCIA DE SEGURIDAD: Este método es inseguro y solo para fines de demostración.
    // En un entorno de producción, utiliza Supabase Auth.
    const { data, error } = await supabase
        .from('users')
        .select('id, username, role')
        .eq('username', username)
        .eq('password', password) // Comparación en texto plano (NO SEGURO)
        .single();
    
    // El código de error 'PGRST116' significa que no se encontró ninguna fila, lo cual es un fallo de login esperado.
    if (error && error.code !== 'PGRST116') throw error;
    
    return data as unknown as User | null;
};

// --- Jobs ---
export const apiGetJobs = async (user: User): Promise<Job[]> => {
    let query = supabase.from('jobs').select('*');

    if (user.role === Role.Branch) {
        query = query.eq('branch_id', user.id);
    }

    const { data, error } = await query.order('updated_at', { ascending: false });

    if (error) throw error;
    return (data as unknown as Job[]) || [];
};

export const apiCreateJob = async (jobData: { id: string; description: string; branch_id: string; branch_name: string }): Promise<Job> => {
    const now = new Date().toISOString();
    const newJob: Database['public']['Tables']['jobs']['Insert'] = {
        ...jobData,
        status: JobStatus.PendingInBranch,
        priority: JobPriority.Normal,
        priority_message: '',
        history: [{
            timestamp: now,
            status: JobStatus.PendingInBranch,
            updatedBy: jobData.branch_name,
        }]
    };

    const { data, error } = await supabase
        .from('jobs')
        .insert(newJob)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Error de violación de clave primaria (id duplicado)
            throw new Error('El número de trabajo ya existe.');
        }
        throw error;
    }
    if (!data) {
        throw new Error('Failed to create job, no data returned.');
    }
    return data as unknown as Job;
};

export const apiUpdateJob = async (jobId: string, updates: Omit<Database['public']['Tables']['jobs']['Update'], 'updated_at' | 'history'>, updatedBy: User): Promise<Job> => {
    const { data: currentJobData, error: fetchError } = await supabase.from('jobs').select('history, status').eq('id', jobId).single();
    if (fetchError) throw fetchError;

    const currentJob = currentJobData as unknown as Pick<Job, 'history' | 'status'> | null;
    if (!currentJob) throw new Error(`Job with id ${jobId} not found.`);

    const now = new Date().toISOString();
    const newHistory = [...((currentJob.history as JobHistoryEntry[]) || [])];

    if (updates.status && updates.status !== currentJob.status) {
        newHistory.push({
            timestamp: now,
            status: updates.status,
            updatedBy: updatedBy.username
        });
    }
    
    if('priority' in updates && updates.priority){
        newHistory.push({
            timestamp: now,
            status: `PRIORIDAD CAMBIADA A ${updates.priority}`,
            updatedBy: updatedBy.username
        });
    }

    const updatePayload: Database['public']['Tables']['jobs']['Update'] = { 
        ...updates, 
        updated_at: now, 
        history: newHistory
    };

    const { data, error } = await supabase
        .from('jobs')
        .update(updatePayload)
        .eq('id', jobId)
        .select()
        .single();
    
    if (error) throw error;
    if (!data) throw new Error(`Failed to update job ${jobId}, no data returned.`);
    return data as unknown as Job;
};


export const apiBulkUpdateJobs = async (jobIds: string[], status: JobStatus, updatedBy: User): Promise<Job[]> => {
    const { data: currentJobsData, error: fetchError } = await supabase.from('jobs').select('*').in('id', jobIds);
    if (fetchError) throw fetchError;

    const currentJobs = currentJobsData as unknown as Job[] | null;
    if (!currentJobs) return [];
    
    const now = new Date().toISOString();
    const jobsToUpdate: Database['public']['Tables']['jobs']['Insert'][] = currentJobs.map(job => ({
        ...job,
        status,
        updated_at: now,
        history: [...((job.history as JobHistoryEntry[]) || []), { timestamp: now, status, updatedBy: updatedBy.username }]
    }));

    const { data, error } = await supabase.from('jobs').upsert(jobsToUpdate).select();

    if (error) throw error;
    return (data as unknown as Job[]) || [];
};

// --- Admin: Users ---
export const apiGetUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('id, username, role');
    if (error) throw error;
    return (data as unknown as User[]) || [];
};

export const apiGetStats = async (): Promise<{
    totalJobs: number;
    jobsByBranch: Record<string, number>;
    jobsByPriority: Record<JobPriority, number>;
}> => {
    const { data: allJobsData, error } = await supabase.from('jobs').select('branch_name, priority');
    if (error) throw error;

    const allJobs = (allJobsData as unknown as Pick<Job, 'branch_name' | 'priority'>[]) || [];
    
    const jobsByBranch = allJobs.reduce((acc, job) => {
        acc[job.branch_name] = (acc[job.branch_name] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const jobsByPriority = allJobs.reduce((acc, job) => {
        acc[job.priority] = (acc[job.priority] || 0) + 1;
        return acc;
    }, {} as Record<JobPriority, number>);
    
    return {
        totalJobs: allJobs?.length || 0,
        jobsByBranch,
        jobsByPriority,
    }
};

export const apiAddUser = async (userData: Database['public']['Tables']['users']['Insert']): Promise<User> => {
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) {
        if (error.code === '23505') { // Error de violación de unicidad
            throw new Error('El nombre de usuario ya existe.');
        }
        throw error;
    }
    if (!data) throw new Error("Failed to create user.");
    return data as unknown as User;
};

export const apiUpdateUserPassword = async (id: string, newPassword: string):Promise<User> => {
    const { data, error } = await supabase.from('users').update({ password: newPassword }).eq('id', id).select().single();
    if (error) throw error;
    if (!data) throw new Error(`User with id ${id} not found.`);
    return data as unknown as User;
};

export const apiDeleteUser = async (id: string): Promise<{ success: true }> => {
    // Lógica para no eliminar al último admin
    const { data: userToDeleteData, error: fetchError } = await supabase.from('users').select('role').eq('id', id).single();
    if (fetchError) throw fetchError;
    
    const userToDelete = userToDeleteData as unknown as Pick<User, 'role'> | null;
    if (!userToDelete) {
        throw new Error(`User with id ${id} not found.`);
    }
    if(userToDelete.role === Role.Admin){
        const { count, error: countError } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', Role.Admin);
        if (countError) throw countError;
        if (count === 1) {
            throw new Error('No se puede eliminar al último administrador.');
        }
    }
    
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
};

// --- Admin: Announcements ---
export const apiGetAnnouncements = async (): Promise<Announcement[]> => {
    const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data as unknown as Announcement[]) || [];
};

export const apiAddAnnouncement = async (message: string): Promise<Announcement> => {
    const { data, error } = await supabase.from('announcements').insert({ message }).select().single();
    if (error) throw error;
    if (!data) throw new Error("Failed to create announcement.");
    return data as unknown as Announcement;
};

export const apiDeleteAnnouncement = async (id: string): Promise<{ success: boolean }> => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
};