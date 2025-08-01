
import React, { useState } from 'react';
import type { Job, ToastType } from '../types.ts';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (job: { orderNumber: string; note: string }) => void;
  branch: string;
  allJobs: Job[];
  showToast: (message: string, type: ToastType) => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose, onAddJob, branch, allJobs, showToast }) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!orderNumber) {
      showToast('Por favor, ingrese el número de trabajo.', 'error');
      return;
    }
    
    if (allJobs.some(j => j.orderNumber.toLowerCase() === orderNumber.toLowerCase())) {
      showToast('Este número de trabajo ya existe. Use uno diferente.', 'error');
      return;
    }

    onAddJob({ orderNumber, note });
    // Reset form for next time
    setOrderNumber('');
    setNote('');
  };
  
  const handleClose = () => {
      setOrderNumber('');
      setNote('');
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg animate-fade-in-up">
        <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Crear Nuevo Trabajo</h2>
            <p className="text-sm text-slate-500 mt-1">Para sucursal: <span className="font-semibold">{branch}</span></p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
                <label htmlFor="orderNumber" className="block text-sm font-medium text-slate-700 mb-1">Número de Trabajo</label>
                <input 
                    type="text" 
                    id="orderNumber" 
                    value={orderNumber} 
                    onChange={e => setOrderNumber(e.target.value)} 
                    placeholder="Ej: A-103" 
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500" 
                    required 
                    autoFocus
                />
            </div>
             <div>
              <label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1">
                Notas Adicionales <span className="text-slate-400 font-normal">(Opcional)</span>
              </label>
              <textarea
                id="note"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Ej: El cliente necesita el trabajo con urgencia..."
                rows={3}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
            <button type="button" onClick={handleClose} className="bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-sky-700 transition-colors">
              Agregar Trabajo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};