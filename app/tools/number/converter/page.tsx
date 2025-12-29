'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function NumberConverterPage() {
  const [values, setValues] = useState({
    binary: '',
    octal: '',
    decimal: '',
    hex: '',
  });

  const updateValues = (value: string, fromBase: number) => {
    if (!value) {
      setValues({ binary: '', octal: '', decimal: '', hex: '' });
      return;
    }

    try {
      const decimal = parseInt(value, fromBase);
      if (isNaN(decimal)) {
        // Don't update if invalid
        return;
      }

      setValues({
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        decimal: decimal.toString(10),
        hex: decimal.toString(16).toUpperCase(),
      });
    } catch (e) {
      // Ignore errors
    }
  };

  const handleChange = (value: string, base: number) => {
    // Validate input based on base
    let isValid = false;
    if (base === 2) isValid = /^[01]*$/.test(value);
    else if (base === 8) isValid = /^[0-7]*$/.test(value);
    else if (base === 10) isValid = /^[0-9]*$/.test(value);
    else if (base === 16) isValid = /^[0-9A-Fa-f]*$/.test(value);

    if (isValid) {
      // Temporarily set the specific field to allow typing
      const newValues = { ...values };
      if (base === 2) newValues.binary = value;
      else if (base === 8) newValues.octal = value;
      else if (base === 10) newValues.decimal = value;
      else if (base === 16) newValues.hex = value;
      
      setValues(newValues);
      
      // Update others if value is not empty
      if (value) {
        updateValues(value, base);
      } else {
        setValues({ binary: '', octal: '', decimal: '', hex: '' });
      }
    }
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

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            进制转换工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            二进制、八进制、十进制、十六进制实时转换
          </p>
        </div>

        <div className="grid gap-6 rounded-lg border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
          {/* Decimal */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              十进制 (Decimal)
            </label>
            <input
              type="text"
              value={values.decimal}
              onChange={(e) => handleChange(e.target.value, 10)}
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="0-9"
            />
          </div>

          {/* Binary */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              二进制 (Binary)
            </label>
            <input
              type="text"
              value={values.binary}
              onChange={(e) => handleChange(e.target.value, 2)}
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="0-1"
            />
          </div>

          {/* Octal */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              八进制 (Octal)
            </label>
            <input
              type="text"
              value={values.octal}
              onChange={(e) => handleChange(e.target.value, 8)}
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="0-7"
            />
          </div>

          {/* Hex */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              十六进制 (Hexadecimal)
            </label>
            <input
              type="text"
              value={values.hex}
              onChange={(e) => handleChange(e.target.value, 16)}
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="0-9, A-F"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setValues({ binary: '', octal: '', decimal: '', hex: '' })}
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
