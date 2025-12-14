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
  exportScale?: number;
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
      exportScale = 1,
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
          width: `${420 * exportScale}px`,
          height: `${510 * exportScale}px`,
          padding: `${30 * exportScale}px ${30 * exportScale}px ${
            120 * exportScale
          }px ${30 * exportScale}px`,
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
          {/* Scale Wrapper for internal content to maintain coordinate system */}
          <div
            style={{
              width: '360px',
              height: '360px',
              transform: `scale(${exportScale})`,
              transformOrigin: 'top left',
            }}
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
        </div>

        {/* Text Area (Absolute positioned relative to frame) */}
        <div
          className="absolute bottom-0 left-0 flex w-full flex-col justify-center"
          style={{
            height: `${120 * exportScale}px`,
            padding: `${16 * exportScale}px ${30 * exportScale}px`,
          }}
        >
          <div className="flex items-end justify-between">
            <div className="flex flex-col" style={{ gap: `${4 * exportScale}px` }}>
              <h2
                className="leading-tight"
                style={{
                  fontFamily: 'var(--font-recursive), sans-serif',
                  fontWeight: 600,
                  color: textColor,
                  fontSize: `${24 * exportScale}px`,
                }}
              >
                {title}
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-recursive), sans-serif',
                  fontWeight: 400,
                  color: textColor,
                  opacity: 0.8,
                  fontSize: `${18 * exportScale}px`,
                }}
              >
                {date}
              </p>
            </div>
            <div className="drop-shadow-sm filter" style={{ fontSize: `${36 * exportScale}px` }}>
              {countryFlag}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
PolaroidPhotoFrame.displayName = 'PolaroidPhotoFrame';
