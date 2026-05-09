"use client";

import { useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  fallbackHref = "/personal/goals",
  label = "返回上一页",
  className = "",
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    // 微信等内置浏览器历史栈可能不可用，兜底跳到 fallback 页面
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`rounded-full border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 ${className}`}
    >
      ← {label}
    </button>
  );
}
