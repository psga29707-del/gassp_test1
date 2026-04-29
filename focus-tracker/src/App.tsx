import { useState } from 'react';
import { Timer as TimerIcon, BarChart3, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Timer } from './components/timer/Timer';
import { Dashboard } from './components/reports/Dashboard';
import { SubjectManager } from './components/subjects/SubjectManager';

/**
 * Utility for merging tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function App() {
  const [activeTab, setActiveTab] = useState<'timer' | 'stats' | 'settings'>('timer');

  const navItems = [
    { id: 'timer', label: '专注计时', icon: TimerIcon },
    { id: 'stats', label: '数据分析', icon: BarChart3 },
    { id: 'settings', label: '科目管理', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-warm-bg text-warm-text font-sans selection:bg-warm-primary/10">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 bg-warm-surface/80 backdrop-blur-md border-b border-warm-primary/10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-warm-primary rounded-lg flex items-center justify-center">
              <TimerIcon className="w-5 h-5 text-warm-surface" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-warm-text">FocusTracker</h1>
          </div>
          
          <nav className="flex gap-1 p-1 bg-warm-bg/50 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-warm-surface text-warm-primary shadow-md shadow-warm-primary/10" 
                      : "text-warm-text/50 hover:text-warm-text hover:bg-warm-surface/50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn(
        "max-w-3xl mx-auto px-4 py-12",
        activeTab === 'stats' && "max-w-5xl"
      )}>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'timer' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Timer />
            </div>
          )}

          {activeTab === 'stats' && (
            <Dashboard />
          )}

          {activeTab === 'settings' && (
            <SubjectManager />
          )}
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-12 text-center text-warm-text/30 text-sm">
        <p>© 2026 FocusTracker · 咖啡与原木的静谧空间</p>
      </footer>
    </div>
  );
}

export default App;
