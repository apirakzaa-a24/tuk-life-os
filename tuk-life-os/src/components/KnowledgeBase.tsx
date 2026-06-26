import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Star, Clock, Trash2 } from 'lucide-react';
import { safeLocalStorage } from '../utils/storage';

export default function KnowledgeBase() {
  const [notes, setNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด');
  const [showCreate, setShowCreate] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', category: 'งาน', tags: '', content: '' });

  useEffect(() => {
    const savedNotes = JSON.parse(safeLocalStorage.getItem('tuk_life_knowledge_notes') || '[]');
    setNotes(savedNotes);
  }, []);

  const categories = ['ทั้งหมด', 'งาน', 'ท่องเที่ยว', 'ส่วนตัว', 'เอกสาร'];

  const saveNote = () => {
    if (!newNote.title) return;
    const note = { ...newNote, id: Date.now().toString(), createdAt: new Date().toISOString(), isFavorite: false };
    const updatedNotes = [note, ...notes];
    setNotes(updatedNotes);
    safeLocalStorage.setItem('tuk_life_knowledge_notes', JSON.stringify(updatedNotes));
    setNewNote({ title: '', category: 'งาน', tags: '', content: '' });
    setShowCreate(false);
  };

  const toggleFavorite = (id: string) => {
    const updated = notes.map(n => n.id === id ? {...n, isFavorite: !n.isFavorite} : n);
    setNotes(updated);
    safeLocalStorage.setItem('tuk_life_knowledge_notes', JSON.stringify(updated));
  };

  const filteredNotes = notes.filter(n => 
    (categoryFilter === 'ทั้งหมด' || n.category === categoryFilter) &&
    (n.title.includes(searchQuery) || (n.tags || '').includes(searchQuery))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1 lg:col-span-3">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-500" />
            📚 คลังความรู้ส่วนตัว
        </h3>
        <button onClick={() => setShowCreate(!showCreate)} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Plus size={18}/></button>
      </div>

      {showCreate && (
        <div className="space-y-2 mb-4 p-4 border rounded-xl bg-slate-50">
            <input placeholder="หัวข้อ" className="w-full p-2 text-sm border rounded" value={newNote.title} onChange={e => setNewNote({...newNote, title: e.target.value})} />
            <select className="w-full p-2 text-sm border rounded" value={newNote.category} onChange={e => setNewNote({...newNote, category: e.target.value})}>{categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}</select>
            <input placeholder="แท็ก (คั่นด้วยคอมม่า)" className="w-full p-2 text-sm border rounded" value={newNote.tags} onChange={e => setNewNote({...newNote, tags: e.target.value})} />
            <textarea placeholder="เนื้อหา" className="w-full p-2 text-sm border rounded" value={newNote.content} onChange={e => setNewNote({...newNote, content: e.target.value})} />
            <button onClick={saveNote} className="w-full bg-emerald-600 text-white p-2 rounded-lg text-sm font-bold">บันทึก</button>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <input 
          placeholder="ค้นหา..."
          className="flex-1 p-2 border rounded-lg text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select className="p-2 border rounded-lg text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filteredNotes.map((n: any) => (
            <div key={n.id} className="p-3 border rounded-lg text-sm flex justify-between items-center">
                <div>
                    <div className="font-bold">{n.title}</div>
                    <div className="text-xs text-slate-500">{n.category} • {new Date(n.createdAt).toLocaleDateString()}</div>
                </div>
                <button onClick={() => toggleFavorite(n.id)}>
                    <Star className={`w-4 h-4 ${n.isFavorite ? 'text-amber-500' : 'text-slate-300'}`} />
                </button>
            </div>
        ))}
      </div>
    </div>
  );
}
