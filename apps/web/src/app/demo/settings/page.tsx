"use client";

import { useState, useEffect } from "react";
import { Moon, Sun, User } from "lucide-react";
import { useDarkMode } from "../dark-mode";

type Profile = {
  name: string;
  jobTitle: string;
  intro: string;
};

export default function SettingsPage() {
  const { isDark, toggle } = useDarkMode();
  const [profile, setProfile] = useState<Profile>({ name: "", jobTitle: "", intro: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const p = localStorage.getItem("inote-profile");
    if (p) setProfile(JSON.parse(p));
  }, []);

  const handleSave = () => {
    localStorage.setItem("inote-profile", JSON.stringify(profile));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const set = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="max-w-lg mx-auto px-4 lg:px-8 pt-6 pb-10">
      <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-6">설정</h1>

      <div className="flex flex-col gap-4">

        {/* 프로필 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-5">
            <User size={15} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500">프로필</p>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1.5">
                이름
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={set("name")}
                placeholder="홍길동"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1.5">
                직업 / 직책
              </label>
              <input
                type="text"
                value={profile.jobTitle}
                onChange={set("jobTitle")}
                placeholder="프론트엔드 개발자"
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 block mb-1.5">
                한 줄 소개
              </label>
              <textarea
                value={profile.intro}
                onChange={set("intro")}
                placeholder="절약하며 자유를 향해 달리는 중"
                rows={2}
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-green-200 dark:focus:ring-green-800 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-500 resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                saved
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {saved ? "저장됨 ✓" : "저장하기"}
            </button>
          </div>
        </div>

        {/* 앱 설정 */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-4">앱 설정</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon size={18} className="text-indigo-400" />
              ) : (
                <Sun size={18} className="text-amber-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">다크 모드</p>
                <p className="text-[11px] text-gray-400 dark:text-gray-500">
                  {isDark ? "어두운 테마 사용 중" : "밝은 테마 사용 중"}
                </p>
              </div>
            </div>

            {/* Toggle switch */}
            <button
              onClick={toggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                isDark ? "bg-indigo-500" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  isDark ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
