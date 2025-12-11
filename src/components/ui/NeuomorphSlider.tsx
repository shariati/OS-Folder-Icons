import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface NeuomorphSliderProps {
  value?: number | number[]; // Controlled value
  defaultValue?: number | number[]; // Uncontrolled default
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange?: (value: number | number[]) => void;
  onChangeEnd?: (value: number | number[]) => void;
  className?: string;
  label?: string;
  showTooltip?: boolean;
  marks?: { value: number; label?: string }[];
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  fillClassName?: string;
  trackClassName?: string;
  formatTooltip?: (value: number) => string;
}

export function NeuomorphSlider({
  value: propValue,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onChange,
  onChangeEnd,
  className,
  fillClassName = 'bg-gradient-to-r from-orange-400 to-pink-500',
  trackClassName,
  label,
  showTooltip = false,
  marks = [],
  startContent,
  endContent,
  formatTooltip = (v) => v.toString(),
}: NeuomorphSliderProps) {
  const isControlled = propValue !== undefined;
  const [internalValue, setInternalValue] = useState<number>(
    isControlled ? (propValue as number) : (defaultValue as number)
  );

  const currentValue = isControlled ? (propValue as number) : internalValue;
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  // Motion value for the thumb position in pixels
  const x = useMotionValue(0);
  const fillWidth = useTransform(x, (v) => v);

  // Update track width on mount/resize
  useEffect(() => {
    if (!trackRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setTrackWidth(entry.contentRect.width);
      }
    });

    observer.observe(trackRef.current);
    return () => observer.disconnect();
  }, []);

  const isDragging = useRef(false);

  const THUMB_SIZE = 14;
  const AVAILABLE_WIDTH = trackWidth - THUMB_SIZE * 2;

  // Sync x with value when value changes (external update or initial)
  useEffect(() => {
    if (trackWidth === 0 || isDragging.current) return;
    const progress = (currentValue - min) / (max - min);

    // Constrain the travel range
    // Start at THUMB_SIZE, end at trackWidth - THUMB_SIZE
    const targetX = progress * AVAILABLE_WIDTH;

    animate(x, targetX, { type: 'spring', stiffness: 300, damping: 30 });
  }, [currentValue, min, max, trackWidth, x]);

  const handleDrag = (event: Event, info: PanInfo) => {
    if (disabled || trackWidth === 0) return;

    const currentX = x.get();

    // Calculate progress based on the constrained range
    let newProgress = currentX / AVAILABLE_WIDTH;
    newProgress = Math.min(Math.max(newProgress, 0), 1);

    let newValue = min + newProgress * (max - min);

    // Snap to step
    if (step) {
      const steps = Math.round((newValue - min) / step);
      newValue = min + steps * step;
    }

    newValue = Math.min(Math.max(newValue, min), max);

    if (newValue !== currentValue) {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onChange?.(newValue);
    }
  };

  const handleDragStart = () => {
    isDragging.current = true;
  };

  const handleDragEnd = () => {
    isDragging.current = false;
    if (!disabled) {
      const progress = (currentValue - min) / (max - min);
      const targetX = progress * AVAILABLE_WIDTH;

      animate(x, targetX, { type: 'spring', stiffness: 300, damping: 30 });

      onChangeEnd?.(currentValue);
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !trackRef.current || trackWidth === 0) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const relativeX = e.clientX - trackRect.left;

    let newProgress = relativeX / AVAILABLE_WIDTH;

    newProgress = Math.min(Math.max(newProgress, 0), 1);

    let newValue = min + newProgress * (max - min);

    if (step) {
      const steps = Math.round((newValue - min) / step);
      newValue = min + steps * step;
    }

    newValue = Math.min(Math.max(newValue, min), max);
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
    onChangeEnd?.(newValue);
  };

  return (
    <div className={twMerge('w-full select-none', className)}>
      {label && (
        <label className="mb-3 block text-sm font-bold text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}

      <div className="flex items-center gap-4">
        {startContent && <div className="text-gray-500">{startContent}</div>}

        <div
          className="group relative h-8 flex-1 cursor-pointer py-1"
          /* Increased height slightly for hit area, py-1 to center 6px track */
          onClick={handleTrackClick}
        >
          {/* Reference div for width measurement */}
          <div
            ref={trackRef}
            className="pointer-events-none absolute left-0 right-0 top-1/2 -mt-1.5 h-3 opacity-0"
          />

          {/* Track Background - neu-pressed */}
          <div
            className={twMerge(
              clsx(
                'absolute left-0 right-0 top-1/2 -mt-1.5 h-3 rounded-full',
                !trackClassName && 'neu-pressed',
                'border-none',
                disabled && 'cursor-not-allowed opacity-50'
              ),
              trackClassName
            )}
          ></div>

          {/* Filled Track using Motion */}
          <motion.div
            className={twMerge(
              clsx(
                'pointer-events-none absolute left-0 top-1/2 -mt-1.5 h-3 rounded-full',
                disabled && 'opacity-50 grayscale'
              ),
              fillClassName
            )}
            style={{ width: fillWidth }}
          />

          {/* Thumb - neu-flat */}
          <motion.div
            className={clsx(
              'absolute flex h-7 w-7 items-center justify-center rounded-full',
              'neu-flat',
              'border-none',
              disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
            )}
            style={{ x }}
            drag="x"
            dragConstraints={{ left: 0, right: AVAILABLE_WIDTH }}
            dragElastic={0}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            custom={trackWidth}
          >
            <div className="absolute inset-0 -z-10 rounded-full" />
            {/* Small dimple */}
            <div className="h-2 w-2 rounded-full bg-gray-300 shadow-inner dark:bg-gray-600" />
            {/* Tooltip */}
            {showTooltip && (
              <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-200 dark:text-gray-900">
                {formatTooltip(currentValue)}
                <div className="absolute -bottom-1 left-1/2 -ml-1 h-2 w-2 rotate-45 bg-gray-800 dark:bg-gray-200"></div>
              </div>
            )}
          </motion.div>
        </div>

        {endContent && <div className="text-gray-500">{endContent}</div>}
      </div>

      {marks.length > 0 && (
        <div className="relative mt-2 h-4 w-full">
          {marks.map((mark, index) => {
            const markPos = ((mark.value - min) / (max - min)) * 100;
            return (
              <div
                key={index}
                className="absolute flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${markPos}%` }}
              >
                <div className="h-1 w-0.5 bg-gray-400 dark:bg-gray-500"></div>
                {mark.label && (
                  <span className="mt-1 select-none text-[10px] text-gray-500">{mark.label}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
