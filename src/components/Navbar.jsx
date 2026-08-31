import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { name: 'Home', url: '/dashboard' },
  { name: 'List', url: '/prescriptions' },
  { name: 'Register', url: '/patient-reg' },
  { name: 'Patients', url: '/patient-list' },
  { name: 'Setup', url: '/setup' },
  { name: 'Profile', url: '/profile' },
  { name: 'Reset', url: '/reset' },
];

export default function Navbar() {
  const loc = useLocation();
  return (
    <>
      <aside className="fixed bottom-0 left-0 z-[100] w-full h-[65px] bg-white border-t border-slate-200 md:relative md:h-screen md:w-20 md:flex-col md:border-t-0 md:border-r flex shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] md:shadow-none">
        <div className="hidden md:flex p-6 items-center justify-center shrink-0">
          <svg className="w-10 h-10 fill-blue-700" viewBox="0 0 512 512"><path d="M184 48H328c4.4 0 8 3.6 8 8V96H176V56c0-4.4 3.6-8 8-8zm-56 8V96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H384V56c0-30.9-25.1-56-56-56H184c-30.9 0-56 25.1-56 56zm96 152c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v48h48c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H288v48c0 8.8-7.2 16-16 16H240c-8.8 0-16-7.2-16-16V320H176c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16h48V208z"></path></svg>
        </div>
        <nav className="grid grid-cols-7 md:flex md:flex-col flex-1 w-full p-1 md:p-2">
          {menuItems.map(item => {
            const isActive = loc.pathname === item.url || (item.url === '/dashboard' && loc.pathname === '/') ;
            const cls = isActive ? 'text-blue-700 border-t-2 md:border-t-0 md:border-l-4 border-blue-700 bg-blue-50/50 md:bg-blue-50' : 'text-slate-400 border-t-2 border-transparent md:border-t-0 md:border-l-4 md:border-transparent hover:text-slate-600 hover:bg-slate-50';
            return (
              <NavLink key={item.url} to={item.url} className={`flex flex-col md:flex-row items-center justify-center py-2 md:py-5 transition-all relative group ${cls}`}>
                <span className="md:hidden text-[10px] font-bold mt-1 tracking-tight">{item.name}</span>
                <span className="hidden md:block text-[11px] font-black uppercase tracking-wider">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <div className="h-[65px] md:hidden"></div>
    </>
  );
}
