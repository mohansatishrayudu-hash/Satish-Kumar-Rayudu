import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronLeft, ChevronRight, Check, ChevronDown, Clock } from "lucide-react";
import { getISTDateString, getDaysAgoIST, getISTFirstDayOfMonth, getISTLastDayOfMonth } from "../utils";

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
}

type AutoRangeType = 'fixed' | 'today' | 'yesterday' | 'this_month' | 'last_7_days' | 'advanced';

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [autoRange, setAutoRange] = useState<AutoRangeType>('fixed');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Calendar month views (Defaulting dynamically to the current year/month in IST)
  const [startCalendarMonth, setStartCalendarMonth] = useState(() => {
    const todayStr = getISTDateString();
    const [y, m] = todayStr.split("-");
    return new Date(parseInt(y), parseInt(m) - 1, 1);
  });
  const [endCalendarMonth, setEndCalendarMonth] = useState(() => {
    const todayStr = getISTDateString();
    const [y, m] = todayStr.split("-");
    return new Date(parseInt(y), parseInt(m) - 1, 1);
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync temp dates with props when opening
  useEffect(() => {
    if (isOpen) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      
      const today = getISTDateString();
      const yesterday = getDaysAgoIST(1);
      const startOfMonth = getISTFirstDayOfMonth();
      const endOfMonth = getISTLastDayOfMonth();
      const last7DaysStart = getDaysAgoIST(6);
      const advancedStart = getDaysAgoIST(4);

      // Determine autoRange based on dates
      if (startDate === today && endDate === today) {
        setAutoRange('today');
      } else if (startDate === yesterday && endDate === yesterday) {
        setAutoRange('yesterday');
      } else if (startDate === startOfMonth && endDate === endOfMonth) {
        setAutoRange('this_month');
      } else if (startDate === last7DaysStart && endDate === today) {
        setAutoRange('last_7_days');
      } else if (startDate === advancedStart && endDate === today) {
        setAutoRange('advanced');
      } else {
        setAutoRange('fixed');
      }
    }
  }, [isOpen, startDate, endDate]);

  const handleAutoRangeSelect = (type: AutoRangeType) => {
    setAutoRange(type);
    setIsDropdownOpen(false);

    // Set dates based on selection (Dynamic India Standard Time)
    if (type === 'today') {
      setTempStartDate(getISTDateString());
      setTempEndDate(getISTDateString());
    } else if (type === 'yesterday') {
      setTempStartDate(getDaysAgoIST(1));
      setTempEndDate(getDaysAgoIST(1));
    } else if (type === 'this_month') {
      setTempStartDate(getISTFirstDayOfMonth());
      setTempEndDate(getISTLastDayOfMonth());
    } else if (type === 'last_7_days') {
      setTempStartDate(getDaysAgoIST(6));
      setTempEndDate(getISTDateString());
    } else if (type === 'advanced') {
      setTempStartDate(getDaysAgoIST(4));
      setTempEndDate(getISTDateString());
    }
  };

  const isInvalidRange = useMemo(() => {
    if (!tempStartDate || !tempEndDate) return false;
    return new Date(tempStartDate) > new Date(tempEndDate);
  }, [tempStartDate, tempEndDate]);

  const handleDayClick = (dateString: string, isStart: boolean) => {
    setAutoRange('fixed'); // manual override
    
    if (isStart) {
      setTempStartDate(dateString);
    } else {
      setTempEndDate(dateString);
    }
  };

  const formattedLabel = useMemo(() => {
    const formatDateStr = (str: string) => {
      if (!str) return "...";
      const [y, m, d] = str.split("-");
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthIndex = parseInt(m) - 1;
      return `${monthNames[monthIndex]} ${parseInt(d)}, ${y}`;
    };

    const today = getISTDateString();
    const yesterday = getDaysAgoIST(1);

    if (startDate === endDate) {
      if (startDate === today) return `${formatDateStr(startDate)} (Today)`;
      if (startDate === yesterday) return `${formatDateStr(startDate)} (Yesterday)`;
      return formatDateStr(startDate);
    }
    return `${formatDateStr(startDate)} - ${formatDateStr(endDate)}`;
  }, [startDate, endDate]);

  const handleApply = () => {
    if (tempStartDate) {
      const finalEnd = tempEndDate || tempStartDate;
      onChange(tempStartDate, finalEnd);
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  // Days in month calculator
  const getDaysInMonthGrid = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    
    // First day of interest
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday, 1 is Monday
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const cells = [];
    // Padding
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push(null);
    }
    // Days
    for (let i = 1; i <= daysCount; i++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      cells.push(`${year}-${mStr}-${dStr}`);
    }
    return cells;
  };

  const renderCalendar = (monthDate: Date, setMonthDate: (d: Date) => void, isStart: boolean) => {
    const grid = getDaysInMonthGrid(monthDate);
    const monthLabel = monthDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const yearLabel = monthDate.getFullYear();

    const changeMonth = (direction: number) => {
      setMonthDate(new Date(monthDate.getFullYear(), monthDate.getMonth() + direction, 1));
    };

    return (
      <div className="w-56 select-none">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 transition-colors">
            <span className="font-sans font-extrabold text-[#111827] text-xs tracking-wider">
              {monthLabel} {yearLabel}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </div>
          <div className="flex items-center gap-1">
            <button 
              type="button" 
              onClick={() => changeMonth(-1)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => changeMonth(1)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
          <span>S</span>
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
        </div>

        {/* Calendar Grid */}
        <div className="text-center font-sans font-extrabold text-[10px] text-slate-400 mb-2 px-1 text-left">
          {monthLabel}
        </div>
        
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {grid.map((cellStr, idx) => {
            if (!cellStr) return <div key={`empty-${idx}`} className="h-8" />;
            
            const dayNum = parseInt(cellStr.split("-")[2]);
            const isSelected = isStart ? tempStartDate === cellStr : tempEndDate === cellStr;

            return (
              <button
                key={cellStr}
                type="button"
                onClick={() => handleDayClick(cellStr, isStart)}
                className={`h-7 w-7 rounded-full flex items-center justify-center font-bold transition-all relative cursor-pointer text-[11px]
                  ${isSelected 
                    ? 'bg-slate-800 text-white shadow-sm font-sans scale-105 z-10' 
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                {dayNum}
                {/* Specific circled display helper as in Picture 1 */}
                {isSelected && (
                  <span className="absolute inset-0 border border-slate-600 rounded-full scale-110 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const getAutoRangeLabel = (type: AutoRangeType) => {
    switch (type) {
      case 'fixed': return 'Fixed';
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'this_month': return 'This month';
      case 'last_7_days': return 'Last 7 days';
      case 'advanced': return 'Advanced';
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef} id="date-range-picker-container">
      {/* Trigger Button */}
      <button
        type="button"
        id="date-range-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs py-2 px-3.5 rounded-xl border border-slate-200 shadow-xs cursor-pointer select-none transition-all w-[240px] md:w-[260px]"
      >
        <span className="flex items-center gap-1.5 truncate text-indigo-600 font-sans">
          <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="truncate text-slate-700 font-bold">{formattedLabel}</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {/* Popover pane */}
      {isOpen && (
        <div 
          id="date-range-picker-panel"
          className="absolute left-0 mt-2 bg-[#e5e7eb] rounded-2xl shadow-xl border border-slate-300 z-50 p-0 text-slate-800 animate-fade-in overflow-hidden w-full max-w-[550px] sm:w-[540px]"
        >
          {/* Top Panel Bar containing the Auto date range selection */}
          <div className="bg-[#e5e7eb] py-3.5 px-4 flex items-center justify-between border-b border-slate-300">
            <span className="text-xs font-bold text-slate-600">Period Configuration</span>
            
            {/* Auto Range Select Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                id="auto-date-range-dropdown-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white hover:bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 text-slate-700 cursor-pointer shadow-xs whitespace-nowrap min-w-[140px] justify-between"
              >
                <span>{getAutoRangeLabel(autoRange)}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isDropdownOpen && (
                <div 
                  id="auto-date-range-dropdown-menu"
                  className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1.5 w-40 text-left font-sans text-xs font-semibold"
                >
                  {(['fixed', 'today', 'yesterday', 'this_month', 'last_7_days', 'advanced'] as AutoRangeType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleAutoRangeSelect(type)}
                      className={`w-full px-3.5 py-1.5 flex items-center justify-between text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer ${autoRange === type ? 'bg-indigo-50/50 text-indigo-700 font-bold' : ''}`}
                    >
                      <span>{getAutoRangeLabel(type)}</span>
                      {autoRange === type && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warning banner if start date > end date */}
          {isInvalidRange && (
            <div className="bg-[#fff1f2] border border-rose-200 px-4 py-2.5 flex items-center gap-2 text-xs text-rose-800 font-bold animate-fade-in mx-5 mt-3 rounded-xl shadow-xs">
              <span className="flex items-center justify-center bg-rose-200 text-rose-700 rounded-full w-5 h-5 font-extrabold text-center select-none text-[12px] shrink-0">
                !
              </span>
              <span>End date is earlier than start date</span>
            </div>
          )}

          {/* Dual Calendars display */}
          <div className="bg-white p-5 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-indigo-50">
            {/* Start Date Calendar Column */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold text-slate-450 pl-1 mb-2 uppercase tracking-wider">Start Date</span>
              {renderCalendar(startCalendarMonth, setStartCalendarMonth, true)}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-[1px] bg-slate-200 self-stretch mt-6" />

            {/* End Date Calendar Column */}
            <div className="space-y-1">
              <span className="block text-[11px] font-bold text-slate-450 pl-1 mb-2 uppercase tracking-wider">End Date</span>
              {renderCalendar(endCalendarMonth, setEndCalendarMonth, false)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white p-4 flex items-center justify-end gap-2 px-5">
            <button
              type="button"
              id="date-range-cancel-btn"
              onClick={handleCancel}
              className="px-4 py-2 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              id="date-range-apply-btn"
              onClick={handleApply}
              disabled={isInvalidRange || !tempStartDate || !tempEndDate}
              className="px-4 py-2 bg-[#e5e7eb] hover:bg-indigo-600 hover:text-white text-slate-800 font-extrabold text-xs rounded-xl cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
