import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Reset(){
  const { doctor } = useAuth();
  const resetLayout = ()=>{
    if(!confirm('Reset layout to default settings?')) return;
    localStorage.removeItem(`ehr_layout_v2_${doctor._id}`);
    alert('Layout reset to default. Changes will apply on next page load.');
  };
  const clearLocalData=()=>{
    if(!confirm('Clear all local prescription data?')) return;
    Object.keys(localStorage).forEach(key=>{
      if(key.startsWith(`presc_${doctor._id}_`) || key.startsWith('ehr_layout_v2_')) localStorage.removeItem(key);
    });
    alert('Local data cleared.');
  };
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50 text-[13px] antialiased">
      <Navbar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
        <Header />
        <section className="px-3 sm:px-5 lg:px-6 py-3 sm:py-4 bg-white border-b shrink-0"><h1 className="text-lg sm:text-xl font-black tracking-tight">Reset</h1></section>
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 pb-20 md:pb-6">
          <div className="max-w-lg mx-auto w-full">
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b"><h2 className="text-xs font-black uppercase">Layout Settings</h2></div>
              <div className="p-5 space-y-4"><p className="text-xs text-slate-500 leading-relaxed">Reset your prescription layout to default settings. This will clear your custom layout configuration.</p><button onClick={resetLayout} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase">Reset Layout to Default</button></div>
            </div>
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden mt-4">
              <div className="px-5 py-4 border-b"><h2 className="text-xs font-black uppercase">Clear All Data</h2></div>
              <div className="p-5 space-y-4"><p className="text-xs text-slate-500 leading-relaxed">Remove all locally stored prescription data for the current session.</p><button onClick={clearLocalData} className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase">Clear Local Data</button></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
