import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-rose-100',
          iconColor: 'text-rose-600',
          btnBg: 'bg-rose-600 hover:bg-rose-700',
        };
      case 'warning':
        return {
          iconBg: 'bg-gold-100',
          iconColor: 'text-gold-600',
          btnBg: 'bg-gold-600 hover:bg-gold-700',
        };
      default:
        return {
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          btnBg: 'bg-slate-800 hover:bg-slate-900',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-full ${colors.iconBg}`}>
            <AlertTriangle className={`w-8 h-8 ${colors.iconColor}`} />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-display">{title}</h3>
            <p className="text-sm text-slate-500 mt-2">{message}</p>
          </div>

          <div className="flex gap-3 w-full mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`flex-1 py-3 px-4 text-white font-bold rounded-xl transition-colors ${colors.btnBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
