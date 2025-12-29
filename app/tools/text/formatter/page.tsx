'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TextFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'json'>('json');
  const [copied, setCopied] = useState(false);

  const formatText = () => {
    setError('');
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'json') {
        const parsed = JSON.parse(input);
        setOutput(JSON.stringify(parsed, null, 2));
      }
    } catch (err) {
      setError('无效的 JSON 格式');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          ← 返回首页
        </Link>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            文本格式化工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持 JSON 等格式的美化和压缩
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              输入
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[180px] resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={10}
              placeholder="在此输入 JSON..."
            />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              输出
            </label>
            <div className="relative flex-1">
              <textarea
                readOnly
                value={output}
                className={`min-h-[180px] w-full resize-y rounded-md border p-3 font-mono text-sm focus:outline-none ${
                  error
                    ? 'border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-900/20 dark:text-red-200'
                    : 'border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
                }`}
                rows={10}
                placeholder="格式化后的结果将显示在这里..."
              />
              {error && (
                <div className="absolute bottom-4 left-4 right-4 rounded bg-red-100 p-2 text-sm text-red-600 dark:bg-red-900/50 dark:text-red-200">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            onClick={formatText}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            格式化
          </button>
          <button
            onClick={() => {
              try {
                const parsed = JSON.parse(input);
                setOutput(JSON.stringify(parsed));
                setError('');
              } catch (err) {
                setError('无效的 JSON 格式');
              }
            }}
            className="rounded-md bg-gray-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            压缩
          </button>
          <button
            onClick={() => {
              setInput('');
              setOutput('');
              setError('');
            }}
            className="rounded-md bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            清空
          </button>
          {output && (
            <button
              onClick={copyToClipboard}
              className={`ml-auto rounded-md border px-6 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                copied
                  ? 'border-green-500 bg-green-50 text-green-700 dark:border-green-500 dark:bg-green-900/20 dark:text-green-400'
                  : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {copied ? '已复制！' : '复制结果'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
