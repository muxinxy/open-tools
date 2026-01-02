'use client';

import { useState, useMemo } from 'react';

export default function RegexTester() {
  const [pattern, setPattern] = useState('\\d+');
  const [flags, setFlags] = useState('g');
  const [testString, setTestString] = useState('测试文本123，包含456数字789');
  const [error, setError] = useState('');

  const result = useMemo(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches = Array.from(testString.matchAll(regex));
      setError('');

      return {
        matches: matches.map((match) => ({
          value: match[0],
          index: match.index,
          groups: match.slice(1),
        })),
        test: regex.test(testString),
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : '正则表达式错误');
      return { matches: [], test: false };
    }
  }, [pattern, flags, testString]);

  const highlightMatches = () => {
    if (result.matches.length === 0) return testString;

    let highlighted = '';
    let lastIndex = 0;

    result.matches.forEach((match) => {
      const index = match.index ?? 0;
      highlighted += testString.slice(lastIndex, index);
      highlighted += `<mark class="bg-yellow-300">${match.value}</mark>`;
      lastIndex = index + match.value.length;
    });

    highlighted += testString.slice(lastIndex);
    return highlighted;
  };

  const commonPatterns = [
    { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: '手机号', pattern: '1[3-9]\\d{9}' },
    { name: 'URL', pattern: 'https?://[^\\s]+' },
    { name: 'IP地址', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b' },
    { name: '日期(YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
    { name: '数字', pattern: '\\d+' },
    { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">正则表达式测试</h1>

        {/* 正则表达式输入 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">正则表达式</h2>
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="输入正则表达式..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
              />
            </div>
            <div className="w-32">
              <input
                type="text"
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="flags"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono"
              />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            <span className="font-mono">/{pattern}/{flags}</span>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Flags 说明 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Flags 说明</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
            <div>
              <span className="font-mono font-semibold">g</span> - 全局匹配
            </div>
            <div>
              <span className="font-mono font-semibold">i</span> - 忽略大小写
            </div>
            <div>
              <span className="font-mono font-semibold">m</span> - 多行模式
            </div>
          </div>
        </div>

        {/* 测试文本 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">测试文本</h2>
          <textarea
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder="输入要测试的文本..."
            className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg resize-none"
          />
        </div>

        {/* 匹配结果 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            匹配结果 ({result.matches.length} 个匹配)
          </h2>
          {result.matches.length > 0 ? (
            <div className="space-y-4">
              <div
                className="p-4 bg-gray-50 rounded-lg text-gray-900 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightMatches() }}
              />
              <div className="space-y-2">
                {result.matches.map((match, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="text-sm">
                      <span className="font-semibold">匹配 {index + 1}:</span>{' '}
                      <span className="font-mono">{match.value}</span>
                      <span className="text-gray-600 ml-4">
                        位置: {match.index}
                      </span>
                    </div>
                    {match.groups.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        分组: {match.groups.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">没有匹配结果</p>
          )}
        </div>

        {/* 常用正则 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">常用正则表达式</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {commonPatterns.map((item) => (
              <button
                key={item.name}
                onClick={() => setPattern(item.pattern)}
                className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition"
              >
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-gray-600 font-mono mt-1">
                  {item.pattern}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
