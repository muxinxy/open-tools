"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import JsBarcode from "jsbarcode";

interface Status {
  type: "success" | "error" | null;
  message: string;
}

const defaultOptions = {
  width: 2.4,
  height: 120,
};

export default function BarcodeGeneratorPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [value, setValue] = useState("");
  const [barWidth, setBarWidth] = useState(defaultOptions.width);
  const [barHeight, setBarHeight] = useState(defaultOptions.height);
  const [status, setStatus] = useState<Status>({ type: null, message: "" });
  const [dataUrl, setDataUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = () => {
    if (!value.trim()) {
      setStatus({ type: "error", message: "请输入条形码内容" });
      setDataUrl("");
      return;
    }

    if (!canvasRef.current) return;

    try {
      setBusy(true);
      JsBarcode(canvasRef.current, value, {
        format: "CODE128",
        width: barWidth,
        height: barHeight,
        displayValue: true,
        fontSize: 16,
        textMargin: 8,
        margin: 14,
        background: "#ffffff",
        lineColor: "#0f172a",
      });
      setDataUrl(canvasRef.current.toDataURL("image/png"));
      setStatus({ type: "success", message: "生成成功，可下载 PNG" });
    } catch (err) {
      console.error(err);
      setDataUrl("");
      setStatus({ type: "error", message: "生成失败：内容可能不符合格式" });
    } finally {
      setBusy(false);
    }
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "barcode.png";
    a.click();
  };

  const reset = () => {
    setValue("");
    setBarWidth(defaultOptions.width);
    setBarHeight(defaultOptions.height);
    setStatus({ type: null, message: "" });
    setDataUrl("");
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">条形码生成器</h1>
          <p className="text-gray-600 dark:text-gray-400">生成 CODE128 条形码，支持自定义条宽与高度，纯前端生成可下载 PNG。</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <label className="text-sm font-medium text-gray-900 dark:text-white">条形码内容</label>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="输入要编码的文本或数字..."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">条宽</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">每根线条的像素宽度</p>
                </div>
                <input
                  type="range"
                  min={1.4}
                  max={4}
                  step={0.2}
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-12 text-right text-sm text-gray-700 dark:text-gray-200">{barWidth.toFixed(1)}</span>
              </div>

              <div className="flex items-center gap-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">高度</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">条码区域像素高度</p>
                </div>
                <input
                  type="range"
                  min={80}
                  max={200}
                  step={10}
                  value={barHeight}
                  onChange={(e) => setBarHeight(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-14 text-right text-sm text-gray-700 dark:text-gray-200">{barHeight}px</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={generate}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
              >
                生成条形码
              </button>
              <button
                onClick={reset}
                className="inline-flex flex-1 items-center justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
              >
                清空
              </button>
            </div>

            {status.type && (
              <div
                className={`rounded-md px-3 py-2 text-sm ${
                  status.type === "success"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200"
                }`}
              >
                {status.message}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">预览</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">生成后可下载 PNG 文件</p>
              </div>
              <button
                onClick={download}
                disabled={!dataUrl}
                className="text-xs text-blue-600 hover:text-blue-700 disabled:text-gray-400 dark:text-blue-400 dark:hover:text-blue-300"
              >
                下载 PNG
              </button>
            </div>

            <div className="flex min-h-[260px] items-center justify-center rounded-md bg-gray-50 p-4 dark:bg-gray-900">
              <canvas ref={canvasRef} className="max-w-full" aria-label="Barcode preview" />
            </div>

            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600 dark:bg-gray-900 dark:text-gray-300">
              <p>• 采用 CODE128 编码，兼容多数物流与资产场景。</p>
              <p>• 如需特定格式（EAN/UPC），请确保内容满足数字长度要求后再转换。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
