import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CreateIcon from '@mui/icons-material/Create';
import SearchIcon from '@mui/icons-material/Search';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useContext(AuthContext);

  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '40px',
    backgroundColor: '#eef2f6',
    padding: '10px 0',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    zIndex: 1000,
  };

  const linkStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#333',
    fontSize: '14px',
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    color: '#d00',
    cursor: 'pointer',
    fontSize: '14px',
  };

  return (
    <nav style={navStyle}>
      <Link to="/home" style={linkStyle}>
        <HomeIcon />
        Home
      </Link>
      <Link to="/search" style={linkStyle}>
        <SearchIcon />
        Search
      </Link>
      <Link to="/create" style={linkStyle}>
        <CreateIcon />
        Post
      </Link>
      <Link to="/profile" style={linkStyle}>
        <AccountCircleIcon />
        Profile
      </Link>
      <button onClick={logout} style={buttonStyle}>
        Logout
      </button>
    </nav>
  );
}
