'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';

type SplitResult = {
  name: string;
  url: string;
};

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const parseRanges = (input: string, totalPages: number) => {
  const ranges: Array<{ start: number; end: number }> = [];
  const trimmed = input.trim();
  if (!trimmed) return ranges;
  const parts = trimmed.split(',');
  for (const part of parts) {
    const seg = part.trim();
    if (!seg) continue;
    if (seg.includes('-')) {
      const [s, e] = seg.split('-').map((v) => parseInt(v, 10));
      const start = Math.max(1, s || 1);
      const end = Math.min(totalPages, e || totalPages);
      if (start <= end) ranges.push({ start, end });
    } else {
      const page = parseInt(seg, 10);
      if (!Number.isNaN(page) && page >= 1 && page <= totalPages) ranges.push({ start: page, end: page });
    }
  }
  return ranges;
};

export default function PdfSplitterPage() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<number>(0);
  const [rangeInput, setRangeInput] = useState('');
  const [results, setResults] = useState<SplitResult[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const summaryText = useMemo(() => {
    if (!file) return '未选择文件';
    return `${file.name} · ${pages || '?'} 页 · ${formatBytes(file.size)}`;
  }, [file, pages]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== 'application/pdf') {
      setError('仅支持 PDF 文件');
      setFile(null);
      setPages(0);
      return;
    }
    if (f.size > MAX_SIZE) {
      setError('单个 PDF 需小于 20MB');
      setFile(null);
      setPages(0);
      return;
    }
    setError('');
    setResults([]);
    setRangeInput('');
    const bytes = new Uint8Array(await f.arrayBuffer());
    const pdf = await PDFDocument.load(bytes);
    setPages(pdf.getPageCount());
    setFile(f);
  };

  const handleSplit = async () => {
    if (!file) {
      setError('请先选择 PDF');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await PDFDocument.load(bytes);
      const total = src.getPageCount();
      const ranges = parseRanges(rangeInput, total);
      if (!ranges.length) {
        // 默认按单页拆分
        for (let i = 1; i <= total; i++) ranges.push({ start: i, end: i });
      }

      const outputs: SplitResult[] = [];

      for (let idx = 0; idx < ranges.length; idx++) {
        const { start, end } = ranges[idx];
        const doc = await PDFDocument.create();
        const indices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
        const pagesCopied = await doc.copyPages(src, indices);
        pagesCopied.forEach((p: any) => doc.addPage(p));
        const outBytes = await doc.save();
        const blob = new Blob([outBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        outputs.push({ name: `split-${idx + 1}-${start}-${end}.pdf`, url });
      }

      setResults((prev) => {
        prev.forEach((r) => URL.revokeObjectURL(r.url));
        return outputs;
      });
    } catch (err) {
      console.error(err);
      setError('拆分失败，请检查文件或稍后再试');
    } finally {
      setIsProcessing(false);
    }
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

      <div className="mx-auto max-w-5xl">
        <div className="mb-5">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">PDF 拆分</h1>
          <p className="text-gray-600 dark:text-gray-400">
            纯浏览器内完成拆分，不上传服务器。支持输入页码范围（如 1-3,5,7-9），或留空自动按单页拆分。一次上传 1 个 PDF，大小不超 20MB。
          </p>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span aria-hidden>📤</span>
                <span>上传 PDF</span>
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} />
              </label>

              <button
                onClick={handleSplit}
                disabled={!file || isProcessing}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isProcessing ? '拆分中…' : '开始拆分'}
              </button>

              <span className="text-xs text-gray-500 whitespace-nowrap">{summaryText}</span>
            </div>

            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <p className="text-xs text-gray-500">范围示例：1-3,5,7-9。留空则按每页输出一个 PDF。</p>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder="输入页码范围 (可留空)"
                className="w-full rounded-md border border-gray-300 p-2 text-sm dark:border-gray-600 dark:bg-gray-800"
              />
            </div>

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

            {results.length > 0 && (
              <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-100">
                <p className="font-semibold">拆分完成，下载结果：</p>
                <div className="space-y-1">
                  {results.map((r) => (
                    <div key={r.url} className="flex items-center justify-between rounded-md bg-white/60 px-2 py-1 text-xs shadow-sm dark:bg-white/5">
                      <span className="truncate pr-2">{r.name}</span>
                      <a
                        href={r.url}
                        download={r.name}
                        className="rounded-md bg-green-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-green-700"
                      >
                        下载
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 lg:w-[320px]">
            <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">使用说明</h2>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>1) 上传 1 个 PDF（≤20MB）。</li>
              <li>2) 输入范围：如 1-3,5,7-9；留空则按单页拆分。</li>
              <li>3) 点击“开始拆分”，完成后下载各段文件。</li>
              <li>4) 全程本地处理，不上传服务器。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
