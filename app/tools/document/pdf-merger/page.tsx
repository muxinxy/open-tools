'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
// 需要依赖 pdf-lib，请确保已安装：npm install pdf-lib

type PdfItem = {
  id: string;
  file: File;
  name: string;
  size: number;
};

const MAX_FILES = 5;
const MAX_SIZE = 20 * 1024 * 1024;

const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const loadPdfLib = async () => {
  // @ts-ignore 动态引入以避免构建前的模块解析错误
  const mod = await import('pdf-lib');
  return mod as typeof import('pdf-lib');
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function PdfMergerPage() {
  const [items, setItems] = useState<PdfItem[]>([]);
  const [error, setError] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [outputUrl, setOutputUrl] = useState('');
  const dragIdRef = useRef<string | null>(null);

  const validateAndAdd = (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type === 'application/pdf');
    if (!arr.length) {
      setError('仅支持 PDF 文件');
      return;
    }
    const oversize = arr.find((f) => f.size > MAX_SIZE);
    if (oversize) {
      setError('单个文件需小于 20MB');
      return;
    }
    setItems((prev) => {
      if (prev.length + arr.length > MAX_FILES) {
        setError(`最多上传 ${MAX_FILES} 个 PDF`);
        return prev;
      }
      setError('');
      const next = arr.map((file) => ({ id: genId(), file, name: file.name, size: file.size }));
      return [...prev, ...next];
    });
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    validateAndAdd(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    validateAndAdd(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const moveItem = (fromId: string, toId: string) => {
    setItems((prev) => {
      const fromIdx = prev.findIndex((p) => p.id === fromId);
      const toIdx = prev.findIndex((p) => p.id === toId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const handleDragStart = (id: string) => {
    dragIdRef.current = id;
  };

  const handleDragEnter = (id: string) => {
    const from = dragIdRef.current;
    if (!from || from === id) return;
    moveItem(from, id);
  };

  const mergePdfs = useCallback(async () => {
    if (!items.length) {
      setError('请先选择 PDF');
      return;
    }
    setError('');
    setIsMerging(true);
    setOutputUrl('');

    try {
      const { PDFDocument } = await loadPdfLib();
      const merged = await PDFDocument.create();
      for (const item of items) {
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        const src = await PDFDocument.load(bytes);
        const copied = await merged.copyPages(src, src.getPageIndices());
        copied.forEach((p: any) => merged.addPage(p));
      }
      const outBytes = await merged.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
    } catch (err) {
      console.error(err);
      setError('合并失败，请检查文件或重试');
    } finally {
      setIsMerging(false);
    }
  }, [items]);

  const summaryText = useMemo(() => {
    if (!items.length) return '未选择文件';
    return `已选择 ${items.length} 个 PDF`;
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

      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">PDF 合并</h1>
          <p className="text-gray-600 dark:text-gray-400">
            纯浏览器内完成合并，不上传服务器。支持拖拽排序，最多 5 个 PDF，单个不超 20MB。
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span aria-hidden>📤</span>
                <span>上传 PDF</span>
                <input type="file" accept="application/pdf" multiple className="hidden" onChange={handleFiles} />
              </label>

              <button
                onClick={mergePdfs}
                disabled={!items.length || isMerging}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isMerging ? '合并中…' : '开始合并'}
              </button>

              <span className="text-xs text-gray-500 whitespace-nowrap">{summaryText}</span>
            </div>

            <div
              className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              将 PDF 拖拽到此处，或点击上方按钮选择文件。可拖拽列表调整顺序。
            </div>

            <div className="space-y-2">
              {items.length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  请选择最多 5 个 PDF，单个 ≤ 20MB。
                </div>
              )}

              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900"
                  draggable
                  onDragStart={() => handleDragStart(item.id)}
                  onDragEnter={() => handleDragEnter(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="cursor-grab select-none text-gray-400">☰</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{idx + 1}. {item.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(item.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap transition-colors hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            {outputUrl && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-100">
                <div className="flex items-center justify-between">
                  <span>合并完成，可下载</span>
                  <a
                    href={outputUrl}
                    download="merged.pdf"
                    className="rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    下载合并文件
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="w-full rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 lg:w-[320px]">
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">使用说明</h2>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>1) 上传或拖拽最多 5 个 PDF。</li>
              <li>2) 拖拽列表条目以调整顺序，序号即合并顺序。</li>
              <li>3) 点击“开始合并”，等待完成后下载。</li>
              <li>4) 全流程在浏览器内完成，不上传服务器。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
