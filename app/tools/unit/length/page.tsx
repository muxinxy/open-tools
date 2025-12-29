'use client';

import { useState } from 'react';
import Link from 'next/link';

const units = [
  { id: 'm', name: '米 (m)', ratio: 1 },
  { id: 'km', name: '千米 (km)', ratio: 1000 },
  { id: 'cm', name: '厘米 (cm)', ratio: 0.01 },
  { id: 'mm', name: '毫米 (mm)', ratio: 0.001 },
  { id: 'inch', name: '英寸 (inch)', ratio: 0.0254 },
  { id: 'ft', name: '英尺 (ft)', ratio: 0.3048 },
  { id: 'yd', name: '码 (yd)', ratio: 0.9144 },
  { id: 'mi', name: '英里 (mi)', ratio: 1609.344 },
];

export default function LengthConverterPage() {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');

  const convert = (val: string, from: string, to: string) => {
    if (!val) return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';

    const fromRatio = units.find((u) => u.id === from)?.ratio || 1;
    const toRatio = units.find((u) => u.id === to)?.ratio || 1;

    const result = (num * fromRatio) / toRatio;
    
    // Format to avoid floating point errors but keep precision
    if (Number.isInteger(result)) return result.toString();
    return parseFloat(result.toFixed(6)).toString();
  };

  const result = convert(value, fromUnit, toUnit);

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

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            长度转换工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持米、千米、英尺、英里等常用长度单位转换
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          <div className="grid gap-6 md:grid-cols-[1fr,auto,1fr]">
            {/* From */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                从
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="输入数值"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex items-center justify-center pt-6">
              <button
                onClick={() => {
                  setFromUnit(toUnit);
                  setToUnit(fromUnit);
                }}
                className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                title="交换单位"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            </div>

            {/* To */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                到
              </label>
              <div className="flex h-[50px] items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white">
                {result || '...'}
              </div>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="rounded-md border border-gray-300 p-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setValue('')}
              className="rounded-md bg-red-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              清空
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
