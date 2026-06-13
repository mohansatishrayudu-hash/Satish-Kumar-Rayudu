/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, ChangeEvent } from "react";
import { Upload, FileSpreadsheet, Settings, AlertTriangle, BadgeCheck, RotateCcw, Play, Download, X, Trash2 } from "lucide-react";
import { ColumnMapping } from "../types";
import { parseCSV } from "../data";

interface DataImporterProps {
  onDataImported: (data: {
    crtContent: string | null;
    classContent: string | null;
    mappings: ColumnMapping;
  }) => void;
  onReset: () => void;
  onClearAllData?: () => void;
  isUsingDefault: boolean;
}

export function DataImporter({ onDataImported, onReset, onClearAllData, isUsingDefault }: DataImporterProps) {
  const [crtFile, setCrtFile] = useState<{ name: string; content: string } | null>(null);
  const [classFile, setClassFile] = useState<{ name: string; content: string } | null>(null);
  
  const [crtHeaders, setCrtHeaders] = useState<string[]>([]);
  const [classHeaders, setClassHeaders] = useState<string[]>([]);

  const [mappings, setMappings] = useState<ColumnMapping>({
    crtStudentCol: "",
    crtStatusCol: "",
    crtDateCol: "",
    crtBatchCol: "",
    crtCompanyCol: "",
    classStudentCol: "",
    classDateCol: "",
    classBatchCol: "",
    classStatusCol: ""
  });

  const [error, setError] = useState<string | null>(null);

  // Download Sample CSV templates matching user's exact models
  const downloadSampleCRT = () => {
    const headers = ["Name", "Company Name", "Attendance Status", "Date", "Batch"];
    const rows = [
      ["I25A1001 - Konduri Vishesh", "Wipro", "Present", "12/06/2026", "M1"],
      ["I25A1015 - Pathipati Tejas Vardhan", "Wipro", "Absent", "12/06/2026", "M1"],
      ["I25A1021 - Vakati Ashraf Ali", "NxtWave Tech Academy", "Present", "12/06/2026", "M1"],
      ["I25A1030 - Jayaramya Akkala", "Apex Global Training", "Present", "12/06/2026", "M1"],
      ["I25A1059 - Ellimilli Meghana", "Wipro", "Absent", "12/06/2026", "M1"],
      ["I25A1061 - Rayudu Nikhitha", "Sovereign Eng Corp", "Present", "12/06/2026", "M1"]
    ];
    const csvContent = [headers.join(","), ...rows.map(r => r.map(x => `"${x}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "crt_attendance_example.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSampleClassroom = () => {
    const headers = ["Name", "Date", "Batch", "Attendance Status"];
    const rows = [
      ["I25A1001 - Konduri Vishesh", "12/06/2026", "M1", "Present"],
      ["I25A1015 - Pathipati Tejas Vardhan", "12/06/2026", "M1", "Present"],
      ["I25A1021 - Vakati Ashraf Ali", "12/06/2026", "M1", "Present"],
      ["I25A1030 - Jayaramya Akkala", "12/06/2026", "M1", "Present"],
      ["I25A1059 - Ellimilli Meghana", "12/06/2026", "M1", "Present"],
      ["I25A1061 - Rayudu Nikhitha", "12/06/2026", "M1", "Present"]
    ];
    const csvContent = [headers.join(","), ...rows.map(r => r.map(x => `"${x}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "classroom_attendance_example.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to deduce optimal columns intelligently
  const findBestHeaderMatch = (headers: string[], patterns: RegExp[]): string => {
    for (const pattern of patterns) {
      const match = headers.find(h => pattern.test(h.toLowerCase()));
      if (match) return match;
    }
    return headers[0] || "";
  };

  const handleCrtUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCrtFile({ name: file.name, content: text });
      
      const rows = parseCSV(text);
      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        setCrtHeaders(headers);
        
        // Auto map columns
        const student = findBestHeaderMatch(headers, [/student\s*name/i, /id\s*-\s*student/i, /^name$/i, /name/i, /id/i]);
        const status = findBestHeaderMatch(headers, [/attendance\s*status/i, /status/i, /attendance/i, /crt/i]);
        const date = findBestHeaderMatch(headers, [/date/i, /day/i]);
        const batch = findBestHeaderMatch(headers, [/batch\s*details/i, /batch/i, /section/i, /class/i]);
        const company = findBestHeaderMatch(headers, [/company\s*name/i, /company/i, /firm/i]);
        
        setMappings(prev => ({
          ...prev,
          crtStudentCol: student,
          crtStatusCol: status,
          crtDateCol: date,
          crtBatchCol: batch,
          crtCompanyCol: company
        }));
        setError(null);
      } else {
        setError("The CRT attendance file appears empty or unparseable. Please upload a structured CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const handleClassroomUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setClassFile({ name: file.name, content: text });

      const rows = parseCSV(text);
      if (rows.length > 0) {
        const headers = Object.keys(rows[0]);
        setClassHeaders(headers);

        // Auto map columns
        const student = findBestHeaderMatch(headers, [/student\s*name/i, /id\s*-\s*student/i, /^name$/i, /name/i, /id/i]);
        const date = findBestHeaderMatch(headers, [/date/i, /day/i]);
        const batch = findBestHeaderMatch(headers, [/batch\s*details/i, /batch/i, /section/i, /class/i]);
        const status = findBestHeaderMatch(headers, [/attendance\s*status/i, /classroom\s*attendance/i, /status/i, /attendance/i]);

        setMappings(prev => ({
          ...prev,
          classStudentCol: student,
          classDateCol: date,
          classBatchCol: batch,
          classStatusCol: status
        }));
        setError(null);
      } else {
        setError("The Classroom attendance file appears empty or unparseable. Please upload a structured CSV file.");
      }
    };
    reader.readAsText(file);
  };

  const executeMergeAndAnalyze = () => {
    if (!crtFile && !classFile) {
      setError("Please upload at least one file (either Classroom Logs or CRT Registry) to update attendance.");
      return;
    }

    onDataImported({
      crtContent: crtFile?.content || null,
      classContent: classFile?.content || null,
      mappings
    });
    setError(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6" id="dashboard-custom-importer">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-200 gap-4 mb-6">
        <div>
          <h3 className="font-sans font-bold text-slate-900 text-base flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            Flexible Attendance Data Loader
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Upload Classroom data and CRT Placement data as needed. You can upload either or both!
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {onClearAllData && (
            <button
              id="clear-all-dummy-data-btn"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all cached and preloaded dummy datasets? This will clear all mock records and allow you to load your original data from a 100% clean slate.")) {
                  onClearAllData();
                }
              }}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Wipe Demo Data & Start Clean
            </button>
          )}

          {!isUsingDefault && (
            <button
              id="reset-original-data-btn"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Standard Metrics
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-rose-900">Import Violation</h4>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Column 1: CRT Placement Registry */}
        <div className="border border-slate-200 rounded-lg p-5 bg-[#f8fafc]/60 hover:bg-[#f8fafc] transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-bold font-mono border border-indigo-200/50">1</span>
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 leading-none">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-indigo-500" />
                  CRT Placement Registry
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Contains company routing & student training records</p>
              </div>
            </div>
 
            {!crtFile ? (
              <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-white rounded-lg p-5 text-center transition-all cursor-pointer">
                <input
                  id="crt-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleCrtUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-indigo-300 mx-auto mb-2" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-600">Select CRT CSV file</p>
                  <p className="text-[10px] text-slate-400">Supports Name, Company Name, Status, Date, Batch</p>
                </div>
              </div>
            ) : (
              <div className="relative border border-emerald-250 bg-emerald-50/10 rounded-lg p-5 text-center transition-all">
                <button
                  type="button"
                  id="clear-crt-file-btn"
                  onClick={() => {
                    setCrtFile(null);
                    setCrtHeaders([]);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <FileSpreadsheet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1">
                    <BadgeCheck className="w-4 h-4 text-emerald-500" /> Ready: {crtFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Mapped columns: {crtHeaders.length}</p>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-xs px-1">
              <span className="text-[11px] text-slate-400 font-medium">Need sample format?</span>
              <button
                id="download-crt-template-btn"
                onClick={downloadSampleCRT}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer hover:underline bg-transparent border-none p-0"
              >
                <Download className="w-3.5 h-3.5" /> Sample CRT.csv
              </button>
            </div>
          </div>

          {crtFile && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Student Name Col</label>
                <select
                  id="mapping-crt-student-select"
                  value={mappings.crtStudentCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, crtStudentCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {crtHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Attendance Status Col</label>
                <select
                  id="mapping-crt-status-select"
                  value={mappings.crtStatusCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, crtStatusCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {crtHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Date Col</label>
                <select
                  id="mapping-crt-date-select"
                  value={mappings.crtDateCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, crtDateCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {crtHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Batch Col</label>
                <select
                  id="mapping-crt-batch-select"
                  value={mappings.crtBatchCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, crtBatchCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {crtHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Company Name Col</label>
                <select
                  id="mapping-crt-company-select"
                  value={mappings.crtCompanyCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, crtCompanyCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {crtHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Upload Column 2: Classroom Academic Attendance */}
        <div className="border border-slate-200 rounded-lg p-5 bg-[#f8fafc]/60 hover:bg-[#f8fafc] transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold font-mono border border-emerald-250/50">2</span>
              <div>
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5 leading-none">
                  <FileSpreadsheet className="w-4.5 h-4.5 text-teal-600" />
                  Classroom Academic Logs
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Contains master students, their cohorts and attendance status</p>
              </div>
            </div>
 
            {!classFile ? (
              <div className="relative border-2 border-dashed border-slate-200 hover:border-[#10b981] bg-white rounded-lg p-5 text-center transition-all cursor-pointer">
                <input
                  id="class-file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleClassroomUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-600">Select Classroom CSV Logs</p>
                  <p className="text-[10px] text-slate-400">Supports Name, Date, Batch, Status</p>
                </div>
              </div>
            ) : (
              <div className="relative border border-[#10b981] bg-emerald-50/10 rounded-lg p-5 text-center transition-all">
                <button
                  type="button"
                  id="clear-class-file-btn"
                  onClick={() => {
                    setClassFile(null);
                    setClassHeaders([]);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer border border-slate-200"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <FileSpreadsheet className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-teal-700 flex items-center justify-center gap-1">
                    <BadgeCheck className="w-4 h-4 text-emerald-500" /> Ready: {classFile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">Mapped columns: {classHeaders.length}</p>
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between text-xs px-1">
              <span className="text-[11px] text-slate-400 font-medium">Need sample format?</span>
              <button
                id="download-class-template-btn"
                onClick={downloadSampleClassroom}
                className="inline-flex items-center gap-1 text-[11px] text-teal-650 hover:text-teal-800 font-bold cursor-pointer hover:underline bg-transparent border-none p-0"
              >
                <Download className="w-3.5 h-3.5" /> Sample Class.csv
              </button>
            </div>
          </div>

          {classFile && (
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-3 animate-fade-in">
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Student Name Col</label>
                <select
                  id="mapping-class-student-select"
                  value={mappings.classStudentCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, classStudentCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {classHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Date Col</label>
                <select
                  id="mapping-class-date-select"
                  value={mappings.classDateCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, classDateCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {classHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Batch Col</label>
                <select
                  id="mapping-class-batch-select"
                  value={mappings.classBatchCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, classBatchCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {classHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Attendance Status Col</label>
                <select
                  id="mapping-class-status-select"
                  value={mappings.classStatusCol}
                  onChange={(e) => setMappings(prev => ({ ...prev, classStatusCol: e.target.value }))}
                  className="w-full bg-white border border-slate-200 p-1.5 mt-1 rounded-md text-xs font-medium text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  {classHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 flex justify-end">
        <button
          id="execute-crossmatch-btn"
          onClick={executeMergeAndAnalyze}
          disabled={!crtFile && !classFile}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-all ${(!crtFile && !classFile) ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' : 'bg-slate-900 hover:bg-slate-850 text-white active:scale-95 cursor-pointer border border-slate-950'}`}
        >
          <Play className="w-4 h-4 fill-current" />
          Process Uploaded Attendance
        </button>
      </div>
    </div>
  );
}
