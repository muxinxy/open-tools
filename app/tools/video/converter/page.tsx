'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type TaskStatus = 'pending' | 'processing' | 'done' | 'error';

type MediaTask = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: TaskStatus;
  outputUrl?: string;
  outputName?: string;
  message?: string;
  progress?: number;
};

const MAX_FILES = 5;
const MAX_SIZE = 100 * 1024 * 1024;
const OUTPUT_FORMATS = ['mp4', 'avi', 'mpg', 'mov', 'flv', '3gp', 'webm', 'mkv', 'wmv', 'gif'];
const VIDEO_CODECS = [
  { value: 'auto', label: '自动 (跟随格式默认)' },
  { value: 'copy', label: '不转码 (copy)' },
  { value: 'libx264', label: 'H.264 (libx264)' },
  { value: 'libx265', label: 'H.265 (libx265)' },
  { value: 'libvpx-vp9', label: 'VP9 (libvpx-vp9)' },
  { value: 'libaom-av1', label: 'AV1 (libaom-av1)' },
  { value: 'mpeg4', label: 'MPEG-4 (mpeg4)' },
];
const AUDIO_CODECS = [
  { value: 'auto', label: '自动 (跟随格式默认)' },
  { value: 'copy', label: '不转码 (copy)' },
  { value: 'aac', label: 'AAC (aac)' },
  { value: 'mp3', label: 'MP3 (libmp3lame)' },
  { value: 'opus', label: 'Opus (libopus)' },
  { value: 'vorbis', label: 'Vorbis (libvorbis)' },
];

const genId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExtension = (name: string) => {
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot + 1).toLowerCase();
};

const mimeByFormat: Record<string, string> = {
  mp4: 'video/mp4',
  avi: 'video/x-msvideo',
  mpg: 'video/mpeg',
  mov: 'video/quicktime',
  flv: 'video/x-flv',
  '3gp': 'video/3gpp',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
  wmv: 'video/x-ms-wmv',
  gif: 'image/gif',
};

export default function VideoConverterPage() {
  const [tasks, setTasks] = useState<MediaTask[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const currentTaskIdRef = useRef<string | null>(null);
  const cancelRef = useRef(false);

  const [settings, setSettings] = useState({
    format: 'mp4',
    videoCodec: 'auto',
    videoBitrate: '2500',
    fps: '',
    width: 0,
    height: 0,
    removeAudio: false,
    audioCodec: 'auto',
    audioBitrate: '192',
    audioSampleRate: '44100',
    audioChannels: '2',
  });

  const ensureFFmpeg = useCallback(async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    setFfmpegLoading(true);
    const instance = new FFmpeg();
    await instance.load();
    instance.on('progress', ({ progress }) => {
      if (!currentTaskIdRef.current) return;
      setTasks((prev) => prev.map((t) => (t.id === currentTaskIdRef.current ? { ...t, progress: Math.round(progress * 100) } : t)));
    });
    ffmpegRef.current = instance;
    setFfmpegReady(true);
    setFfmpegLoading(false);
    return instance;
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const arr = Array.from(files);
    const overLimit = arr.find((f) => f.size > MAX_SIZE);
    if (overLimit) {
      setError('单个文件需小于 100MB');
      return;
    }

    setTasks((prev) => {
      if (prev.length + arr.length > MAX_FILES) {
        setError(`最多上传 ${MAX_FILES} 个文件`);
        return prev;
      }
      setError('');
      const next: MediaTask[] = arr.map((file) => ({
        id: genId(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'pending',
      }));
      return [...prev, ...next];
    });
  };

  const buildArgs = (inputName: string, outputName: string) => {
    const args: string[] = ['-i', inputName];

    if (settings.videoCodec !== 'auto') args.push('-c:v', settings.videoCodec);
    if (settings.videoBitrate) args.push('-b:v', `${settings.videoBitrate}k`);
    if (settings.fps) args.push('-r', settings.fps);
    if (settings.width > 0 || settings.height > 0) {
      const w = settings.width > 0 ? settings.width.toString() : '-1';
      const h = settings.height > 0 ? settings.height.toString() : '-1';
      args.push('-vf', `scale=${w}:${h}`);
    }

    if (settings.removeAudio) {
      args.push('-an');
    } else {
      if (settings.audioCodec !== 'auto') args.push('-c:a', settings.audioCodec);
      if (settings.audioBitrate) args.push('-b:a', `${settings.audioBitrate}k`);
      if (settings.audioSampleRate) args.push('-ar', settings.audioSampleRate);
      if (settings.audioChannels) args.push('-ac', settings.audioChannels);
    }

    args.push('-f', settings.format);
    args.push(outputName);
    return args;
  };

  const convertOne = useCallback(
    async (task: MediaTask) => {
      const ffmpeg = await ensureFFmpeg();
      const inputExt = getExtension(task.name) || 'dat';
      const inputName = `input-${task.id}.${inputExt}`;
      const outputName = `output-${task.id}.${settings.format}`;

      await ffmpeg.writeFile(inputName, await fetchFile(task.file));
      const args = buildArgs(inputName, outputName);

      currentTaskIdRef.current = task.id;
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      const bytes = data instanceof Uint8Array ? data : 'data' in (data as any) ? (data as any).data : new Uint8Array();
      const blob = new Blob([bytes], { type: mimeByFormat[settings.format] || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);

      return { url, outputName };
    },
    [ensureFFmpeg, settings.audioBitrate, settings.audioChannels, settings.audioCodec, settings.audioSampleRate, settings.format, settings.fps, settings.height, settings.removeAudio, settings.videoBitrate, settings.videoCodec, settings.width],
  );

  const handleConvert = async () => {
    if (!tasks.length) {
      setError('请先选择文件');
      return;
    }
    setError('');
    setIsConverting(true);
    cancelRef.current = false;

    for (const task of tasks) {
      if (cancelRef.current) break;
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'processing', message: '', progress: 0 } : t)));
      try {
        const result = await convertOne(task);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'done', outputUrl: result.url, outputName: result.outputName, message: undefined, progress: 100 }
              : t,
          ),
        );
      } catch (err) {
        console.error(err);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'error', message: '转换失败，请调整参数或编解码器' } : t)));
      }
    }

    setIsConverting(false);
    currentTaskIdRef.current = null;
  };

  const handleCancel = async () => {
    cancelRef.current = true;
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg) {
      await ffmpeg.terminate();
      ffmpegRef.current = null;
      setFfmpegReady(false);
    }
    setIsConverting(false);
    currentTaskIdRef.current = null;
    setTasks((prev) => prev.map((t) => (t.status === 'processing' ? { ...t, status: 'error', message: '已取消', progress: undefined } : t)));
  };

  const summaryText = useMemo(() => {
    if (!tasks.length) return '未选择文件';
    const done = tasks.filter((t) => t.status === 'done').length;
    const processing = tasks.some((t) => t.status === 'processing');
    if (processing) return `正在转换 ${tasks.length} 个，已完成 ${done}`;
    return `共 ${tasks.length} 个，已完成 ${done}`;
  }, [tasks]);

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
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">视频格式转换</h1>
          <p className="text-gray-600 dark:text-gray-400">
            纯浏览器内完成转换，不上传服务器。支持 MP4 / AVI / MPG / MOV / FLV / 3GP / WEBM / MKV / WMV / GIF 互转，最多 5 个文件，单个不超过 100MB。
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span aria-hidden>📤</span>
                <span>上传视频/音频</span>
                <input type="file" accept="video/*,audio/*" multiple className="hidden" onChange={handleFiles} />
              </label>

              <button
                onClick={handleConvert}
                disabled={!tasks.length || isConverting || ffmpegLoading}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isConverting ? '转换中…' : '开始转换'}
              </button>

              <button
                onClick={handleCancel}
                disabled={!isConverting}
                className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-60"
              >
                取消
              </button>

              <span className="text-xs text-gray-500">{summaryText}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {tasks.length === 0 && (
                <div className="col-span-2 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  请选择最多 5 个视频或音频文件，单个 ≤ 100MB。
                </div>
              )}

              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-gray-200 p-3 shadow-sm dark:border-gray-700">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.name}</p>
                      <p className="text-xs text-gray-500">{formatBytes(task.size)}</p>
                      <p className="text-xs text-gray-500">{task.type || '未知类型'}</p>
                      {task.message && <p className="text-xs text-red-600">{task.message}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap dark:bg-gray-800 dark:text-gray-300">
                        {task.status === 'pending' && '待转换'}
                        {task.status === 'processing' && '处理中'}
                        {task.status === 'done' && '完成'}
                        {task.status === 'error' && '失败'}
                      </div>
                      <button
                        onClick={() => removeTask(task.id)}
                        disabled={isConverting && task.status === 'processing'}
                        className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap transition-colors hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        删除
                      </button>
                    </div>
                  </div>

                  {task.status === 'processing' && (
                    <div className="mt-2 space-y-1">
                      <div className="h-2 overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-full bg-blue-500 transition-[width]"
                          style={{ width: `${task.progress ?? 0}%` }}
                          aria-label="进度条"
                        />
                      </div>
                      <div className="text-right text-xs text-gray-500">{task.progress ?? 0}%</div>
                    </div>
                  )}

                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                    {task.outputUrl ? (
                      <>
                        <button
                          onClick={() => {
                            if (!task.outputUrl) return;
                            const a = document.createElement('a');
                            a.href = task.outputUrl;
                            a.download = task.outputName || `converted-${task.name}.${settings.format}`;
                            a.click();
                          }}
                          className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 whitespace-nowrap hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200"
                        >
                          下载结果
                        </button>
                        <span className="text-gray-400">·</span>
                        <span>{task.outputName || `输出.${settings.format}`}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">等待转换完成</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {(ffmpegLoading || ffmpegReady) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                {ffmpegLoading ? '正在加载 FFmpeg 内核，大文件转换时请耐心等待…' : 'FFmpeg 已加载，本地离线转换，无需上传。'}
              </div>
            )}

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          </div>

          <div className="w-full space-y-4 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 lg:w-[360px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">输出参数</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-medium">输出格式</label>
                <select
                  value={settings.format}
                  onChange={(e) => setSettings((s) => ({ ...s, format: e.target.value }))}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                >
                  {OUTPUT_FORMATS.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">视频编码器</label>
                <select
                  value={settings.videoCodec}
                  onChange={(e) => setSettings((s) => ({ ...s, videoCodec: e.target.value }))}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                >
                  {VIDEO_CODECS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-medium">视频码率 (kbps)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.videoBitrate}
                  onChange={(e) => setSettings((s) => ({ ...s, videoBitrate: e.target.value }))}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">帧率 (fps)</label>
                <input
                  type="number"
                  min={0}
                  value={settings.fps}
                  onChange={(e) => setSettings((s) => ({ ...s, fps: e.target.value }))}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                  placeholder="默认不改"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-medium">分辨率宽</label>
                <input
                  type="number"
                  min={0}
                  value={settings.width}
                  onChange={(e) => setSettings((s) => ({ ...s, width: Number(e.target.value) }))}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                  placeholder="0 表示自适应"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-medium">分辨率高</label>
                <input
                  type="number"
                  min={0}
                  value={settings.height}
                  onChange={(e) => setSettings((s) => ({ ...s, height: Number(e.target.value) }))}
                  className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                  placeholder="0 表示自适应"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm dark:bg-gray-900/50">
              <span className="font-medium text-gray-800 dark:text-gray-100">去除音频</span>
              <label className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={settings.removeAudio}
                  onChange={(e) => setSettings((s) => ({ ...s, removeAudio: e.target.checked }))}
                />
                <span>开启</span>
              </label>
            </div>

            {!settings.removeAudio && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">音频编码器</label>
                    <select
                      value={settings.audioCodec}
                      onChange={(e) => setSettings((s) => ({ ...s, audioCodec: e.target.value }))}
                      className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                    >
                      {AUDIO_CODECS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">音频码率 (kbps)</label>
                    <input
                      type="number"
                      min={0}
                      value={settings.audioBitrate}
                      onChange={(e) => setSettings((s) => ({ ...s, audioBitrate: e.target.value }))}
                      className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">采样率 (Hz)</label>
                    <input
                      type="number"
                      min={0}
                      value={settings.audioSampleRate}
                      onChange={(e) => setSettings((s) => ({ ...s, audioSampleRate: e.target.value }))}
                      className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-medium">声道</label>
                    <select
                      value={settings.audioChannels}
                      onChange={(e) => setSettings((s) => ({ ...s, audioChannels: e.target.value }))}
                      className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
                    >
                      <option value="">默认</option>
                      <option value="1">单声道</option>
                      <option value="2">立体声</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100">
              部分编解码器可能在 WebAssembly 构建中不可用，失败时请尝试切换编码器或去掉高级参数。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
