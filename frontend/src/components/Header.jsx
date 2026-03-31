import React from 'react';

const Header = ({ user, logout }) => {
  return (
    <header className="app-header">
      <div className="nav-brand">
        LeaveTrack{' '}
        <span>
          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} Portal
        </span>
      </div>

      <div className="nav-links">
        {user && (
          <>
            <div className="user-info">
              Welcome, <strong>{user.username}</strong>
            </div>
            <button className="btn-logout" onClick={logout}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;