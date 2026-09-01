import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', specialization: '', degree: '', experiance: '', license_number: '', branch: '', bhaban: '', room: ''
  });
  const [error, setError] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="bg-blue-50 flex items-center justify-center p-3 sm:p-6 min-h-screen">
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl w-full max-w-2xl my-4">
        <div className="text-center mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-cyan-500">eghealth</h1>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-700">Doctor Registration</h2>
          {error && <p className="text-red-500 text-xs sm:text-sm mt-2 font-bold bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <input name="name" placeholder="Full Name *" required value={form.name} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="email" type="email" placeholder="Email Address *" required value={form.email} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="password" type="password" placeholder="Password *" required value={form.password} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="specialization" placeholder="Specialization (e.g. Cardiology)" value={form.specialization} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="degree" placeholder="Degree (e.g. MBBS, FCPS)" value={form.degree} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="experiance" placeholder="Years of Experience" value={form.experiance} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="license_number" placeholder="BMDC License Number" value={form.license_number} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="branch" placeholder="Branch (e.g. Dhanmondi)" value={form.branch} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="bhaban" placeholder="Bhaban / Building Name" value={form.bhaban} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm" />
          <input name="room" placeholder="Room Number" value={form.room} onChange={handleChange} className="border p-3.5 sm:p-3 rounded-xl bg-gray-50 focus:ring-2 focus:ring-cyan-400 focus:bg-white outline-none text-sm md:col-span-2" />
          <button type="submit" className="md:col-span-2 bg-cyan-500 text-white font-bold py-3.5 sm:py-3 rounded-xl hover:bg-cyan-600 active:bg-cyan-700 transition duration-200 shadow-md text-sm">Complete Registration</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline">Login here</Link></p>
      </div>
    </div>
  );
}
