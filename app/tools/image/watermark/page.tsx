'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type WatermarkMode = 'single' | 'tile';
type Position = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';

interface WatermarkSettings {
  text: string;
  fontSize: number;
  opacity: number;
  rotate: number;
  gap: number; // For tile mode
  fontFamily: string;
  fontWeight: string;
  color: string;
  mode: WatermarkMode;
  position: Position;
}

export default function WatermarkPage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState('');
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: '水印文字',
    fontSize: 40,
    opacity: 0.5,
    rotate: -30,
    gap: 100,
    fontFamily: 'sans-serif',
    fontWeight: 'normal',
    color: '#ffffff',
    mode: 'tile',
    position: 'bottomRight',
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        setImageName(file.name);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const drawWatermark = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to image size
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw original image
    ctx.drawImage(image, 0, 0);

    // Configure watermark style
    ctx.fillStyle = settings.color;
    ctx.globalAlpha = settings.opacity;
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px ${settings.fontFamily}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    const textWidth = ctx.measureText(settings.text).width;
    const textHeight = settings.fontSize;

    if (settings.mode === 'tile') {
      // Tile mode
      const stepX = textWidth + settings.gap;
      const stepY = textHeight + settings.gap;

      ctx.save();
      // We need to cover a larger area to account for rotation
      const diag = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
      for (let x = -diag; x < diag * 2; x += stepX) {
        for (let y = -diag; y < diag * 2; y += stepY) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((settings.rotate * Math.PI) / 180);
          ctx.fillText(settings.text, 0, 0);
          ctx.restore();
        }
      }
      ctx.restore();
    } else {
      // Single mode
      let x = 0;
      let y = 0;
      const margin = 40;

      switch (settings.position) {
        case 'topLeft':
          x = margin + textWidth / 2;
          y = margin + textHeight / 2;
          break;
        case 'topRight':
          x = canvas.width - margin - textWidth / 2;
          y = margin + textHeight / 2;
          break;
        case 'bottomLeft':
          x = margin + textWidth / 2;
          y = canvas.height - margin - textHeight / 2;
          break;
        case 'bottomRight':
          x = canvas.width - margin - textWidth / 2;
          y = canvas.height - margin - textHeight / 2;
          break;
        case 'center':
          x = canvas.width / 2;
          y = canvas.height / 2;
          break;
      }

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((settings.rotate * Math.PI) / 180);
      ctx.fillText(settings.text, 0, 0);
      ctx.restore();
    }
  }, [image, settings]);

  useEffect(() => {
    drawWatermark();
  }, [drawWatermark]);

  const handleDownload = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `watermark-${imageName}`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
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
        <div className="mb-5">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">图片水印工具</h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持自定义文字水印，可调节大小、透明度、旋转角度及铺满模式。
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left side: Preview */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span>📤 上传图片</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <button
                onClick={handleDownload}
                disabled={!image}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                <span>⬇️ 下载图片</span>
              </button>
            </div>

            <div className="relative flex min-h-[400px] items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-black/5 dark:border-gray-700">
              {!image ? (
                <div className="text-sm text-gray-400">请先上传图片</div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="max-h-[600px] max-w-full object-contain shadow-lg"
                />
              )}
            </div>
          </div>

          {/* Right side: Controls */}
          <div className="w-full space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 lg:w-[380px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">水印设置</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1">
                <label className="font-medium">水印文字</label>
                <input
                  type="text"
                  value={settings.text}
                  onChange={(e) => setSettings({ ...settings, text: e.target.value })}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-medium">字体大小 ({settings.fontSize}px)</label>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    value={settings.fontSize}
                    onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium">透明度 ({Math.round(settings.opacity * 100)}%)</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.opacity}
                    onChange={(e) => setSettings({ ...settings, opacity: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-medium">旋转角度 ({settings.rotate}°)</label>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    value={settings.rotate}
                    onChange={(e) => setSettings({ ...settings, rotate: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium">水印颜色</label>
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                    className="h-8 w-full cursor-pointer rounded-md border border-gray-300 p-1 dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">字体</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="sans-serif">无衬线 (Sans-serif)</option>
                  <option value="serif">衬线 (Serif)</option>
                  <option value="monospace">等宽 (Monospace)</option>
                  <option value="cursive">手写 (Cursive)</option>
                  <option value="system-ui">系统默认</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">粗细</label>
                <select
                  value={settings.fontWeight}
                  onChange={(e) => setSettings({ ...settings, fontWeight: e.target.value })}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="normal">常规</option>
                  <option value="bold">加粗</option>
                  <option value="lighter">更细</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-medium">模式</label>
                <div className="flex gap-2">
                  {(['single', 'tile'] as WatermarkMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setSettings({ ...settings, mode: m })}
                      className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                        settings.mode === m
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {m === 'single' ? '单个' : '铺满'}
                    </button>
                  ))}
                </div>
              </div>

              {settings.mode === 'tile' ? (
                <div className="flex flex-col gap-1">
                  <label className="font-medium">间距 ({settings.gap}px)</label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    value={settings.gap}
                    onChange={(e) => setSettings({ ...settings, gap: parseInt(e.target.value) })}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <label className="font-medium">位置</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'] as Position[]).map((p) => (
                      <button
                        key={p}
                        onClick={() => setSettings({ ...settings, position: p })}
                        className={`rounded-md py-2 text-[10px] font-medium transition-colors ${
                          settings.position === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {p === 'topLeft' && '左上'}
                        {p === 'topRight' && '右上'}
                        {p === 'center' && '居中'}
                        {p === 'bottomLeft' && '左下'}
                        {p === 'bottomRight' && '右下'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              <p>所有操作均在本地浏览器完成，不会上传您的图片。</p>
            </div>
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
