'use client';

import React from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
};

export default function Modal({ open, title, description, onClose, confirmText = 'Đóng', onConfirm }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl w-[92%] max-w-md p-6 shadow-xl">
        {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
        {description && <p className="text-gray-700 whitespace-pre-wrap">{description}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">Đóng</button>
          {onConfirm && (
            <button onClick={onConfirm} className="px-4 py-2 rounded bg-[#0065ca] text-white">
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


