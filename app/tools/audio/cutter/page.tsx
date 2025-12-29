'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

type TaskStatus = 'pending' | 'processing' | 'done' | 'error';

type AudioTask = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  url: string;
  duration?: number;
  start: number;
  end: number;
  currentTime?: number;
  playbackRate: number;
  volume: number;
  loop: boolean;
  status: TaskStatus;
  outputUrl?: string;
  outputName?: string;
  message?: string;
  progress?: number;
};

const MAX_FILES = 1;
const MAX_SIZE = 50 * 1024 * 1024;
const OUTPUT_FORMATS = ['aac', 'flac', 'm4a', 'wav', 'mp3'];

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

const codecByFormat: Record<string, string> = {
  aac: 'aac',
  flac: 'flac',
  m4a: 'aac',
  wav: 'pcm_s16le',
  mp3: 'libmp3lame',
};

const mimeByFormat: Record<string, string> = {
  aac: 'audio/aac',
  flac: 'audio/flac',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  mp3: 'audio/mpeg',
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

const toSeconds = (minutes: number, seconds: number) => clamp(minutes * 60 + seconds, 0, Number.MAX_SAFE_INTEGER);

const formatTime = (sec?: number) => {
  if (!sec || !Number.isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const loadDuration = (url: string) =>
  new Promise<number>((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      resolve(audio.duration || 0);
    };
    audio.onerror = () => reject(new Error('无法读取音频时长'));
    audio.src = url;
  });

export default function AudioCutterPage() {
  const [tasks, setTasks] = useState<AudioTask[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [format, setFormat] = useState<string>('aac');
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ffmpegReady, setFfmpegReady] = useState(false);
  const [ffmpegLoading, setFfmpegLoading] = useState(false);
  const currentTaskIdRef = useRef<string | null>(null);
  const cancelRef = useRef(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

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

  const addFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files);
    if (arr.length > MAX_FILES) {
      setError(`一次仅支持 ${MAX_FILES} 个音频文件`);
      return;
    }
    const oversize = arr.find((f) => f.size > MAX_SIZE);
    if (oversize) {
      setError('单个文件需小于 50MB');
      return;
    }
    const notAudio = arr.find((f) => !f.type.startsWith('audio/'));
    if (notAudio) {
      setError('仅支持音频文件');
      return;
    }

    const nextItems: AudioTask[] = [];
    for (const file of arr) {
      const id = genId();
      const url = URL.createObjectURL(file);
      let duration = 0;
      try {
        duration = await loadDuration(url);
      } catch (e) {
        console.warn(e);
      }
      nextItems.push({
        id,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        url,
        duration,
        start: 0,
        end: duration || 0,
        currentTime: 0,
        playbackRate: 1,
        volume: 1,
        loop: false,
        status: 'pending',
      });
    }

    setTasks((prev) => {
      if (prev.length + nextItems.length > MAX_FILES) {
        setError(`一次仅支持 ${MAX_FILES} 个音频文件`);
        return prev;
      }
      setError('');
      return [...prev, ...nextItems];
    });
  };

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    addFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      if (target?.outputUrl) URL.revokeObjectURL(target.outputUrl);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const updateTaskRange = (id: string, key: 'start' | 'end', value: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, [key]: Math.max(0, value) } as AudioTask;
        if (next.duration && key === 'end' && next.end > next.duration) next.end = next.duration;
        if (next.duration && key === 'start' && next.start > next.duration) next.start = next.duration;
        if (next.start > next.end) {
          if (key === 'start') next.end = next.start;
          else next.start = next.end;
        }
        return next;
      }),
    );
  };

  const buildArgs = (inputName: string, outputName: string, start: number, end: number) => {
    const args: string[] = [];
    if (start > 0) args.push('-ss', start.toString());
    if (end > 0 && end > start) args.push('-to', end.toString());
    args.push('-i', inputName, '-vn');
    args.push('-c:a', codecByFormat[format] || 'aac');
    args.push('-f', format);
    args.push(outputName);
    return args;
  };

  const cutOne = useCallback(
    async (task: AudioTask) => {
      const ffmpeg = await ensureFFmpeg();
      const inputExt = getExtension(task.name) || 'dat';
      const inputName = `input-${task.id}.${inputExt}`;
      const outputName = `cut-${task.id}.${format}`;
      const start = Math.max(0, task.start);
      const end = task.end > 0 && (!task.duration || task.end <= task.duration) ? task.end : 0;

      await ffmpeg.writeFile(inputName, await fetchFile(task.file));
      const args = buildArgs(inputName, outputName, start, end);
      currentTaskIdRef.current = task.id;
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputName);
      const bytes = data instanceof Uint8Array ? data : 'data' in (data as any) ? (data as any).data : new Uint8Array();
      const blob = new Blob([bytes], { type: mimeByFormat[format] || 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      return { url, outputName };
    },
    [ensureFFmpeg, format],
  );

  const handleCutAll = async () => {
    if (!tasks.length) {
      setError('请先选择文件');
      return;
    }
    setError('');
    setIsProcessing(true);
    cancelRef.current = false;

    for (const task of tasks) {
      if (cancelRef.current) break;
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'processing', message: '', progress: 0 } : t)));
      try {
        const result = await cutOne(task);
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'done', outputUrl: result.url, outputName: result.outputName, message: undefined, progress: 100 }
              : t,
          ),
        );
      } catch (err) {
        console.error(err);
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: 'error', message: '剪辑失败，请调整时间或格式' } : t)));
      }
    }

    setIsProcessing(false);
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
    setIsProcessing(false);
    currentTaskIdRef.current = null;
    setTasks((prev) => prev.map((t) => (t.status === 'processing' ? { ...t, status: 'error', message: '已取消', progress: undefined } : t)));
  };

  const applyAudioProps = (task: AudioTask) => {
    const audio = audioRefs.current[task.id];
    if (!audio) return;
    audio.playbackRate = task.playbackRate;
    audio.volume = task.volume;
    audio.loop = task.loop;
  };

  const summaryText = useMemo(() => {
    if (!tasks.length) return '未选择文件';
    const done = tasks.filter((t) => t.status === 'done').length;
    const processing = tasks.some((t) => t.status === 'processing');
    if (processing) return `正在剪辑 ${tasks.length} 个，已完成 ${done}`;
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

      <div className="mx-auto max-w-7xl">
        <div className="mb-5">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">音频剪辑</h1>
          <p className="text-gray-600 dark:text-gray-400">
            在线可视化编辑，纯浏览器内处理，支持 AAC / FLAC / M4A / WAV / MP3 输出，单文件 ≤ 50MB，最多 5 个。
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span aria-hidden>📤</span>
                <span>上传/拖拽音频</span>
                <input type="file" accept="audio/*" multiple className="hidden" onChange={handleFiles} />
              </label>

              <button
                onClick={handleCutAll}
                disabled={!tasks.length || isProcessing || ffmpegLoading}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                {isProcessing ? '剪辑中…' : '开始剪辑'}
              </button>

              <button
                onClick={handleCancel}
                disabled={!isProcessing}
                className="inline-flex items-center gap-2 rounded-md bg-gray-200 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-60"
              >
                取消
              </button>

              <span className="text-xs text-gray-500 whitespace-nowrap">{summaryText}</span>
            </div>

            <div
              className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              将音频拖拽到此处，或点击上方按钮选择文件。
            </div>

            <div className="grid gap-3 sm:grid-cols-1">
              {tasks.length === 0 && (
                <div className="col-span-2 rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  仅支持 1 个音频文件，单个 ≤ 50MB。
                </div>
              )}

              {tasks.map((task) => (
                <div key={task.id} className="rounded-lg border border-gray-200 p-3 shadow-sm dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-[260px] space-y-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatBytes(task.size)} {task.duration ? `· ${task.duration.toFixed(1)}s` : ''}
                      </p>
                      <audio
                        controls
                        src={task.url}
                        className="w-full"
                        preload="metadata"
                        ref={(el) => {
                          if (el) {
                            audioRefs.current[task.id] = el;
                            applyAudioProps(task);
                          }
                        }}
                        onLoadedMetadata={(e) => {
                          const target = e.currentTarget;
                          if (!target) return;
                          const duration = Number.isFinite(target.duration) ? target.duration : 0;
                          const ct = Number.isFinite(target.currentTime) ? target.currentTime : 0;
                          setTasks((prev) =>
                            prev.map((t) =>
                              t.id === task.id
                                ? {
                                    ...t,
                                    duration,
                                    end: t.end || duration,
                                    currentTime: ct,
                                  }
                                : t,
                            ),
                          );
                        }}
                        onTimeUpdate={(e) => {
                          const target = e.currentTarget;
                          if (!target) return;
                          const ct = Number.isFinite(target.currentTime) ? target.currentTime : 0;
                          const start = task.start || 0;
                          const end = task.end || task.duration || 0;
                          if (ct < start) {
                            target.currentTime = start;
                            return;
                          }
                          if (end > start && ct > end) {
                            target.pause();
                            target.currentTime = end;
                            setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, currentTime: end } : t)));
                            return;
                          }
                          setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, currentTime: ct } : t)));
                        }}
                        onPlay={(e) => {
                          const target = e.currentTarget;
                          const start = task.start || 0;
                          if (target && target.currentTime < start) target.currentTime = start;
                        }}
                      />

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span>{formatTime(task.currentTime)}</span>
                          <span>{formatTime(task.duration)}</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={task.duration || 0}
                          step={0.01}
                          value={task.currentTime ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const audio = audioRefs.current[task.id];
                            if (audio) audio.currentTime = val;
                            setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, currentTime: val } : t)));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <div
                          className="h-2 rounded bg-gray-100 dark:bg-gray-800"
                          style={{
                            background:
                              task.duration && task.duration > 0
                                ? `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${(task.start / task.duration) * 100}%, #3b82f6 ${(task.start / task.duration) * 100}%, #3b82f6 ${(task.end / task.duration) * 100}%, #e5e7eb ${(task.end / task.duration) * 100}%, #e5e7eb 100%)`
                                : undefined,
                          }}
                        />
                        <div className="flex flex-col gap-1 text-xs text-gray-700 dark:text-gray-200">
                          <input
                            type="range"
                            min={0}
                            max={task.duration || 0}
                            step={0.01}
                            value={task.start}
                            onChange={(e) => updateTaskRange(task.id, 'start', Number(e.target.value))}
                          />
                          <input
                            type="range"
                            min={0}
                            max={task.duration || 0}
                            step={0.01}
                            value={task.end}
                            onChange={(e) => updateTaskRange(task.id, 'end', Number(e.target.value))}
                          />
                          <div className="flex justify-between text-[11px] text-gray-500">
                            <span>开始 {formatTime(task.start)}</span>
                            <span>结束 {formatTime(task.end)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-200">
                        <label className="flex items-center gap-1">
                          <span className="whitespace-nowrap">开始 (分:秒)</span>
                          <div className="flex w-full items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={Math.floor(task.start / 60)}
                              onChange={(e) => updateTaskRange(task.id, 'start', toSeconds(Number(e.target.value), Math.floor(task.start % 60)))}
                              className="w-14 rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                            />
                            <span>:</span>
                            <input
                              type="number"
                              min={0}
                              max={59}
                              value={Math.floor(task.start % 60)}
                              onChange={(e) => updateTaskRange(task.id, 'start', toSeconds(Math.floor(task.start / 60), Number(e.target.value)))}
                              className="w-14 rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                            />
                          </div>
                        </label>
                        <label className="flex items-center gap-1">
                          <span className="whitespace-nowrap">结束 (分:秒)</span>
                          <div className="flex w-full items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              value={Math.floor(task.end / 60)}
                              onChange={(e) => updateTaskRange(task.id, 'end', toSeconds(Number(e.target.value), Math.floor(task.end % 60)))}
                              className="w-14 rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                            />
                            <span>:</span>
                            <input
                              type="number"
                              min={0}
                              max={59}
                              value={Math.floor(task.end % 60)}
                              onChange={(e) => updateTaskRange(task.id, 'end', toSeconds(Math.floor(task.end / 60), Number(e.target.value)))}
                              className="w-14 rounded-md border border-gray-300 px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800"
                            />
                          </div>
                        </label>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-700 dark:text-gray-200">
                        <label className="flex items-center gap-2">
                          <span className="whitespace-nowrap">播放速度</span>
                          <input
                            type="range"
                            min={0.5}
                            max={2}
                            step={0.05}
                            value={task.playbackRate}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, playbackRate: val } : t)));
                              const audio = audioRefs.current[task.id];
                              if (audio) audio.playbackRate = val;
                            }}
                          />
                          <span className="w-10 text-right">{task.playbackRate.toFixed(2)}x</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <span className="whitespace-nowrap">音量</span>
                          <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={task.volume}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, volume: val } : t)));
                              const audio = audioRefs.current[task.id];
                              if (audio) audio.volume = val;
                            }}
                          />
                          <span className="w-10 text-right">{Math.round(task.volume * 100)}%</span>
                        </label>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-700 dark:text-gray-200">
                        <label className="inline-flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={task.loop}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, loop: checked } : t)));
                              const audio = audioRefs.current[task.id];
                              if (audio) audio.loop = checked;
                            }}
                          />
                          <span>循环播放</span>
                        </label>
                        <button
                          onClick={() => {
                            const audio = audioRefs.current[task.id];
                            if (audio) audio.currentTime = task.start;
                            setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, currentTime: task.start } : t)));
                          }}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap transition-colors hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          跳到开始
                        </button>
                        <button
                          onClick={() => {
                            const audio = audioRefs.current[task.id];
                            if (audio) audio.currentTime = task.end;
                            setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, currentTime: task.end } : t)));
                          }}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap transition-colors hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          跳到结束
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 whitespace-nowrap dark:bg-gray-800 dark:text-gray-300">
                        {task.status === 'pending' && '待剪辑'}
                        {task.status === 'processing' && '处理中'}
                        {task.status === 'done' && '完成'}
                        {task.status === 'error' && '失败'}
                      </div>
                      <button
                        onClick={() => removeTask(task.id)}
                        disabled={isProcessing && task.status === 'processing'}
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
                            a.download = task.outputName || `cut-${task.name}.${format}`;
                            a.click();
                          }}
                          className="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 whitespace-nowrap hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-200"
                        >
                          下载结果
                        </button>
                        <span className="text-gray-400">·</span>
                        <span>{task.outputName || `输出.${format}`}</span>
                      </>
                    ) : (
                      <span className="text-gray-500">等待剪辑完成</span>
                    )}
                  </div>

                  {task.message && <p className="mt-1 text-xs text-red-600">{task.message}</p>}
                </div>
              ))}
            </div>

            {(ffmpegLoading || ffmpegReady) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-300">
                {ffmpegLoading ? '正在加载 FFmpeg 内核，大文件剪辑时请耐心等待…' : 'FFmpeg 已加载，本地离线剪辑，无需上传。'}
              </div>
            )}

            {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          </div>

          <div className="w-full space-y-4 rounded-lg border border-gray-200 p-4 text-sm dark:border-gray-700 lg:w-[360px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">输出设置</h2>
            <div className="flex flex-col gap-2">
              <label className="font-medium">输出格式</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
              >
                {OUTPUT_FORMATS.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-md bg-yellow-50 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100">
              可输入开始/结束秒数完成裁剪，保持分辨率并在浏览器内完成处理，确保数据安全。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
