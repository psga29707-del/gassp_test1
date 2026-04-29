import React, { useState } from 'react';
import { Plus, Trash2, Tag, Palette } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const PRESET_COLORS = [
  '#8C5A35', // 暖咖啡 (Primary)
  '#5D4037', // 深可可
  '#A67C52', // 浅橡木
  '#3E2723', // 特浓咖啡 (Text)
  '#8B4513', // 马鞍棕
  '#A0522D', // 赭石色
  '#BC8F8F', // 褐玫瑰
  '#6B8E23', // 橄榄绿 (哑光)
  '#556B2F', // 暗橄榄
  '#4E342E', // 炭棕色
];

export const SubjectManager: React.FC = () => {
  const { subjects, addSubject, deleteSubject } = useSubjectStore();
  
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#8C5A35');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = newName.trim();
    if (!trimmedName) return;

    // Check for duplicates
    const isDuplicate = subjects.some(
      (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (isDuplicate) {
      alert('该科目名称已存在，请换一个名字吧！');
      return;
    }

    addSubject({
      name: trimmedName,
      color: newColor,
    });

    // Reset form
    setNewName('');
    setNewColor('#8C5A35');
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`确定要删除“${name}”吗？这将不会删除已有的专注记录，但该科目将不再可选。`)) {
      deleteSubject(id);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h2 className="text-2xl font-bold text-warm-text">科目管理</h2>
        <p className="text-warm-text/50 text-sm mt-1">添加或删除你的学习分类，并为它们分配专属颜色。</p>
      </header>

      {/* Add New Subject Form */}
      <section className="bg-warm-surface p-6 rounded-3xl shadow-md shadow-warm-primary/5 border border-warm-primary/10">
        <h3 className="text-lg font-bold text-warm-text mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-warm-primary" />
          新增科目
        </h3>
        
        <form onSubmit={handleAdd} className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-warm-text/30 uppercase tracking-wider ml-1">
                科目名称
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-text/20" />
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="例如：高等数学、雅思听力..."
                  className="w-full pl-11 pr-4 py-3 bg-warm-bg/50 border border-warm-primary/5 rounded-xl focus:ring-2 focus:ring-warm-primary/30 outline-none transition-all text-warm-text"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!newName.trim()}
              className={cn(
                "px-8 h-[50px] bg-warm-primary text-warm-surface rounded-xl font-bold transition-all hover:bg-warm-primary/90 active:scale-95 shadow-lg shadow-warm-primary/10 flex items-center gap-2",
                !newName.trim() && "opacity-50 grayscale cursor-not-allowed active:scale-100"
              )}
            >
              <Plus className="w-5 h-5" />
              <span>添加科目</span>
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-warm-text/30 uppercase tracking-wider ml-1">
              专属颜色
            </label>
            <div className="flex flex-wrap gap-3 p-3 bg-warm-bg/30 border border-warm-primary/5 rounded-2xl">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all hover:scale-110 active:scale-90 shadow-sm border-2 flex items-center justify-center",
                    newColor === color ? "border-warm-primary/50 scale-110 shadow-md" : "border-white/50 hover:border-warm-primary/20"
                  )}
                  style={{ backgroundColor: color }}
                >
                  {newColor === color && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </button>
              ))}
              <div className="w-[1px] h-8 bg-warm-primary/10 mx-2 self-center" />
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold text-warm-text/20 uppercase tracking-tight">HEX CODE</span>
                <span className="text-sm font-mono text-warm-text/70 font-bold uppercase">
                  {newColor}
                </span>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Subjects List */}
      <section className="space-y-4">
        <h3 className="text-lg font-bold text-warm-text flex items-center gap-2 ml-1">
          <Palette className="w-5 h-5 text-warm-primary" />
          现有科目 ({subjects.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <div 
              key={subject.id}
              className="group bg-warm-surface p-4 rounded-2xl border border-warm-primary/10 shadow-sm flex items-center justify-between hover:border-warm-primary/30 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="font-semibold text-warm-text/80">{subject.name}</span>
              </div>
              
              <button
                onClick={() => handleDelete(subject.id, subject.name)}
                className="p-2 text-warm-text/10 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="删除科目"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12 bg-warm-bg/30 rounded-3xl border-2 border-dashed border-warm-primary/10">
            <p className="text-warm-text/20 font-medium">还没有科目，快去添加一个吧！</p>
          </div>
        )}
      </section>
    </div>
  );
};
