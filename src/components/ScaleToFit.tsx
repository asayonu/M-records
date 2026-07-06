"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function ScaleToFit({ children, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>();

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    function updateScale() {
      const available = container!.clientWidth;
      const needed = content!.scrollWidth;
      const neededHeight = content!.scrollHeight;
      if (needed <= 0) return;

      const nextScale = Math.min(1, available / needed);
      setScale(nextScale);
      setScaledHeight(neededHeight * nextScale);
    }

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    observer.observe(content);
    return () => observer.disconnect();
  }, [children]);

  return (
    <div ref={containerRef} className={className ?? "w-full"}>
      <div style={scaledHeight !== undefined ? { height: scaledHeight } : undefined}>
        <div
          ref={contentRef}
          className="inline-block min-w-full"
          style={
            scale < 1
              ? {
                  transform: `scale(${scale})`,
                  transformOrigin: "top left",
                }
              : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
