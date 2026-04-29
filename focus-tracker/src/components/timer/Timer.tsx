import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { useSubjectStore } from '../../store/useSubjectStore';
import { useRecordStore } from '../../store/useRecordStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Timer: React.FC = () => {
  const { subjects } = useSubjectStore();
  const { addRecord } = useRecordStore();

  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const themeColor = selectedSubject?.color || '#8C5A35'; // Changed default to warm-primary

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return [hrs, mins, secs]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  };

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setElapsedTime(0);
    setStartTime(null);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleEndFocus = useCallback(() => {
    if (!startTime || !selectedSubjectId) return;

    const durationMinutes = elapsedTime / 60;
    
    // Check for short duration
    if (elapsedTime < 60) {
      if (!window.confirm('专注时间过短（不足1分钟），是否放弃本次记录？')) {
        // User wants to keep it anyway? Or maybe they clicked cancel to keep recording?
        // The requirement says: "是否放弃记录？"
        // If they click "Confirm/OK", they abandon. If "Cancel", they keep recording or just stay.
        // Let's refine: "Confirm" = Abandon, "Cancel" = Stay in pause/stop state.
        return;
      } else {
        resetTimer();
        return;
      }
    }

    addRecord({
      subjectId: selectedSubjectId,
      startTime: startTime,
      endTime: Date.now(),
      duration: parseFloat(durationMinutes.toFixed(2)),
    });
    
    alert(`🎉 专注结束！本次专注时长：${durationMinutes.toFixed(2)} 分钟。`);
    resetTimer();
  }, [startTime, selectedSubjectId, elapsedTime, addRecord, resetTimer]);

  useEffect(() => {
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isPaused]);

  const handleStart = () => {
    if (!selectedSubjectId) {
      alert('请先选择一个学习科目！');
      return;
    }
    setIsActive(true);
    setIsPaused(false);
    if (!startTime) setStartTime(Date.now());
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  // SVG Constants
  const radius = 120;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col items-center w-full space-y-8">
      {/* Subject Selection */}
      <div className="w-full max-w-xs">
        <label className="block text-sm font-medium text-warm-text/50 mb-2 text-center">
          当前专注科目
        </label>
        <select
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
          disabled={isActive}
          className={cn(
            "w-full bg-warm-surface border border-warm-primary/10 rounded-xl px-4 py-3 text-warm-text focus:ring-2 focus:ring-warm-primary/30 outline-none transition-all appearance-none cursor-pointer text-center font-medium",
            isActive && "opacity-50 cursor-not-allowed"
          )}
        >
          <option value="">-- 请选择科目 --</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>

      {/* Animated Background Rings */}
      <div className="relative flex items-center justify-center">
        <div 
          className={cn(
            "absolute inset-0 rounded-full transition-all duration-1000",
            isActive && !isPaused ? "animate-pulse scale-110 opacity-10" : "opacity-0"
          )}
          style={{ backgroundColor: themeColor, boxShadow: `0 0 60px ${themeColor}20` }}
        />
        
        <svg 
          className={cn(
            "w-72 h-72 transition-transform duration-700",
            isActive && !isPaused ? "animate-[spin_10s_linear_infinite]" : ""
          )}
        >
          {/* Static Background Track */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-warm-primary/5"
          />
          {/* Active Status Ring (Partial for rotation effect) */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke={themeColor}
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.7} ${circumference * 0.3}`}
            strokeLinecap="round"
            fill="transparent"
            className="transition-colors duration-500"
          />
        </svg>
        
        {/* Centered Time Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold text-warm-text tracking-tight tabular-nums">
            {formatTime(elapsedTime)}
          </span>
          {selectedSubject && (
            <div className="mt-3 flex flex-col items-center">
              <span 
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-warm-text/30 mb-1"
              >
                Focusing on
              </span>
              <span 
                className="text-sm font-semibold px-4 py-1 rounded-full text-white shadow-lg shadow-warm-primary/20 transition-colors duration-300"
                style={{ backgroundColor: themeColor }}
              >
                {selectedSubject.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {!isActive ? (
          <button
            onClick={handleStart}
            disabled={!selectedSubjectId}
            className={cn(
              "flex items-center gap-2 px-10 py-4 bg-warm-primary text-warm-surface rounded-2xl font-bold text-lg hover:bg-warm-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-warm-primary/10",
              !selectedSubjectId && "opacity-50 grayscale cursor-not-allowed scale-100"
            )}
          >
            <Play className="w-6 h-6 fill-current" />
            开始专注
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className={cn(
                "flex items-center justify-center w-16 h-16 bg-warm-surface border border-warm-primary/10 rounded-2xl transition-all shadow-md shadow-warm-primary/5 group",
                isPaused ? "text-emerald-600 hover:bg-emerald-50/50" : "text-amber-600 hover:bg-amber-50/50"
              )}
            >
              {isPaused ? (
                <Play className="w-8 h-8 fill-current" />
              ) : (
                <Pause className="w-8 h-8 fill-current" />
              )}
            </button>
            
            <button
              onClick={handleEndFocus}
              className="flex items-center justify-center w-16 h-16 bg-warm-surface border border-warm-primary/10 rounded-2xl text-warm-text/20 hover:border-red-100 hover:text-red-500 hover:bg-red-50/50 transition-all shadow-md shadow-warm-primary/5"
              title="结束本次专注"
            >
              <Square className="w-8 h-8 fill-current" />
            </button>
          </>
        )}
      </div>

      {/* Status Badges */}
      {isActive && (
        <div className="flex items-center gap-2 px-4 py-2 bg-warm-surface border border-warm-primary/10 rounded-full text-warm-text/50 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 shadow-sm shadow-warm-primary/5">
          {isPaused ? (
            <>
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>专注已暂停</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>专注中...</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
