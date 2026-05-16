import React from 'react';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      
{/*  Canvas  */}
<main className="w-full max-w-md">
{/*  Extruded Card  */}
<div className="bg-[#F0F0F3] rounded-2xl p-8 shadow-[-6px_-6px_12px_#FFFFFF,6px_6px_12px_#AEAEC0] flex flex-col gap-8 items-center">
{/*  Header  */}
<div className="text-center space-y-2">
<h1 className="font-headline-lg text-headline-lg md:font-headline-lg md:text-headline-lg text-primary tracking-tight">Portal Login</h1>
<p className="font-body-md text-body-md text-secondary">Access your personalized workspace.</p>
</div>
{/*  Form  */}
<form className="w-full flex flex-col gap-6">
{/*  Email Field (Pressed)  */}
<div className="flex flex-col gap-2">
<label className="font-label-caps text-label-caps text-on-surface-variant ml-2" htmlFor="email">Email Address</label>
<div className="relative">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">mail</span>
<input className="w-full bg-[#F0F0F3] text-on-surface font-body-lg text-body-lg rounded-xl py-3 pl-12 pr-4 border-none shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] focus:ring-2 focus:ring-primary focus:outline-none transition-shadow placeholder:text-outline-variant" id="email" name="email" placeholder="name@company.com" required="" type="email"/>
</div>
</div>
{/*  Password Field (Pressed)  */}
<div className="flex flex-col gap-2">
<div className="flex justify-between items-center ml-2 mr-2">
<label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="password">Password</label>
<a className="font-label-caps text-label-caps text-primary hover:text-primary-container transition-colors" href="#">Forgot?</a>
</div>
<div className="relative">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary pointer-events-none">lock</span>
<input className="w-full bg-[#F0F0F3] text-on-surface font-body-lg text-body-lg rounded-xl py-3 pl-12 pr-4 border-none shadow-[inset_3px_3px_7px_#AEAEC0,inset_-2px_-2px_5px_#FFFFFF] focus:ring-2 focus:ring-primary focus:outline-none transition-shadow placeholder:text-outline-variant" id="password" name="password" placeholder="••••••••" required="" type="password"/>
</div>
</div>
{/*  Action Button (Extruded to Pressed on Active)  */}
<button className="mt-2 w-full bg-primary text-on-primary font-headline-md text-headline-md py-4 rounded-xl shadow-[-6px_-6px_12px_#FFFFFF,6px_6px_12px_#AEAEC0] hover:bg-primary-container active:shadow-[inset_3px_3px_7px_#444842,inset_-2px_-2px_5px_#8A9A86] transition-all duration-200 flex items-center justify-center gap-2" type="submit">
<span>Sign In</span>
<span className="material-symbols-outlined text-[20px]">login</span>
</button>
</form>
{/*  Footer Link  */}
<p className="font-body-md text-body-md text-secondary text-center">
                Don't have an account? <a className="text-primary font-bold hover:text-primary-container transition-colors" href="#">Sign up</a>
</p>
</div>
</main>

    </div>
  );
}
