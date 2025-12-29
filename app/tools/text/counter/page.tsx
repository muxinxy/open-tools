'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function TextCounterPage() {
  const [text, setText] = useState('');
  
  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
    lines: text === '' ? 0 : text.split('\n').length,
    paragraphs: text.trim() === '' ? 0 : text.split(/\n\n+/).filter(p => p.trim() !== '').length,
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
            字数统计工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            实时统计文本的字符数、单词数、行数等信息
          </p>
        </div>

        {/* Stats Display */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.characters}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">字符数</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.charactersNoSpaces}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">字符数(不含空格)</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.words}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">单词数</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {stats.lines}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">行数</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center dark:border-gray-700 dark:bg-gray-800">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.paragraphs}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">段落数</div>
          </div>
        </div>

        {/* Text Input */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <label
            htmlFor="text-input"
            className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
          >
            请输入或粘贴文本
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full min-h-[180px] resize-y rounded-md border border-gray-300 p-3 font-mono text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            rows={10}
            placeholder="在此输入文本..."
          />
          <div className="mt-4 flex gap-4">
            <button
              onClick={() => setText('')}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              清空
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
          <h2 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
            使用说明
          </h2>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>• 在文本框中输入或粘贴文本，统计结果会实时更新</li>
            <li>• 字符数：包含所有字符（含空格、标点等）</li>
            <li>• 字符数(不含空格)：不包含空格的字符总数</li>
            <li>• 单词数：按空格分隔的单词数量</li>
            <li>• 行数：文本的总行数</li>
            <li>• 段落数：按空行分隔的段落数量</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
