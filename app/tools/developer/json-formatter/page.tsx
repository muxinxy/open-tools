'use client';

import { useState } from 'react';

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '无效的 JSON 格式');
      setOutput('');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '无效的 JSON 格式');
      setOutput('');
    }
  };

  const validateJson = () => {
    try {
      JSON.parse(input);
      setError('');
      alert('✓ JSON 格式正确');
    } catch (e) {
      setError(e instanceof Error ? e.message : '无效的 JSON 格式');
    }
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert('已复制到剪贴板');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">JSON 格式化工具</h1>

        {/* 控制按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <button
              onClick={formatJson}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              格式化
            </button>
            <button
              onClick={minifyJson}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              压缩
            </button>
            <button
              onClick={validateJson}
              className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              验证
            </button>
            <button
              onClick={clearAll}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              清空
            </button>
            {output && (
              <button
                onClick={copyOutput}
                className="px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
              >
                复制结果
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <label className="text-sm text-gray-600">缩进空格:</label>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">
              <strong>错误:</strong> {error}
            </p>
          </div>
        )}

        {/* 输入输出区域 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 输入 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              输入 JSON
            </h2>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='粘贴或输入 JSON 数据，例如: {"name": "value"}'
              className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 输出 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              输出结果
            </h2>
            <textarea
              value={output}
              readOnly
              placeholder="格式化或压缩后的结果将显示在这里..."
              className="w-full h-[600px] px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm resize-none bg-gray-50"
            />
          </div>
        </div>

        {/* 使用提示 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">使用说明:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 格式化: 将 JSON 转换为易读格式</li>
            <li>• 压缩: 移除所有空格和换行</li>
            <li>• 验证: 检查 JSON 语法是否正确</li>
            <li>• 支持嵌套对象和数组</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
