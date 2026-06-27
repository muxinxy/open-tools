'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function UrlEncoderPage() {
  const [plainText, setPlainText] = useState('');
  const [encodedText, setEncodedText] = useState('');
  const [copied, setCopied] = useState<'plain' | 'encoded' | null>(null);

  const encode = () => {
    if (!plainText) {
      setEncodedText('');
      return;
    }
    try {
      const encoded = encodeURIComponent(plainText);
      setEncodedText(encoded);
    } catch (e) {
      console.error('编码失败', e);
    }
  };

  const decode = () => {
    if (!encodedText) {
      setPlainText('');
      return;
    }
    try {
      const decoded = decodeURIComponent(encodedText);
      setPlainText(decoded);
    } catch (e) {
      alert('解码失败：无效的 URL 编码字符串');
    }
  };

  const encodeUrl = () => {
    if (!plainText) {
      setEncodedText('');
      return;
    }
    try {
      const encoded = encodeURI(plainText);
      setEncodedText(encoded);
    } catch (e) {
      console.error('URL 编码失败', e);
    }
  };

  const copyToClipboard = (value: string, target: 'plain' | 'encoded') => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(target);
    setTimeout(() => setCopied(null), 2000);
  };

  const clearAll = () => {
    setPlainText('');
    setEncodedText('');
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
            URL 编码/解码
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            在线 URL 编码和解码工具，支持 encodeURIComponent 和 encodeURI
          </p>
        </div>

        {/* 按钮组 */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={encode}
            className="rounded-lg bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            编码（encodeURIComponent）
          </button>
          <button
            onClick={encodeUrl}
            className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            编码 URL（encodeURI）
          </button>
          <button
            onClick={decode}
            className="rounded-lg bg-purple-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            解码
          </button>
          <button
            onClick={clearAll}
            className="rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            清空
          </button>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-stretch">
          {/* 原始文本输入框 */}
          <div className="flex flex-1 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                原始文本
              </label>
              <button
                onClick={() => copyToClipboard(plainText, 'plain')}
                disabled={!plainText}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {copied === 'plain' ? '已复制 ✓' : '复制'}
              </button>
            </div>
            <textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              className="flex-1 min-h-[300px] resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              placeholder="输入需要编码的文本或 URL..."
            />
          </div>

          {/* 箭头指示 */}
          <div className="flex items-center justify-center md:flex-col">
            <div className="text-2xl text-gray-400">
              <span className="hidden md:inline">↓</span>
              <span className="md:hidden">→</span>
            </div>
          </div>

          {/* 编码后文本输出框 */}
          <div className="flex flex-1 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                编码后文本
              </label>
              <button
                onClick={() => copyToClipboard(encodedText, 'encoded')}
                disabled={!encodedText}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {copied === 'encoded' ? '已复制 ✓' : '复制'}
              </button>
            </div>
            <textarea
              value={encodedText}
              onChange={(e) => setEncodedText(e.target.value)}
              className="flex-1 min-h-[300px] resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
              placeholder="编码结果或输入需要解码的文本..."
            />
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-gray-800">
          <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
            📖 使用说明
          </h3>
          <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <strong>encodeURIComponent：</strong>编码所有特殊字符，适用于 URL 参数值
            </li>
            <li>
              <strong>encodeURI：</strong>保留 URL 结构字符（如 :、/、?、#），适用于完整 URL
            </li>
            <li>
              <strong>解码：</strong>自动识别并解码 URL 编码的文本
            </li>
            <li>
              例如：<code className="rounded bg-gray-200 px-1 dark:bg-gray-700">你好 世界</code> → 
              <code className="rounded bg-gray-200 px-1 dark:bg-gray-700">%E4%BD%A0%E5%A5%BD%20%E4%B8%96%E7%95%8C</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
