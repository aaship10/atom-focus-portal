import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { response, data } = await apiClient('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        
        const payload = parseJwt(data.access_token);
        const role = payload?.role || 'Employee';

        if (role === 'Admin') {
          navigate('/admin/dashboard');
        } else if (role === 'Manager') {
          navigate('/manager/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      } else {
        alert(data?.detail || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F0F3]">
      <main className="w-full max-w-md">
        <div className="bg-[#F0F0F3] rounded-2xl p-8 neumorphic-outset flex flex-col gap-8 items-center">
          <div className="text-center space-y-2">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Portal Login</h1>
            <p className="font-body-md text-body-md text-secondary">Access your personalized workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant ml-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">mail</span>
                <input 
                  className="w-full bg-[#F0F0F3] text-on-surface font-body-lg text-body-lg rounded-xl py-3 pl-12 pr-4 border-none neumorphic-inset focus:ring-2 focus:ring-primary focus:outline-none transition-shadow placeholder:text-outline-variant" 
                  id="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  required 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center ml-2 mr-2">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">Password</label>
                <a className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors" href="#">Forgot?</a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">lock</span>
                <input 
                  className="w-full bg-[#F0F0F3] text-on-surface font-body-lg text-body-lg rounded-xl py-3 pl-12 pr-4 border-none neumorphic-inset focus:ring-2 focus:ring-primary focus:outline-none transition-shadow placeholder:text-outline-variant" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  required 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button 
              className="mt-2 w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl neumorphic-outset neumorphic-button flex items-center justify-center gap-2 disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              <span>{loading ? 'Signing In...' : 'Sign In'}</span>
              {!loading && <span className="material-symbols-outlined text-[20px]">login</span>}
            </button>
          </form>

          <p className="font-body-md text-body-md text-secondary text-center">
            Don't have an account? <Link className="text-primary font-bold hover:text-primary-container transition-colors" to="/signup">Sign up</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
