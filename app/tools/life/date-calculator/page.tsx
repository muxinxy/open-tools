'use client';

import { useState } from 'react';

export default function DateCalculator() {
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [daysToAdd, setDaysToAdd] = useState(100);
  const [baseDate, setBaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const calculateDateDiff = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = (diffDays % 365) % 30;

    const weeks = Math.floor(diffDays / 7);
    const hours = diffDays * 24;
    const minutes = hours * 60;

    return {
      totalDays: diffDays,
      years,
      months,
      days,
      weeks,
      hours,
      minutes,
    };
  };

  const calculateFutureDate = () => {
    const base = new Date(baseDate);
    const future = new Date(base);
    future.setDate(future.getDate() + daysToAdd);
    return future.toISOString().split('T')[0];
  };

  const diff = calculateDateDiff();
  const futureDate = calculateFutureDate();

  const getWeekday = (dateString: string) => {
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const date = new Date(dateString);
    return `星期${weekdays[date.getDay()]}`;
  };

  const quickSet = (days: number) => {
    const today = new Date();
    const target = new Date(today);
    target.setDate(today.getDate() + days);
    setEndDate(target.toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">日期计算器</h1>

        {/* 日期间隔计算 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            计算日期间隔
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <div className="text-sm text-gray-500 mt-1">
                {getWeekday(startDate)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <div className="text-sm text-gray-500 mt-1">
                {getWeekday(endDate)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => quickSet(7)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              一周后
            </button>
            <button
              onClick={() => quickSet(30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              一月后
            </button>
            <button
              onClick={() => quickSet(100)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              100天后
            </button>
            <button
              onClick={() => quickSet(365)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              一年后
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-blue-600">
                {diff.totalDays}
              </div>
              <div className="text-sm text-gray-600 mt-1">天</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {diff.years}年 {diff.months}月 {diff.days}天
                </div>
                <div className="text-xs text-gray-500">年月日</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {diff.weeks}
                </div>
                <div className="text-xs text-gray-500">周</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {diff.hours.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">小时</div>
              </div>
            </div>
          </div>
        </div>

        {/* 日期加减计算 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            日期加减计算
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基准日期
              </label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                增加/减少天数
              </label>
              <input
                type="number"
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                placeholder="正数为增加，负数为减少"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {[7, 30, 100, 365, -7, -30].map((days) => (
              <button
                key={days}
                onClick={() => setDaysToAdd(days)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                {days > 0 ? '+' : ''}
                {days}天
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">结果日期</div>
              <div className="text-3xl font-bold text-green-600 mb-1">
                {futureDate}
              </div>
              <div className="text-sm text-gray-500">{getWeekday(futureDate)}</div>
            </div>
          </div>
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">使用说明:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 日期间隔: 计算两个日期之间相差的天数</li>
            <li>• 日期加减: 在指定日期基础上增加或减少天数</li>
            <li>• 支持快速选择常用时间间隔</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
