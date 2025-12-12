import React, { forwardRef } from 'react';

interface PolaroidPhotoFrameProps {
  image: string | null;
  title: string;
  date: string;
  countryFlag: React.ReactNode;
  backgroundColor: string;
  textColor: string;
  baseScale: number;
  zoom: number;
  position: { x: number; y: number };
  onAutoFit: (scale: number, position: { x: number; y: number }) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const PolaroidPhotoFrame = forwardRef<HTMLDivElement, PolaroidPhotoFrameProps>(
  (
    {
      image,
      title,
      date,
      countryFlag,
      backgroundColor,
      textColor,
      baseScale,
      zoom,
      position,
      onAutoFit,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    ref
  ) => {
    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      const CONTAINER_SIZE = 360;

      // Calculate scale to cover the container
      const scaleX = CONTAINER_SIZE / naturalWidth;
      const scaleY = CONTAINER_SIZE / naturalHeight;
      const scale = Math.max(scaleX, scaleY);

      // Center the image
      const x = (CONTAINER_SIZE - naturalWidth) / 2;
      const y = (CONTAINER_SIZE - naturalHeight) / 2;

      onAutoFit(scale, { x, y });
    };

    return (
      <div
        ref={ref}
        className="relative flex flex-shrink-0 flex-col items-center shadow-2xl"
        style={{
          width: '420px', // 14 units * 30px scale
          height: '510px', // 17 units * 30px scale
          padding: '30px 30px 120px 30px', // 1 unit top/sides, 4 units bottom
          boxSizing: 'border-box',
          backgroundColor: backgroundColor,
        }}
      >
        {/* Image Area */}
        <div
          className="relative h-full w-full cursor-move overflow-hidden bg-gray-100"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          {image ? (
            <img
              src={image}
              alt="Uploaded"
              className="absolute max-w-none"
              onLoad={handleImageLoad}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${baseScale * zoom})`,
                transformOrigin: 'center',
                pointerEvents: 'none', // Let the container handle events
                userSelect: 'none',
                left: 0,
                top: 0,
              }}
              draggable={false}
            />
          ) : (
            <label
              htmlFor="photo-upload-trigger"
              className="flex h-full w-full cursor-pointer items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <p className="text-sm font-medium">Upload an image</p>
            </label>
          )}
        </div>

        {/* Text Area (Absolute positioned relative to frame) */}
        <div className="absolute bottom-0 left-0 flex h-[120px] w-full flex-col justify-center px-[30px] py-4">
          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <h2
                className="text-2xl leading-tight"
                style={{
                  fontFamily: 'var(--font-recursive), sans-serif',
                  fontWeight: 600,
                  color: textColor,
                }}
              >
                {title}
              </h2>
              <p
                className="text-lg"
                style={{
                  fontFamily: 'var(--font-recursive), sans-serif',
                  fontWeight: 400,
                  color: textColor,
                  opacity: 0.8,
                }}
              >
                {date}
              </p>
            </div>
            <div className="text-4xl drop-shadow-sm filter">{countryFlag}</div>
          </div>
        </div>
      </div>
    );
  }
);
PolaroidPhotoFrame.displayName = 'PolaroidPhotoFrame';
