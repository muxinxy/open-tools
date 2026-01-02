'use client';

import { useState } from 'react';

export default function ColorPicker() {
  const [color, setColor] = useState('#3b82f6');
  const [copySuccess, setCopySuccess] = useState('');

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(format);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const rgb = hexToRgb(color);
  const hsl = hexToHsl(color);

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">颜色选择器</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* 颜色预览 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                颜色预览
              </label>
              <div
                className="w-full h-48 rounded-lg border-4 border-gray-200 mb-4 transition-colors duration-200"
                style={{ backgroundColor: color }}
              />
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-12 cursor-pointer rounded-lg"
              />
            </div>

            {/* 颜色值 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                颜色值
              </label>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">HEX</label>
                    <input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                          setColor(value);
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                    />
                  </div>
                  <button
                    onClick={() => copyToClipboard(color.toUpperCase(), 'HEX')}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    {copySuccess === 'HEX' ? '✓' : '复制'}
                  </button>
                </div>

                {rgb && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">RGB</label>
                      <input
                        type="text"
                        value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono bg-gray-50"
                      />
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'RGB')
                      }
                      className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {copySuccess === 'RGB' ? '✓' : '复制'}
                    </button>
                  </div>
                )}

                {hsl && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">HSL</label>
                      <input
                        type="text"
                        value={`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono bg-gray-50"
                      />
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                          'HSL'
                        )
                      }
                      className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                      {copySuccess === 'HSL' ? '✓' : '复制'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 预设颜色 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">常用颜色</h2>
          <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-17 gap-2">
            {presetColors.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => setColor(presetColor)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-400 transition-all hover:scale-110"
                style={{ backgroundColor: presetColor }}
                title={presetColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
