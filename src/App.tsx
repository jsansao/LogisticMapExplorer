/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine
} from 'recharts';
import { motion } from 'motion/react';
import { Settings2, RefreshCw, Info, Activity } from 'lucide-react';

// Constantes
const MAX_ITERATIONS = 100;

export default function App() {
  const [mu, setMu] = useState(3.7);
  const [x0, setX0] = useState(0.5);
  const [iterations, setIterations] = useState(128);

  // Lógica do Mapa Logístico: x_{n+1} = mu * x_n * (1 - x_n)
  const data = useMemo(() => {
    const series = [];
    let x = x0;
    series.push({ n: 0, x: x });

    for (let i = 1; i <= iterations; i++) {
      x = mu * x * (1 - x);
      series.push({ n: i, x: x });
    }
    return series;
  }, [mu, x0, iterations]);

  // Dados para o Gráfico de Teia (Cobweb Plot)
  const cobwebData = useMemo(() => {
    const points = [];
    const curve = [];
    
    // Curva logística: f(x) = mu * x * (1 - x)
    for (let i = 0; i <= 100; i++) {
      const val = i / 100;
      curve.push({ x: val, y: mu * val * (1 - val) });
    }

    let x = x0;
    // Ponto inicial na reta y=0
    points.push({ x: x, y: 0 });
    
    for (let i = 0; i < Math.min(iterations, 100); i++) {
      const y = mu * x * (1 - x);
      points.push({ x: x, y: y });
      points.push({ x: y, y: y });
      x = y;
    }

    return { points, curve };
  }, [mu, x0, iterations]);

  const lyapunov = useMemo(() => {
    let sum = 0;
    let x = x0;
    const n = Math.min(iterations, 1000);
    for (let i = 0; i < n; i++) {
      const deriv = Math.abs(mu * (1 - 2 * x));
      if (deriv > 0) sum += Math.log2(deriv);
      x = mu * x * (1 - x);
    }
    return (sum / n).toFixed(4);
  }, [mu, x0, iterations]);

  const systemState = useMemo(() => {
    const l = parseFloat(lyapunov);
    if (l > 0) return "Chaotic";
    if (l < 0) return "Stable";
    return "Neutral";
  }, [lyapunov]);

  return (
    <div className="flex flex-col h-screen w-full bg-[#0c0e14] text-slate-300 font-mono overflow-hidden select-none">
      {/* Header */}
      <header className="h-12 border-b border-slate-800 flex items-center justify-between px-6 bg-[#161b22] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse"></div>
          <h1 className="text-xs font-bold tracking-widest text-slate-100 uppercase">Logistic Map Explorer // v2.0.0</h1>
        </div>
        <div className="hidden md:flex gap-6 text-[10px] text-slate-500 uppercase tracking-tighter">
          <span>Session: <span className="text-slate-300">Active</span></span>
          <span>Kernel: <span className="text-cyan-500">React + Recharts</span></span>
          <span>Status: <span className="text-emerald-500 underline decoration-emerald-500/30 underline-offset-4">Real-time Rendering Active</span></span>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-[#0c0e14] border-r border-slate-800 p-6 flex flex-col gap-8 overflow-y-auto shrink-0">
          <section>
            <h2 className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-bold">
              <span className="w-1 h-3 bg-cyan-500"></span> Control Cluster
            </h2>
            <div className="space-y-6">
              {/* Parameter MU */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <label className="text-slate-400 font-bold uppercase italic tracking-tight">Growth Rate (μ)</label>
                  <span className="text-cyan-400 font-bold">{mu.toFixed(4)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  step="0.0001" 
                  value={mu} 
                  onChange={(e) => setMu(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[8px] text-slate-600 font-bold">
                  <span>0.0</span><span>1.0</span><span>2.0</span><span>3.0</span><span>4.0</span>
                </div>
              </div>

              {/* Initial Condition */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <label className="text-slate-400 font-bold uppercase italic tracking-tight">Initial x₀</label>
                  <span className="text-cyan-400 font-bold">{x0.toFixed(4)}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.001" 
                  value={x0} 
                  onChange={(e) => setX0(parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Iterations */}
              <div className="space-y-2">
                <div className="flex justify-between text-[11px]">
                  <label className="text-slate-400 font-bold uppercase italic tracking-tight">Iter Count</label>
                  <span className="text-cyan-400 font-bold">{iterations}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[32, 64, 128, 256].map(val => (
                    <button 
                      key={val}
                      onClick={() => setIterations(val)}
                      className={`p-1 border text-[10px] transition-colors ${
                        iterations === val 
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' 
                        : 'border-slate-700 bg-slate-900 text-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Metrics Panel */}
          <section className="flex-1 flex flex-col min-h-0">
            <h2 className="text-[10px] text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-bold">
              <span className="w-1 h-3 bg-emerald-500"></span> Metrics Output
            </h2>
            <div className="bg-[#161b22] border border-slate-800 rounded p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold">Lyapunov Exp</p>
                  <p className={`text-xs font-bold ${parseFloat(lyapunov) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {lyapunov} bits/it
                  </p>
                </div>
                <div>
                  <p className="text-[8px] text-slate-500 uppercase font-bold">System State</p>
                  <p className={`text-xs italic font-bold ${systemState === 'Chaotic' ? 'text-amber-400' : 'text-cyan-400'}`}>
                    {systemState}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-4 flex-1 overflow-hidden flex flex-col">
                <p className="text-[9px] text-slate-600 uppercase mb-2 font-bold flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Convergence Log
                </p>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar text-[10px] space-y-1 text-slate-400">
                  {data.slice(0, 10).map((point, idx) => (
                    <p key={idx} className="flex justify-between">
                      <span className="text-slate-600">[{String(point.n).padStart(3, '0')}]</span>
                      <span>x = {point.x.toFixed(8)}</span>
                    </p>
                  ))}
                  {data.length > 10 && <p className="text-slate-600 text-center py-1">...</p>}
                  <p className="flex justify-between border-t border-slate-800/50 pt-1">
                    <span className="text-slate-600">[{String(data[data.length-1].n).padStart(3, '0')}]</span>
                    <span>x = {data[data.length-1].x.toFixed(8)}</span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-auto border-t border-slate-800 pt-4">
             <div className="flex items-center justify-between text-[10px]">
               <div className="flex gap-2">
                 <button onClick={() => { setMu(3.7); setX0(0.5); setIterations(128); }} className="text-slate-500 hover:text-cyan-400 transition-colors uppercase font-bold text-[9px] border border-slate-800 px-2 py-1 rounded bg-[#161b22]">RESET_CORE</button>
               </div>
               <div className="flex gap-2 items-center text-emerald-500/80 font-bold">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 SOLVER: OK
               </div>
             </div>
          </footer>
        </aside>

        {/* Content Area */}
        <section className="flex-1 bg-[#0c0e14] flex flex-col p-6 gap-6 overflow-hidden">
          <div className="grid grid-rows-12 gap-6 h-full">
            {/* Cobweb Chart */}
            <div className="row-span-8 bg-[#161b22] border border-slate-800 rounded relative overflow-hidden flex flex-col p-4">
              <div className="absolute top-4 left-6 z-10 flex gap-4 pointer-events-none">
                <span className="text-[10px] bg-black/70 px-2 py-1 rounded text-cyan-400 border border-cyan-500/30 backdrop-blur-sm font-bold uppercase tracking-tight">ANALYSIS: COBWEB_DIAGRAM</span>
                <span className="text-[10px] bg-black/70 px-2 py-1 rounded text-slate-500 border border-slate-800 backdrop-blur-sm font-bold uppercase tracking-tight">RANGE: [0.0, 1.0]</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <XAxis type="number" dataKey="x" domain={[0, 1]} hide />
                    <YAxis type="number" dataKey="y" domain={[0, 1]} hide />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    
                    {/* f(x) = mu * x * (1 - x) */}
                    <Scatter 
                      name="LogitMap" 
                      data={cobwebData.curve} 
                      fill="none" 
                      line={{ stroke: '#f43f5e', strokeWidth: 1.5, opacity: 0.8 }}
                    />
                    
                    {/* y = x Reference */}
                    <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#334155" strokeWidth={1} strokeDasharray="4 4" />
                    
                    {/* The Cobweb Trajectory */}
                    <Scatter 
                      name="Trajetória" 
                      data={cobwebData.points} 
                      fill="none" 
                      line={{ stroke: '#22d3ee', strokeWidth: 1 }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center px-4 pt-2 border-t border-slate-800/50">
                <div className="flex gap-6 text-[9px] uppercase font-bold text-slate-500">
                  <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-[#f43f5e]"></div> f(x)</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-[#334155] dashed border-t border-dashed"></div> y=x</div>
                  <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-[#22d3ee]"></div> Orbit</div>
                </div>
                <div className="text-[8px] text-slate-700 italic">TRANSFORM: ITERATIVE_MAPPING</div>
              </div>
            </div>

            {/* Time Series */}
            <div className="row-span-4 grid grid-cols-2 gap-6 min-h-0">
              <div className="bg-[#161b22] border border-slate-800 rounded relative p-4 flex flex-col">
                <span className="text-[9px] text-slate-500 absolute top-2 left-3 font-bold uppercase tracking-tighter">SIGNAL: TIME_SERIES x[n]</span>
                <div className="flex-1 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 10, right: 0, left: -40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="n" hide />
                      <YAxis domain={[0, 1]} hide />
                      <Line 
                        type="monotone" 
                        dataKey="x" 
                        stroke="#22d3ee" 
                        strokeWidth={1.5} 
                        dot={false}
                        animationDuration={150}
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-[#161b22] border border-slate-800 rounded relative p-4 flex flex-col">
                <span className="text-[9px] text-slate-500 absolute top-2 left-3 font-bold uppercase tracking-tighter">PHASE: ITERATION_STATE</span>
                <div className="flex-1 flex flex-col justify-center items-center gap-2 pt-4">
                   <div className="grid grid-cols-3 gap-8 w-full px-6">
                      <div className="text-center">
                        <p className="text-[8px] text-slate-600 uppercase">Avg Val</p>
                        <p className="text-xs text-slate-300">{(data.reduce((acc, curr) => acc + curr.x, 0) / data.length).toFixed(3)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[8px] text-slate-600 uppercase">Variance</p>
                        <p className="text-xs text-slate-300">{(data.reduce((acc, curr) => acc + (curr.x - (data.reduce((a,c)=>a+c.x,0)/data.length))**2, 0) / data.length).toFixed(4)}</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[8px] text-slate-600 uppercase">Density</p>
                         <p className="text-xs text-emerald-400">High</p>
                      </div>
                   </div>
                   <div className="w-full h-1 bg-slate-800/50 rounded-full mt-4 overflow-hidden mx-6">
                      <motion.div 
                        animate={{ width: `${mu * 25}%` }}
                        className="h-full bg-cyan-500/50"
                      />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Ticker / Footer */}
      <footer className="h-6 bg-[#161b22] border-t border-slate-800 px-6 flex justify-between items-center shrink-0">
        <div className="flex gap-4 text-[9px] text-slate-600 font-bold uppercase">
          <span>LATENCY: 4ms</span>
          <span>SYSTEM_CLOCK: 1.4GHz</span>
          <span>GPU_CACHE: ENABLED</span>
        </div>
        <div className="text-[9px] text-slate-500 uppercase tracking-widest italic">
          Deterministic Chaos Analysis Engine // build_id: 0x9AF2
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}
