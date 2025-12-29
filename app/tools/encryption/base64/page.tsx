'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Base64Page() {
  const [plainText, setPlainText] = useState('');
  const [base64Text, setBase64Text] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'plain' | 'base64' | null>(null);

  const encode = () => {
    setError('');
    if (!plainText) {
      setBase64Text('');
      return;
    }
    try {
      const encoded = btoa(
        encodeURIComponent(plainText).replace(/%([0-9A-F]{2})/g,
          function toSolidBytes(match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        })
      );
      setBase64Text(encoded);
    } catch (e) {
      setError('编码失败');
    }
  };

  const decode = () => {
    setError('');
    if (!base64Text) {
      setPlainText('');
      return;
    }
    try {
      const decoded = decodeURIComponent(
        atob(base64Text)
          .split('')
          .map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join('')
      );
      setPlainText(decoded);
    } catch (e) {
      setError('解码失败：无效的 Base64 字符串');
    }
  };

  const copyToClipboard = (value: string, target: 'plain' | 'base64') => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(target);
    setTimeout(() => setCopied(null), 2000);
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
            Base64 编码/解码
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            在线 Base64 编码和解码工具，支持 UTF-8 字符
          </p>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          {/* Plain text field */}
          <div className="flex flex-1 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                文本内容
              </label>
              <button
                onClick={() => copyToClipboard(plainText, 'plain')}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {copied === 'plain' ? '已复制' : '复制文本'}
              </button>
            </div>
            <textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              className="min-h-[180px] resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={10}
              placeholder="输入或编辑文本..."
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center gap-4 md:w-44 md:flex-none">
            <button
              onClick={encode}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              文本 → Base64
            </button>
            <button
              onClick={decode}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Base64 → 文本
            </button>
            <button
              onClick={() => {
                setPlainText('');
                setBase64Text('');
                setError('');
              }}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              清空
            </button>
          </div>

          {/* Base64 field */}
          <div className="flex flex-1 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Base64 字符串
              </label>
              <button
                onClick={() => copyToClipboard(base64Text, 'base64')}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {copied === 'base64' ? '已复制' : '复制 Base64'}
              </button>
            </div>
            <textarea
              value={base64Text}
              onChange={(e) => setBase64Text(e.target.value)}
              className={`min-h-[180px] resize-y rounded-md border p-3 font-mono text-sm focus:outline-none ${
                error
                  ? 'border-red-500 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-900/20 dark:text-red-200'
                  : 'border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white'
              }`}
              rows={10}
              placeholder="输入或编辑 Base64..."
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
