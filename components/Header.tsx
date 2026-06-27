'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toolCategories } from '@/lib/tools-data';

interface SearchResult {
  id: string;
  name: string;
  description: string;
  icon: string;
  path: string;
  categoryName: string;
  categoryIcon: string;
}

export default function Header() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const allTools = useMemo<SearchResult[]>(
    () =>
      toolCategories.flatMap((category) =>
        category.tools.map((tool) => ({
          ...tool,
          categoryName: category.name,
          categoryIcon: category.icon,
        }))
      ),
    []
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];

    return allTools
      .filter((tool) =>
        [tool.name, tool.description, tool.categoryName]
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      )
      .slice(0, 8);
  }, [allTools, query]);

  const showDropdown = isFocused && query.trim().length > 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-700 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-2xl">🛠️</span>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            开源工具箱
          </span>
        </Link>

        <div className="relative w-full max-w-xl">
          <div className="flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:focus-within:ring-blue-900/40">
            <span className="mr-2 text-gray-500">🔍</span>
            <input
              type="text"
              value={query}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 100)}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索全站工具..."
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>

          {showDropdown && (
            <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  没有找到相关工具
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((tool) => (
                    <li key={tool.id}>
                      <Link
                        href={tool.path}
                        onClick={() => setIsFocused(false)}
                        className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/80 cursor-pointer"
                      >
                        <span className="text-lg flex-shrink-0">{tool.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {tool.name}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300 flex-shrink-0">
                              {tool.categoryIcon} {tool.categoryName}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            {tool.description}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            首页
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            关于
          </Link>
          <a
            href="https://github.com/muxinxy/open-tools"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            源码
          </a>
        </nav>
      </div>
    </header>
  );
}
