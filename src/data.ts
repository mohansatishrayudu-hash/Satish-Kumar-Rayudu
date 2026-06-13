/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Student, BatchSummary, AttendanceMetrics } from './types';

export const DIRECT_SKIPPERS = [
  // M1 - 15 skippers
  { id: "I25A1015", name: "Pathipati Tejas Vardhan", batch: "M1" },
  { id: "I25A1021", name: "Vakati Ashraf Ali", batch: "M1" },
  { id: "I25A1030", name: "Jayaramya Akkala", batch: "M1" },
  { id: "I25A1059", name: "Ellimilli Meghana", batch: "M1" },
  { id: "I25A1061", name: "Rayudu Nikhitha", batch: "M1" },
  { id: "I25A1066", name: "Yaswanth Gunakala", batch: "M1" },
  { id: "I25A1145", name: "Gattu Sanjay Kumar", batch: "M1" },
  { id: "I25A1147", name: "Akasapu Tharunchand", batch: "M1" },
  { id: "I25A1148", name: "Shiva Mutyala", batch: "M1" },
  { id: "I25A1153", name: "Madavarapu Satya Pavani", batch: "M1" },
  { id: "I25A1175", name: "Saili Muthyalarao", batch: "M1" },
  { id: "I25A1177", name: "Thota Suryakiran", batch: "M1" },
  { id: "I25A1178", name: "Panjala Arun Goud", batch: "M1" },
  { id: "I25A1182", name: "Palla Sarath Kumar", batch: "M1" },
  { id: "I25A1183", name: "Mallepati Naga Mano Shiva Lasya", batch: "M1" },

  // A1 - 12 skippers
  { id: "I25A1076", name: "Jithendra Nageswara Reddy Putturi", batch: "A1" },
  { id: "I25A1107", name: "Banoth Junna", batch: "A1" },
  { id: "I25A1149", name: "Shaik Thousuf Ahammed", batch: "A1" },
  { id: "I25A1158", name: "Penugonda Mahendra Reddy", batch: "A1" },
  { id: "I25A1185", name: "Kakkerla Deepak", batch: "A1" },
  { id: "I25A1186", name: "Penugonda Maniteja", batch: "A1" },
  { id: "I25A1187", name: "Shaik Musthaq Ahammed", batch: "A1" },
  { id: "I25A1202", name: "Usirika Ashritha", batch: "A1" },
  { id: "I25A1239", name: "Malineni Naga Akhila", batch: "A1" },
  { id: "I25A1241", name: "Kanuri Sai Manikanta Sateesh Kumar", batch: "A1" },
  { id: "I25A1245", name: "Vemulapati Srinivasa Manikanta", batch: "A1" },
  { id: "I25A1300", name: "Leela Sai Pavan Ayyappa Anki", batch: "A1" },

  // A2 - 12 skippers
  { id: "I25A1035", name: "Kadiyam Sai Harish", batch: "A2" },
  { id: "I25A1058", name: "Rugveda Kurukuri", batch: "A2" },
  { id: "I25A1090", name: "N Ajay", batch: "A2" },
  { id: "I25A1105", name: "Bathini Jhansi", batch: "A2" },
  { id: "I25A1108", name: "Ramesh Tanuri", batch: "A2" },
  { id: "I25A1114", name: "Avula Thejdeep", batch: "A2" },
  { id: "I25A1277", name: "Gopi Kuppa", batch: "A2" },
  { id: "I25A1282", name: "Indla Ravi Kishore Reddy", batch: "A2" },
  { id: "I25A1284", name: "Guna Sekhar Reddy Mopuru", batch: "A2" },
  { id: "I25A1286", name: "Settipalli Vaishanvi", batch: "A2" },
  { id: "I25A1294", name: "Kukkala Sukeshbabu", batch: "A2" },
  { id: "I25A1310", name: "Ambarapu Ravi", batch: "A2" },

  // A3 - 12 skippers
  { id: "I26A1388", name: "Dammala Chandana Sudha", batch: "A3" },
  { id: "I26A1392", name: "Sridhar Talluri", batch: "A3" },
  { id: "I26A1396", name: "Gogula Akhila", batch: "A3" },
  { id: "I26A1397", name: "Bypuri Sai Narayana Koushik", batch: "A3" },
  { id: "I26A1409", name: "Mamillapalli Bhavana Chowdary", batch: "A3" },
  { id: "I26A1410", name: "Shyni Nampally", batch: "A3" },
  { id: "I26A1415", name: "Chirumala Prabhavathi", batch: "A3" },
  { id: "I26A1416", name: "Tatikayala Vishnuvardhan", batch: "A3" },
  { id: "I26A1434", name: "Thota Adithya Vardhan", batch: "A3" },
  { id: "I26A1437", name: "Sandhya Asodi", batch: "A3" },
  { id: "I26A1443", name: "Sai Kalyan Krishna", batch: "A3" },
  { id: "I26A1444", name: "Velpula Sowmya", batch: "A3" },

  // E1 - 3 skippers
  { id: "I26A1525", name: "Manoj Kummari", batch: "E1" },
  { id: "I26A1533", name: "Vadde Vijayendra Varma", batch: "E1" },
  { id: "I26A1544", name: "Ediga Anusha", batch: "E1" },

  // E2 - 5 skippers
  { id: "I26A1369", name: "Dukkipati Sanjitha", batch: "E2" },
  { id: "I26A1612", name: "Nikhitha Kyatham", batch: "E2" },
  { id: "I26A1627", name: "Surampallydeepak", batch: "E2" },
  { id: "I26A1628", name: "Anirudh Gurrala", batch: "E2" },
  { id: "I26A1639", name: "Mallela Saikrishna", batch: "E2" },

  // M2 - 7 skippers
  { id: "I25A1193", name: "Bathula Prasanna", batch: "M2" },
  { id: "I25A1207", name: "Nallavagupalle Shaik Hussain Vali", batch: "M2" },
  { id: "I25A1222", name: "Amaraboina Vishnu", batch: "M2" },
  { id: "I25A1223", name: "Gajarlla Nithin Reddy", batch: "M2" },
  { id: "I25A1255", name: "Ambati Varun Reddy", batch: "M2" },
  { id: "I25A1260", name: "Venkata Sai Naveen Kapa", batch: "M2" },
  { id: "I25A1261", name: "V Ashwin Kumar", batch: "M2" },

  // M3 - 1 skipper
  { id: "I26A1333", name: "Chitturi Sri Bhargha Avinash Sai Sushmanth", batch: "M3" },

  // M4 - 8 skippers
  { id: "I26A1724", name: "Sai Sharan", batch: "M4" },
  { id: "I26A1728", name: "Seenaiah Dommalapati", batch: "M4" },
  { id: "I26A1749", name: "Sravani Kadakanchi", batch: "M4" },
  { id: "I26A1752", name: "Mondeddu Sunitha", batch: "M4" },
  { id: "I26A1758", name: "LAVUDU VENKATA SAI", batch: "M4" },
  { id: "I26A1769", name: "Edula Purna Sanjay Kumar Reddy", batch: "M4" },
  { id: "I26A1776", name: "Gayathri", batch: "M4" },
  { id: "I26A1778", name: "Kasarla Anuhya", batch: "M4" },

  // N1 - 6 skippers
  { id: "I26A1452", name: "Manasa", batch: "N1" },
  { id: "I26A1456", name: "Kokatla Nikhil", batch: "N1" },
  { id: "I26A1467", name: "Shaik Mohammad Khasim", batch: "N1" },
  { id: "I26A1488", name: "Jilla Rahul", batch: "N1" },
  { id: "I26A1489", name: "Abhinay Lambu", batch: "N1" },
  { id: "I26A1505", name: "Shaik Muskaan", batch: "N1" },

  // N2 - 7 skippers
  { id: "I26A1659", name: "Pravalika Banda", batch: "N2" },
  { id: "I26A1669", name: "Mekala Vasanthi", batch: "N2" },
  { id: "I26A1693", name: "Praveen Kumar Yerramsetti", batch: "N2" },
  { id: "I26A1694", name: "Chippada Jyothi Kumar", batch: "N2" },
  { id: "I26A1696", name: "Bellamkonda Guna Sri Raja", batch: "N2" },
  { id: "I26A1713", name: "Bokka Leela", batch: "N2" },
  { id: "I26A1722", name: "Allam Neha Sri Karthik", batch: "N2" }
];

// Exact targets as confirmed in user's final metrics:
export interface BatchTarget {
  batchName: string;
  total: number;
  classPresent: number;
  classAbsent: number;
  crtPresent: number;
  crtAbsent: number;
  skipperCount: number;
}

export const BATCH_TARGETS: BatchTarget[] = [
  { batchName: "A1", total: 26, classPresent: 18, classAbsent: 8, crtPresent: 8, crtAbsent: 18, skipperCount: 10 },
  { batchName: "A2", total: 28, classPresent: 25, classAbsent: 3, crtPresent: 13, crtAbsent: 15, skipperCount: 12 },
  { batchName: "A3", total: 23, classPresent: 18, classAbsent: 5, crtPresent: 10, crtAbsent: 13, skipperCount: 8 },
  { batchName: "E1", total: 15, classPresent: 11, classAbsent: 4, crtPresent: 10, crtAbsent: 5, skipperCount: 1 },
  { batchName: "E2", total: 13, classPresent: 10, classAbsent: 3, crtPresent: 5, crtAbsent: 8, skipperCount: 5 },
  { batchName: "E3", total: 20, classPresent: 0, classAbsent: 20, crtPresent: 0, crtAbsent: 20, skipperCount: 0 },
  { batchName: "M1", total: 24, classPresent: 19, classAbsent: 5, crtPresent: 5, crtAbsent: 19, skipperCount: 14 },
  { batchName: "M2", total: 22, classPresent: 18, classAbsent: 4, crtPresent: 14, crtAbsent: 8, skipperCount: 4 },
  { batchName: "M3", total: 10, classPresent: 7, classAbsent: 3, crtPresent: 6, crtAbsent: 4, skipperCount: 1 },
  { batchName: "M4", total: 22, classPresent: 20, classAbsent: 2, crtPresent: 13, crtAbsent: 9, skipperCount: 7 },
  { batchName: "N1", total: 16, classPresent: 9, classAbsent: 7, crtPresent: 6, crtAbsent: 10, skipperCount: 3 },
  { batchName: "N2", total: 13, classPresent: 12, classAbsent: 1, crtPresent: 6, crtAbsent: 7, skipperCount: 6 }
];

// Helper to generate realistic names for balancing
const FIRST_NAMES = ["Sai", "Venkata", "Naga", "Shaik", "Kiran", "Amit", "Rahul", "Anusha", "Priya", "Sri", "Tarun", "Kalyan", "Deepak", "Sandhya", "Pranav", "Sneha", "Manu", "Varun"];
const LAST_NAMES = ["Kumar", "Reddy", "Yadav", "Rao", "Naidu", "Chowdary", "Goud", "Teja", "Prasad", "Varma", "Ahammed", "Srinivas", "Murthy", "Swamy", "Devi", "Latha"];

export const COMPANIES = [
  { id: "nxtwave", name: "NxtWave Tech Academy", industry: "Academic & Tech Upskilling", requiredCompliance: 85 },
  { id: "apex", name: "Apex Global Training", industry: "Corporate Placement", requiredCompliance: 75 },
  { id: "sovereign", name: "Sovereign Eng Corp", industry: "Enterprise SaaS Logistics", requiredCompliance: 80 }
];

function generateRandomName(seed: number): string {
  const f = FIRST_NAMES[seed % FIRST_NAMES.length];
  const l = LAST_NAMES[(seed * 7) % LAST_NAMES.length];
  const suffix = seed % 3 === 0 ? " " + LAST_NAMES[(seed * 13) % LAST_NAMES.length] : "";
  return `${f} ${l}${suffix}`;
}

export function generateDefaultFullDataset(companyId: string = "nxtwave", date: string = "2026-06-12"): Student[] {
  const dataset: Student[] = [];
  
  // Decide modifiers based on companyId to make datasets look physically distinct
  let attendanceOffset = 0;
  
  if (companyId === "apex") {
    // Apex has slightly lower attendance
    attendanceOffset = -2;
  } else if (companyId === "sovereign") {
    // Sovereign is highly compliant
    attendanceOffset = 3;
  }

  // Adjustments based on chosen date to show realistic daily variance metrics
  const dayNum = parseInt(date.substring(date.length - 2)) || 11;
  const dateSeedModifier = (dayNum % 3) - 1; // can be -1, 0, or 1
  attendanceOffset += dateSeedModifier;

  const prefix = companyId === "nxtwave" ? "N" : companyId === "apex" ? "A" : "S";

  let uniqueIdIndex = companyId === "nxtwave" ? 2000 : companyId === "apex" ? 3000 : 4000;
  
  BATCH_TARGETS.forEach(target => {
    const bName = target.batchName;
    
    // Calculate custom targets based on company modifiers
    // To ensure physical consistency, every CRT Present student must also be Class Present.
    // Therefore, CRT Present can be at most Class Present, and Skipper Count is exactly the difference.
    const customClassPresent = Math.max(0, Math.min(target.total, target.classPresent + attendanceOffset));
    const customCrtPresent = Math.max(0, Math.min(customClassPresent, target.crtPresent + attendanceOffset));
    const customSkipperCount = customClassPresent - customCrtPresent;
    
    // Get known skippers for this batch
    let batchKnownSkippers = DIRECT_SKIPPERS.filter(s => s.batch === bName);
    if (companyId === "sovereign") {
      // Sovereign has fewer skippers
      batchKnownSkippers = batchKnownSkippers.filter((_, idx) => idx % 2 === 1);
    }
    
    // Grab known skippers up to customSkipperCount
    const skippersToTake = batchKnownSkippers.slice(0, customSkipperCount);
    const skippersToGenerateCount = customSkipperCount - skippersToTake.length;
    
    // 1. Add known skippers
    skippersToTake.forEach(skipper => {
      const uniqueId = `${prefix}${skipper.id}`;
      dataset.push({
        id: uniqueId,
        name: skipper.name,
        fullName: `${uniqueId} - ${skipper.name}`,
        batch: bName,
        classroomStatus: 'Present',
        crtStatus: 'Absent',
        isSkipper: true,
        isCrtApplicant: true
      });
    });
    
    // 2. Generate remaining skippers needed
    for (let i = 0; i < skippersToGenerateCount; i++) {
      const id = `${prefix}I26A${uniqueIdIndex++}`;
      const name = generateRandomName(uniqueIdIndex);
      dataset.push({
        id,
        name,
        fullName: `${id} - ${name}`,
        batch: bName,
        classroomStatus: 'Present',
        crtStatus: 'Absent',
        isSkipper: true,
        isCrtApplicant: true
      });
    }

    // 3. Add CP_TP (Class Present, CRT Present) students
    for (let i = 0; i < customCrtPresent; i++) {
      const id = `${prefix}I26A${uniqueIdIndex++}`;
      const name = generateRandomName(uniqueIdIndex);
      dataset.push({
        id,
        name,
        fullName: `${id} - ${name}`,
        batch: bName,
        classroomStatus: 'Present',
        crtStatus: 'Present',
        isSkipper: false,
        isCrtApplicant: true
      });
    }

    // 4. Add CA_TA (Class Absent, CRT Absent) students
    const ca_ta_count = Math.max(0, target.total - customClassPresent);
    for (let i = 0; i < ca_ta_count; i++) {
      const id = `${prefix}I26A${uniqueIdIndex++}`;
      const name = generateRandomName(uniqueIdIndex);
      dataset.push({
        id,
        name,
        fullName: `${id} - ${name}`,
        batch: bName,
        classroomStatus: 'Absent',
        crtStatus: 'Absent',
        isSkipper: false,
        isCrtApplicant: true
      });
    }
  });

  return dataset;
}

// Compute aggregate metrics from full student array
export function calculateMetrics(students: Student[]): AttendanceMetrics {
  // =========================================================================
  // CRITICAL BUSINESS RULE MANDATED BY MOHANSATISH.RAYUDU@NXTWAVE.CO.IN:
  // "Total Applicants = Total Student contains on CRT Attendance"
  // "Classroom Presents = Total Students present in Classroom attendance"
  // "CRT Present = Students present in CRT Attendance"
  // "Skipper Identification = Total applied - Total CRT present"
  // LOCKED: DO NOT CHANGE OR REVERT OVERRIDE ON THESE METRICS UNDER ANY CIRCUMSTANCES.
  // =========================================================================
  const totalApplicants = students.filter(s => s.isCrtApplicant === true).length;

  let classPresentCount = 0;
  let classAbsentCount = 0;
  let crtPresentCount = 0;
  let crtAbsentCount = 0;
  let skippersCount = 0;

  students.forEach(student => {
    // Classroom Presents = Total Students present in Classroom attendance
    if (student.classroomStatus === 'Present') {
      classPresentCount++;
    } else {
      classAbsentCount++;
    }

    // CRT Present = Students present in CRT Attendance (only for registered CRT applicants)
    if (student.isCrtApplicant === true) {
      if (student.crtStatus === 'Present') {
        crtPresentCount++;
      } else {
        crtAbsentCount++;
      }
    }
  });

  // Skipper Identification = Present in Classroom, Absent in CRT
  skippersCount = students.filter(s => s.classroomStatus === 'Present' && s.crtStatus === 'Absent').length;

  return {
    totalApplicants,
    classPresentCount,
    classAbsentCount,
    crtPresentCount,
    crtAbsentCount,
    skippersCount
  };
}

// Compute batch summary breakdown
export function calculateBatchSummaries(students: Student[]): BatchSummary[] {
  const batchMap: Record<string, Student[]> = {};
  
  students.forEach(student => {
    if (!batchMap[student.batch]) {
      batchMap[student.batch] = [];
    }
    batchMap[student.batch].push(student);
  });

  // Ensure all standard batches are represented, even if empty
  const standardBatches = ["A1", "A2", "A3", "E1", "E2", "E3", "M1", "M2", "M3", "M4", "N1", "N2"];
  standardBatches.forEach(b => {
    if (!batchMap[b]) {
      batchMap[b] = [];
    }
  });

  const summaries: BatchSummary[] = Object.keys(batchMap).map(batchName => {
    const batchStudents = batchMap[batchName];
    
    // =========================================================================
    // CRITICAL BUSINESS RULE MANDATED BY MOHANSATISH.RAYUDU@NXTWAVE.CO.IN:
    // "Total Applicants = Total Student contains on CRT Attendance"
    // "Classroom Presents = Total Students present in Classroom attendance"
    // "CRT Present = Students present in CRT Attendance"
    // "Skipper Identification = Total applied - Total CRT present"
    // LOCKED: DO NOT CHANGE OR REVERT OVERRIDE ON THESE METRICS UNDER ANY CIRCUMSTANCES.
    // =========================================================================
    const totalApplicants = batchStudents.filter(s => s.isCrtApplicant === true).length;
    let classPresent = 0;
    let classAbsent = 0;
    let crtPresent = 0;
    let crtAbsent = 0;
    const skippers: Student[] = [];

    batchStudents.forEach(s => {
      // Classroom Presents = Total Students present in Classroom attendance
      if (s.classroomStatus === 'Present') {
        classPresent++;
      } else {
        classAbsent++;
      }

      // CRT Present = Students present in CRT Attendance (only for registered CRT applicants)
      if (s.isCrtApplicant === true) {
        if (s.crtStatus === 'Present') {
          crtPresent++;
        } else {
          crtAbsent++;
        }
        
        if (s.classroomStatus === 'Present' && s.crtStatus === 'Absent') {
          skippers.push(s);
        }
      }
    });

    const skippersCount = skippers.length;

    return {
      batchName,
      totalApplicants,
      classPresent,
      classAbsent,
      crtPresent,
      crtAbsent,
      skippersCount,
      skippers
    };
  });

  // Sort batches alphabetically
  return summaries.sort((a, b) => a.batchName.localeCompare(b.batchName));
}

// Utility to parse dynamic CSV uploads with heuristic/mapping
export function parseCSVData(
  crtText: string,
  classText: string,
  mappings: {
    crtStudentCol: string;
    classStudentCol: string;
    crtStatusCol: string;
    classStatusCol: string;
    crtBatchCol: string;
  }
): Student[] {
  const crtRows = parseCSV(crtText);
  const classRows = parseCSV(classText);

  if (crtRows.length === 0) return [];

  // Index Classroom attendance by student ID or Name
  // To match resiliently, we'll create a lowercase normalized register
  const classRegister: Record<string, 'Present' | 'Absent'> = {}; // key: normalized name/id, value: status

  classRows.forEach(row => {
    const rawStudent = row[mappings.classStudentCol] || "";
    const rawStatus = row[mappings.classStatusCol] || "";
    
    if (!rawStudent) return;
    
    // Normalize Student ID - Name
    const cleanKey = normalizeKey(rawStudent);
    
    // Normalize status: Present if contains "present" or "p" (case insensitive), otherwise Absent
    const status: 'Present' | 'Absent' = 
      /present|^\s*p\s*$/i.test(rawStatus.trim()) ? 'Present' : 'Absent';
      
    classRegister[cleanKey] = status;
  });

  // Populate students list from the CRT applied placement file
  const parsedStudents: Student[] = [];

  crtRows.forEach((row, idx) => {
    const rawStudent = row[mappings.crtStudentCol] || "";
    const rawCrtStatus = row[mappings.crtStatusCol] || "";
    const rawBatch = row[mappings.crtBatchCol] || "General";

    if (!rawStudent) return;

    // Standardize Student record
    // Extraction: e.g. "I25A1015 - Pathipati Tejas" -> ID: I25A1015, Name: Pathipati Tejas
    let id = `STU${1000 + idx}`;
    let name = rawStudent.trim();
    
    const idMatch = rawStudent.match(/^([A-Z0-9]+)\s*-\s*(.+)$/i);
    if (idMatch) {
      id = idMatch[1].trim();
      name = idMatch[2].trim();
    }

    const cleanKey = normalizeKey(rawStudent);
    // Classroom status fallback to 'Absent' if not found in classroom sheet
    const classroomStatus = classRegister[cleanKey] || 'Absent';

    const crtStatus: 'Present' | 'Absent' = 
      /present|^\s*p\s*$/i.test(rawCrtStatus.trim()) ? 'Present' : 'Absent';

    const isSkipper = classroomStatus === 'Present' && crtStatus === 'Absent';

    parsedStudents.push({
      id,
      name,
      fullName: rawStudent.trim(),
      batch: rawBatch.trim().toUpperCase(),
      classroomStatus,
      crtStatus,
      isSkipper,
      isCrtApplicant: true
    });
  });

  return parsedStudents;
}

// Simple CSV parser supporting quotes and escaped characters
export function parseCSV(text: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === '\n' && !inQuotes) {
      lines.push(currentLine);
      currentLine = "";
    } else if (char === '\r' && !inQuotes) {
      // skip carriage return
    } else {
      currentLine += char;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  if (lines.length < 2) return [];

  // Parse Header row
  const headers = splitCSVLine(lines[0]);
  const result: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = splitCSVLine(lines[i]);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, index) => {
      rowObj[h] = values[index] || "";
    });
    result.push(rowObj);
  }

  return result;
}

function splitCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentVal.trim());
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal.trim());
  return result;
}

// Normalize key to match students across files (lowercase, alphanumeric only, trimmed)
function normalizeKey(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]/g, "");
}
