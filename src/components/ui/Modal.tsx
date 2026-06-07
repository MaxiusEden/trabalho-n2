import React from 'react';

interface ModalProps {
  id: string;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  show?: boolean; // For controlled modals if needed, though Bootstrap handles data-bs-toggle
}

export const Modal = ({ id, title, children, onClose }: ModalProps) => {
  return (
    <div className="modal fade" id={id} tabIndex={-1} aria-labelledby={`${id}Label`} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={`${id}Label`}>{title}</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
