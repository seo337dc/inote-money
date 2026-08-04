'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AccountBookError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-stone-700">
      <p className="text-sm font-medium">가계부를 불러오는 중 문제가 발생했어요.</p>
      <p className="text-xs text-stone-400">일시적인 오류예요. 다시 시도해주세요.</p>
      <button
        onClick={reset}
        className="mt-2 flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        다시 시도
      </button>
    </div>
  );
}
