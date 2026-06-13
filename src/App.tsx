/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from "react";
import { Student, ColumnMapping } from "./types";
import { generateDefaultFullDataset, calculateMetrics, calculateBatchSummaries, COMPANIES, parseCSV } from "./data";
import { getISTDateString, getDaysAgoIST } from "./utils";
import { MetricCard } from "./components/MetricCard";
import { BatchBreakdownTable } from "./components/BatchBreakdownTable";
import { SkippersList } from "./components/SkippersList";
import { DataImporter } from "./components/DataImporter";
import { 
  Users, 
  UserX, 
  GraduationCap, 
  Layers, 
  HelpCircle, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  CloudHail,
  ExternalLink,
  Sparkles,
  Building2,
  Briefcase,
  Calendar,
  Download,
  FileSpreadsheet,
  Lock
} from "lucide-react";
import { motion } from "motion/react";

import { DateRangePicker } from "./components/DateRangePicker";

export default function App() {
  const [companies, setCompanies] = useState<{ id: string; name: string; industry: string; requiredCompliance: number }[]>(() => {
    const saved = localStorage.getItem("crt_companies");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [startDate, setStartDate] = useState<string>(() => {
    return localStorage.getItem("crt_start_date") || getISTDateString();
  });

  const [endDate, setEndDate] = useState<string>(() => {
    return localStorage.getItem("crt_end_date") || getISTDateString();
  });

  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("crt_selected_company_ids");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState<boolean>(false);

  const selectedCompanyId = useMemo(() => selectedCompanyIds[0] || "", [selectedCompanyIds]);
  const setSelectedCompanyId = (id: string) => {
    setSelectedCompanyIds([id]);
  };

  const [companyDatasets, setCompanyDatasets] = useState<Record<string, Record<string, Student[]>>>(() => {
    const saved = localStorage.getItem("crt_company_datasets");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const [isUsingDefault, setIsUsingDefault] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem("crt_is_using_default");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {};
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'batches' | 'skippers' | 'importer' | 'exporter'>('dashboard');

  // Sync state to localStorage to prevent data loss on hot-rebuild or browser shifts
  useEffect(() => {
    localStorage.setItem("crt_companies", JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem("crt_company_datasets", JSON.stringify(companyDatasets));
  }, [companyDatasets]);

  useEffect(() => {
    localStorage.setItem("crt_is_using_default", JSON.stringify(isUsingDefault));
  }, [isUsingDefault]);

  useEffect(() => {
    localStorage.setItem("crt_selected_company_ids", JSON.stringify(selectedCompanyIds));
  }, [selectedCompanyIds]);

  useEffect(() => {
    localStorage.setItem("crt_start_date", startDate);
  }, [startDate]);

  useEffect(() => {
    localStorage.setItem("crt_end_date", endDate);
  }, [endDate]);

  const getDatesInRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dates: string[] = [];
    const curr = new Date(start);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const getFormattedDateRange = () => {
    const formatDateStr = (str: string) => {
      const [, m, d] = str.split("-");
      const monthLabel = m === "06" ? "Jun" : m === "07" ? "Jul" : m === "08" ? "Aug" : "Sep";
      return `${monthLabel} ${parseInt(d)}, 2026`;
    };
    if (startDate === endDate) {
      return formatDateStr(startDate);
    }
    return `${formatDateStr(startDate)} - ${formatDateStr(endDate)}`;
  };

  const students = useMemo(() => {
    const list: Student[] = [];
    const range = getDatesInRange(startDate, endDate);
    selectedCompanyIds.forEach(id => {
      range.forEach(date => {
        let data = companyDatasets[id]?.[date];
        if (!data) {
          data = [];
        }
        list.push(...data);
      });
    });
    return list.map(student => ({
      ...student,
      isSkipper: student.isCrtApplicant === true && student.classroomStatus === 'Present' && student.crtStatus === 'Absent'
    }));
  }, [companyDatasets, selectedCompanyIds, startDate, endDate]);

  const activeUseDefault = useMemo(() => {
    const range = getDatesInRange(startDate, endDate);
    return selectedCompanyIds.every(id => 
      range.every(date => isUsingDefault[id]?.[date] ?? true)
    );
  }, [isUsingDefault, selectedCompanyIds, startDate, endDate]);

  const allStudentsForRange = useMemo(() => {
    const list: Student[] = [];
    const range = getDatesInRange(startDate, endDate);
    companies.forEach(comp => {
      range.forEach(date => {
        const data = companyDatasets[comp.id]?.[date];
        if (data) {
          list.push(...data);
        }
      });
    });
    return list;
  }, [companyDatasets, companies, startDate, endDate]);

  const globalClassroomMetrics = useMemo(() => {
    let classPresentCount = 0;
    let classAbsentCount = 0;
    allStudentsForRange.forEach(s => {
      if (s.classroomStatus === 'Present') {
        classPresentCount++;
      } else {
        classAbsentCount++;
      }
    });
    return { classPresentCount, classAbsentCount };
  }, [allStudentsForRange]);

  // Compute live statistics and rosters based on active state array
  const metrics = useMemo(() => {
    const baseMetrics = calculateMetrics(students);
    return {
      ...baseMetrics,
      classPresentCount: globalClassroomMetrics.classPresentCount,
      classAbsentCount: globalClassroomMetrics.classAbsentCount
    };
  }, [students, globalClassroomMetrics]);

  const batchSummaries = useMemo(() => {
    const baseSummaries = calculateBatchSummaries(students);
    const globalSummaries = calculateBatchSummaries(allStudentsForRange);
    return baseSummaries.map(bs => {
      const globalBs = globalSummaries.find(g => g.batchName === bs.batchName);
      return {
        ...bs,
        classPresent: globalBs ? globalBs.classPresent : 0,
        classAbsent: globalBs ? globalBs.classAbsent : 0
      };
    });
  }, [students, allStudentsForRange]);

  const handleDataImported = (data: {
    crtContent: string | null;
    classContent: string | null;
    mappings: ColumnMapping;
  }) => {
    const normalizeDateToISO = (dateStr: string): string => {
      if (!dateStr) return "";
      const clean = dateStr.trim();
      
      const dmyMatch = clean.match(/^(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})$/);
      if (dmyMatch) {
        const day = dmyMatch[1].padStart(2, '0');
        const month = dmyMatch[2].padStart(2, '0');
        const year = dmyMatch[3];
        return `${year}-${month}-${day}`;
      }
      
      const ymdMatch = clean.match(/^(\d{4})[/\-](\d{1,2})[/\-](\d{1,2})$/);
      if (ymdMatch) {
        const year = ymdMatch[1];
        const month = ymdMatch[2].padStart(2, '0');
        const day = ymdMatch[3].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      return clean;
    };

    const normalizeKey = (val: string): string => {
      return val.toLowerCase().replace(/[^a-z0-9]/g, "");
    };

    let companiesList = [...companies];
    let datasetsCopy = { ...companyDatasets };
    let usingDefaultCopy = { ...isUsingDefault };
    let lastActiveCompanyId = selectedCompanyId;

    // Build registry mapping studentFullName -> companyName
    const studentToCompany: Record<string, string> = {};

    // 1. Pre-populate mapping from existing (already loaded) datasets
    for (const cId of Object.keys(datasetsCopy)) {
      const companyObj = companiesList.find(c => c.id === cId);
      if (companyObj) {
        for (const dateStr of Object.keys(datasetsCopy[cId] || {})) {
          (datasetsCopy[cId][dateStr] || []).forEach(s => {
            studentToCompany[normalizeKey(s.fullName)] = companyObj.name;
          });
        }
      }
    }

    // 2. Add mapping from newly uploaded CRT logs (which is the source of truth for student corporate routing)
    if (data.crtContent) {
      const crtRows = parseCSV(data.crtContent);
      crtRows.forEach((row) => {
        const rawStudent = row[data.mappings.crtStudentCol] || "";
        const rawCompany = row[data.mappings.crtCompanyCol] || "";
        if (rawStudent && rawCompany) {
          studentToCompany[normalizeKey(rawStudent)] = rawCompany.trim();
        }
      });
    }

    // Build a fallback company name if some students in the Classroom logs do not match any CRT mapped student:
    // We prioritize using any company from studentToCompany first, then existing companies, and finally fallback to "Unassigned"
    let fallbackCompanyName = "";
    const studentToCompanyValues = Object.values(studentToCompany);
    if (studentToCompanyValues.length > 0) {
      fallbackCompanyName = studentToCompanyValues[0];
    } else if (companiesList.length > 0) {
      fallbackCompanyName = companiesList[0].name;
    } else {
      fallbackCompanyName = "Unassigned";
    }

    // SCENARIO 1: Process Classroom Logs
    if (data.classContent) {
      const classRows = parseCSV(data.classContent);
      const groupMap: Record<string, Record<string, Record<string, Student>>> = {};

      classRows.forEach((row) => {
        const rawStudent = row[data.mappings.classStudentCol] || "";
        const rawDate = row[data.mappings.classDateCol] || "";
        const rawBatch = row[data.mappings.classBatchCol] || "M1";
        const rawClassStatus = row[data.mappings.classStatusCol] || "";

        if (!rawStudent) return;

        const dateStr = normalizeDateToISO(rawDate) || startDate;
        const studentKey = normalizeKey(rawStudent);
        const companyName = studentToCompany[studentKey] || fallbackCompanyName;
        const compId = companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "unassigned";
        const batchName = rawBatch.trim().toUpperCase() || "M1";

        const isClassPresent = !rawClassStatus || /present|^\s*p\s*$/i.test(rawClassStatus.trim());
        const classroomStatus = isClassPresent ? 'Present' : 'Absent';

        let studentId = `STU_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        let studentName = rawStudent.trim();
        const idMatch = rawStudent.match(/^([A-Za-z0-9]+)\s*-\s*(.+)$/);
        if (idMatch) {
          studentId = idMatch[1].trim();
          studentName = idMatch[2].trim();
        }

        // Auto add custom company if missing
        if (!companiesList.some(c => c.id === compId)) {
          companiesList.push({
            id: compId,
            name: companyName,
            industry: "Placement Portfolio",
            requiredCompliance: 80
          });
        }

        if (!groupMap[compId]) groupMap[compId] = {};
        if (!groupMap[compId][dateStr]) groupMap[compId][dateStr] = {};

        let crtStatus: 'Present' | 'Absent' = 'Absent';
        let existingIsCrt = false;
        const existingStud = datasetsCopy[compId]?.[dateStr]?.find(s => normalizeKey(s.fullName) === studentKey);
        if (existingStud) {
          crtStatus = existingStud.crtStatus;
          existingIsCrt = !!existingStud.isCrtApplicant;
        }

        const isSkipper = existingIsCrt && classroomStatus === 'Present' && crtStatus === 'Absent';

        groupMap[compId][dateStr][studentKey] = {
          id: studentId,
          name: studentName,
          fullName: rawStudent.trim(),
          batch: batchName,
          classroomStatus,
          crtStatus,
          isSkipper,
          isCrtApplicant: existingIsCrt
        };
      });

      // Commit parsed Classroom groups
      Object.keys(groupMap).forEach(compId => {
        if (!datasetsCopy[compId]) datasetsCopy[compId] = {};
        Object.keys(groupMap[compId]).forEach(dateStr => {
          datasetsCopy[compId][dateStr] = Object.values(groupMap[compId][dateStr]);
          if (!usingDefaultCopy[compId]) usingDefaultCopy[compId] = {};
          usingDefaultCopy[compId][dateStr] = false;
        });
        lastActiveCompanyId = compId;
      });
    }

    // SCENARIO 2: Process CRT Registry Logs
    if (data.crtContent) {
      const crtRows = parseCSV(data.crtContent);

      crtRows.forEach((row) => {
        const rawStudent = row[data.mappings.crtStudentCol] || "";
        const rawDate = row[data.mappings.crtDateCol] || "";
        const rawBatch = row[data.mappings.crtBatchCol] || "M1";
        const rawCrtStatus = row[data.mappings.crtStatusCol] || "";
        const rawCompany = row[data.mappings.crtCompanyCol] || "";

        if (!rawStudent) return;

        const dateStr = normalizeDateToISO(rawDate) || startDate;
        const batchName = rawBatch.trim().toUpperCase() || "M1";
        const isCrtPresent = /present|^\s*p\s*$/i.test(rawCrtStatus.trim());
        const crtStatus = isCrtPresent ? 'Present' : 'Absent';

        const studentKey = normalizeKey(rawStudent);
        const companyName = rawCompany.trim() || studentToCompany[studentKey] || fallbackCompanyName;
        const compId = companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "unassigned";

        // Auto add custom company if missing
        if (!companiesList.some(c => c.id === compId)) {
          companiesList.push({
            id: compId,
            name: companyName,
            industry: "Placement Portfolio",
            requiredCompliance: 80
          });
        }

        let foundCompId = compId;
        let foundClassroomStatus: 'Present' | 'Absent' = 'Present';
        let foundStudentId = "";
        let foundStudentName = "";

        // Locate student in active date set
        for (const cId of Object.keys(datasetsCopy)) {
          const dayStudents = datasetsCopy[cId]?.[dateStr];
          if (dayStudents) {
            const found = dayStudents.find(s => normalizeKey(s.fullName) === studentKey);
            if (found) {
              foundCompId = cId;
              foundClassroomStatus = found.classroomStatus;
              foundStudentId = found.id;
              foundStudentName = found.name;
              break;
            }
          }
        }

        // Locate student in older/other dates
        if (!foundStudentId) {
          for (const cId of Object.keys(datasetsCopy)) {
            for (const otherDate of Object.keys(datasetsCopy[cId] || {})) {
              const dayStudents = datasetsCopy[cId]?.[otherDate];
              if (dayStudents) {
                const found = dayStudents.find(s => normalizeKey(s.fullName) === studentKey);
                if (found) {
                  foundCompId = cId;
                  foundClassroomStatus = found.classroomStatus;
                  foundStudentId = found.id;
                  foundStudentName = found.name;
                  break;
                }
              }
            }
            if (foundStudentId) break;
          }
        }

        // Fallback: Default to mapped company
        if (!foundStudentId) {
          foundClassroomStatus = 'Present';
          let sId = `STU_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
          let sName = rawStudent.trim();
          const idMatch = rawStudent.match(/^([A-Za-z0-9]+)\s*-\s*(.+)$/);
          if (idMatch) {
            sId = idMatch[1].trim();
            sName = idMatch[2].trim();
          }
          foundStudentId = sId;
          foundStudentName = sName;
        }

        // Move student to active company mapping if it changed
        if (foundCompId !== compId) {
          if (datasetsCopy[foundCompId]?.[dateStr]) {
            datasetsCopy[foundCompId][dateStr] = datasetsCopy[foundCompId][dateStr].filter(
              s => normalizeKey(s.fullName) !== studentKey
            );
          }
          foundCompId = compId;
        }

        if (!datasetsCopy[foundCompId]) datasetsCopy[foundCompId] = {};
        if (!datasetsCopy[foundCompId][dateStr]) datasetsCopy[foundCompId][dateStr] = [];

        const index = datasetsCopy[foundCompId][dateStr].findIndex(s => normalizeKey(s.fullName) === studentKey);
        const originalClassroomStatus = index > -1 ? datasetsCopy[foundCompId][dateStr][index].classroomStatus : foundClassroomStatus;
        const isSkipper = originalClassroomStatus === "Present" && crtStatus === "Absent";

        if (index > -1) {
          const original = datasetsCopy[foundCompId][dateStr][index];
          datasetsCopy[foundCompId][dateStr][index] = {
            ...original,
            crtStatus,
            isSkipper,
            isCrtApplicant: true
          };
        } else {
          datasetsCopy[foundCompId][dateStr].push({
            id: foundStudentId,
            name: foundStudentName,
            fullName: rawStudent.trim(),
            batch: batchName,
            classroomStatus: foundClassroomStatus,
            crtStatus,
            isSkipper,
            isCrtApplicant: true
          });
        }

        if (!usingDefaultCopy[foundCompId]) usingDefaultCopy[foundCompId] = {};
        usingDefaultCopy[foundCompId][dateStr] = false;
        lastActiveCompanyId = foundCompId;
      });
    }

    setCompanies(companiesList);
    setCompanyDatasets(datasetsCopy);
    setIsUsingDefault(usingDefaultCopy);

    if (lastActiveCompanyId && !selectedCompanyIds.includes(lastActiveCompanyId)) {
      setSelectedCompanyIds([lastActiveCompanyId]);
    }
    
    setActiveTab('dashboard');
  };

  const handleResetData = () => {
    const range = getDatesInRange(startDate, endDate);
    setCompanyDatasets(prev => {
      const companyData = { ...(prev[selectedCompanyId] || {}) };
      range.forEach(date => {
        companyData[date] = generateDefaultFullDataset(selectedCompanyId, date);
      });
      return {
        ...prev,
        [selectedCompanyId]: companyData
      };
    });
    
    setIsUsingDefault(prev => {
      const companyDefault = { ...(prev[selectedCompanyId] || {}) };
      range.forEach(date => {
        companyDefault[date] = true;
      });
      return {
        ...prev,
        [selectedCompanyId]: companyDefault
      };
    });
    
    setActiveTab('dashboard');
  };

  const handleClearAllData = () => {
    setCompanies([]);
    setCompanyDatasets({});
    setIsUsingDefault({});
    setSelectedCompanyIds([]);
    setActiveTab('importer');
  };

  // Compute portfolio comparison data
  const portfolioSummaries = useMemo(() => {
    const range = getDatesInRange(startDate, endDate);
    return companies.map(comp => {
      const list: Student[] = [];
      range.forEach(date => {
        let data = companyDatasets[comp.id]?.[date];
        if (!data) {
          data = [];
        }
        list.push(...data);
      });

      const normalizedList = list.map(student => ({
        ...student,
        isSkipper: student.isCrtApplicant === true && student.classroomStatus === 'Present' && student.crtStatus === 'Absent'
      }));

      const met = calculateMetrics(normalizedList);
      const total = met.totalApplicants;
      
      // Classroom attendance is same for all companies
      const globalClassTotal = globalClassroomMetrics.classPresentCount + globalClassroomMetrics.classAbsentCount;
      const classRate = globalClassTotal > 0 ? (globalClassroomMetrics.classPresentCount / globalClassTotal) * 100 : 0;
      const crtRate = total > 0 ? (met.crtPresentCount / total) * 100 : 0;
      
      let status: 'Critical' | 'Warning' | 'Healthy' = 'Healthy';
      if (crtRate < 60) {
        status = 'Critical';
      } else if (crtRate < 75) {
        status = 'Warning';
      }

      return {
        companyId: comp.id,
        companyName: comp.name,
        industry: comp.industry,
        totalApplicants: total,
        classRate,
        crtRate,
        skippersCount: met.skippersCount,
        requiredCompliance: comp.requiredCompliance,
        status,
        isCustom: !range.every(date => isUsingDefault[comp.id]?.[date] ?? true)
      };
    });
  }, [companyDatasets, isUsingDefault, startDate, endDate, companies, globalClassroomMetrics]);

  const currentCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0] || { id: "no-company", name: "No Loaded Company", industry: "Unassigned", requiredCompliance: 80 };
  }, [selectedCompanyId, companies]);

  // Compute consolidated metrics for the entire organization for the selected date
  const consolidatedMetrics = useMemo(() => {
    let totalApplicants = 0;
    let totalClassPresent = 0;
    let totalClassAbsent = 0;
    let totalCrtPresent = 0;
    let totalSkippers = 0;
    const range = getDatesInRange(startDate, endDate);

    companies.forEach(comp => {
      range.forEach(date => {
        let data = companyDatasets[comp.id]?.[date];
        if (!data) {
          data = [];
        }
        const m = calculateMetrics(data);
        totalApplicants += m.totalApplicants;
        totalClassPresent += m.classPresentCount;
        totalClassAbsent += m.classAbsentCount;
        totalCrtPresent += m.crtPresentCount;
        totalSkippers += m.skippersCount;
      });
    });

    const classTotal = totalClassPresent + totalClassAbsent;
    const averageClassRate = classTotal > 0 ? (totalClassPresent / classTotal) * 100 : 0;
    const averageCrtRate = totalApplicants > 0 ? (totalCrtPresent / totalApplicants) * 100 : 0;

    return {
      totalApplicants,
      totalClassPresent,
      totalClassAbsent,
      totalCrtPresent,
      totalSkippers,
      averageClassRate,
      averageCrtRate
    };
  }, [companyDatasets, startDate, endDate, companies]);

  // Consolidate skippers from all companies dynamically for the selected date
  const consolidatedSkippers = useMemo(() => {
    const list: { student: Student; companyName: string; companyId: string; date: string }[] = [];
    const range = getDatesInRange(startDate, endDate);
    
    companies.forEach(comp => {
      range.forEach(date => {
        let data = companyDatasets[comp.id]?.[date];
        if (!data) {
          data = [];
        }
        data.forEach(s => {
          if (s.isSkipper) {
            list.push({
              student: s,
              companyName: comp.name,
              companyId: comp.id,
              date
            });
          }
        });
      });
    });
    return list;
  }, [companyDatasets, startDate, endDate, companies]);

  // Automated Insights Engine based on computed states
  const insights = useMemo(() => {
    const list: string[] = [];
    
    // Find batch with highest class absenteeism
    let highestAbsentBatch = "";
    let highestAbsentRate = -1;
    
    // Find batch with highest skipper count
    let highestSkipperBatch = "";
    let highestSkipperCount = -1;

    batchSummaries.forEach(b => {
      const absentRate = b.totalApplicants > 0 ? (b.classAbsent / b.totalApplicants) : 0;
      if (absentRate > highestAbsentRate && b.totalApplicants > 0) {
        highestAbsentRate = absentRate;
        highestAbsentBatch = b.batchName;
      }

      if (b.skippersCount > highestSkipperCount) {
        highestSkipperCount = b.skippersCount;
        highestSkipperBatch = b.batchName;
      }
    });

    if (highestAbsentBatch && highestAbsentRate > 0) {
      list.push(`Critical Absenteeism: Batch **${highestAbsentBatch}** exhibited the highest regular classroom absenteeism of **${Math.round(highestAbsentRate * 100)}%** among applicants.`);
    }

    if (highestSkipperBatch && highestSkipperCount > 0) {
      list.push(`Skipper Outlier: Batch **${highestSkipperBatch}** recorded **${highestSkipperCount} Skips**, meaning **${Math.round((highestSkipperCount / (batchSummaries.find(b => b.batchName === highestSkipperBatch)?.totalApplicants || 1)) * 100)}%** of registered students bypassed training at **${currentCompany.name}**.`);
    }

    // Add safe standard benchmark values if defaults are active
    if (activeUseDefault) {
      if (selectedCompanyId === "nxtwave") {
        list.push("Regular Classroom attendance is remarkably high at **72%** (167 / 232). However, placement training compliance is under **46%** (106 / 232).");
        list.push("Audit Trigger: **Batch E3** has 20 applicants but **0** attended classroom sessions; they either skipped or are on external projects.");
      } else if (selectedCompanyId === "apex") {
        list.push("Regular Classroom attendance rate is **64%**. However, corporate compliance requires **75%**. The excess skippers trigger immediate administrative warning rules.");
      } else {
        list.push("Sovereign Engineering exhibits an elite **85%** compliance rate today, setting the high-tier benchmark for this billing cycle.");
      }
    } else {
      const classTotal = metrics.classPresentCount + metrics.classAbsentCount;
      const globalClassPresentRate = classTotal > 0 ? (metrics.classPresentCount / classTotal) * 100 : 0;
      const globalCrtPresentRate = metrics.totalApplicants > 0 ? (metrics.crtPresentCount / metrics.totalApplicants) * 100 : 0;
      list.push(`Cross-match indicates a classroom presence rate of **${globalClassPresentRate.toFixed(1)}%**, compared to placement sessions at **${globalCrtPresentRate.toFixed(1)}%**.`);
    }

    return list;
  }, [batchSummaries, metrics, activeUseDefault, selectedCompanyId, currentCompany]);

  const downloadDataset = (companyId: string, date: string, type: 'crt' | 'classroom' | 'master') => {
    const data = companyDatasets[companyId]?.[date] || [];
    let csvContent = "";
    let filename = "";
    
    if (type === 'crt') {
      const headers = ["Student Name", "Attendance Status", "Batch Details"];
      const rows = data.map(s => [
        s.fullName,
        s.crtStatus,
        s.batch
      ]);
      csvContent = [headers.join(","), ...rows.map(r => r.map(x => `"${x}"`).join(","))].join("\n");
      filename = `${companyId}_crt_placement_${date}.csv`;
    } else if (type === 'classroom') {
      const headers = ["Student Name", "1st Session Attendance Status"];
      const rows = data.map(s => [
        s.fullName,
        s.classroomStatus
      ]);
      csvContent = [headers.join(","), ...rows.map(r => r.map(x => `"${x}"`).join(","))].join("\n");
      filename = `${companyId}_classroom_academic_${date}.csv`;
    } else {
      const headers = ["Student ID", "Student Name", "Batch", "Classroom Attendance", "CRT Attendance", "Is Skipper"];
      const rows = data.map(s => [
        s.id,
        s.name,
        s.batch,
        s.classroomStatus,
        s.crtStatus,
        s.isSkipper ? "Yes" : "No"
      ]);
      csvContent = [headers.join(","), ...rows.map(r => r.map(x => `"${x}"`).join(","))].join("\n");
      filename = `${companyId}_master_roster_${date}.csv`;
    }
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCombinedAllDataset = () => {
    const headers = ["Date", "Company Name", "Student ID", "Student Name", "Batch", "Classroom Attendance", "CRT Attendance", "Is Skipper"];
    const rows: string[][] = [];

    const dates = [
      getISTDateString(),
      getDaysAgoIST(1),
      getDaysAgoIST(2),
      getDaysAgoIST(3),
      getDaysAgoIST(4)
    ];

    companies.forEach(comp => {
      dates.forEach(date => {
        const data = companyDatasets[comp.id]?.[date] || [];
        data.forEach(s => {
          rows.push([
            date,
            comp.name,
            s.id,
            s.name,
            s.batch,
            s.classroomStatus,
            s.crtStatus,
            s.isSkipper ? "Yes" : "No"
          ]);
        });
      });
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.map(x => `"${x}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "all_companies_all_days_combined_master.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between" id="app-wrapper">
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-full h-[360px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 grow">
        {/* Top Header Block */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md shadow-indigo-100 border border-indigo-700 shrink-0">
              <GraduationCap className="w-7.5 h-7.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-sans font-bold text-gray-900 tracking-tight text-xl sm:text-2xl">
                  Attendance & Placement Skipper Analyzer
                </h1>
              </div>
              
              {/* Personalized Corporate Selector */}
              <div className="flex items-center gap-2 mt-2 bg-slate-100/80 p-1 rounded-lg border border-slate-200/50 max-w-md w-full relative">
                <span className="text-[10px] md:text-xs text-slate-500 font-bold px-2 uppercase tracking-wider flex items-center gap-1 shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" /> Company Name:
                </span>
                <div className="relative grow">
                  <button
                    id="header-multiselect-dropdown-btn"
                    type="button"
                    onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                    className="w-full bg-white text-slate-800 text-[11px] md:text-xs font-bold py-1 px-2 rounded border border-slate-200 shadow-2xs outline-hidden cursor-pointer focus:ring-1 focus:ring-indigo-500 flex items-center justify-between gap-2 text-left"
                  >
                    <div className="flex flex-wrap gap-1 items-center overflow-hidden max-w-[210px] sm:max-w-xs">
                      {companies.length === 0 ? (
                        <span className="text-slate-400 italic font-medium">No Companies Loaded</span>
                      ) : selectedCompanyIds.length === companies.length ? (
                        <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase">
                          All Companies Selected ({selectedCompanyIds.length})
                        </span>
                      ) : (
                        selectedCompanyIds.map(id => {
                          const comp = companies.find(c => c.id === id);
                          return (
                            <span 
                              key={id} 
                              className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold"
                            >
                              {comp?.name.split(" ")[0] || id}
                            </span>
                          );
                        })
                      )}
                    </div>
                    <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform shrink-0 ${isCompanyDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isCompanyDropdownOpen && (
                    <>
                      {/* Overlay backdrop to close when clicking outside */}
                      <div className="fixed inset-0 z-40" onClick={() => setIsCompanyDropdownOpen(false)} />
                      
                      <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-lg p-2 z-50 text-xs space-y-0.5 min-w-[220px]">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-1.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 py-1 rounded-t-md">
                          <span>Active Portfolios</span>
                          {companies.length > 0 && (
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCompanyIds(companies.map(c => c.id));
                              }}
                              className="text-indigo-650 hover:text-indigo-800 font-extrabold normal-case cursor-pointer hover:underline"
                            >
                              Select All
                            </button>
                          )}
                        </div>
                        {companies.length === 0 ? (
                          <div className="px-3 py-4 text-center text-slate-400 italic text-[11px] leading-relaxed">
                            No companies available.<br />Please upload logs to populate.
                          </div>
                        ) : (
                          companies.map(comp => {
                            const isSelected = selectedCompanyIds.includes(comp.id);
                            return (
                              <label
                                key={comp.id}
                                className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none ${isSelected ? 'bg-indigo-50/40 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isSelected) {
                                      if (selectedCompanyIds.length > 1) {
                                        setSelectedCompanyIds(selectedCompanyIds.filter(id => id !== comp.id));
                                      }
                                    } else {
                                      setSelectedCompanyIds([...selectedCompanyIds, comp.id]);
                                    }
                                  }}
                                  className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                                />
                                <div className="grow leading-none">
                                  <span className="block font-bold text-xs">{comp.name}</span>
                                  <span className="text-[9px] text-slate-400 font-medium">{comp.industry}</span>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Multiple Days Date Filter Selection Block */}
              <div className="flex items-center gap-2 mt-2 max-w-md w-full">
                <DateRangePicker
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(start, end) => {
                    setStartDate(start);
                    setEndDate(end);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!activeUseDefault && (
              <button
                id="header-reset-btn"
                onClick={handleResetData}
                className="hidden bg-white hover:bg-gray-100 text-gray-700 font-semibold text-xs py-2 px-3.5 rounded-xl border border-gray-200 shadow-xs transition-colors cursor-pointer"
              >
                Reset Benchmarks
              </button>
            )}
            <a
              href="https://ai.studio/build"
              target="_blank"
              rel="noreferrer"
              className="bg-indigo-600/10 hover:bg-indigo-600/15 text-indigo-700 font-semibold text-xs py-2 px-3.5 rounded-xl transition-colors inline-flex items-center gap-1"
            >
              Google AI Studio
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Global tab control */}
        <div className="bg-slate-100 p-0.5 rounded-xl border border-slate-200 w-full overflow-x-auto flex mb-6 shadow-xs">
          <nav className="flex space-x-1 min-w-max w-full">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'dashboard' ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-sans' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              General Dashboard
            </button>
            <button
              id="tab-batches"
              onClick={() => setActiveTab('batches')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'batches' ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-sans' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
            >
              <Users className="w-4 h-4 text-indigo-500" />
              Batch Metrics Breakdown
            </button>
            <button
              id="tab-skippers"
              onClick={() => setActiveTab('skippers')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'skippers' ? 'bg-white text-rose-700 shadow-xs border border-rose-100 font-sans' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Skippers Directory
            </button>
            <button
              id="tab-importer"
              onClick={() => setActiveTab('importer')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'importer' ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-sans' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
            >
              <Layers className="w-4 h-4 text-teal-500" />
              Custom CSV Alignment
            </button>
            <button
              id="tab-exporter"
              onClick={() => setActiveTab('exporter')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${activeTab === 'exporter' ? 'bg-white text-emerald-700 shadow-xs border border-slate-200 font-sans' : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'}`}
            >
              <Download className="w-4 h-4 text-emerald-600" />
              Dataset Export Hub
            </button>
          </nav>
        </div>

        {companies.length === 0 && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-xs">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-amber-500 rounded-xl text-white shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-amber-950 text-sm">Clean Slate Enabled</h4>
                <p className="text-xs text-amber-700 leading-relaxed mt-0.5">
                  You have wiped all preloaded placeholder records! Go ahead and import your <strong>original Classroom logs and CRT Placement sheet</strong> in the Custom Alignment tab to populate live compliance data.
                </p>
              </div>
            </div>
            <button
              id="clean-slate-importer-btn"
              onClick={() => setActiveTab('importer')}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Upload Real Data Now
            </button>
          </div>
        )}

        {/* Tab Content Rendering */}
        <main className="space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Telemetry Numeric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  id="card-total-applicants"
                  title="Total Applicants"
                  value={metrics.totalApplicants}
                  subtitle="Total students Applied for Placements"
                  icon={<Users className="w-5 h-5" />}
                  colorScheme="blue"
                />
                
                <MetricCard
                  id="card-class-presents"
                  title="Classroom Present"
                  value={metrics.classPresentCount}
                  subtitle="Students present in academic/classroom sessions"
                  icon={<CheckCircle2 className="w-5 h-5" />}
                  colorScheme="indigo"
                  percentage={(metrics.classPresentCount + metrics.classAbsentCount) > 0 ? (metrics.classPresentCount / (metrics.classPresentCount + metrics.classAbsentCount)) * 100 : 0}
                />

                <MetricCard
                  id="card-crt-presents"
                  title="CRT Present"
                  value={metrics.crtPresentCount}
                  subtitle="Students present in CRT/placement training sessions"
                  icon={<TrendingUp className="w-5 h-5" />}
                  colorScheme="teal"
                  percentage={metrics.totalApplicants > 0 ? (metrics.crtPresentCount / metrics.totalApplicants) * 100 : 0}
                />

                <MetricCard
                  id="card-skippers-alert"
                  title="Skipper Identification"
                  value={metrics.skippersCount}
                  subtitle="Classroom Present & CRT Session  Absent"
                  icon={<AlertTriangle className="w-5 h-5" />}
                  colorScheme="rose"
                  percentage={metrics.totalApplicants > 0 ? (metrics.skippersCount / metrics.totalApplicants) * 100 : 0}
                />
              </div>

              {/* Corporate Portfolio Compliance Matrix */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="font-sans font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-indigo-500" />
                      Corporate Portfolio Compliance Matrix
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Live comparative compliance data across all companies in your corporate organization ecosystem.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="view-all-consolidated-inline-btn"
                      type="button"
                      onClick={() => {
                        const target = document.getElementById('consolidated-dashboard-section');
                        if (target) {
                          target.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 transition-all py-1.5 px-3 rounded-lg border border-indigo-150 cursor-pointer shadow-3xs"
                    >
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      Scroll to Corporate Consolidation
                    </button>
                    <div className="hidden md:block text-[10px] font-mono font-bold uppercase py-1.5 px-2.5 rounded bg-slate-50 text-slate-500 border border-slate-200">
                      High Priority Audit Active &bull; {companies.length} Subsidiaries
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-4 font-sans text-slate-500">Company Name</th>
                        <th className="py-2.5 px-3 text-slate-500">Industry / Domain</th>
                        <th className="py-2.5 px-3 text-center text-slate-500">Total Applicants</th>
                        <th className="py-2.5 px-3 text-center text-slate-500">Classroom Attendance</th>
                        <th className="py-2.5 px-3 text-center text-slate-500">Placement Compliance</th>
                        <th className="py-2.5 px-3 text-center text-slate-500">Active Skippers</th>
                        <th className="py-2.5 pr-4 pl-3 text-right text-slate-500">Action Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {portfolioSummaries.map(p => {
                        const isCurrent = selectedCompanyIds.includes(p.companyId);
                        return (
                          <tr 
                            key={p.companyId}
                            onClick={() => {
                              if (isCurrent) {
                                if (selectedCompanyIds.length > 1) {
                                  setSelectedCompanyIds(selectedCompanyIds.filter(id => id !== p.companyId));
                                }
                              } else {
                                setSelectedCompanyIds([...selectedCompanyIds, p.companyId]);
                              }
                            }}
                            className={`group cursor-pointer hover:bg-slate-50/85 transition-all ${isCurrent ? 'bg-indigo-50/20 font-semibold' : ''}`}
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isCurrent}
                                  readOnly
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                                />
                                <div className="flex items-center gap-1.5">
                                  <Building2 className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isCurrent ? 'text-indigo-600' : 'text-slate-450'}`} />
                                  <div>
                                    <span className={`block text-xs font-bold ${isCurrent ? 'text-indigo-900 font-extrabold' : 'text-slate-800'}`}>
                                      {p.companyName}
                                    </span>
                                    {isCurrent ? (
                                      <span className="inline-flex px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-700 mt-0.5">
                                        Active in View
                                      </span>
                                    ) : (
                                      <span className="text-[9px] text-slate-450">Click to add to view</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-medium">{p.industry}</td>
                            <td className="py-3 px-3 text-center font-mono font-semibold text-slate-700">{p.totalApplicants}</td>
                            <td className="py-3 px-3 text-center font-mono font-semibold text-indigo-600">
                              {p.classRate.toFixed(1)}%
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`font-bold ${p.status === 'Critical' ? 'text-rose-600' : p.status === 'Warning' ? 'text-amber-600' : 'text-teal-650'}`}>
                                  {p.crtRate.toFixed(1)}%
                                </span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${p.status === 'Critical' ? 'bg-rose-500' : p.status === 'Warning' ? 'bg-amber-400' : 'bg-emerald-500'}`} 
                                    style={{ width: `${Math.min(100, p.crtRate)}%` }} 
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-center font-mono">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${p.skippersCount > 0 ? 'bg-rose-50 border border-rose-100 text-rose-700' : 'bg-emerald-50 border border-emerald-100 text-emerald-700'}`}>
                                {p.skippersCount} skippers
                              </span>
                            </td>
                            <td className="py-3 pr-4 pl-3 text-right">
                              {p.status === 'Critical' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-extrabold bg-[#fff1f2] text-rose-700 border border-rose-200 uppercase tracking-wider">
                                  &bull; Urgent Review
                                </span>
                              ) : p.status === 'Warning' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                  &bull; Warning
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                                  &bull; Compliant
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bento Row: Concept Alert + Smart Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Concept Explainer (LHS) */}
                <div className="lg:col-span-4 bg-white border border-slate-200 shadow-sm p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute right-[-20px] bottom-[-20px] text-indigo-500/5 select-none pointer-events-none">
                    <AlertTriangle className="w-40 h-40" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5 mb-2">
                      <HelpCircle className="w-5 h-5 text-indigo-500" />
                      What is a 'Skipper'?
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Our system cross-references students listed as registered applicant pools with active hourly classroom reports.
                    </p>
                    <div className="bg-rose-50/50 rounded-lg p-4 border border-rose-100/80 text-xs text-rose-800 font-medium my-4 leading-relaxed space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
                        <span className="text-slate-700">Present in Classroom Roll</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                        <span className="text-slate-700">Absent in placement training</span>
                      </div>
                      <div className="text-[11px] text-rose-800 border-t border-rose-100 pt-2 font-mono font-bold uppercase tracking-wider">
                        Rule: Class Present + CRT Absent
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Skipping critical sessions damages college mock appraisal percentages and eligibility rules with recruitment partners.
                    </p>
                  </div>

                  <button
                    id="goto-directory-btn"
                    onClick={() => setActiveTab('skippers')}
                    className="mt-6 w-full text-center bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs py-2.5 rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    Launch Message &amp; Draft Alerts Menu
                  </button>
                </div>

                {/* Live automated insights list (RHS) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 shadow-sm rounded-xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-indigo-500" />
                      Attendance Audits &amp; Core Anomalies
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {insights.map((ins, i) => {
                        // Dynamically render bold elements
                        const formattedText = ins.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                        return (
                          <div key={i} className="py-3.5 flex items-start gap-3 first:pt-0 last:pb-0">
                            <span className="mt-1.5 flex w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                            <p 
                              className="text-sm text-slate-700 leading-relaxed"
                              dangerouslySetInnerHTML={{ __html: formattedText }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg mt-6 flex items-start sm:items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Administrators should contact batch coordinators in M1 and M4 immediately to inquire about these attendance breaches. Click the Directory tab to copy individual template alerts.
                    </p>
                  </div>
                </div>
              </div>
              {/* Consolidated Corporate Network Metrics and Performance */}
              <div id="consolidated-dashboard-section" className="pt-10 border-t border-slate-200/80 space-y-8">
                <div>
                  <h3 className="font-sans font-extrabold text-slate-900 text-lg flex items-center gap-2">
                    <Building2 className="w-5.5 h-5.5 text-indigo-600" />
                    Corporate Consolidation &amp; Portfolio Metrics
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Unified ecosystem intelligence tracking, cross-matching, and ranking compliance performance metrics across all portfolio operations on <strong className="text-slate-600">{getFormattedDateRange()}</strong>.
                  </p>
                </div>

                {/* Master Organizations Overarching Cumulative KPIs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
                    <div className="p-3.5 bg-indigo-50 rounded-lg text-indigo-600 shrink-0">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-450 block uppercase tracking-wider">Total Corporate Applicants</span>
                      <span className="text-2xl font-black text-slate-900 mt-0.5 block font-mono">
                        {consolidatedMetrics.totalApplicants}
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Across entire subsidiary network</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
                    <div className="p-3.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-450 block uppercase tracking-wider">Avg Classroom Present</span>
                      <span className="text-2xl font-black text-blue-600 mt-0.5 block font-mono">
                        {consolidatedMetrics.averageClassRate.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Academic logging consistency</span>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center gap-4">
                    <div className="p-3.5 bg-teal-50 rounded-lg text-teal-650 shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-450 block uppercase tracking-wider">Avg Placement Compliance</span>
                      <span className="text-2xl font-black text-teal-600 mt-0.5 block font-mono">
                        {consolidatedMetrics.averageCrtRate.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-medium mt-0.5">Corporate benchmark network average</span>
                    </div>
                  </div>

                  <div className="bg-white border border-rose-250 rounded-xl p-5 shadow-xs flex items-center gap-4 relative overflow-hidden">
                    <div className="p-3.5 bg-rose-50 rounded-lg text-rose-600 shrink-0">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-rose-450 block uppercase tracking-wider">Total Organization Skippers</span>
                      <span className="text-2xl font-black text-rose-600 mt-0.5 block font-mono">
                        {consolidatedMetrics.totalSkippers}
                      </span>
                      <span className="text-[10px] text-rose-500 block font-medium mt-0.5">Urgent warning reviews required</span>
                    </div>
                  </div>
                </div>

                {/* Side-by-side comparative grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {portfolioSummaries.map(p => {
                    return (
                      <div 
                        key={p.companyId}
                        className={`bg-white border rounded-xl overflow-hidden transition-all shadow-xs flex flex-col justify-between hover:shadow-md ${selectedCompanyId === p.companyId ? 'border-indigo-500 ring-2 ring-indigo-500/15' : 'border-slate-200'}`}
                      >
                        {/* Company Header Card */}
                        <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                              <h3 className="text-sm font-bold text-slate-900">{p.companyName}</h3>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{p.industry}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${p.status === 'Critical' ? 'bg-rose-50 border border-rose-200 text-rose-700' : p.status === 'Warning' ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
                              {p.status}
                            </span>
                          </div>
                        </div>

                        {/* Company Performance metrics details page */}
                        <div className="p-5 space-y-4 grow">
                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                              <span>Classroom Attendance</span>
                              <span className="font-bold text-slate-800">{p.classRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-indigo-500" style={{ width: `${p.classRate}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
                              <span>Placement Compliance</span>
                              <span className="font-bold text-emerald-700">{p.crtRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
                              {/* Compliance bar */}
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.crtRate}%` }} />
                            </div>
                          </div>

                          {/* Additional insights parameters */}
                          <div className="pt-2 grid grid-cols-2 gap-3 text-xs border-t border-slate-50">
                            <div className="text-center p-2 rounded-lg bg-slate-50">
                              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Pool</div>
                              <div className="text-sm font-extrabold text-slate-700 font-mono mt-0.5">{p.totalApplicants}</div>
                            </div>
                            <div className="text-center p-2 rounded-lg bg-rose-50/40 border border-rose-100/35">
                              <div className="text-[10px] text-rose-450 font-bold uppercase">Skippers Today</div>
                              <div className="text-sm font-extrabold text-rose-750 font-mono mt-0.5">{p.skippersCount}</div>
                            </div>
                          </div>
                        </div>

                        {/* Footer toggle select dataset shortcut button */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            {p.isCustom ? "Custom Data Active" : "Default Benchmarks"}
                          </span>
                          <button
                            id={`set-company-active-btn-${p.companyId}`}
                            type="button"
                            onClick={() => {
                              setSelectedCompanyId(p.companyId);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`text-[11px] font-bold py-1 px-3 rounded-lg transition-all cursor-pointer ${selectedCompanyId === p.companyId ? 'bg-indigo-600 text-white shadow-2xs border border-indigo-700' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'}`}
                          >
                            {selectedCompanyId === p.companyId ? "Selected Database" : "Switch Dataset"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="space-y-6">
              <BatchBreakdownTable 
                summaries={batchSummaries} 
                onSelectStudent={() => {}}
              />
            </div>
          )}

          {activeTab === 'skippers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 bg-[#fff1f2] border border-rose-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-800 text-sm">Critical Placement Support Roster</h4>
                  <p className="text-xs text-rose-600 leading-relaxed mt-0.5">
                    This table catalogs all <strong>{metrics.skippersCount}</strong> skippers across currently loaded sheets. Use the Smart Message Architect to copy preformatted notification warnings directly to your messaging channels or draft instant mail client prompts.
                  </p>
                </div>
              </div>
              <SkippersList students={students} />
            </div>
          )}

          {activeTab === 'importer' && (
            <div className="space-y-6">
              <DataImporter 
                onDataImported={handleDataImported} 
                onReset={handleResetData}
                onClearAllData={handleClearAllData}
                isUsingDefault={activeUseDefault}
              />
            </div>
          )}

          {activeTab === 'exporter' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1 px-2 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase tracking-wider">Corporate Hub</span>
                    <h3 className="font-sans font-extrabold text-slate-800 text-base">All-Tenant CSV Dataset Export Center</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
                    Compile and instantly download standardized compliance, classroom, or placement registry files for audit verification and physical ledger archives across all subsidiaries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadCombinedAllDataset}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download Combined Master All-Days (Single CSV)
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {companies.map(comp => {
                  const dates = [
                    getISTDateString(),
                    getDaysAgoIST(1),
                    getDaysAgoIST(2),
                    getDaysAgoIST(3),
                    getDaysAgoIST(4)
                  ];
                  
                  return (
                    <div key={comp.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4.5 h-4.5 text-indigo-500" />
                          <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">{comp.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{comp.industry}</p>
                      </div>

                      <div className="p-4 divide-y divide-slate-100 grow flex flex-col justify-between">
                        {dates.map(date => {
                          const dateObj = companyDatasets[comp.id]?.[date] || [];
                          const recordsCount = dateObj.length;
                          const isDefault = isUsingDefault[comp.id]?.[date] ?? true;
                          
                          // Format date nicely using helper (dynamic IST)
                          const formatDateStrNice = (dtStr: string) => {
                            const [year, month, day] = dtStr.split("-");
                            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            const mIdx = parseInt(month) - 1;
                            const formatted = `${monthNames[mIdx]} ${parseInt(day)}, ${year}`;
                            if (dtStr === getISTDateString()) return `${formatted} (Today)`;
                            if (dtStr === getDaysAgoIST(1)) return `${formatted} (Yesterday)`;
                            return formatted;
                          };
                          const formattedDate = formatDateStrNice(date);

                          return (
                            <div key={date} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-extrabold text-slate-700">{formattedDate}</span>
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-100/80 border border-slate-200 px-1.5 py-0.5 rounded-md">
                                  {recordsCount} students {isDefault ? '• Benchmark' : '• Custom'}
                                </span>
                              </div>

                              <div className="grid grid-cols-3 gap-1.5 pt-1">
                                <button
                                  type="button"
                                  onClick={() => downloadDataset(comp.id, date, 'classroom')}
                                  title="Download Academic Classroom Attendance Sheet"
                                  className="py-1 px-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-[9px] uppercase border border-amber-100/60 transition-all cursor-pointer text-center truncate flex flex-col items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5 text-amber-500" />
                                  Classroom
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadDataset(comp.id, date, 'crt')}
                                  title="Download Placement CRT Registry Sheet"
                                  className="py-1 px-1.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-[9px] uppercase border border-sky-100/60 transition-all cursor-pointer text-center truncate flex flex-col items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5 text-sky-500" />
                                  Placement
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadDataset(comp.id, date, 'master')}
                                  title="Download Full Unified Roster Sheet"
                                  className="py-1 px-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] uppercase border border-indigo-100/60 transition-all cursor-pointer text-center truncate flex flex-col items-center gap-1"
                                >
                                  <Download className="w-3.5 h-3.5 text-indigo-500" />
                                  Full Master
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Styled Footer */}
      <footer className="w-full bg-[#f8fafc] border-t border-slate-200 py-6 mt-16 relative z-10 text-[11px] text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6 text-center md:text-left">
            <span>Report Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>Analysis Engine: v2.4.0 (Skipper Detection Enabled)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 uppercase tracking-widest font-bold">PLACEMENT_ELIGIBLE_ONLY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
