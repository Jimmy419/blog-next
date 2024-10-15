"use client";
import { useState } from "react";

interface CopyCodeProps {
  code: string;
}

const CopyCode: React.FC<CopyCodeProps> = ({ code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="relative mb-4 rounded-md border border-gray-300 bg-gray-100 dark:bg-gray-800 p-4">
      <pre className="overflow-auto text-sm text-gray-800 dark:text-gray-200">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        {isCopied ? "已复制" : "复制"}
      </button>
    </div>
  );
};

export default CopyCode;
