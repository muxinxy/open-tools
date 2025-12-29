'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';

interface TaskItem {
  id: string;
  file: File;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  message?: string;
  outputUrl?: string;
}

const MAX_FILES = 10;
const MAX_SIZE = 20 * 1024 * 1024;

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isPdf = (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

export default function PdfToWordPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const summary = useMemo(() => {
    if (!tasks.length) return '未选择文件';
    const done = tasks.filter((t) => t.status === 'done').length;
    const processing = tasks.filter((t) => t.status === 'processing').length;
    return `共 ${tasks.length} 个 · 处理中 ${processing} · 已完成 ${done}`;
  }, [tasks]);

  const validateAndAdd = (files: FileList | File[]) => {
    const arr = Array.from(files);
    const invalid = arr.find((f) => !isPdf(f));
    if (invalid) {
      setError('仅支持 PDF 文件');
      return;
    }
    const oversize = arr.find((f) => f.size > MAX_SIZE);
    if (oversize) {
      setError('单个文件需小于 20MB');
      return;
    }
    setTasks((prev) => {
      if (prev.length + arr.length > MAX_FILES) {
        setError(`最多上传 ${MAX_FILES} 个文件`);
        return prev;
      }
      setError('');
      const next = arr.map((file) => ({
        id: genId(),
        file,
        name: file.name,
        size: file.size,
        status: 'pending' as const,
      }));
      return [...prev, ...next];
    });
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    validateAndAdd(e.target.files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    validateAndAdd(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeTask = (id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((t) => t.id !== id);
    });
  };

  const convertOne = useCallback(async (task: TaskItem) => {
    const form = new FormData();
    form.append('file', task.file);

    const res = await fetch('/api/pdf-to-word', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || '转换失败');
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return url;
  }, []);

  const startConvert = useCallback(async () => {
    if (!tasks.length) {
      setError('请先选择文件');
      return;
    }
    setIsProcessing(true);
    setError('');

    for (const task of tasks) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'processing', message: '' } : t)));
      try {
        const url = await convertOne(task);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'done', outputUrl: url } : t)));
      } catch (err) {
        const message = err instanceof Error ? err.message : '转换失败，请稍后重试';
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'error', message } : t)));
      }
    }

    setIsProcessing(false);
  }, [convertOne, tasks]);

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
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">PDF 转 Word</h1>
          <p className="text-gray-600 dark:text-gray-400">
            上传到后端处理，采用 PDF.js 文本提取 + docx 生成，专注文本内容快速转换。最多 10 个 PDF，单个不超 20MB。
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span aria-hidden>📤</span>
                <span>上传/拖拽 PDF</span>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleFiles}
                />
              </label>

              <button
                onClick={startConvert}
                disabled={!tasks.length || isProcessing}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isProcessing ? '转换中…' : '开始转换'}
              </button>

              <span className="whitespace-nowrap text-xs text-gray-500">{summary}</span>
            </div>

            <div
              className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              将 PDF 拖拽到此处，或点击上方按钮选择文件。后端处理，最多 10 个，单个 ≤ 20MB。
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {tasks.length === 0 && (
                <div className="col-span-2 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  请选择待转换的 PDF。最多 10 个，单个 ≤ 20MB。
                </div>
              )}

              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{task.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(task.size)}</p>
                      {task.message && <p className="text-xs text-red-600">{task.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {task.status === 'pending' && '待转换'}
                        {task.status === 'processing' && '处理中'}
                        {task.status === 'done' && '完成'}
                        {task.status === 'error' && '失败'}
                      </span>
                      <button
                        onClick={() => removeTask(task.id)}
                        disabled={isProcessing && task.status === 'processing'}
                        className="rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600 transition-colors hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    {task.outputUrl ? (
                      <>
                        <a
                          href={task.outputUrl}
                          download={`${task.name.replace(/\.pdf$/i, '') || 'converted'}.docx`}
                          className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200"
                        >
                          下载 Word
                        </a>
                        <span className="text-gray-400">·</span>
                        <span>已生成</span>
                      </>
                    ) : (
                      <span className="text-gray-500">等待转换</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          </div>

          <div className="w-full space-y-3 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 lg:w-[340px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">使用说明</h2>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>1) 上传或拖拽最多 10 个 PDF，单个 ≤20MB。</li>
              <li>2) 点击“开始转换”，后端逐个处理生成 docx。</li>
              <li>3) 完成后可直接下载 Word 文件。</li>
              <li>4) 基于 PDF.js 文本提取，主要保留文本，复杂排版/图片可能无法完整还原。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
