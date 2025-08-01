
import React, { useEffect } from 'react';
import type { ToastType } from '../types.ts';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from './Icons.tsx';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

const toastConfig = {
    success: {
        icon: CheckCircleIcon,
        bg: 'bg-green-500',
        text: 'text-white',
    },
    error: {
        icon: XCircleIcon,
        bg: 'bg-red-500',
        text: 'text-white',
    },
    info: {
        icon: InformationCircleIcon,
        bg: 'bg-sky-500',
        text: 'text-white',
    }
};

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    const config = toastConfig[type];
    const Icon = config.icon;

    return (
        <div 
            className={`fixed top-5 right-5 z-[100] flex items-center w-full max-w-xs p-4 rounded-lg shadow-lg text-base ${config.bg} ${config.text} animate-fade-in-down`}
            role="alert"
        >
            <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
                <Icon className="w-6 h-6" />
                <span className="sr-only">{type} icon</span>
            </div>
            <div className="ml-3 text-sm font-medium">{message}</div>
            <button 
                type="button" 
                className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-white p-1.5 hover:bg-white/20 inline-flex h-8 w-8" 
                aria-label="Cerrar"
                onClick={onClose}
            >
                <span className="sr-only">Cerrar</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
            </button>
        </div>
    );
};