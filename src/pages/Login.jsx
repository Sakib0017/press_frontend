import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      // Prefer friendlyMessage from api interceptor for 405, else server message
      const msg = err.friendlyMessage || err.response?.data?.message || err.response?.data?.detail || err.message || 'Login failed';
      // Show 405-specific guidance inline
      if (err.response?.status === 405) {
        setError(msg + ' — Deploy backend first, then set VITE_API_URL in frontend Vercel env.');
      } else {
        setError(msg);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <div className="hidden lg:flex w-1/2 bg-blue-50 flex-col items-center justify-center p-8 xl:p-12 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-500">Homecare</h1>
          <p className="text-2xl xl:text-3xl text-gray-600 mt-2">To Touch Billion Lives <span className="text-cyan-500 font-bold border-b-4 border-orange-400">Positively</span></p>
        </div>
        <img src="https://placehold.co/400x300/e0f2fe/0e7490?text=Homecare" alt="Healthcare Illustration" className="max-w-md rounded-xl w-full" onError={(e)=>e.target.style.display='none'} />
        <div className="absolute bottom-8 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Powered By:</p>
          <p className="font-bold text-gray-700 italic">Homecare</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-white min-h-screen">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="lg:hidden text-2xl font-bold text-cyan-500 mb-1">Homecare</h1>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-700 leading-tight">ePrescription and Pharmacy Management</h2>
            <p className="lg:hidden text-[11px] text-slate-400 mt-1">To Touch Billion Lives Positively</p>
            {error && <p className="text-red-500 text-xs sm:text-sm mt-3 font-bold bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] sm:text-xs text-blue-500 font-medium">Email Address</label>
              <input type="email" name="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 bg-yellow-50 outline-none text-sm" placeholder="doctor@example.com" />
            </div>
            <div className="relative">
              <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] sm:text-xs text-blue-500 font-medium">Password</label>
              <input type="password" name="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 bg-yellow-50 outline-none text-sm" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 sm:py-3 rounded-xl transition duration-200 shadow-lg text-sm">Login</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">New doctor? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
