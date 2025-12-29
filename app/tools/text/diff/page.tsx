'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function TextDiffPage() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState<Array<{ type: 'same' | 'added' | 'removed'; content: string }>>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  const compareText = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const result: Array<{ type: 'same' | 'added' | 'removed'; content: string }> = [];

    let i = 0;
    let j = 0;

    while (i < lines1.length || j < lines2.length) {
      if (i < lines1.length && j < lines2.length && lines1[i] === lines2[j]) {
        result.push({ type: 'same', content: lines1[i] });
        i++;
        j++;
      } else if (j < lines2.length && (i >= lines1.length || !lines1.includes(lines2[j], i))) {
        result.push({ type: 'added', content: lines2[j] });
        j++;
      } else if (i < lines1.length && (j >= lines2.length || !lines2.includes(lines1[i], j))) {
        result.push({ type: 'removed', content: lines1[i] });
        i++;
      } else {
        // Fallback for complex changes, just mark as removed then added
        result.push({ type: 'removed', content: lines1[i] });
        result.push({ type: 'added', content: lines2[j] });
        i++;
        j++;
      }
    }
    setDiffResult(result);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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

      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            文本对比工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            比较两段文本的差异
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Text 1 */}
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              原始文本
            </label>
            <textarea
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="min-h-[180px] resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={10}
              placeholder="在此输入原始文本..."
            />
          </div>

          {/* Text 2 */}
          <div className="flex flex-col">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              修改后文本
            </label>
            <textarea
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="min-h-[180px] resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={10}
              placeholder="在此输入修改后文本..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={compareText}
            className="rounded-md bg-blue-600 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            开始对比
          </button>
          <button
            onClick={() => {
              setText1('');
              setText2('');
              setDiffResult([]);
            }}
            className="rounded-md bg-red-600 px-8 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            清空
          </button>
        </div>

        {/* Result */}
        {diffResult.length > 0 && (
          <div className="mt-8" ref={resultRef}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              对比结果
            </h2>
            <div className="rounded-md border border-gray-200 bg-white p-4 font-mono text-sm dark:border-gray-700 dark:bg-gray-800">
              {diffResult.map((line, index) => (
                <div
                  key={index}
                  className={`flex ${
                    line.type === 'added'
                      ? 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-100'
                      : line.type === 'removed'
                      ? 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100'
                      : 'text-gray-900 dark:text-gray-300'
                  }`}
                >
                  <span className="w-8 select-none px-2 text-right text-gray-400 opacity-50">
                    {index + 1}
                  </span>
                  <span className="w-8 select-none px-2 text-center font-bold">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <pre className="whitespace-pre-wrap">{line.content}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
