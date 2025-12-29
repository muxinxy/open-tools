'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HashGeneratorPage() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<{ [key: string]: string }>({
    'SHA-1': '',
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': '',
  });
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const generateHashes = async () => {
      if (!input) {
        setHashes({
          'SHA-1': '',
          'SHA-256': '',
          'SHA-384': '',
          'SHA-512': '',
        });
        return;
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      const algorithms = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];
      const newHashes: { [key: string]: string } = {};

      for (const algo of algorithms) {
        try {
          const hashBuffer = await crypto.subtle.digest(algo, data);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          newHashes[algo] = hashHex;
        } catch (e) {
          newHashes[algo] = 'Error';
        }
      }

      setHashes(newHashes);
    };

    generateHashes();
  }, [input]);

  const copyToClipboard = (text: string, algo: string) => {
    navigator.clipboard.writeText(text);
    setCopied(algo);
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

      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            哈希生成工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            在线生成 SHA-1, SHA-256, SHA-512 等哈希值
          </p>
        </div>

        <div className="grid gap-8">
          {/* Input */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              输入文本
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={4}
              placeholder="在此输入要加密的文本..."
            />
          </div>

          {/* Results */}
          <div className="space-y-4">
            {Object.entries(hashes).map(([algo, hash]) => (
              <div
                key={algo}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {algo}
                  </span>
                  <button
                    onClick={() => copyToClipboard(hash, algo)}
                    className={`text-sm ${
                      copied === algo
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                    }`}
                  >
                    {copied === algo ? '已复制' : '复制'}
                  </button>
                </div>
                <div className="break-all font-mono text-sm text-gray-600 dark:text-gray-400">
                  {hash || '等待输入...'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
