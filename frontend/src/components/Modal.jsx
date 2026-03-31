import React from 'react';

const Modal = ({ title, onClose, onSubmit, children }) => {
  return (
    <div className="modal-overlay active">
      <div className="glass-container modal-content">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>
        <form id="leave-form" onSubmit={onSubmit}>
          {children}
        </form>
      </div>
    </div>
  );
};

export default Modal;
