/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactComponentElement, ReactNode } from "react";
import { motion } from "motion/react";

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  colorScheme: 'emerald' | 'rose' | 'amber' | 'indigo' | 'blue' | 'teal';
  percentage?: number;
  id: string;
  notice?: ReactNode;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  colorScheme,
  percentage,
  id,
  notice
}: MetricCardProps) {
  const schemes = {
    indigo: {
      bg: "bg-white border-slate-200 shadow-sm",
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
      text: "text-xs font-medium text-slate-500",
      valueText: "text-[#0f172a]",
      progress: "bg-indigo-500",
      glow: "hover:shadow-indigo-50/40",
      subtitleText: "text-slate-500 font-normal"
    },
    blue: {
      bg: "bg-white border-slate-200 shadow-sm",
      iconBg: "bg-blue-50 text-blue-600 border border-blue-100",
      text: "text-xs font-medium text-slate-500",
      valueText: "text-[#0f172a]",
      progress: "bg-blue-500",
      glow: "hover:shadow-blue-50/40",
      subtitleText: "text-slate-500 font-normal"
    },
    teal: {
      bg: "bg-white border-slate-200 shadow-sm",
      iconBg: "bg-teal-50 text-teal-600 border border-teal-100",
      text: "text-xs font-medium text-slate-500",
      valueText: "text-[#0f172a]",
      progress: "bg-teal-500",
      glow: "hover:shadow-teal-50/40",
      subtitleText: "text-slate-500 font-normal"
    },
    rose: {
      bg: "bg-[#fff1f2] border-rose-100 shadow-sm",
      iconBg: "bg-rose-100 text-rose-600",
      text: "text-rose-600 uppercase tracking-wider font-bold mb-1",
      valueText: "text-rose-700",
      progress: "bg-rose-500",
      glow: "hover:shadow-rose-50/40",
      subtitleText: "text-[10px] text-rose-500 mt-2 font-medium"
    },
    emerald: {
      bg: "bg-white border-slate-200 shadow-sm",
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
      text: "text-xs font-medium text-slate-500",
      valueText: "text-[#0f172a]",
      progress: "bg-emerald-500",
      glow: "hover:shadow-emerald-50/40",
      subtitleText: "text-slate-500 font-normal"
    },
    amber: {
      bg: "bg-[#fff1f2] border-rose-100 shadow-sm",
      iconBg: "bg-rose-100 text-rose-600",
      text: "text-rose-600 uppercase tracking-wider font-bold mb-1",
      valueText: "text-rose-700",
      progress: "bg-rose-500",
      glow: "hover:shadow-rose-50/40",
      subtitleText: "text-[10px] text-rose-500 mt-2 font-medium"
    }
  };

  const scheme = schemes[colorScheme] || schemes.indigo;

  const isSpecialRose = colorScheme === 'rose' || colorScheme === 'amber';

  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative overflow-hidden p-5 rounded-xl border transition-shadow duration-300 shadow-sm ${scheme.bg} ${scheme.glow} flex flex-col justify-between`}
    >
      {/* Decorative ambient gradient backdrop */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-100/20 to-transparent pointer-none rounded-full blur-xl" />

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium text-slate-500 ${isSpecialRose ? 'text-rose-600 uppercase tracking-wider font-bold' : ''}`}>
            {title}
          </span>
          <div className={`p-2 rounded-lg ${scheme.iconBg}`}>
            {icon}
          </div>
        </div>

        <div className="flex items-baseline space-x-2">
          <span className={`text-3xl font-sans font-bold tracking-tight ${scheme.valueText}`}>
            {value.toLocaleString()}
          </span>
          {!isSpecialRose && percentage !== undefined && (
            <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100/80">
        <p className={`text-xs ${scheme.subtitleText}`}>
          {subtitle}
        </p>
        
        {notice && (
          <div className="mt-2">
            {notice}
          </div>
        )}
        
        {!isSpecialRose && percentage !== undefined && (
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className={`h-full rounded-full ${scheme.progress}`}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
