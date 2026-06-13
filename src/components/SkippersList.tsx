/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { Student } from "../types";
import { Search, Filter, Copy, Check, MessageSquare, Code, ListCheck, Sparkles, Send, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SkippersListProps {
  students: Student[];
}

export function SkippersList({ students }: SkippersListProps) {
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [activeCommStudent, setActiveCommStudent] = useState<Student | null>(null);
  
  // Custom draft builder states
  const [commChannel, setCommChannel] = useState<'email' | 'chat'>('email');
  const [subjectText, setSubjectText] = useState("URGENT: Placement Training Support Attendance Query");
  const [customMsg, setCustomMsg] = useState(
    "Our placement team recorded that you attended your regular academic classroom session earlier today, but you were marked absent from your critical placement-related CRT Drive session. Missing these sessions significantly affects mock feedback metrics and final placements eligibility. Let the coordinator know the reason immediately."
  );

  // Extract unique batch names for filter
  const batchesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach(s => {
      if (s.isSkipper) set.add(s.batch);
    });
    return ["ALL", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [students]);

  // Filter actual skippers list
  const skippersFiltered = useMemo(() => {
    return students.filter(s => {
      if (!s.isSkipper) return false;
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
      const matchesBatch = selectedBatch === "ALL" || s.batch === selectedBatch;
      return matchesSearch && matchesBatch;
    });
  }, [students, search, selectedBatch]);

  // Export functions
  const copyAsMarkdown = () => {
    let header = "| ID - Student Name | Batch Details | Classroom Status | CRT Status |\n";
    header += "| :--- | :---: | :---: | :---: |\n";
    const body = skippersFiltered.map(s => 
      `| ${s.fullName} | ${s.batch} | ${s.classroomStatus} | ${s.crtStatus} |`
    ).join("\n");
    
    navigator.clipboard.writeText(header + body);
    setCopiedFormat("markdown");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const copyAsCommaList = () => {
    const list = skippersFiltered.map(s => s.fullName).join(", ");
    navigator.clipboard.writeText(list);
    setCopiedFormat("comma");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const copyAsIDsList = () => {
    const list = skippersFiltered.map(s => s.id).join(", ");
    navigator.clipboard.writeText(list);
    setCopiedFormat("ids");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Draft dynamic communication structure
  const dynamicDraft = useMemo(() => {
    if (!activeCommStudent) return "";
    
    if (commChannel === 'email') {
      return `To: student.${activeCommStudent.id.toLowerCase()}@college.edu\nSubject: ${subjectText}\n\nDear ${activeCommStudent.name},\n\nWe are writing to notify you that a check of today's attendance logs has raised an alert:\n\n- Regular Classroom Session: PRESENT\n- Placement Training (CRT) Session: ABSENT\n\n${customMsg}\n\nBest regards,\nPlacement Coordination Office`;
    } else {
      return `[WhatsApp / Chat Notification to ${activeCommStudent.name} (${activeCommStudent.id}) - Batch ${activeCommStudent.batch}]\n\n⚠️ URGENT NOTICE:\nHello ${activeCommStudent.name}, our system detected that you attended your main academic classroom today but skipped the CRT Placement Session. This is a critical training breach. Details: ${customMsg.substring(0, 150)}... Please contact your batch coordinator right away!`;
    }
  }, [activeCommStudent, commChannel, subjectText, customMsg]);

  const copyDraftContent = () => {
    navigator.clipboard.writeText(dynamicDraft);
    setCopiedFormat("draft");
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="skippers-list-explorer">
      {/* Search & Left Table Panels (Span 2) */}
      <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col h-[580px]">
        {/* Row 1: Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h3 className="font-sans font-bold text-slate-900 text-base flex items-center gap-2">
              <span className="p-1 px-2.5 rounded bg-rose-50 text-rose-700 text-xs font-mono border border-rose-200/60">
                {skippersFiltered.length}
              </span>
              Skippers Master Roster
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete cross-matched register of academic applicants skipped from training.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-copy-markdown"
              onClick={copyAsMarkdown}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200/80 transition-all font-medium cursor-pointer"
              title="Copy as Markdown table"
            >
              {copiedFormat === "markdown" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" /> Copied Markdown
                </>
              ) : (
                <>
                  <Code className="w-3.5 h-3.5" /> Markdown
                </>
              )}
            </button>
            <button
              id="btn-copy-comma"
              onClick={copyAsCommaList}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200/80 transition-all font-medium cursor-pointer"
              title="Copy list of all names"
            >
              {copiedFormat === "comma" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" /> Copied Names
                </>
              ) : (
                <>
                  <ListCheck className="w-3.5 h-3.5" /> Names List
                </>
              )}
            </button>
            <button
              id="btn-copy-ids"
              onClick={copyAsIDsList}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200/80 transition-all font-medium cursor-pointer"
              title="Copy comma separated Student IDs"
            >
              {copiedFormat === "ids" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-600" /> Copied IDs
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy IDs
                </>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-skippers-input"
              type="text"
              placeholder="Search by ID, name or surname..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>

          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              id="batch-filter-dropdown"
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-sm outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-medium text-slate-700 appearance-none"
            >
              {batchesList.map(b => (
                <option key={b} value={b}>
                  {b === "ALL" ? "All Batches" : `Batch ${b}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Scroller list */}
        <div className="grow overflow-y-auto border border-slate-200 rounded-lg">
          {skippersFiltered.length === 0 ? (
            <div className="py-24 text-center flex flex-col items-center justify-center p-6">
              <Users className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-slate-500 font-medium text-sm">No matched skippers found.</p>
              <p className="text-xs text-slate-400 mt-1">Try modifying your query or selecting another batch folder.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-3 px-4 font-sans text-slate-500">Student ID</th>
                  <th className="py-3 px-4 text-slate-500">Student Name</th>
                  <th className="py-3 px-3 text-center text-slate-500">Batch</th>
                  <th className="py-3 px-3 text-center text-slate-500">Class Status</th>
                  <th className="py-3 px-3 text-center text-slate-500">CRT Status</th>
                  <th className="py-3 pr-4 pl-2 text-right text-slate-500">Draft Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {skippersFiltered.map((s, idx) => {
                  const isActive = activeCommStudent?.id === s.id;
                  return (
                    <tr
                      id={`skipper-row-${s.id}`}
                      key={`${s.id}-${idx}`}
                      onClick={() => setActiveCommStudent(s)}
                      className={`hover:bg-slate-50/80 active:bg-slate-100/10 cursor-pointer transition-all duration-150 ${isActive ? 'bg-[#fff1f2]/40 font-semibold border-l-4 border-rose-500' : ''}`}
                    >
                      <td className="py-2.5 px-4 font-mono font-bold text-rose-700">{s.id}</td>
                      <td className="py-2.5 px-4 text-slate-700 font-medium">{s.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-600 bg-slate-50/50 text-xs">
                        {s.batch}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                          Present
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100/80">
                          Absent
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 pl-2 text-right">
                        <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded transition-colors border border-rose-100">
                          <MessageSquare className="w-3 h-3" /> Communication
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Draft Communication Planner (Column 1) */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl border border-indigo-800 shadow-md p-6 flex flex-col h-[580px] justify-between relative overflow-hidden">
        {/* Ambient grid vector overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-400/20 text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-base leading-none">Smart Message Architect</h4>
              <span className="text-[11px] text-indigo-300 font-medium">Build customized notifications instantly</span>
            </div>
          </div>

          {!activeCommStudent ? (
            <div className="py-16 text-center text-indigo-200/60 grow flex flex-col items-center justify-center border border-indigo-800/60 rounded-xl bg-indigo-950/40 px-4">
              <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No student selected</p>
              <p className="text-xs mt-1 leading-relaxed">
                Click any student row in the directory list to draft live personalized alerts, emails, or warning letters.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Student Banner */}
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-sm leading-tight text-white">{activeCommStudent.name}</h5>
                  <span className="text-xs text-indigo-300 font-mono">{activeCommStudent.id} • Batch {activeCommStudent.batch}</span>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Skipper
                </span>
              </div>

              {/* Channel Selector */}
              <div className="flex bg-indigo-950/60 p-1.5 rounded-xl border border-indigo-800/60 text-xs">
                <button
                  id="tab-channel-email"
                  onClick={() => setCommChannel('email')}
                  className={`grow py-1.5 rounded-lg text-center font-semibold transition-all ${commChannel === 'email' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-300 hover:text-white'}`}
                >
                  Official Email Draft
                </button>
                <button
                  id="tab-channel-chat"
                  onClick={() => setCommChannel('chat')}
                  className={`grow py-1.5 rounded-lg text-center font-semibold transition-all ${commChannel === 'chat' ? 'bg-indigo-600 text-white shadow-xs' : 'text-indigo-300 hover:text-white'}`}
                >
                  Quick Messenger (SMS/WA)
                </button>
              </div>

              {/* Message Controls */}
              {commChannel === 'email' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Email Subject</label>
                  <input
                    id="email-subject-input"
                    type="text"
                    value={subjectText}
                    onChange={(e) => setSubjectText(e.target.value)}
                    className="w-full bg-indigo-950/40 border border-indigo-800/80 rounded-xl p-2.5 text-xs text-white outline-hidden focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Warning Premise / Message Block</label>
                <textarea
                  id="warning-premise-textarea"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  rows={4}
                  className="w-full bg-indigo-950/40 border border-indigo-800/80 rounded-xl p-2.5 text-xs text-white outline-hidden focus:border-indigo-500 transition-all font-medium resize-none leading-relaxed"
                />
              </div>
            </div>
          )}
        </div>

        {activeCommStudent && (
          <div className="pt-4 border-t border-indigo-800/60 mt-4">
            <h5 className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2">Compiled Draft Preview</h5>
            <div className="p-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl max-h-36 overflow-y-auto text-indigo-100 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
              {dynamicDraft}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                id="btn-copy-draft"
                onClick={copyDraftContent}
                className="grow inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl px-4 py-2.5 text-xs font-bold font-sans transition-all active:scale-[0.98] border border-indigo-500"
              >
                {copiedFormat === "draft" ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" /> Copied Draft
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy Draft
                  </>
                )}
              </button>
              
              <a
                id="mailto-trigger-link"
                href={`mailto:student.${activeCommStudent.id.toLowerCase()}@college.edu?subject=${encodeURIComponent(subjectText)}&body=${encodeURIComponent(dynamicDraft.replace(/^To: .*\nSubject: .*\n\n/, ''))}`}
                className="p-2.5 bg-indigo-850 hover:bg-indigo-750 border border-indigo-800 rounded-xl text-indigo-300 hover:text-white transition-all text-xs"
                title="Launch Local Mail Client"
              >
                <Send className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
