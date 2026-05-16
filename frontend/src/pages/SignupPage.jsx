import React from 'react';
import { Link } from 'react-router-dom';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen">
      
<div className="w-full max-w-md bg-[#F0F0F3] rounded-[16px] neumorphic-outset p-container-padding">
<div className="text-center mb-stack-md">
<h1 className="font-headline-lg text-headline-lg text-primary md:font-headline-lg md:text-headline-lg font-headline-lg-mobile text-headline-lg-mobile">Create Account</h1>
<p className="font-body-md text-body-md text-secondary mt-2">Join FocusPortal to manage your goals.</p>
</div>
<form action="#" className="space-y-stack-sm" method="POST">
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="fullName">Full Name</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>person</span>
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="fullName" name="fullName" required="" type="text"/>
</div>
</div>
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="email">Email</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>mail</span>
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="email" name="email" required="" type="email"/>
</div>
</div>
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="role">Role</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>work</span>
<select className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-10 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md appearance-none" id="role" name="role" required="">
<option className="text-outline-variant" disabled="" selected="" value="">Select a role...</option>
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
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="password" name="password" required="" type="password"/>
</div>
</div>
<div>
<label className="block font-label-caps text-label-caps text-secondary mb-1" htmlFor="confirmPassword">Confirm Password</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline" style={{fontVariationSettings: "'FILL' 0"}}>lock_reset</span>
<input className="w-full bg-[#F0F0F3] neumorphic-inset rounded-lg py-3 pl-10 pr-4 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary border-none font-body-md text-body-md placeholder-outline-variant transition-shadow" id="confirmPassword" name="confirmPassword" required="" type="password"/>
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
