'use client';

import { toPng } from 'html-to-image';
import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { generateICNS, generateICO } from '@/lib/utils/icon-generator';

export interface CanvasPreviewProps {
  enableDownload?: boolean;
  onDownloadStart?: () => void;
  onDownloadComplete?: () => void;
  onDownloadError?: (error: Error) => void;
  children: React.ReactNode;
  containerClassName?: string;
  exactSize?: boolean;
  triggerEventName?: string;
  pixelRatio?: number;
  filename?: string;
  format?: 'png' | 'ico' | 'icns';
}

// Memoize the component to prevent re-renders when parent re-renders but props are same
export const CanvasPreview = memo(
  forwardRef<HTMLDivElement, CanvasPreviewProps>((props, ref) => {
    const {
      enableDownload = false,
      onDownloadStart,
      onDownloadComplete,
      onDownloadError,
      children,
      containerClassName,
      exactSize = false,
      triggerEventName = 'trigger-download',
      pixelRatio,
      filename = 'download',
      format = 'png',
    } = props;

    const containerRef = useRef<HTMLDivElement>(null);

    // Expose the container ref via forwardRef
    useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Keep track of latest props with a ref to access them in the event handler consistently
    const propsRef = useRef({
      filename,
      format,
      exactSize,
      children,
      containerClassName,
      triggerEventName,
      pixelRatio,
    });

    useEffect(() => {
      propsRef.current = {
        filename,
        format,
        exactSize,
        children,
        containerClassName,
        triggerEventName,
        pixelRatio,
      };
    }, [filename, format, exactSize, children, containerClassName, triggerEventName, pixelRatio]);

    // Download handler
    const handleDownload = async () => {
      if (!containerRef.current) {
        console.error('[CanvasPreview] Container ref is missing!');
        return;
      }

      onDownloadStart?.();

      try {
        // GET FRESH STATE FROM REF
        const current = propsRef.current;
        const currentFormat = current.format || 'png';
        const finalFilename = `${current.filename}.${currentFormat}`;

        // Determine sizes based on format
        let sizes: number[] = [512];
        if (current.exactSize) {
          sizes = [0]; // Dummy size, wont be used for calculations if exactSize is true and we rely on container
        } else if (currentFormat === 'ico') {
          sizes = [16, 32, 48, 64, 256];
        } else if (currentFormat === 'icns') {
          sizes = [16, 32, 64, 128, 256, 512, 1024];
        }

        const images: { width: number; height: number; data: Blob }[] = [];

        for (const size of sizes) {
          const options = {
            pixelRatio: current.pixelRatio || (current.exactSize ? 2 : 1), // Default to 2 for exactSize, 1 otherwise
            cacheBust: false,
          } as any;

          if (!current.exactSize) {
            options.canvasWidth = size;
            options.canvasHeight = size;
          }

          const dataUrl = await toPng(containerRef.current, options);

          // Convert Base64 to Blob manually (CSP-safe)
          const byteString = atob(dataUrl.split(',')[1]);
          const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mimeString });

          images.push({ width: size, height: size, data: blob });
        }

        let finalBlob: Blob;

        if (currentFormat === 'ico') {
          finalBlob = await generateICO(images);
        } else if (currentFormat === 'icns') {
          finalBlob = await generateICNS(images);
        } else {
          finalBlob = images[0].data;
        }

        console.log('[CanvasPreview] Download ready. Blob size:', finalBlob.size);

        // Trigger download
        const url = URL.createObjectURL(finalBlob);
        const link = document.createElement('a');
        link.download = finalFilename;
        link.href = url;
        link.click();

        setTimeout(() => URL.revokeObjectURL(url), 60000);

        onDownloadComplete?.();
      } catch (err) {
        console.error('[CanvasPreview] Failed to generate icon:', err);
        // Deep inspection of the error object
        if (typeof err === 'object' && err !== null) {
          console.error(
            '[CanvasPreview] Error details:',
            JSON.stringify(err, Object.getOwnPropertyNames(err))
          );
        }
        onDownloadError?.(err as Error);
      }
    };

    // Listen for the custom download event
    useEffect(() => {
      if (!enableDownload) return;

      const handler = () => handleDownload();
      window.addEventListener(triggerEventName, handler);
      console.log('[CanvasPreview] Event listener added for', triggerEventName);

      return () => {
        window.removeEventListener(triggerEventName, handler);
        console.log('[CanvasPreview] Event listener removed for', triggerEventName);
      };
    }, [enableDownload, triggerEventName]);

    return (
      <div
        ref={containerRef}
        className={twMerge(
          'relative flex items-center justify-center bg-transparent',
          containerClassName || 'h-[512px] w-[512px]'
        )}
      >
        {children}
      </div>
    );
  })
);

CanvasPreview.displayName = 'CanvasPreview';

CanvasPreview.displayName = 'CanvasPreview';
