import React, { useState, useEffect } from 'react';
import { Package, Users, Calendar, Diamond } from 'lucide-react';

const App = () => {
  const [inventory, setInventory] = useState([]);
  // Replace this with your RENDER URL once deployed, currently pointing to localhost
  const API_BASE = "http://localhost:3001/api";

  useEffect(() => {
    fetch(`${API_BASE}/inventory`)
      .then(res => res.json())
      .then(data => setInventory(data))
      .catch(err => console.error("Database Connection Failed:", err));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#2D2926]">
      {/* Navigation Header */}
      <nav className="border-b border-[#E5E1DA] bg-white px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Diamond className="text-[#C5A059]" size={28} />
          <h1 className="text-2xl font-light tracking-widest uppercase">Faryal Al Hosary</h1>
        </div>
        <div className="flex gap-8 text-sm uppercase tracking-wider text-[#706B63]">
          <span className="border-b border-[#C5A059] pb-1 cursor-pointer">Inventory</span>
          <span className="cursor-pointer hover:text-[#C5A059] transition-colors">Bookings</span>
          <span className="cursor-pointer hover:text-[#C5A059] transition-colors">Customers</span>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-[#C5A059] font-medium mb-2 tracking-widest uppercase text-xs">Atelier Management</p>
            <h2 className="text-4xl font-light">Bridal Inventory</h2>
          </div>
          <button className="bg-[#2D2926] text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-[#C5A059] transition-all">
            Add New Gown
          </button>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inventory.map((item) => (
            <div key={item.id} className="bg-white border border-[#E5E1DA] p-6 hover:shadow-xl transition-shadow group">
              <div className="flex justify-between items-start mb-6">
                <Package className="text-[#E5E1DA] group-hover:text-[#C5A059] transition-colors" size={32} />
                <span className={`px-3 py-1 text-[10px] uppercase tracking-tighter border ${item.current_status === 'ready' ? 'border-green-200 text-green-600' : 'border-amber-200 text-amber-600'}`}>
                  {item.current_status}
                </span>
              </div>
              <h3 className="text-xl font-light mb-1">{item.designer}</h3>
              <p className="text-[#706B63] text-sm italic mb-4">"{item.model_name}"</p>
              <div className="border-t border-[#F5F3EF] pt-4 mt-4 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-[#B4B0A9]">{item.size_label} | {item.color}</span>
                <span className="text-lg font-medium text-[#C5A059]">AED {item.rental_price}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default App;