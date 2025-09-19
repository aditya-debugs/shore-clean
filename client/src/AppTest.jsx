import React from 'react';
import { Route, Routes, BrowserRouter, Link } from 'react-router-dom';

// Simple test components
const TestHome = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Home Page</h1>
    <div style={{ marginTop: '1rem' }}>
      <Link to="/register" style={{ margin: '0 1rem', padding: '0.5rem 1rem', background: '#0891b2', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>
        Go to Register
      </Link>
      <Link to="/signin" style={{ margin: '0 1rem', padding: '0.5rem 1rem', background: '#0891b2', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>
        Go to Signin
      </Link>
    </div>
  </div>
);

const TestRegister = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Register Page</h1>
    <Link to="/" style={{ padding: '0.5rem 1rem', background: '#0891b2', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>
      Back to Home
    </Link>
  </div>
);

const TestSignin = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Signin Page</h1>
    <div style={{ marginTop: '1rem' }}>
      <Link to="/register" style={{ margin: '0 1rem', padding: '0.5rem 1rem', background: '#0891b2', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>
        Create Account
      </Link>
      <Link to="/" style={{ margin: '0 1rem', padding: '0.5rem 1rem', background: '#0891b2', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>
        Back to Home
      </Link>
    </div>
  </div>
);

function AppTest() {
  return (
    <BrowserRouter>
      <div>
        <nav style={{ padding: '1rem', background: '#f0f0f0', borderBottom: '1px solid #ddd' }}>
          <Link to="/" style={{ margin: '0 1rem', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
          <Link to="/register" style={{ margin: '0 1rem', textDecoration: 'none' }}>Register</Link>
          <Link to="/signin" style={{ margin: '0 1rem', textDecoration: 'none' }}>Signin</Link>
        </nav>
        
        <Routes>
          <Route path="/" element={<TestHome />} />
          <Route path="/register" element={<TestRegister />} />
          <Route path="/signin" element={<TestSignin />} />
          <Route path="*" element={
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h1>404 - Page Not Found</h1>
              <Link to="/" style={{ padding: '0.5rem 1rem', background: '#0891b2', color: 'white', textDecoration: 'none', borderRadius: '0.5rem' }}>
                Go Home
              </Link>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default AppTest;