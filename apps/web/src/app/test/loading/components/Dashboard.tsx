'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  ChevronRight, 
  PieChart, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Transaction } from '../types';

interface DashboardProps {
  onRestartLoader: () => void;
  primaryColor: string;
}

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2026-07-02', category: '식비', amount: 15000, type: 'expense', description: '점심 순대국밥', rawNote: '점심 순대국밥 15,000원 식비' },
  { id: '2', date: '2026-07-02', category: '카페', amount: 5500, type: 'expense', description: '스타벅스 아메리카노', rawNote: '스타벅스 아메리카노 5,500원 카페' },
  { id: '3', date: '2026-07-01', category: '수입', amount: 3500000, type: 'income', description: '7월 정기 급여', rawNote: '정기 급여 3,500,000원 수입' },
  { id: '4', date: '2026-06-30', category: '교통비', amount: 1250, type: 'expense', description: '지하철 하차', rawNote: '지하철 하차 1,250원 교통비' },
  { id: '5', date: '2026-06-29', category: '문화생활', amount: 22000, type: 'expense', description: '영화 예매', rawNote: '영화 예매 22,000원 문화생활' },
];

export default function Dashboard({ onRestartLoader, primaryColor }: DashboardProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [noteText, setNoteText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [budget, setBudget] = useState(1000000); // 1,000,000 KRW
  const [parseError, setParseError] = useState<string | null>(null);

  // Map theme values to Tailwind color classes or inline colors
  const getColorHex = (colorName: string) => {
    switch (colorName) {
      case 'emerald': return '#10b981';
      case 'indigo': return '#6366f1';
      case 'rose': return '#f43f5e';
      case 'amber': return '#f59e0b';
      case 'sky': return '#0ea5e9';
      default: return '#10b981';
    }
  };

  const primaryColorHex = getColorHex(primaryColor);

  // Parsing helper (Natural Language parsing simulation)
  const parseNaturalLanguageNote = (note: string): Partial<Transaction> | null => {
    // Expected patterns:
    // "점심 삼겹살 45000원 식비" -> desc: 점심 삼겹살, amount: 45000, cat: 식비, type: expense
    // "용돈 50000원 수입" -> desc: 용돈, amount: 50000, cat: 수입, type: income
    const trimmed = note.trim();
    if (!trimmed) return null;

    // Try parsing amount: look for digits followed by "원" or just digits
    const amountRegex = /(\d{1,3}(,\d{3})*|\d+)\s*원/;
    const amountMatch = trimmed.match(amountRegex);
    let amount = 0;
    if (amountMatch) {
      amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
    } else {
      // fallback to just any group of digits
      const digitMatch = trimmed.match(/\d+/);
      if (digitMatch) {
        amount = parseInt(digitMatch[0], 10);
      }
    }

    if (!amount || isNaN(amount)) return null;

    // Try finding category (usually at the very end or near amount)
    const categories = ['식비', '카페', '교통비', '마트', '쇼핑', '문화생활', '수입', '급여', '의료', '기타'];
    let category = '기타';
    let isIncome = false;

    for (const cat of categories) {
      if (trimmed.includes(cat)) {
        category = cat;
        if (cat === '수입' || cat === '급여') {
          isIncome = true;
        }
        break;
      }
    }

    // Determine description: strip out amount and category
    let description = trimmed
      .replace(amountRegex, '')
      .replace(new RegExp(category, 'g'), '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!description) {
      description = isIncome ? '추가 수입' : '추가 지출';
    }

    return {
      amount,
      category,
      type: isIncome ? 'income' : 'expense',
      description,
      rawNote: note,
    };
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setIsParsing(true);
    setParseError(null);

    // Simulate AI / NLP parsing with a slight delay
    setTimeout(() => {
      const parsed = parseNaturalLanguageNote(noteText);
      
      if (parsed) {
        const newTx: Transaction = {
          id: Math.random().toString(),
          date: new Date().toISOString().split('T')[0],
          category: parsed.category || '기타',
          amount: parsed.amount || 0,
          type: parsed.type || 'expense',
          description: parsed.description || '메모 기입 건',
          rawNote: parsed.rawNote || noteText,
        };
        setTransactions(prev => [newTx, ...prev]);
        setNoteText('');
      } else {
        setParseError('금액(예: 10000원)과 카테고리를 포함해 입력해 주세요.');
      }
      setIsParsing(false);
    }, 1200);
  };

  const handleDeleteTx = (id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Calculations
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentBalance = totalIncome - totalExpense;
  const budgetProgress = Math.min((totalExpense / budget) * 100, 100);

  // Group by category for charts
  const categoryTotals: { [key: string]: number } = {};
  transactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

  const chartData = Object.keys(categoryTotals).map(cat => ({
    category: cat,
    amount: categoryTotals[cat],
    percentage: totalExpense > 0 ? (categoryTotals[cat] / totalExpense) * 100 : 0,
  })).sort((a, b) => b.amount - a.amount);

  const getCategoryColor = (cat: string) => {
    const colors: { [key: string]: string } = {
      '식비': 'bg-rose-100 text-rose-700 font-bold',
      '카페': 'bg-amber-100 text-amber-700 font-bold',
      '교통비': 'bg-sky-100 text-sky-700 font-bold',
      '마트': 'bg-indigo-100 text-indigo-700 font-bold',
      '문화생활': 'bg-purple-100 text-purple-700 font-bold',
      '쇼핑': 'bg-pink-100 text-pink-700 font-bold',
      '수입': 'bg-emerald-100 text-emerald-700 font-bold',
      '급여': 'bg-emerald-100 text-emerald-700 font-bold',
      '기타': 'bg-gray-100 text-gray-700 font-bold',
    };
    return colors[cat] || 'bg-gray-100 text-gray-700 font-bold';
  };

  const getCategoryColorHex = (cat: string) => {
    const colors: { [key: string]: string } = {
      '식비': '#e11d48',
      '카페': '#d97706',
      '교통비': '#0284c7',
      '마트': '#4f46e5',
      '문화생활': '#9333ea',
      '쇼핑': '#db2777',
      '기타': '#4b5563',
    };
    return colors[cat] || '#4b5563';
  };

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] text-slate-800 pb-16">
      {/* Upper Brand Nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/85 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-xl">
                💰
              </div>
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-gray-900 flex items-center gap-1.5">
                <span>iNote Money</span>
                <span className="text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">LIGHT VER</span>
              </h1>
              <p className="text-[11px] text-gray-500 font-medium">자연어 지능형 지출 메모 및 실시간 리포트</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onRestartLoader}
              className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 border border-gray-250 hover:border-gray-300 transition flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>로딩 화면 다시보기</span>
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-green-200 bg-green-50 text-xs text-green-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>실시간 원장 연동 완료</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="max-w-6xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Overview Cards & Dynamic Notepad (7/12 width) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Summary Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Balance */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-3">
                <span>현재 총 자산</span>
                <Wallet className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-xl font-extrabold font-mono tracking-tight text-gray-900">
                ₩ {currentBalance.toLocaleString()}
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-medium">실시간 수입-지출 잔액</p>
            </div>

            {/* Total Income */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-3">
                <span>이번 달 수입</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-extrabold font-mono tracking-tight text-emerald-600">
                + ₩ {totalIncome.toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-700/80 mt-1 font-semibold">수입 메모 파싱 완료</p>
            </div>

            {/* Total Expense */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200/90 shadow-[0_4px_14px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between text-gray-500 text-xs font-semibold mb-3">
                <span>이번 달 소비</span>
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-extrabold font-mono tracking-tight text-rose-600">
                - ₩ {totalExpense.toLocaleString()}
              </div>
              <p className="text-[10px] text-rose-700/80 mt-1 font-semibold">지출 메모 파싱 완료</p>
            </div>
          </div>

          {/* AI Parsing Notepad */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-lg relative overflow-hidden">
            {/* Background design glow */}
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full blur-[60px] opacity-[0.08] pointer-events-none" style={{ backgroundColor: primaryColorHex }} />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-green-600" />
                <h2 className="text-sm font-extrabold text-gray-900">지능형 가계부 메모장</h2>
              </div>
              <div className="text-[10px] text-gray-500 font-semibold flex items-center gap-1.5 bg-gray-100 px-2 py-0.5 rounded-full">
                <FileText className="w-3 h-3 text-gray-400" />
                <span>자연어 인공지능 지원</span>
              </div>
            </div>

            {/* Notepad Textarea */}
            <div className="relative">
              <textarea
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                  if (parseError) setParseError(null);
                }}
                placeholder="지출 및 수입 내역을 편하게 적어보세요.&#10;예) 스타벅스 카페 라떼 5500원 식비&#10;예) 오늘 저녁 삼겹살 42000원 외식"
                disabled={isParsing}
                className="w-full h-32 p-4 bg-gray-50 text-sm text-gray-800 rounded-2xl border border-gray-200 focus:border-gray-300 focus:bg-white focus:ring-1 focus:ring-gray-200 outline-none resize-none transition-all placeholder:text-gray-400 leading-relaxed font-sans"
              />

              {/* Parsing Loader Overlay */}
              <AnimatePresence>
                {isParsing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center text-center p-4 border border-gray-200 shadow-inner"
                  >
                    <div className="relative w-12 h-12 flex items-center justify-center mb-3">
                      <div className="absolute inset-0 rounded-full border-2 border-green-500/10 animate-ping" />
                      <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
                    </div>
                    <p className="text-xs font-bold text-green-700">AI가 지출 메모를 분석하는 중...</p>
                    <p className="text-[10px] text-gray-400 mt-1">금액, 카테고리, 태그 추출 중</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Help guidelines & error alerts */}
            <div className="mt-3 flex flex-wrap gap-2 items-center justify-between">
              {parseError ? (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{parseError}</span>
                </div>
              ) : (
                <div className="text-[11px] text-gray-500 flex items-center gap-1 font-medium">
                  <span>💡 다음을 클릭하여 예시를 바로 테스트 해보세요:</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() || isParsing}
                className="ml-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shadow-[0_4px_14px_rgba(22,163,74,0.3)] hover:brightness-105 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                style={{ backgroundColor: primaryColorHex }}
              >
                <Plus className="w-4 h-4" />
                <span>원장 기록하기</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                '오늘 저녁 삼겹살 회식 78,000원 식비',
                '스타벅스 디카페인 라떼 5,300원 카페',
                '정기 용돈 지원금 150,000원 수입',
                '지하철 정기 충전 50,000원 교통비',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setNoteText(preset);
                    if (parseError) setParseError(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 text-xs text-gray-600 hover:text-gray-900 font-medium transition-all text-left shadow-sm"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Budget ring controller */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-md">
            <h2 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <span>이번 달 예산 설계 및 소비 통제</span>
            </h2>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Simple budget bar */}
              <div className="flex-1 w-full space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-500 font-bold">
                  <span>예산 한도 한계 조절:</span>
                  <span className="font-extrabold font-mono text-gray-900">₩ {budget.toLocaleString()}</span>
                </div>
                
                <input 
                  type="range"
                  min="500000"
                  max="5000000"
                  step="100000"
                  value={budget}
                  onChange={(e) => setBudget(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                />

                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-gray-500">현재 총 소비 비율:</span>
                    <span className={`font-extrabold font-mono ${budgetProgress > 85 ? 'text-rose-600' : 'text-green-600'}`}>
                      {budgetProgress.toFixed(1)}%
                    </span>
                  </div>
                  
                  {/* Gauge bar */}
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-[2px] border border-gray-200">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r"
                      style={{ 
                        backgroundImage: budgetProgress > 85 
                          ? 'linear-gradient(to right, #ef4444, #f43f5e)' 
                          : `linear-gradient(to right, ${primaryColorHex}, #10b981)`,
                        width: `${budgetProgress}%` 
                      }}
                      animate={{ width: `${budgetProgress}%` }}
                      transition={{ type: "spring", stiffness: 60 }}
                    />
                  </div>
                </div>
              </div>

              {/* Status Indicator bubble */}
              <div className="w-full md:w-auto px-5 py-4 rounded-2xl bg-gray-50 border border-gray-200 text-center flex flex-col justify-center items-center">
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">상태</div>
                {budgetProgress > 90 ? (
                  <div className="text-xs font-bold text-rose-700 flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 border border-rose-200">
                    <span>⚠️ 초과 위험</span>
                  </div>
                ) : budgetProgress > 70 ? (
                  <div className="text-xs font-bold text-amber-700 flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                    <span>⚠️ 소비 주의</span>
                  </div>
                ) : (
                  <div className="text-xs font-bold text-green-700 flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 border border-green-200">
                    <span>✨ 아주 여유로움</span>
                  </div>
                )}
                <span className="text-[10px] text-gray-500 font-medium mt-2 font-mono">
                  남은 예산: ₩ {Math.max(budget - totalExpense, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Transactions and Category breakdown (5/12 width) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Custom Visual Category Breakdown Chart (SVG and HTML bars) */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-md">
            <h2 className="text-sm font-extrabold text-gray-900 mb-5 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-green-600" />
              <span>소비 카테고리 분포 리포트</span>
            </h2>

            {chartData.length > 0 ? (
              <div className="space-y-6">
                
                {/* Micro SVG Ring representation */}
                <div className="flex items-center justify-center gap-8 py-2">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="46" fill="transparent" className="stroke-gray-100" strokeWidth="12" />
                      {/* Segmented layout calculation */}
                      {(() => {
                        let accumulatedOffset = 0;
                        const totalCircumference = 2 * Math.PI * 46;

                        return chartData.map((item, idx) => {
                           const percentage = item.percentage;
                           const strokeLength = (percentage / 100) * totalCircumference;
                           const strokeOffset = totalCircumference - strokeLength + accumulatedOffset;
                           accumulatedOffset -= strokeLength;

                           return (
                             <circle
                               key={idx}
                               cx="56"
                               cy="56"
                               r="46"
                               fill="transparent"
                               stroke={getCategoryColorHex(item.category)}
                               strokeWidth="12"
                               strokeDasharray={totalCircumference}
                               strokeDashoffset={strokeOffset}
                             />
                           );
                        });
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] text-gray-400 font-bold">총 지출</span>
                      <span className="text-xs font-extrabold text-gray-900">₩{totalExpense >= 10000 ? `${(totalExpense / 10000).toFixed(1)}만` : totalExpense}</span>
                    </div>
                  </div>

                  {/* Legend lists */}
                  <div className="space-y-1.5 flex-1 max-w-[160px]">
                    {chartData.slice(0, 4).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColorHex(item.category) }} />
                          <span>{item.category}</span>
                        </div>
                        <span className="font-mono text-gray-500 font-semibold">{Math.round(item.percentage)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress-style visualizer lists */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {chartData.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-700">{item.category}</span>
                        <div className="font-mono space-x-1.5">
                          <span className="text-gray-900">₩ {item.amount.toLocaleString()}</span>
                          <span className="text-gray-400">({Math.round(item.percentage)}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full rounded-full"
                          style={{ backgroundColor: getCategoryColorHex(item.category) }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 font-bold">
                지출 기록이 존재하지 않아 차트를 그릴 수 없습니다.
              </div>
            )}
          </div>

          {/* Transactions List */}
          <div className="p-6 rounded-3xl bg-white border border-gray-200/90 shadow-md flex flex-col h-[400px]">
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                <span>원장 내역기록</span>
              </h2>
              <span className="text-[10px] font-bold font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">TOTAL: {transactions.length}</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
              <AnimatePresence initial={false}>
                {transactions.map((tx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-3.5 rounded-2xl bg-gray-50 border border-gray-150/80 hover:border-gray-300 transition-all flex justify-between items-center group relative overflow-hidden shadow-sm"
                  >
                    {/* Left content description */}
                    <div className="flex items-center gap-3">
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider ${getCategoryColor(tx.category)}`}>
                        {tx.category}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-950 leading-tight">
                          {tx.description}
                        </div>
                        <div className="text-[9px] text-gray-400 font-mono mt-0.5 font-semibold">
                          {tx.date} • {tx.rawNote}
                        </div>
                      </div>
                    </div>

                    {/* Right side amount + trash */}
                    <div className="flex items-center gap-2.5 z-10">
                      <div className={`text-xs font-bold font-mono ${tx.type === 'income' ? 'text-emerald-600' : 'text-gray-800'}`}>
                        {tx.type === 'income' ? '+' : '-'} ₩{tx.amount.toLocaleString()}
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteTx(tx.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {transactions.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                  <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs font-semibold">내역이 완전히 비어있습니다.</p>
                  <p className="text-[10px] text-gray-400 mt-1">상단 가계부 메모장에 적어 추가해 보세요.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
