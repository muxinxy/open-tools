'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type MeasurementMode = 'pixel' | 'cm' | 'percent' | 'preset';

type ImageInfo = {
  url: string;
  name: string;
  width: number;
  height: number;
};

type PresetSize = {
  id: string;
  label: string;
  widthPx: number;
  heightPx: number;
  group: PresetGroup;
};

type PresetGroup = 'common' | 'exam' | 'document';

const DPI = 300;
const CONTAINER_WIDTH = 640;
const CONTAINER_HEIGHT = 420;
const MIN_CROP_SIZE_PX = 20;

const PRESET_SIZES: PresetSize[] = [
  // 常见尺寸
  { id: 'common-1inch', label: '一寸 (295×413)', widthPx: 295, heightPx: 413, group: 'common' },
  { id: 'common-big-1inch', label: '大一寸 (390×567)', widthPx: 390, heightPx: 567, group: 'common' },
  { id: 'common-small-2inch', label: '小二寸 (413×531)', widthPx: 413, heightPx: 531, group: 'common' },
  { id: 'common-2inch', label: '二寸 (413×579)', widthPx: 413, heightPx: 579, group: 'common' },
  { id: 'common-5inch', label: '五寸 (1050×1500)', widthPx: 1050, heightPx: 1500, group: 'common' },
  { id: 'common-5inch-landscape', label: '五寸竖版 (1500×1050)', widthPx: 1500, heightPx: 1050, group: 'common' },

  // 报名考试
  { id: 'exam-civil-service-review', label: '公务员审核工具 (295×413)', widthPx: 295, heightPx: 413, group: 'exam' },
  { id: 'exam-civil-service-34x45', label: '公务员 3.4×4.5cm (402×531)', widthPx: 402, heightPx: 531, group: 'exam' },
  { id: 'exam-civil-service-small-130x170', label: '公务员小 (130×170)', widthPx: 130, heightPx: 170, group: 'exam' },
  { id: 'exam-civil-service-small-114x156', label: '公务员小 (114×156)', widthPx: 114, heightPx: 156, group: 'exam' },
  { id: 'exam-judicial', label: '司法考试 (413×626)', widthPx: 413, heightPx: 626, group: 'exam' },
  { id: 'exam-cet-computer', label: '四六级/计算机 (144×192)', widthPx: 144, heightPx: 192, group: 'exam' },
  { id: 'exam-accounting', label: '会计 (114×156)', widthPx: 114, heightPx: 156, group: 'exam' },
  { id: 'exam-nurse', label: '护士 (160×210)', widthPx: 160, heightPx: 210, group: 'exam' },
  { id: 'exam-mandarin', label: '普通话测试 (413×579)', widthPx: 413, heightPx: 579, group: 'exam' },
  { id: 'exam-gaokao-kaoyan', label: '高考/考研 (480×640)', widthPx: 480, heightPx: 640, group: 'exam' },
  { id: 'exam-japanese', label: '日语 (360×480)', widthPx: 360, heightPx: 480, group: 'exam' },

  // 各类证件
  { id: 'id-card', label: '身份证 (358×441)', widthPx: 358, heightPx: 441, group: 'document' },
  { id: 'social-security', label: '社保照片 (358×441)', widthPx: 358, heightPx: 441, group: 'document' },
  { id: 'diploma', label: '毕业证 (480×640)', widthPx: 480, heightPx: 640, group: 'document' },
  { id: 'teacher-cert', label: '教师资格证 (295×413)', widthPx: 295, heightPx: 413, group: 'document' },
  { id: 'passport', label: '护照 (390×567)', widthPx: 390, heightPx: 567, group: 'document' },

  // 产品图/头像
  { id: 'avatar-product', label: '产品图/头像 (800×800)', widthPx: 800, heightPx: 800, group: 'document' },
  { id: 'visa', label: '签证 (700×700)', widthPx: 700, heightPx: 700, group: 'document' },
];

const cmToPx = (cm: number) => Math.round((cm / 2.54) * DPI);

type Rotation = 0 | 90 | 180 | 270;

type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DragMode =
  | { type: 'none' }
  | { type: 'move'; startClientX: number; startClientY: number; startRect: CropRect }
  | {
      type: 'resize';
      startClientX: number;
      startClientY: number;
      startRect: CropRect;
      handle: ResizeHandle;
    };

type ResizeHandle =
  | 'n'
  | 's'
  | 'e'
  | 'w'
  | 'ne'
  | 'nw'
  | 'se'
  | 'sw';

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getOrientedSize = (width: number, height: number, rotation: Rotation) => {
  if (rotation === 90 || rotation === 270) return { width: height, height: width };
  return { width, height };
};

const clampCropRect = (rect: CropRect, imageW: number, imageH: number): CropRect => {
  const width = clamp(rect.width, MIN_CROP_SIZE_PX, Math.max(MIN_CROP_SIZE_PX, imageW));
  const height = clamp(rect.height, MIN_CROP_SIZE_PX, Math.max(MIN_CROP_SIZE_PX, imageH));
  const x = clamp(rect.x, 0, Math.max(0, imageW - width));
  const y = clamp(rect.y, 0, Math.max(0, imageH - height));
  return { x, y, width, height };
};

const centerCropRect = (width: number, height: number, imageW: number, imageH: number): CropRect => {
  const w = clamp(width, MIN_CROP_SIZE_PX, Math.max(MIN_CROP_SIZE_PX, imageW));
  const h = clamp(height, MIN_CROP_SIZE_PX, Math.max(MIN_CROP_SIZE_PX, imageH));
  return {
    width: w,
    height: h,
    x: Math.max(0, (imageW - w) / 2),
    y: Math.max(0, (imageH - h) / 2),
  };
};

const rotateRect = (rect: CropRect, imageW: number, imageH: number, direction: 'left' | 'right') => {
  // rect is in current oriented coordinate space (imageW x imageH)
  if (direction === 'right') {
    // clockwise 90
    return {
      x: imageH - (rect.y + rect.height),
      y: rect.x,
      width: rect.height,
      height: rect.width,
    };
  }
  // counter-clockwise 90
  return {
    x: rect.y,
    y: imageW - (rect.x + rect.width),
    width: rect.height,
    height: rect.width,
  };
};

export default function ImageCropperPage() {
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState<Rotation>(0);
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>('pixel');
  const [pixelSize, setPixelSize] = useState({ width: 600, height: 800 });
  const [cmSize, setCmSize] = useState({ width: 2.5, height: 3.5 });
  const [percentSize, setPercentSize] = useState({ width: 40, height: 60 });
  const [presetGroup, setPresetGroup] = useState<PresetGroup>('common');
  const [selectedPreset, setSelectedPreset] = useState(
    PRESET_SIZES.find((p) => p.group === 'common')?.id ?? PRESET_SIZES[0].id,
  );
  const [error, setError] = useState('');

  const imageRef = useRef<HTMLImageElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orientedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<DragMode>({ type: 'none' });

  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 300, height: 300 });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          url,
          name: file.name,
          width: img.width,
          height: img.height,
        });
        setZoom(1);
        setRotation(0);
      };
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const orientedSize = useMemo(() => {
    if (!imageInfo) return { width: 0, height: 0 };
    return getOrientedSize(imageInfo.width, imageInfo.height, rotation);
  }, [imageInfo, rotation]);

  const targetCropSizePx = useMemo(() => {
    if (!imageInfo) return { width: pixelSize.width, height: pixelSize.height };
    const { width: imageW, height: imageH } = orientedSize;

    const clampSize = (value: number, max: number) => {
      const safeMax = Math.max(MIN_CROP_SIZE_PX, max);
      return clamp(value, MIN_CROP_SIZE_PX, safeMax);
    };

    switch (measurementMode) {
      case 'pixel':
        return {
          width: clampSize(pixelSize.width, imageW),
          height: clampSize(pixelSize.height, imageH),
        };
      case 'cm':
        return {
          width: clampSize(cmToPx(cmSize.width), imageW),
          height: clampSize(cmToPx(cmSize.height), imageH),
        };
      case 'percent':
        return {
          width: clampSize((percentSize.width / 100) * imageW, imageW),
          height: clampSize((percentSize.height / 100) * imageH, imageH),
        };
      case 'preset': {
        const preset = PRESET_SIZES.find((p) => p.id === selectedPreset) ?? PRESET_SIZES[0];
        return {
          width: clampSize(preset.widthPx, imageW),
          height: clampSize(preset.heightPx, imageH),
        };
      }
      default:
        return { width: pixelSize.width, height: pixelSize.height };
    }
  }, [imageInfo, orientedSize, measurementMode, pixelSize, cmSize, percentSize, selectedPreset]);

  const baseScale = useMemo(() => {
    if (!imageInfo) return 1;
    return Math.min(CONTAINER_WIDTH / orientedSize.width, CONTAINER_HEIGHT / orientedSize.height);
  }, [imageInfo, orientedSize]);

  const displayScale = baseScale * zoom;
  const displayWidth = imageInfo ? orientedSize.width * displayScale : 0;
  const displayHeight = imageInfo ? orientedSize.height * displayScale : 0;

  const imageDisplayLeft = (CONTAINER_WIDTH - displayWidth) / 2;
  const imageDisplayTop = (CONTAINER_HEIGHT - displayHeight) / 2;

  const cropDisplayLeft = imageDisplayLeft + cropRect.x * displayScale;
  const cropDisplayTop = imageDisplayTop + cropRect.y * displayScale;
  const cropDisplayWidth = cropRect.width * displayScale;
  const cropDisplayHeight = cropRect.height * displayScale;

  const adjustZoomByWheelDelta = (deltaY: number) => {
    const delta = deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => {
      const next = clamp(prev + delta, 0.5, 3);
      return Number(next.toFixed(2));
    });
  };

  const handleZoomButton = (direction: 'in' | 'out') => {
    const delta = direction === 'in' ? 0.1 : -0.1;
    setZoom((prev) => {
      const next = clamp(prev + delta, 0.5, 3);
      return Number(next.toFixed(2));
    });
  };

  const beginMoveCrop = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageInfo) return;
    if ((event.target as HTMLElement).dataset.handle) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      type: 'move',
      startClientX: event.clientX,
      startClientY: event.clientY,
      startRect: cropRect,
    };
  };

  const beginResizeCrop = (event: React.PointerEvent<HTMLDivElement>, handle: ResizeHandle) => {
    if (!imageInfo) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      type: 'resize',
      startClientX: event.clientX,
      startClientY: event.clientY,
      startRect: cropRect,
      handle,
    };
  };

  const onCropPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!imageInfo) return;
    const mode = dragRef.current;
    if (mode.type === 'none') return;

    const dxPx = (event.clientX - mode.startClientX) / displayScale;
    const dyPx = (event.clientY - mode.startClientY) / displayScale;

    setCropRect((_prev) => {
      const current = mode.startRect;
      const { width: imageW, height: imageH } = orientedSize;

      if (mode.type === 'move') {
        return clampCropRect(
          {
            ...current,
            x: current.x + dxPx,
            y: current.y + dyPx,
          },
          imageW,
          imageH,
        );
      }

      const handle = mode.handle;
      let next = { ...current };

      const applyWest = () => {
        const newX = current.x + dxPx;
        const maxX = current.x + current.width - MIN_CROP_SIZE_PX;
        const clampedX = clamp(newX, 0, maxX);
        next.x = clampedX;
        next.width = current.width + (current.x - clampedX);
      };
      const applyEast = () => {
        const newW = current.width + dxPx;
        next.width = clamp(newW, MIN_CROP_SIZE_PX, imageW - current.x);
      };
      const applyNorth = () => {
        const newY = current.y + dyPx;
        const maxY = current.y + current.height - MIN_CROP_SIZE_PX;
        const clampedY = clamp(newY, 0, maxY);
        next.y = clampedY;
        next.height = current.height + (current.y - clampedY);
      };
      const applySouth = () => {
        const newH = current.height + dyPx;
        next.height = clamp(newH, MIN_CROP_SIZE_PX, imageH - current.y);
      };

      if (handle.includes('w')) applyWest();
      if (handle.includes('e')) applyEast();
      if (handle.includes('n')) applyNorth();
      if (handle.includes('s')) applySouth();

      next = clampCropRect(next, imageW, imageH);
      return next;
    });
  };

  const endCropPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.type === 'none') return;
    dragRef.current = { type: 'none' };
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // ignore
    }
  };

  const rotate = (direction: 'left' | 'right') => {
    if (!imageInfo) return;
    setRotation((prev) => {
      const next = (prev + (direction === 'right' ? 90 : 270)) % 360;
      return next as Rotation;
    });

    const { width: imageW, height: imageH } = orientedSize;
    const rotatedRect = rotateRect(cropRect, imageW, imageH, direction);
    const newOriented = getOrientedSize(imageW, imageH, 90);
    setCropRect(clampCropRect(rotatedRect, newOriented.width, newOriented.height));
  };

  const handleExport = () => {
    if (!imageInfo || !imageRef.current) {
      setError('请先上传图片并调整裁剪区域');
      return;
    }

    setError('');

    const orientedCanvas = document.createElement('canvas');
    orientedCanvas.width = orientedSize.width;
    orientedCanvas.height = orientedSize.height;
    const octx = orientedCanvas.getContext('2d');
    if (!octx) return;

    octx.save();
    switch (rotation) {
      case 0:
        octx.drawImage(imageRef.current, 0, 0);
        break;
      case 90:
        octx.translate(orientedSize.width, 0);
        octx.rotate(Math.PI / 2);
        octx.drawImage(imageRef.current, 0, 0);
        break;
      case 180:
        octx.translate(orientedSize.width, orientedSize.height);
        octx.rotate(Math.PI);
        octx.drawImage(imageRef.current, 0, 0);
        break;
      case 270:
        octx.translate(0, orientedSize.height);
        octx.rotate(-Math.PI / 2);
        octx.drawImage(imageRef.current, 0, 0);
        break;
      default:
        octx.drawImage(imageRef.current, 0, 0);
    }
    octx.restore();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const safeRect = clampCropRect(cropRect, orientedSize.width, orientedSize.height);
    const targetWidth = Math.round(safeRect.width);
    const targetHeight = Math.round(safeRect.height);
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.drawImage(orientedCanvas, safeRect.x, safeRect.y, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);

    canvas.toBlob((blob) => {
      if (!blob) {
        setError('导出失败，请重试');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `crop-${imageInfo.name}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  useEffect(() => {
    // Keep crop size in sync when user changes measurement inputs.
    if (!imageInfo) return;
    setCropRect((prev) => {
      const { width: imageW, height: imageH } = orientedSize;
      const next = centerCropRect(targetCropSizePx.width, targetCropSizePx.height, imageW, imageH);
      // If user already moved/resized manually, only update size and keep center position.
      const cx = prev.x + prev.width / 2;
      const cy = prev.y + prev.height / 2;
      const x = cx - next.width / 2;
      const y = cy - next.height / 2;
      return clampCropRect({ ...next, x, y }, imageW, imageH);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    imageInfo,
    rotation,
    measurementMode,
    pixelSize.width,
    pixelSize.height,
    cmSize.width,
    cmSize.height,
    percentSize.width,
    percentSize.height,
    selectedPreset,
  ]);

  useEffect(() => {
    if (measurementMode !== 'preset') return;
    const selected = PRESET_SIZES.find((p) => p.id === selectedPreset);
    if (selected && selected.group === presetGroup) return;
    const first = PRESET_SIZES.find((p) => p.group === presetGroup);
    if (first) setSelectedPreset(first.id);
  }, [measurementMode, presetGroup, selectedPreset]);

  useEffect(() => {
    // Create an oriented offscreen canvas for fast preview draw.
    if (!imageInfo || !imageRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = orientedSize.width;
    canvas.height = orientedSize.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    switch (rotation) {
      case 0:
        ctx.drawImage(imageRef.current, 0, 0);
        break;
      case 90:
        ctx.translate(orientedSize.width, 0);
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(imageRef.current, 0, 0);
        break;
      case 180:
        ctx.translate(orientedSize.width, orientedSize.height);
        ctx.rotate(Math.PI);
        ctx.drawImage(imageRef.current, 0, 0);
        break;
      case 270:
        ctx.translate(0, orientedSize.height);
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(imageRef.current, 0, 0);
        break;
      default:
        ctx.drawImage(imageRef.current, 0, 0);
    }
    ctx.restore();

    orientedCanvasRef.current = canvas;
  }, [imageInfo, rotation, orientedSize]);

  useEffect(() => {
    // Draw preview canvas (zoom/rotation changes).
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvasRef.current.width = Math.floor(CONTAINER_WIDTH * dpr);
    canvasRef.current.height = Math.floor(CONTAINER_HEIGHT * dpr);
    canvasRef.current.style.width = `${CONTAINER_WIDTH}px`;
    canvasRef.current.style.height = `${CONTAINER_HEIGHT}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, CONTAINER_WIDTH, CONTAINER_HEIGHT);

    if (!imageInfo || !orientedCanvasRef.current) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(orientedCanvasRef.current, imageDisplayLeft, imageDisplayTop, displayWidth, displayHeight);
  }, [imageInfo, imageDisplayLeft, imageDisplayTop, displayWidth, displayHeight]);

  useEffect(() => {
    // Prevent page scroll while zooming with wheel.
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!imageInfo) return;
      e.preventDefault();
      e.stopPropagation();
      adjustZoomByWheelDelta(e.deltaY);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
    };
  }, [imageInfo]);

  const measurementControls = (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(['pixel', 'cm', 'percent', 'preset'] as MeasurementMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setMeasurementMode(mode)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              measurementMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {mode === 'pixel' && '像素'}
            {mode === 'cm' && '厘米'}
            {mode === 'percent' && '百分比'}
            {mode === 'preset' && '常见尺寸'}
          </button>
        ))}
      </div>

      {measurementMode === 'pixel' && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            宽度 (px)
            <input
              type="number"
              min={20}
              value={pixelSize.width}
              onChange={(e) => setPixelSize((prev) => ({ ...prev, width: Number(e.target.value) }))}
              className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            高度 (px)
            <input
              type="number"
              min={20}
              value={pixelSize.height}
              onChange={(e) => setPixelSize((prev) => ({ ...prev, height: Number(e.target.value) }))}
              className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
            />
          </label>
        </div>
      )}

      {measurementMode === 'cm' && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            宽度 (cm)
            <input
              type="number"
              min={0.5}
              step={0.1}
              value={cmSize.width}
              onChange={(e) => setCmSize((prev) => ({ ...prev, width: Number(e.target.value) }))}
              className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            高度 (cm)
            <input
              type="number"
              min={0.5}
              step={0.1}
              value={cmSize.height}
              onChange={(e) => setCmSize((prev) => ({ ...prev, height: Number(e.target.value) }))}
              className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
            />
          </label>
          <p className="col-span-2 text-xs text-gray-500">
            按照 300 DPI 计算，1 cm ≈ 118 像素，可满足大多数证件照需求。
          </p>
        </div>
      )}

      {measurementMode === 'percent' && (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <label className="flex flex-col gap-1">
            宽度占比 (%)
            <input
              type="number"
              min={5}
              max={100}
              value={percentSize.width}
              onChange={(e) => setPercentSize((prev) => ({ ...prev, width: Number(e.target.value) }))}
              className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
            />
          </label>
          <label className="flex flex-col gap-1">
            高度占比 (%)
            <input
              type="number"
              min={5}
              max={100}
              value={percentSize.height}
              onChange={(e) => setPercentSize((prev) => ({ ...prev, height: Number(e.target.value) }))}
              className="rounded-md border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-800"
            />
          </label>
          <p className="col-span-2 text-xs text-gray-500">按原图尺寸的百分比裁剪，适合快速截取主体区域。</p>
        </div>
      )}

      {measurementMode === 'preset' && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'common', label: '常见尺寸' },
              { id: 'exam', label: '报名考试' },
              { id: 'document', label: '各类证件' },
            ] as { id: PresetGroup; label: string }[]).map((g) => (
              <button
                key={g.id}
                onClick={() => setPresetGroup(g.id)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  presetGroup === g.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="max-h-64 space-y-2 overflow-auto text-sm pr-1">
            {PRESET_SIZES.filter((p) => p.group === presetGroup).map((preset) => (
              <label key={preset.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="preset-size"
                  checked={selectedPreset === preset.id}
                  onChange={() => setSelectedPreset(preset.id)}
                />
                <span>{preset.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const zoomControls = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={() => handleZoomButton('out')}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200"
      >
        -
      </button>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="whitespace-nowrap">缩放</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-40"
        />
        <span className="w-12 text-right">{(zoom * 100).toFixed(0)}%</span>
      </div>
      <button
        onClick={() => handleZoomButton('in')}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200"
      >
        +
      </button>
      <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />
      <button
        onClick={() => rotate('left')}
        disabled={!imageInfo}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200"
      >
        左旋 90°
      </button>
      <button
        onClick={() => rotate('right')}
        disabled={!imageInfo}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:text-gray-200"
      >
        右旋 90°
      </button>
    </div>
  );

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
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">图片裁剪工具</h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持像素、厘米、百分比及常见证件照尺寸，拖动裁剪框并缩放图片完成裁剪。
          </p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Left side: crop workspace */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span aria-hidden className="text-base">
                  📤
                </span>
                <span>上传图片</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
              <div className="text-xs text-gray-500">
                {imageInfo ? (
                  <span>
                    原图：{imageInfo.width} × {imageInfo.height} px
                  </span>
                ) : (
                  <span>支持常见 JPG/PNG 等格式</span>
                )}
              </div>

              <button
                onClick={handleExport}
                disabled={!imageInfo}
                className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
              >
                <span aria-hidden>⬇️</span>
                导出裁剪图
              </button>
            </div>

            <div
              ref={stageRef}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-black/5 dark:border-gray-700"
              style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT, touchAction: 'none' }}
            >
              {!imageInfo && (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  请先上传图片
                </div>
              )}

              {imageInfo && (
                <div className="relative h-full w-full">
                  <img ref={imageRef} src={imageInfo.url} alt="source" className="hidden" />
                  <canvas ref={canvasRef} className="absolute left-0 top-0" />

                  <div
                    className="absolute"
                    style={{
                      left: cropDisplayLeft,
                      top: cropDisplayTop,
                      width: cropDisplayWidth,
                      height: cropDisplayHeight,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
                      border: '2px solid rgba(255,255,255,0.85)',
                      cursor: dragRef.current.type !== 'none' ? 'grabbing' : 'grab',
                      userSelect: 'none',
                      touchAction: 'none',
                    }}
                    role="application"
                    onPointerDown={beginMoveCrop}
                    onPointerMove={onCropPointerMove}
                    onPointerUp={endCropPointer}
                    onPointerLeave={endCropPointer}
                  >
                    <div className="absolute left-1 top-1 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {Math.round(cropRect.width)} × {Math.round(cropRect.height)} px
                    </div>

                    {/* resize handles */}
                    {([
                      { h: 'nw', cls: 'left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize' },
                      { h: 'n', cls: 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize' },
                      { h: 'ne', cls: 'right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize' },
                      { h: 'e', cls: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
                      { h: 'se', cls: 'right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize' },
                      { h: 's', cls: 'left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-ns-resize' },
                      { h: 'sw', cls: 'left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize' },
                      { h: 'w', cls: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize' },
                    ] as { h: ResizeHandle; cls: string }[]).map((item) => (
                      <div
                        key={item.h}
                        data-handle={item.h}
                        className={`absolute h-3 w-3 rounded bg-blue-500 ${item.cls}`}
                        onPointerDown={(e) => beginResizeCrop(e, item.h)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {zoomControls}
          </div>

          {/* Right side: controls */}
          <div className="w-full space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 lg:w-[380px]">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">裁剪设置</h2>
            {measurementControls}
            <div className="rounded-md bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-300">
              <p>滚轮/滑块用于缩放图片（不会触发页面滚动）。</p>
              <p>拖动裁剪框可移动位置；拖动边角小方块可调整裁剪框大小。</p>
              <p>导出按裁剪框当前像素尺寸输出 PNG。</p>
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
