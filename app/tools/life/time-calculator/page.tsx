'use client';

import { useState } from 'react';

export default function TimeCalculator() {
  const [time1, setTime1] = useState('09:00:00');
  const [time2, setTime2] = useState('17:30:00');
  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [baseTime, setBaseTime] = useState('09:00:00');

  const parseTime = (timeStr: string) => {
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const calculateTimeDiff = () => {
    const seconds1 = parseTime(time1);
    const seconds2 = parseTime(time2);
    let diff = Math.abs(seconds2 - seconds1);

    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    return { hours, minutes, seconds, totalSeconds: Math.abs(seconds2 - seconds1) };
  };

  const calculateNewTime = () => {
    const baseSeconds = parseTime(baseTime);
    const addSeconds = hours * 3600 + minutes * 60 + seconds;
    let newSeconds = (baseSeconds + addSeconds) % 86400;
    if (newSeconds < 0) newSeconds += 86400;
    return formatTime(newSeconds);
  };

  const diff = calculateTimeDiff();
  const newTime = calculateNewTime();

  const quickSetDiff = (h: number, m: number) => {
    const base = new Date();
    base.setHours(9, 0, 0);
    const target = new Date(base);
    target.setHours(base.getHours() + h, base.getMinutes() + m);
    setTime1('09:00:00');
    setTime2(
      `${String(target.getHours()).padStart(2, '0')}:${String(
        target.getMinutes()
      ).padStart(2, '0')}:00`
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">时间计算器</h1>

        {/* 时间间隔计算 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            计算时间间隔
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始时间
              </label>
              <input
                type="time"
                step="1"
                value={time1}
                onChange={(e) => setTime1(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束时间
              </label>
              <input
                type="time"
                step="1"
                value={time2}
                onChange={(e) => setTime2(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            <button
              onClick={() => quickSetDiff(1, 0)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              1小时
            </button>
            <button
              onClick={() => quickSetDiff(2, 0)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              2小时
            </button>
            <button
              onClick={() => quickSetDiff(4, 0)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              4小时
            </button>
            <button
              onClick={() => quickSetDiff(8, 0)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              8小时
            </button>
            <button
              onClick={() => quickSetDiff(8, 30)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              8.5小时
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-purple-600">
                {diff.hours}:{String(diff.minutes).padStart(2, '0')}:
                {String(diff.seconds).padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600 mt-1">时:分:秒</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {diff.hours}
                </div>
                <div className="text-xs text-gray-500">小时</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {diff.minutes}
                </div>
                <div className="text-xs text-gray-500">分钟</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {diff.seconds}
                </div>
                <div className="text-xs text-gray-500">秒</div>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <div className="text-lg font-semibold text-gray-900">
                  {diff.totalSeconds}
                </div>
                <div className="text-xs text-gray-500">总秒数</div>
              </div>
            </div>
          </div>
        </div>

        {/* 时间加减计算 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            时间加减计算
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              基准时间
            </label>
            <input
              type="time"
              step="1"
              value={baseTime}
              onChange={(e) => setBaseTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                小时
              </label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分钟
              </label>
              <input
                type="number"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                秒
              </label>
              <input
                type="number"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap mb-4">
            {[
              { h: 1, m: 0, label: '+1小时' },
              { h: 2, m: 0, label: '+2小时' },
              { h: 0, m: 30, label: '+30分钟' },
              { h: -1, m: 0, label: '-1小时' },
              { h: 0, m: -30, label: '-30分钟' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  setHours(preset.h);
                  setMinutes(preset.m);
                  setSeconds(0);
                }}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-200">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">计算结果</div>
              <div className="text-4xl font-bold text-blue-600">{newTime}</div>
            </div>
          </div>
        </div>

        {/* 当前时间 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">当前时间</h2>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {new Date().toLocaleTimeString('zh-CN', { hour12: false })}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              })}
            </div>
          </div>
        </div>

        {/* 说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">使用说明:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 时间间隔: 计算两个时间点之间的差值</li>
            <li>• 时间加减: 在指定时间上增加或减少时长</li>
            <li>• 支持小时、分钟、秒的精确计算</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
