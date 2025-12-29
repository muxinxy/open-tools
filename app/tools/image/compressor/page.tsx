'use client';

import { useState } from 'react';
import Link from 'next/link';

type SelectedFile = {
  file: File;
  preview: string;
  compressedUrl?: string;
  compressedSize?: number;
};

export default function ImageCompressorPage() {
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [quality, setQuality] = useState(80);
  const [scale, setScale] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const maxFiles = 10;
  const maxFileSize = 20 * 1024 * 1024; // 20MB

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected) return;

    const filesArray: SelectedFile[] = [];
    setError('');

    for (const file of Array.from(selected)) {
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        setError('仅支持 JPG 和 PNG 格式');
        continue;
      }
      if (file.size > maxFileSize) {
        setError('单个文件大小不能超过 20MB');
        continue;
      }
      if (filesArray.length + files.length >= maxFiles) {
        setError(`最多只能上传 ${maxFiles} 个文件`);
        break;
      }
      filesArray.push({ file, preview: URL.createObjectURL(file) });
    }

    if (filesArray.length > 0) {
      setFiles((prev) => [...prev, ...filesArray]);
    }

    event.target.value = '';
  };

  const clearFiles = () => {
    files.forEach((item) => {
      URL.revokeObjectURL(item.preview);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setFiles([]);
    setError('');
  };

  const compressImages = async () => {
    if (files.length === 0) {
      setError('请先选择图片');
      return;
    }

    setIsProcessing(true);
    setError('');

    const scaleFactor = Math.max(10, Math.min(scale, 100)) / 100;
    const qualityValue = Math.max(1, Math.min(quality, 100)) / 100;

    try {
      const updatedFiles: SelectedFile[] = [];
      for (const item of files) {
        if (item.compressedUrl) {
          URL.revokeObjectURL(item.compressedUrl);
        }
        const compressedBlob = await compressSingleImage(item.file, scaleFactor, qualityValue);
        const compressedUrl = URL.createObjectURL(compressedBlob);
        updatedFiles.push({
          ...item,
          compressedUrl,
          compressedSize: compressedBlob.size,
        });
      }
      setFiles(updatedFiles);
    } catch (err) {
      console.error(err);
      setError('压缩过程中出现问题，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const compressSingleImage = (file: File, scaleFactor: number, qualityValue: number) => {
    return new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) {
          reject(new Error('读取文件失败'));
          return;
        }
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const targetWidth = Math.max(1, Math.round(img.width * scaleFactor));
          const targetHeight = Math.max(1, Math.round(img.height * scaleFactor));
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('无法创建画布上下文'));
            return;
          }
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('生成压缩图片失败'));
                return;
              }
              resolve(blob);
            },
            outputType,
            outputType === 'image/jpeg' ? qualityValue : undefined,
          );
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = e.target.result as string;
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsDataURL(file);
    });
  };

  const totalOriginalSize = files.reduce((sum, item) => sum + item.file.size, 0);
  const totalCompressedSize = files.reduce((sum, item) => sum + (item.compressedSize ?? 0), 0);

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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            图片压缩工具
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持 JPG、PNG 批量压缩，最多 10 张，单张不超过 20MB，可调节压缩强度与缩放比例。
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          {/* Left column: uploader and results */}
          <div className="space-y-6">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-600">
              <input
                type="file"
                accept="image/jpeg,image/png"
                multiple
                id="image-compress-upload"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="image-compress-upload" className="flex cursor-pointer flex-col items-center justify-center">
                <svg
                  className="mb-4 h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  点击或拖拽上传图片
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  支持 JPG/PNG，单张 ≤ 20MB，最多 10 张
                </span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="mb-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>已选择 {files.length} 张图片</span>
                  <button onClick={clearFiles} className="text-red-500 hover:text-red-600">
                    清空
                  </button>
                </div>
                <div className="space-y-3">
                  {files.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 rounded-md border border-gray-100 p-3 dark:border-gray-700">
                      <img src={item.preview} alt={item.file.name} className="h-16 w-16 rounded object-cover" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">{item.file.name}</p>
                        <p className="text-xs text-gray-500">
                          原始大小 {(item.file.size / 1024 / 1024).toFixed(2)} MB
                          {item.compressedSize && (
                            <span className="ml-2 text-green-600 dark:text-green-400">
                              压缩后 {(item.compressedSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                        </p>
                      </div>
                      {item.compressedUrl ? (
                        <a
                          href={item.compressedUrl}
                          download={`compressed-${item.file.name}`}
                          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          下载
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">待压缩</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: settings */}
          <div className="space-y-6 rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                压缩强度（仅 JPG 有效）
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">当前：{quality}%</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                缩放比例
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full"
              />
              <p className="mt-1 text-xs text-gray-500">当前：{scale}%</p>
            </div>

            <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
              <p>提示：缩放比例影响所有格式；压缩强度仅对 JPG 生效。</p>
            </div>

            <button
              onClick={compressImages}
              disabled={isProcessing}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {isProcessing ? '压缩中...' : '开始压缩'}
            </button>

            {files.some((f) => f.compressedSize) && (
              <div className="rounded-md bg-gray-50 p-4 text-sm dark:bg-gray-800">
                <p className="text-gray-700 dark:text-gray-300">
                  总原始大小：{(totalOriginalSize / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-green-600 dark:text-green-400">
                  总压缩大小：{(totalCompressedSize / 1024 / 1024).toFixed(2)} MB
                </p>
                {totalCompressedSize > 0 && (
                  <p className="text-xs text-gray-500">
                    压缩率：{((1 - totalCompressedSize / totalOriginalSize) * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-100 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Knowledge section */}
        <div className="mt-10 space-y-6">
          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">JPEG 压缩方式</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium">基于 DCT 的顺序编码：</span>
                按从上到下、从左到右的顺序编码，解码时同样顺序恢复，属于有损压缩。
              </li>
              <li>
                <span className="font-medium">基于 DCT 的累进编码：</span>
                多次扫描以进一步压缩，解码时先粗略后细化。
              </li>
              <li>
                <span className="font-medium">基于 DCT 的分层编码：</span>
                以分辨率为基准逐层提升，解码也按分辨率逐步恢复。
              </li>
              <li>
                <span className="font-medium">基于空间 DPCM 的无损压缩：</span>
                采用预测加哈夫曼（或算术）编码，重建图像与原图完全一致。
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
            <h2 className="mb-3 text-xl font-semibold text-gray-900 dark:text-white">PNG 压缩流程</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <span className="font-medium">预解析（Prediction）：</span>
                对像素进行预处理，便于后续压缩。
              </li>
              <li>
                <span className="font-medium">压缩（Compression）：</span>
                使用 Deflate（LZ77 + Huffman）算法编码，实现无损压缩。
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
