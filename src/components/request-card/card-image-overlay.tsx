import React, { useRef, useState } from "react";
import Box from "@mui/material/Box";

export interface CardImagePosition {
  x: number;
  y: number;
  width: number;
}

interface Props {
  src: string | null | undefined;
  x: number;
  y: number;
  width: number;
  editable?: boolean;
  onChange?: (pos: CardImagePosition) => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export default function CardImageOverlay({ src, x, y, width, editable, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ startX: number; startY: number; baseX: number; baseY: number; w: number; h: number } | null>(
    null
  );

  if (!src) return null;

  const onPointerDown = (e: React.PointerEvent) => {
    if (!editable || !onChange) return;
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    drag.current = {
      startX: e.clientX,
      startY: e.clientY,
      baseX: x,
      baseY: y,
      w: rect.width,
      h: rect.height,
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !drag.current || !onChange) return;
    const d = drag.current;
    const dx = ((e.clientX - d.startX) / d.w) * 100;
    const dy = ((e.clientY - d.startY) / d.h) * 100;
    onChange({ x: clamp(d.baseX + dx, 0, 100), y: clamp(d.baseY + dy, 0, 100), width });
  };

  const endDrag = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragging(false);
    drag.current = null;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <Box
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      sx={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: `${width}%`,
        zIndex: 5,
        cursor: editable ? (dragging ? "grabbing" : "grab") : "default",
        touchAction: editable ? "none" : "auto",
        outline: editable ? "2px dashed rgba(0,0,0,0.35)" : "none",
        outlineOffset: 2,
        borderRadius: 1,
        userSelect: "none",
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        draggable={false}
        sx={{
          display: "block",
          width: "100%",
          height: "auto",
          pointerEvents: "none",
          borderRadius: 1,
        }}
      />
    </Box>
  );
}
