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
    <div className="bg-blue-50 flex items-center justify-center p-6 min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-cyan-500">eghealth</h1>
          <h2 className="text-xl font-semibold text-gray-700">Doctor Registration</h2>
          {error && <p className="text-red-500 text-sm mt-2 font-bold">{error}</p>}
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="name" placeholder="Full Name" required value={form.name} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="email" type="email" placeholder="Email Address" required value={form.email} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="password" type="password" placeholder="Password" required value={form.password} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="specialization" placeholder="Specialization (e.g. Cardiology)" value={form.specialization} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="degree" placeholder="Degree (e.g. MBBS, FCPS)" value={form.degree} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="experiance" placeholder="Years of Experience" value={form.experiance} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="license_number" placeholder="BMDC License Number" value={form.license_number} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="branch" placeholder="Branch (e.g. Dhanmondi)" value={form.branch} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="bhaban" placeholder="Bhaban / Building Name" value={form.bhaban} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <input name="room" placeholder="Room Number" value={form.room} onChange={handleChange} className="border p-3 rounded-lg bg-gray-50 focus:ring-2 focus:ring-cyan-400 outline-none" />
          <button type="submit" className="md:col-span-2 bg-cyan-500 text-white font-bold py-3 rounded-lg hover:bg-cyan-600 transition duration-200 shadow-md">Complete Registration</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">Already have an account? <Link to="/login" className="text-blue-500 font-bold hover:underline">Login here</Link></p>
      </div>
    </div>
  );
}
