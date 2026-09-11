import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function ThemeSelector({ variant = 'dropdown' }) {
  const { theme, currentThemeId, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'pills') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {availableThemes.map((t) => {
          const isSelected = currentThemeId === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'border-indigo-500/60 bg-white/95 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200/80 bg-white/60 hover:bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`w-5 h-5 rounded-full bg-gradient-to-tr ${t.previewGradient} shadow-sm border border-white/80 flex items-center justify-center`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-slate-900 stroke-[3]" />}
                  </div>
                  <span className="text-xs font-bold text-slate-800">{t.name}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">{t.subtitle}</p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full glass-ltx-track border border-white/90 bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-xs font-semibold transition-all shadow-xs group cursor-pointer"
        title="Change Webpage Color Palette"
      >
        <div
          className={`w-3.5 h-3.5 rounded-full bg-gradient-to-tr ${theme.previewGradient} shadow-xs border border-white/80`}
        />
        <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors" />
        <span className="hidden md:inline">{theme.name}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 mb-1.5 border-b border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>Theme Accent</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">6 Colors</span>
          </div>

          <div className="space-y-1">
            {availableThemes.map((t) => {
              const isSelected = currentThemeId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white font-bold shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-4 h-4 rounded-full bg-gradient-to-tr ${t.previewGradient} shadow-xs border border-white/60 flex items-center justify-center shrink-0`}
                    />
                    <div className="text-left">
                      <div className="leading-none">{t.name}</div>
                      <div className={`text-[9px] mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{t.subtitle.split('&')[0]}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
