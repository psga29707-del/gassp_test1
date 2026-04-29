import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import weekday from 'dayjs/plugin/weekday';
import { useRecordStore } from '../../store/useRecordStore';
import { useSubjectStore } from '../../store/useSubjectStore';
import { Clock, Calendar, BarChart2, Database} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

dayjs.extend(isBetween);
dayjs.extend(weekday);

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const { records, addRecord } = useRecordStore();
  const { subjects } = useSubjectStore();

  // --- Data Logic ---
  const weekData = useMemo(() => {
    const startOfWeek = dayjs().weekday(0).startOf('day');
    const endOfWeek = dayjs().weekday(6).endOf('day');

    const filteredRecords = records.filter(record => 
      dayjs(record.startTime).isBetween(startOfWeek, endOfWeek, null, '[]')
    );

    // 1. Core Metrics
    const totalMinutes = filteredRecords.reduce((acc, cur) => acc + cur.duration, 0);
    const totalHours = (totalMinutes / 60).toFixed(2);
    const avgHoursPerDay = (parseFloat(totalHours) / 7).toFixed(2);
    const focusCount = filteredRecords.length;

    // 2. Bar Chart Data (Daily Trend)
    const dailyData = Array.from({ length: 7 }).map((_, i) => {
      const date = dayjs().weekday(i);
      const dayName = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i];
      const dayMinutes = filteredRecords
        .filter(r => dayjs(r.startTime).isSame(date, 'day'))
        .reduce((acc, cur) => acc + cur.duration, 0);
      
      return {
        name: dayName,
        hours: parseFloat((dayMinutes / 60).toFixed(2))
      };
    });

    // 3. Pie Chart Data (Subject Distribution)
    const subjectData = subjects.map(subject => {
      const subjectMinutes = filteredRecords
        .filter(r => r.subjectId === subject.id)
        .reduce((acc, cur) => acc + cur.duration, 0);
      
      return {
        name: subject.name,
        value: parseFloat((subjectMinutes / 60).toFixed(2)),
        color: subject.color
      };
    }).filter(s => s.value > 0);

    return {
      totalHours,
      avgHoursPerDay,
      focusCount,
      dailyData,
      subjectData,
      hasData: filteredRecords.length > 0
    };
  }, [records, subjects]);

  // --- Mock Data Generator ---
  const generateMockData = () => {
    if (!subjects.length) return alert('请先创建一些科目！');
    
    const count = 30;
    for (let i = 0; i < count; i++) {
      const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
      const randomDayOffset = Math.floor(Math.random() * 7);
      const startTime = dayjs().weekday(randomDayOffset).hour(Math.floor(Math.random() * 12) + 8).valueOf();
      const duration = Math.floor(Math.random() * 110) + 10; // 10-120 min
      
      addRecord({
        subjectId: randomSubject.id,
        startTime,
        endTime: startTime + duration * 60000,
        duration
      });
    }
  };

  if (!weekData.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-warm-surface rounded-3xl border border-warm-primary/10 flex items-center justify-center mb-6 text-warm-text/20 shadow-lg shadow-warm-primary/5">
          <BarChart2 className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-warm-text mb-2">本周暂无数据</h3>
        <p className="text-warm-text/50 max-w-xs mb-8">
          你还没有开始任何专注。快去选择一个科目并开启你的第一个心流时刻吧！
        </p>
        <button
          onClick={generateMockData}
          className="flex items-center gap-2 px-6 py-3 bg-warm-primary text-warm-surface rounded-xl font-semibold hover:bg-warm-primary/90 transition-colors shadow-lg shadow-warm-primary/10"
        >
          <Database className="w-4 h-4" />
          生成测试数据
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Mock Action */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-warm-text">本周专注分析</h2>
        <button
          onClick={generateMockData}
          className="text-xs text-warm-text/30 hover:text-warm-primary flex items-center gap-1 transition-colors"
          title="仅供测试"
        >
          <Database className="w-3 h-3" />
          补全数据
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          icon={<Clock className="w-5 h-5 text-warm-primary" />}
          label="总专注时长"
          value={`${weekData.totalHours}h`}
          color="bg-warm-primary/10"
        />
        <MetricCard 
          icon={<Calendar className="w-5 h-5 text-emerald-700" />}
          label="日均专注"
          value={`${weekData.avgHoursPerDay}h`}
          color="bg-emerald-500/10"
        />
        <MetricCard 
          icon={<BarChart2 className="w-5 h-5 text-amber-700" />}
          label="专注次数"
          value={`${weekData.focusCount}次`}
          color="bg-amber-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Trend Chart */}
        <div className="bg-warm-surface p-6 rounded-3xl shadow-md shadow-warm-primary/5 border border-warm-primary/10">
          <h3 className="text-lg font-bold text-warm-text mb-6 flex items-center gap-2">
            每日趋势
            <span className="text-xs font-normal text-warm-text/30">(单位: 小时)</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5D5C5" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8C5A35', opacity: 0.5, fontSize: 12 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#F4ECE1' }}
                  contentStyle={{ backgroundColor: '#FBF8F1', borderRadius: '16px', border: '1px solid rgba(140, 90, 53, 0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                />
                <Bar 
                  dataKey="hours" 
                  fill="#8C5A35" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Distribution Chart */}
        <div className="bg-warm-surface p-6 rounded-3xl shadow-md shadow-warm-primary/5 border border-warm-primary/10">
          <h3 className="text-lg font-bold text-warm-text mb-6">科目分布</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={weekData.subjectData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {weekData.subjectData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FBF8F1', borderRadius: '16px', border: '1px solid rgba(140, 90, 53, 0.1)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-warm-text/70 text-sm font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) => (
  <div className="bg-warm-surface p-6 rounded-3xl shadow-md shadow-warm-primary/5 border border-warm-primary/10 flex items-center gap-4 transition-transform hover:scale-[1.02]">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", color)}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-warm-text/50">{label}</p>
      <p className="text-2xl font-bold text-warm-text tracking-tight">{value}</p>
    </div>
  </div>
);
