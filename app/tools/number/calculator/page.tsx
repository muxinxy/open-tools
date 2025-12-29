'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CalculatorPage() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setIsNewNumber(true);
  };

  const calculate = () => {
    try {
      const result = eval(equation + display);
      setDisplay(String(result));
      setEquation('');
      setIsNewNumber(true);
    } catch (error) {
      setDisplay('Error');
      setEquation('');
      setIsNewNumber(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  const buttons = [
    { label: 'C', onClick: clear, className: 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400' },
    { label: '(', onClick: () => handleNumber('('), className: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600' },
    { label: ')', onClick: () => handleNumber(')'), className: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600' },
    { label: '/', onClick: () => handleOperator('/'), className: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: '7', onClick: () => handleNumber('7'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '8', onClick: () => handleNumber('8'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '9', onClick: () => handleNumber('9'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '*', onClick: () => handleOperator('*'), className: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: '4', onClick: () => handleNumber('4'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '5', onClick: () => handleNumber('5'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '6', onClick: () => handleNumber('6'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '-', onClick: () => handleOperator('-'), className: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: '1', onClick: () => handleNumber('1'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '2', onClick: () => handleNumber('2'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '3', onClick: () => handleNumber('3'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '+', onClick: () => handleOperator('+'), className: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400' },
    { label: '0', onClick: () => handleNumber('0'), className: 'col-span-2 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '.', onClick: () => handleNumber('.'), className: 'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700' },
    { label: '=', onClick: calculate, className: 'bg-blue-600 text-white hover:bg-blue-700' },
  ];

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

      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            在线计算器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            简单易用的在线计算工具
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Display */}
          <div className="bg-gray-50 p-6 text-right dark:bg-gray-900">
            <div className="h-6 text-sm text-gray-500 dark:text-gray-400">
              {equation}
            </div>
            <div className="mt-2 overflow-x-auto text-4xl font-bold text-gray-900 dark:text-white">
              {display}
            </div>
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-1 bg-gray-200 p-1 dark:bg-gray-700">
            {buttons.map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className={`flex h-16 items-center justify-center text-xl font-medium transition-colors ${btn.className}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
