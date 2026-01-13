'use client';

import { useState, useEffect } from "react";

interface Countdown {
  id: string;
  type: 'min' | 'max';
  targetTime: string;
  timeRemaining: string;
  isFinished: boolean;
}

export default function Home() {
  const [startTime, setStartTime] = useState("");
  const [minEndTime, setMinEndTime] = useState("");
  const [maxEndTime, setMaxEndTime] = useState("");
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Calculate end times when start time changes
  useEffect(() => {
    if (startTime) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);

      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      // Minimum: 7.6 Stunden Arbeit + 30 Min Pause = 8.1 Stunden
      const minDate = new Date(startDate.getTime() + (7.6 * 60 + 30) * 60 * 1000);
      
      // Maximum: 9 Stunden Arbeit + 30 Min Pause = 9.5 Stunden
      const maxDate = new Date(startDate.getTime() + (9 * 60 + 30) * 60 * 1000);

      setMinEndTime(formatTime(minDate));
      setMaxEndTime(formatTime(maxDate));

      return () => clearTimeout(timer);
    } else {
      setMinEndTime("");
      setMaxEndTime("");
      setCountdowns([]);
    }
  }, [startTime]);

  // Update countdown timers every second
  useEffect(() => {
    if (countdowns.length === 0) return;

    const interval = setInterval(() => {
      setCountdowns(prev => prev.map(countdown => {
        const now = new Date();
        const [targetHours, targetMinutes] = countdown.targetTime.split(':').map(Number);
        const targetDate = new Date();
        targetDate.setHours(targetHours, targetMinutes, 0, 0);

        const diff = targetDate.getTime() - now.getTime();

        if (diff <= 0) {
          return { ...countdown, timeRemaining: '00:00:00', isFinished: true };
        }

        const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
        const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000);

        return {
          ...countdown,
          timeRemaining: `${String(hoursLeft).padStart(2, '0')}:${String(minutesLeft).padStart(2, '0')}:${String(secondsLeft).padStart(2, '0')}`,
          isFinished: false,
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [countdowns.length]);

  const startCountdown = (type: 'min' | 'max') => {
    const targetTime = type === 'min' ? minEndTime : maxEndTime;
    const existingCountdown = countdowns.find(c => c.type === type);
    
    if (existingCountdown) return; // Already exists

    const countdown: Countdown = {
      id: Date.now().toString(),
      type,
      targetTime,
      timeRemaining: '00:00:00',
      isFinished: false,
    };

    setCountdowns([...countdowns, countdown]);
  };

  const deleteCountdown = (id: string) => {
    setCountdowns(countdowns.filter(c => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <main className="w-full max-w-4xl py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            Arbeitszeit Rechner
          </h1>
          <p className="text-slate-400 text-lg">
            Gib deine Startzeit ein und starte deine Countdowns
          </p>
        </div>

        {/* Calculator Card */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-8 md:p-12 mb-8">
          {/* Input Section */}
          <div className="mb-10">
            <label className="block text-sm font-medium text-slate-300 mb-3 uppercase tracking-wide">
              Startzeit
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-6 py-4 text-2xl font-medium text-white bg-slate-900/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Results Section */}
          {startTime && (
            <div className={`space-y-4 transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {/* Minimum Time */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm font-medium mb-1 uppercase tracking-wide">
                      Mindestarbeitszeit (7,6h)
                    </p>
                    <p className="text-slate-500 text-xs">
                      inkl. 30 Min Pause
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white font-mono">
                      {minEndTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startCountdown('min')}
                  disabled={countdowns.some(c => c.type === 'min')}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all duration-200"
                >
                  {countdowns.some(c => c.type === 'min') ? 'Countdown läuft' : 'Countdown starten'}
                </button>
              </div>

              {/* Maximum Time */}
              <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-slate-300 text-sm font-medium mb-1 uppercase tracking-wide">
                      Maximalarbeitszeit (9h)
                    </p>
                    <p className="text-slate-500 text-xs">
                      inkl. 30 Min Pause
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-white font-mono">
                      {maxEndTime}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => startCountdown('max')}
                  disabled={countdowns.some(c => c.type === 'max')}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-all duration-200"
                >
                  {countdowns.some(c => c.type === 'max') ? 'Countdown läuft' : 'Countdown starten'}
                </button>
              </div>

              {/* Info Box */}
              <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-4">
                <p className="text-sm text-slate-400 text-center">
                  <strong className="text-slate-300">Hinweis:</strong> Die 30 Minuten Pause sind bereits eingerechnet
                </p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!startTime && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-400 text-lg">
                Wähle eine Startzeit, um loszulegen
              </p>
            </div>
          )}
        </div>

        {/* Active Countdowns */}
        {countdowns.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Aktive Countdowns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {countdowns.map((countdown) => (
                <div
                  key={countdown.id}
                  className={`bg-slate-800/50 backdrop-blur-xl border ${countdown.type === 'min' ? 'border-blue-500/50' : 'border-purple-500/50'} rounded-xl p-6 hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {countdown.type === 'min' ? 'Mindestzeit' : 'Maximalzeit'}
                      </h3>
                      <p className="text-slate-400 text-sm">
                        Zielzeit: <span className="text-white font-mono">{countdown.targetTime}</span>
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {countdown.type === 'min' ? '7,6h + 30 Min' : '9h + 30 Min'}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteCountdown(countdown.id)}
                      className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 rounded-lg w-9 h-9 flex items-center justify-center transition-all"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-6 text-center border border-slate-700/50">
                    {countdown.isFinished ? (
                      <div>
                        <p className="text-green-400 font-bold text-2xl mb-1">Fertig!</p>
                        <p className="text-slate-400 text-sm">Du kannst jetzt gehen</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Verbleibende Zeit</p>
                        <p className="text-white font-bold text-5xl font-mono tracking-wider">
                          {countdown.timeRemaining}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}