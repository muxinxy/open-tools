'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';

type Mode = 'pixel' | 'percent';

type ImageItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  width: number;
  height: number;
  resizedUrl?: string;
  targetWidth?: number;
  targetHeight?: number;
  error?: string;
};

const MAX_FILES = 10;
const MAX_SIZE = 20 * 1024 * 1024;
const ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/tiff'];

const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

export default function ImageResizerPage() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [mode, setMode] = useState<Mode>('pixel');
  const [pixelWidth, setPixelWidth] = useState(0);
  const [pixelHeight, setPixelHeight] = useState(0);
  const [percent, setPercent] = useState(50);
  const [keepAspect, setKeepAspect] = useState(true);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const arr = Array.from(files);
    if (arr.length > MAX_FILES) {
      setError(`最多上传 ${MAX_FILES} 个文件`);
      return;
    }

    const next: ImageItem[] = [];
    for (const file of arr) {
      if (!ACCEPT_TYPES.includes(file.type)) {
        setError('仅支持 PNG/JPG/GIF/BMP/TIFF');
        return;
      }
      if (file.size > MAX_SIZE) {
        setError('单个文件需小于 20MB');
        return;
      }

      const url = URL.createObjectURL(file);
      const img = await loadImage(url);
      next.push({
        id: genId(),
        name: file.name,
        type: file.type,
        size: file.size,
        url,
        width: img.width,
        height: img.height,
      });
    }

    setError('');
    setItems(next);
  };

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const computeTargetSize = useCallback(
    (item: ImageItem) => {
      if (mode === 'percent') {
        const scale = Math.max(1, percent) / 100;
        const w = Math.max(1, Math.round(item.width * scale));
        const h = Math.max(1, Math.round(item.height * scale));
        return { width: w, height: h };
      }

      if (keepAspect) {
        const aspect = item.height / item.width;
        // 0 means auto-calculate
        if (pixelWidth > 0 && pixelHeight <= 0) {
          // Width specified, height auto
          return { width: pixelWidth, height: Math.max(1, Math.round(pixelWidth * aspect)) };
        }
        if (pixelHeight > 0 && pixelWidth <= 0) {
          // Height specified, width auto
          return { width: Math.max(1, Math.round(pixelHeight / aspect)), height: pixelHeight };
        }
        // Both specified, use width as base
        if (pixelWidth > 0) {
          return { width: pixelWidth, height: Math.max(1, Math.round(pixelWidth * aspect)) };
        }
        // Both 0, default to original size
        return { width: item.width, height: item.height };
      }
      return {
        width: Math.max(1, pixelWidth || item.width),
        height: Math.max(1, pixelHeight || item.height),
      };
    },
    [keepAspect, mode, percent, pixelHeight, pixelWidth],
  );

  const resizeOne = useCallback(
    async (item: ImageItem) => {
      const img = await loadImage(item.url);
      const { width, height } = computeTargetSize(item);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas unsupported');

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const mime = ACCEPT_TYPES.includes(item.type) ? item.type : 'image/png';
      const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), mime));
      const resizedUrl = URL.createObjectURL(blob);
      return { resizedUrl, width, height };
    },
    [computeTargetSize],
  );

  const handleResizeAll = async () => {
    if (!items.length) {
      setError('请先上传图片');
      return;
    }
    setError('');
    setIsProcessing(true);

    const updated: ImageItem[] = [];
    for (const item of items) {
      try {
        const result = await resizeOne(item);
        updated.push({ ...item, resizedUrl: result.resizedUrl, targetWidth: result.width, targetHeight: result.height, error: undefined });
      } catch (err) {
        console.error(err);
        updated.push({ ...item, error: '处理失败' });
      }
    }

    setItems(updated);
    setIsProcessing(false);
  };

  const downloadItem = (item: ImageItem) => {
    if (!item.resizedUrl) return;
    const a = document.createElement('a');
    a.href = item.resizedUrl;
    a.download = `resized-${item.name}`;
    a.click();
  };

  const summaryText = useMemo(() => {
    if (!items.length) return '未选择图片';
    const ready = items.filter((i) => i.resizedUrl).length;
    return `已选择 ${items.length} 张，完成 ${ready} 张`;
  }, [items]);

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
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">图片调整大小</h1>
          <p className="text-gray-600 dark:text-gray-400">支持批量调整尺寸，最多 10 张，单张不超 20MB。</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left side: uploader & list */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span aria-hidden>📤</span>
                <span>上传图片</span>
                <input
                  type="file"
                  accept={ACCEPT_TYPES.join(',')}
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                />
              </label>

              <button
                onClick={handleResizeAll}
                disabled={!items.length || isProcessing}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isProcessing ? '处理中…' : '开始调整'}
              </button>

              <span className="text-xs text-gray-500">{summaryText}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {items.length === 0 && (
                <div className="col-span-2 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  请选择最多 10 张图片 (PNG/JPG/GIF/BMP/TIFF，单张 ≤ 20MB)
                </div>
              )}

              {items.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-200 p-3 shadow-sm dark:border-gray-700">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        原始：{item.width} × {item.height} · {(item.size / 1024).toFixed(1)} KB
                      </p>
                      {item.targetWidth && item.targetHeight && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          新尺寸：{item.targetWidth} × {item.targetHeight}
                        </p>
                      )}
                      {item.error && <p className="text-xs text-red-600">{item.error}</p>}
                    </div>
                    {item.resizedUrl ? (
                      <button
                        onClick={() => downloadItem(item)}
                        className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200"
                      >
                        下载
                      </button>
                    ) : (
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                        待处理
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex gap-2 overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
                    <div className="h-24 w-1/2 bg-gray-50 p-1 dark:bg-gray-800">
                      <img src={item.url} alt={item.name} className="h-full w-full object-contain" />
                    </div>
                    <div className="h-24 w-1/2 bg-gray-50 p-1 dark:bg-gray-800">
                      {item.resizedUrl ? (
                        <img src={item.resizedUrl} alt={`resized-${item.name}`} className="h-full w-full object-contain" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-gray-400">未生成</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side: settings */}
          <div className="w-full space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 lg:w-[360px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">调整设置</h2>

            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                {(['pixel', 'percent'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                      mode === m
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {m === 'pixel' ? '按像素' : '按百分比'}
                  </button>
                ))}
              </div>

              {mode === 'pixel' && (
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1">
                    <span className="font-medium">目标宽度 (px)</span>
                    <input
                      type="number"
                      min={0}
                      value={pixelWidth}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPixelWidth(val);
                        if (keepAspect && val > 0) {
                          setPixelHeight(0);
                        }
                      }}
                      className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-900 dark:disabled:text-gray-600"
                      placeholder="0=自适应"
                      disabled={keepAspect && pixelHeight > 0}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="font-medium">目标高度 (px)</span>
                    <input
                      type="number"
                      min={0}
                      value={pixelHeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setPixelHeight(val);
                        if (keepAspect && val > 0) {
                          setPixelWidth(0);
                        }
                      }}
                      className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:disabled:bg-gray-900 dark:disabled:text-gray-600"
                      placeholder="0=自适应"
                      disabled={keepAspect && pixelWidth > 0}
                    />
                  </label>
                </div>
              )}

              {mode === 'percent' && (
                <div className="flex flex-col gap-1">
                  <label className="font-medium">缩放百分比 ({percent}%)</label>
                  <input
                    type="range"
                    min={1}
                    max={200}
                    value={percent}
                    onChange={(e) => setPercent(Number(e.target.value))}
                  />
                </div>
              )}

              <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={keepAspect}
                  onChange={(e) => setKeepAspect(e.target.checked)}
                />
                保持长宽比（0代表自适应）
              </label>

              <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                <p>支持 10 张 PNG/JPG/GIF/BMP/TIFF，单张不超过 20MB。</p>
                <p>保持长宽比时，宽或高填 0 代表自适应；按百分比模式按当前比例缩放。</p>
              </div>
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
