/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Fragment } from "react";
import { BatchSummary, Student } from "../types";
import { ChevronDown, ChevronUp, Copy, Check, Users, ShieldAlert, BadgeCheck, FileWarning, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BatchBreakdownTableProps {
  summaries: BatchSummary[];
  onSelectStudent: (student: Student) => void;
}

export function BatchBreakdownTable({ summaries, onSelectStudent }: BatchBreakdownTableProps) {
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [copiedBatch, setCopiedBatch] = useState<string | null>(null);
  const [detailFilter, setDetailFilter] = useState<'skippers' | 'classPresent' | 'classAbsent' | 'crtPresent' | 'crtAbsent'>('skippers');
  const [innerSearch, setInnerSearch] = useState("");

  const toggleExpand = (batchName: string) => {
    if (expandedBatch === batchName) {
      setExpandedBatch(null);
    } else {
      setExpandedBatch(batchName);
      setDetailFilter('skippers'); // default tab
      setInnerSearch("");
    }
  };

  const copySkippersList = (batch: BatchSummary) => {
    const skipperText = batch.skippers.map(s => `${s.id} - ${s.name}`).join("\n");
    navigator.clipboard.writeText(skipperText);
    setCopiedBatch(batch.batchName);
    setTimeout(() => setCopiedBatch(null), 2000);
  };

  const getFilteredStudentsForBatch = (batch: BatchSummary): Student[] => {
    // Get all students of this batch
    // To extract batch students from the summary, we know each summary has skippers as concrete Student list, 
    // but the parent might pass the full students down. Wait! In BatchSummary we have skippers.
    // Let's ensure that we have a general list or can filter by status,
    // Wait, to keep it highly responsive, let's look at the target lists.
    // If the selection is 'skippers', we return batch.skippers.
    // Wait! Let's allow filtering from batch.skippers first, as they are the primary skippers.
    // If we want coordinates of others, we can filter them by category, but wait:
    // To make sure all lists are fully searchable and populated, let's support search query inside.
    let baseList = batch.skippers;
    if (innerSearch.trim()) {
      baseList = baseList.filter(s => 
        s.name.toLowerCase().includes(innerSearch.toLowerCase()) || 
        s.id.toLowerCase().includes(innerSearch.toLowerCase())
      );
    }
    return baseList;
  };

  const grandTotals = summaries.reduce((acc, current) => {
    return {
      total: acc.total + current.totalApplicants,
      classP: acc.classP + current.classPresent,
      classA: acc.classA + current.classAbsent,
      crtP: acc.crtP + current.crtPresent,
      crtA: acc.crtA + current.crtAbsent,
      skippers: acc.skippers + current.skippersCount
    };
  }, { total: 0, classP: 0, classA: 0, crtP: 0, crtA: 0, skippers: 0 });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="batch-breakdown-section">
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Batch-Wise Performance Analytics
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Comparing regular classroom attendance against placements (CRT list) to drill down into absenteeism.
          </p>
        </div>
        <div className="bg-indigo-50/60 rounded-lg px-3 py-1.5 border border-indigo-100 flex items-center gap-2 text-xs font-semibold text-indigo-800 self-start sm:self-auto shadow-xs">
          <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
          Click any batch row to reveal individual student charts
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-4 pl-6 pr-4 font-sans text-slate-500">Batch Name</th>
              <th className="py-4 px-4 text-center text-slate-500">Total Applied</th>
              <th className="py-4 px-4 text-center bg-indigo-50/30 text-indigo-800 border-x border-slate-200/50">Class Present</th>
              <th className="py-4 px-4 text-center text-slate-500 border-r border-slate-200/50">Class Absent</th>
              <th className="py-4 px-4 text-center bg-teal-50/30 text-teal-800 border-r border-slate-200/50">CRT Present</th>
              <th className="py-4 px-4 text-center text-slate-500 border-r border-slate-200/50">CRT Absent</th>
              <th className="py-4 px-4 text-center text-rose-600 bg-rose-50/50 font-bold">Skippers</th>
              <th className="py-4 pr-6 pl-4 text-right text-slate-500">Drill Down</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {summaries.map((summary) => {
              const isExpanded = expandedBatch === summary.batchName;
              const classAbsentPercent = summary.totalApplicants > 0 ? (summary.classAbsent / summary.totalApplicants) * 100 : 0;
              const skipperPercent = summary.totalApplicants > 0 ? (summary.skippersCount / summary.totalApplicants) * 100 : 0;

              return (
                <Fragment key={summary.batchName}>
                  <tr
                    id={`batch-row-${summary.batchName}`}
                    onClick={() => toggleExpand(summary.batchName)}
                    className={`hover:bg-slate-50/80 cursor-pointer transition-colors border-b border-slate-100 relative ${isExpanded ? 'bg-slate-50/60 font-semibold' : ''}`}
                  >
                    <td className="py-3.5 pl-6 pr-4 font-bold text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="font-sans text-sm font-bold text-slate-700">{summary.batchName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700 font-mono text-sm">
                      {summary.totalApplicants}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-indigo-600 font-bold bg-indigo-50/10 text-sm border-x border-slate-100">
                      {summary.classPresent}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-sm border-r border-slate-100">
                      {summary.classAbsent}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-teal-600 font-bold bg-teal-50/10 text-sm border-r border-slate-100">
                      {summary.crtPresent}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 text-sm border-r border-slate-100">
                      {summary.crtAbsent}
                    </td>
                    <td className="py-3.5 px-4 text-center bg-rose-50/10 border-r border-slate-100">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${summary.skippersCount > 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-450'}`}>
                          {summary.skippersCount}
                        </span>
                        {summary.skippersCount > 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold">({Math.round(skipperPercent)}%)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 pr-6 pl-4 text-right">
                      <button className="p-1 px-2 hover:bg-slate-250/65 rounded text-slate-450 hover:text-slate-700 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Accordion Rows */}
                  <tr key={`expanded-${summary.batchName}`} className="border-none">
                    <td colSpan={8} className="p-0 border-none">
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="bg-gray-50/60 border-y border-gray-200/50 px-6 py-5 overflow-hidden"
                          >
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                              {/* Left column: Micro analytics cards */}
                              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs">
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Attendance Ratio Comparison</h4>
                                  
                                  {/* Classroom Ratios */}
                                  <div className="space-y-3">
                                    <div>
                                      <div className="flex justify-between text-xs text-gray-700 font-semibold mb-1">
                                        <span>Regular Classroom Present</span>
                                        <span className="font-mono">{summary.classPresent} / {summary.classPresent + summary.classAbsent} ({(summary.classPresent + summary.classAbsent) > 0 ? Math.round((summary.classPresent / (summary.classPresent + summary.classAbsent)) * 100) : 0}%)</span>
                                      </div>
                                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(summary.classPresent + summary.classAbsent) > 0 ? (summary.classPresent / (summary.classPresent + summary.classAbsent)) * 100 : 0}%` }} />
                                      </div>
                                    </div>

                                    {/* CRT Placement Attendance */}
                                    <div>
                                      <div className="flex justify-between text-xs text-gray-700 font-semibold mb-1">
                                        <span>CRT Placement Present</span>
                                        <span className="font-mono">{summary.crtPresent} / {summary.totalApplicants} ({summary.totalApplicants > 0 ? Math.round((summary.crtPresent / summary.totalApplicants) * 100) : 0}%)</span>
                                      </div>
                                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${summary.totalApplicants > 0 ? (summary.crtPresent / summary.totalApplicants) * 100 : 0}%` }} />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="p-4 bg-amber-50/60 border border-amber-200/60 rounded-xl relative overflow-hidden flex flex-col justify-center">
                                  <div className="absolute right-3 bottom-1 text-amber-500/10 pointer-events-none">
                                    <FileWarning className="w-20 h-20" />
                                  </div>
                                  <h4 className="text-amber-800 font-semibold text-sm flex items-center gap-1.5 mb-1">
                                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                                    Skipper Level Critical Risk
                                  </h4>
                                  <p className="text-xs text-amber-700 leading-relaxed max-w-sm">
                                    These <strong>{summary.skippersCount}</strong> students are registered CRT applicants who did not attend their placement-critical training session.
                                  </p>
                                  {summary.skippersCount > 0 && (
                                    <div className="mt-3 flex gap-2">
                                      <button
                                        id={`copy-skippers-btn-${summary.batchName}`}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          copySkippersList(summary);
                                        }}
                                        className="inline-flex items-center gap-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs px-2.5 py-1 rounded-lg font-medium transition-all"
                                      >
                                        {copiedBatch === summary.batchName ? (
                                          <>
                                            <Check className="w-3.5 h-3.5 text-green-600" /> Copied!
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" /> Copy Skippers
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right column: Students sub-table */}
                              <div className="lg:col-span-7 bg-white rounded-xl border border-gray-200 shadow-xs flex flex-col overflow-hidden">
                                <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between gap-3">
                                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Skippers List ({summary.skippersCount})
                                  </span>
                                  <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                      id={`inner-search-${summary.batchName}`}
                                      type="text"
                                      placeholder="Search skippers..."
                                      value={innerSearch}
                                      onChange={(e) => setInnerSearch(e.target.value)}
                                      className="pl-8 pr-2.5 py-1 rounded-lg border border-gray-200 bg-white text-xs outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 w-36 sm:w-48"
                                    />
                                  </div>
                                </div>

                                <div className="max-h-48 overflow-y-auto">
                                  {getFilteredStudentsForBatch(summary).length === 0 ? (
                                    <div className="py-10 text-center text-xs text-gray-400">
                                      {innerSearch ? "No match found" : "No skippers in this batch! 🎉"}
                                    </div>
                                  ) : (
                                    <table className="w-full text-xs text-left">
                                      <thead>
                                        <tr className="bg-gray-100/40 text-gray-500 border-b border-gray-100 font-semibold uppercase">
                                          <th className="py-2.5 pl-4 pr-2">Student ID</th>
                                          <th className="py-2.5 px-2">Student Name</th>
                                          <th className="py-2.5 px-2 text-center">Class Status</th>
                                          <th className="py-2.5 pr-4 pl-2 text-center">CRT Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-50">
                                        {getFilteredStudentsForBatch(summary).map((student, idx) => (
                                          <tr key={`${student.id}-${idx}`} className="hover:bg-amber-50/10">
                                            <td className="py-2.5 pl-4 pr-2 font-mono font-medium text-amber-700">{student.id}</td>
                                            <td className="py-2.5 px-2 font-medium text-gray-800">{student.name}</td>
                                            <td className="py-2.5 px-2 text-center">
                                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                Present
                                              </span>
                                            </td>
                                            <td className="py-2.5 pr-4 pl-2 text-center">
                                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                                                Absent
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
            
            {/* Grand Total Row */}
            <tr className="bg-slate-900 text-white font-bold border-t border-slate-800">
              <td className="py-4 pl-6 pr-4 uppercase text-xs tracking-wider text-slate-300 font-semibold">Global Total</td>
              <td className="py-4 px-4 text-center font-mono text-white text-base">{grandTotals.total}</td>
              <td className="py-4 px-4 text-center font-mono text-indigo-300 bg-slate-850/40 text-base">{grandTotals.classP}</td>
              <td className="py-4 px-4 text-center font-mono text-slate-400 bg-slate-850/20 text-base">{grandTotals.classA}</td>
              <td className="py-4 px-4 text-center font-mono text-teal-300 bg-slate-850/40 text-base">{grandTotals.crtP}</td>
              <td className="py-4 px-4 text-center font-mono text-slate-400 bg-slate-850/20 text-base">{grandTotals.crtA}</td>
              <td className="py-4 px-4 text-center bg-slate-850/30">
                <span className="bg-rose-500/20 border border-rose-500/30 px-3 py-1 rounded text-xs font-bold text-rose-300 font-mono">
                  {grandTotals.skippers}
                </span>
              </td>
              <td className="py-4 pr-6 pl-4 text-right pr-6" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
