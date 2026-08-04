'use client';

import { useState } from 'react';
import { Profession } from '../types';
import { PROFESSIONS } from '../data/professions';
import {
  Stethoscope,
  Cpu,
  GraduationCap,
  Truck,
  Briefcase,
  Scale,
  CheckCircle2,
  Award
} from 'lucide-react';

interface ProfessionSelectModalProps {
  onSelectProfession: (profession: Profession) => void;
}

export function ProfessionSelectModal({ onSelectProfession }: ProfessionSelectModalProps) {
  const [selectedId, setSelectedId] = useState<string>(PROFESSIONS[1].id);
  const selectedProfession = PROFESSIONS.find((p) => p.id === selectedId) || PROFESSIONS[0];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope': return <Stethoscope className="w-6 h-6" />;
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'GraduationCap': return <GraduationCap className="w-6 h-6" />;
      case 'Truck': return <Truck className="w-6 h-6" />;
      case 'Briefcase': return <Briefcase className="w-6 h-6" />;
      case 'Scale': return <Scale className="w-6 h-6" />;
      default: return <Briefcase className="w-6 h-6" />;
    }
  };

  const totalExpenses =
    selectedProfession.taxes +
    selectedProfession.homeMortgage.expense +
    selectedProfession.schoolLoans.expense +
    selectedProfession.carLoans.expense +
    selectedProfession.creditCard.expense +
    selectedProfession.retailDebt.expense +
    selectedProfession.otherExpenses;

  const monthlyPayday = selectedProfession.salary - totalExpenses;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-stone-200 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest bg-black/20 px-2.5 py-1 rounded-full">
                쥐경주 탈출 보드게임
              </span>
              <h2 className="text-2xl font-bold mt-2">직업 및 재무제표 선택</h2>
              <p className="text-sm text-emerald-100 mt-1">
                직업마다 급여와 부채, 패시브 인컴 목표가 다릅니다. 원하는 직업 카드를 선택하세요.
              </p>
            </div>
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/10 items-center justify-center border border-white/20">
              <Award className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {PROFESSIONS.map((prof) => {
              const profTotalExp =
                prof.taxes + prof.homeMortgage.expense + prof.schoolLoans.expense +
                prof.carLoans.expense + prof.creditCard.expense + prof.retailDebt.expense + prof.otherExpenses;
              const profCashflow = prof.salary - profTotalExp;
              const isSelected = prof.id === selectedId;

              return (
                <button
                  key={prof.id}
                  onClick={() => setSelectedId(prof.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400'
                      : 'bg-white hover:bg-stone-50 border-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      isSelected ? 'bg-emerald-500 text-white' : 'bg-stone-100 text-stone-500'
                    }`}>
                      {getIcon(prof.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-base">{prof.nameKo}</span>
                        <span className="text-xs text-stone-400 font-medium">({prof.name})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-stone-400 mt-1">
                        <span>월급 <strong className="text-stone-700">${prof.salary.toLocaleString()}</strong></span>
                        <span>•</span>
                        <span>초기저축 <strong className="text-emerald-600">${prof.savings.toLocaleString()}</strong></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-stone-400">월 잉여현금</div>
                    <div className="text-emerald-600 font-bold text-sm">+${profCashflow.toLocaleString()}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-6 bg-stone-50 rounded-xl p-5 border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-stone-200 pb-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    {getIcon(selectedProfession.icon)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-stone-900">
                      {selectedProfession.nameKo}{' '}
                      <span className="text-sm font-normal text-stone-400">({selectedProfession.name})</span>
                    </h3>
                    <p className="text-xs text-stone-400">
                      초기 저축액: <span className="text-emerald-600 font-bold">${selectedProfession.savings.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-stone-400">목표 패시브 인컴</div>
                  <div className="text-sm font-bold text-blue-600">${totalExpenses.toLocaleString()}/월</div>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed mb-4 bg-white p-3 rounded-lg border border-stone-200">
                {selectedProfession.description}
              </p>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <div className="text-stone-400 mb-0.5">월급 (Salary)</div>
                    <div className="text-stone-900 font-bold text-sm">${selectedProfession.salary.toLocaleString()}</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <div className="text-stone-400 mb-0.5">월 총지출 (Total Expenses)</div>
                    <div className="text-rose-500 font-bold text-sm">${totalExpenses.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-stone-200">
                  <div className="text-xs font-semibold text-stone-600 mb-2">지출 및 부채 세부 내역</div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-500"><span>세금 (Taxes)</span><span className="text-stone-700">${selectedProfession.taxes.toLocaleString()}</span></div>
                    <div className="flex justify-between text-stone-500"><span>주택담보대출 (총 ${selectedProfession.homeMortgage.total.toLocaleString()})</span><span className="text-stone-700">${selectedProfession.homeMortgage.expense.toLocaleString()}</span></div>
                    <div className="flex justify-between text-stone-500"><span>학자금 대출 (총 ${selectedProfession.schoolLoans.total.toLocaleString()})</span><span className="text-stone-700">${selectedProfession.schoolLoans.expense.toLocaleString()}</span></div>
                    <div className="flex justify-between text-stone-500"><span>자동차 대출 (총 ${selectedProfession.carLoans.total.toLocaleString()})</span><span className="text-stone-700">${selectedProfession.carLoans.expense.toLocaleString()}</span></div>
                    <div className="flex justify-between text-stone-500"><span>신용카드 빚 (총 ${selectedProfession.creditCard.total.toLocaleString()})</span><span className="text-stone-700">${selectedProfession.creditCard.expense.toLocaleString()}</span></div>
                    <div className="flex justify-between text-stone-600 font-semibold border-t border-stone-100 pt-1.5"><span>기타 생활비 (Other)</span><span>${selectedProfession.otherExpenses.toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-stone-200 flex items-center justify-between">
              <div className="text-xs text-stone-400">
                월급날 수입: <strong className="text-emerald-600 text-sm">${monthlyPayday.toLocaleString()}</strong>
              </div>
              <button
                onClick={() => onSelectProfession(selectedProfession)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>이 직업으로 게임 시작</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
