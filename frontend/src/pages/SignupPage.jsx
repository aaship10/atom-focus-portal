import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('employee');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }

    let role_id = 1; // Employee
    if (role === 'manager') role_id = 2;
    if (role === 'admin') role_id = 3;

    try {
      const { response, data } = await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: fullName, email, password, role_id })
      });
      console.log('Register Response:', response.status, data);

      if (response.ok) {
        alert('Registration successful!');
        navigate('/login');
      } else {
        alert(data?.detail || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="flex min-h-screen">
      
<div className="w-full max-w-md bg-[#F0F0F3] rounded-[16px] neumorphic-outset p-container-padding">
<div className="text-center mb-stack-md">
<h1 className="font-headline-lg text-headline-lg text-primary md:font-headline-lg md:text-headline-lg font-headline-lg-mobile text-headline-lg-mobile">Create Account</h1>
<p className="font-body-md text-body-md text-secondary mt-2">Join FocusPortal to manage your goals.</p>
</div>
<form onSubmit={handleRegister} className="space-y-stack-sm">
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="fullName">Full Name</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>person</span>
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="fullName" name="fullName" required="" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
</div>
</div>
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="email">Email</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>mail</span>
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="email" name="email" required="" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
</div>
</div>
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="role">Role</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>work</span>
<select className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-10 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md appearance-none" id="role" name="role" required="" value={role} onChange={(e) => setRole(e.target.value)}>
<option className="text-outline-variant" disabled="" value="">Select a role...</option>
<option value="employee">Employee</option>
<option value="manager">Manager</option>
<option value="admin">Admin</option>
</select>
<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" style={{fontVariationSettings: "'FILL' 0"}}>expand_more</span>
</div>
</div>
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="password">Password</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>lock</span>
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="password" name="password" required="" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
</div>
</div>
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="confirmPassword">Confirm Password</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>lock_reset</span>
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="confirmPassword" name="confirmPassword" required="" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
</div>
</div>
<div className="pt-stack-sm">
<button className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-3 rounded-lg neumorphic-outset neumorphic-button transition-all duration-200 flex justify-center items-center gap-2" type="submit">
<span>Sign Up</span>
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 0"}}>arrow_forward</span>
</button>
</div>
</form>
<div className="mt-stack-md text-center">
<a className="font-body-md text-body-md text-secondary hover:text-primary transition-colors" href="#">
                Already have an account? <span className="font-bold">Log in</span>
</a>
</div>
</div>

    </div>
  );
}
