import React from 'react';

const Toast = ({ message, type }) => {
  return (
    <div id="toast-container">
      <div className={`toast ${type}`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
