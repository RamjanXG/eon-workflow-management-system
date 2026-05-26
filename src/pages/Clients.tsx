import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { Search, Plus, Building2, Briefcase, User, Mail, Phone, MapPin } from 'lucide-react';
import { Client } from '../types';
import { Modal } from '../components/Modal';

export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'clients'));
    return onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      companyName: formData.get('companyName') as string,
      industry: formData.get('industry') as string,
      contactPerson: formData.get('contactPerson') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
    };

    if (editingClient) {
      await updateDoc(doc(db, 'clients', editingClient.id), data);
    } else {
      await addDoc(collection(db, 'clients'), { ...data, createdAt: Date.now() });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-8">
      <header className="flex items-center justify-between mb-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">Partners</span>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mt-1">Clients</h1>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-neutral-950 text-white px-6 py-3 rounded-2xl font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="card p-6 flex flex-col justify-between group hover:border-neutral-950 transition-all">
            <div>
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-400 group-hover:text-neutral-950 transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => { setEditingClient(client); setIsModalOpen(true); }}
                  className="text-xs font-bold text-neutral-400 hover:text-neutral-950 uppercase tracking-widest"
                >
                  Edit
                </button>
              </div>
              <h3 className="mt-6 text-xl font-bold text-neutral-900 line-clamp-1">{client.companyName}</h3>
              <p className="text-xs font-mono text-neutral-500 mt-1 uppercase tracking-tighter">{client.industry}</p>
              
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <User className="w-4 h-4 opacity-50" /> {client.contactPerson}
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <Phone className="w-4 h-4 opacity-50" /> {client.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <Mail className="w-4 h-4 opacity-50" /> {client.email}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <MapPin className="w-3 h-3" /> {client.address.split(',')[0]}
              </div>
              <div className="w-8 h-8 rounded-full bg-neutral-950 text-white flex items-center justify-center text-[10px] font-bold">
                12
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? "Edit Client" : "Add New Client"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Company Name</label>
            <input name="companyName" defaultValue={editingClient?.companyName} required className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Industry</label>
              <input name="industry" defaultValue={editingClient?.industry} className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Contact Person</label>
              <input name="contactPerson" defaultValue={editingClient?.contactPerson} required className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Phone</label>
              <input name="phone" defaultValue={editingClient?.phone} required className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-neutral-500">Email</label>
              <input name="email" type="email" defaultValue={editingClient?.email} className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-neutral-500">Address</label>
            <textarea name="address" defaultValue={editingClient?.address} className="w-full px-4 py-3 rounded-xl border border-neutral-200" />
          </div>
          <button type="submit" className="w-full bg-neutral-950 text-white py-4 rounded-2xl font-bold uppercase tracking-widest text-xs">
            Save Client
          </button>
        </form>
      </Modal>
    </div>
  );
};
