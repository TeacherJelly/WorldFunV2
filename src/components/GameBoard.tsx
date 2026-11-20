import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DotNode, GameItem, InteractionMode, ModeConfig } from '../types';
import { CANDY_COLORS } from '../utils/gameUtils';
import { sound } from '../utils/audio';
import { IllustrationCard } from './IllustrationCard';
import { triggerBackdropBurst } from './DynamicBackdrop';
import { SlotAuditStatus } from './SentenceTray';

interface GameBoardProps {
  item: GameItem;
  nodes: DotNode[];
  selectedNodeIds: string[];
  auditResults: SlotAuditStatus[] | null;
  modeConfig: ModeConfig;
  interactionMode?: InteractionMode;
  onToggleNode: (nodeId: string, clientX: number, clientY: number) => void;
  onConnectNode?: (nodeId: string, clientX: number, clientY: number) => void;
  onDisconnectLast?: () => void;
  onMoveNode: (nodeId: string, xPct: number, yPct: number) => void;
  compact?: boolean;
  teamAccent?: 'blue' | 'coral';
  disabled?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  item,
  nodes,
  selectedNodeIds,
  auditResults,
  modeConfig,
  interactionMode = 'move_tap',
  onToggleNode,
  onConnectNode,
  onDisconnectLast,
  onMoveNode,
  compact = false,
  teamAccent,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeElementsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const [hintUsed, setHintUsed] = useState(false);

  // Move & Tap drag state
  const dragStateRef = useRef<{
    nodeId: string;
    pointerId: number;
    startX: number;
    startY: number;
    hasMoved: boolean;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Swap Line swipe-connection state
  const swipeStateRef = useRef<{
    pointerId: number;
    startNodeId: string;
    startedOnExistingTip: boolean;
    startedOnEarlierSelected: boolean;
    movedAcrossAnotherNode: boolean;
    chain: string[];
    lastHoveredId: string | null;
  } | null>(null);

  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [liveLineEnd, setLiveLineEnd] = useState<{ x: number; y: number } | null>(null);
  const [isGestureActive, setIsGestureActive] = useState(false);
  const [boardSize, setBoardSize] = useState({ width: 800, height: 500 });

  // Reset hint and any active gesture when puzzle changes
  useEffect(() => {
    setHintUsed(false);
    dragStateRef.current = null;
    swipeStateRef.current = null;
    setDraggingNodeId(null);
    setHoveredNodeId(null);
    setLiveLineEnd(null);
    setIsGestureActive(false);
  }, [item.id]);

  // Clear active gestures when interactionMode changes or board is disabled
  useEffect(() => {
    dragStateRef.current = null;
    swipeStateRef.current = null;
    setDraggingNodeId(null);
    setHoveredNodeId(null);
    setLiveLineEnd(null);
    setIsGestureActive(false);
  }, [interactionMode, disabled]);

  // Bulletproof fallback: reset gesture lock if window loses focus mid-touch
  useEffect(() => {
    if (!isGestureActive) return;
    const resetGesture = () => {
      dragStateRef.current = null;
      swipeStateRef.current = null;
      setDraggingNodeId(null);
      setHoveredNodeId(null);
      setLiveLineEnd(null);
      setIsGestureActive(false);
    };
    window.addEventListener('blur', resetGesture);
    return () => window.removeEventListener('blur', resetGesture);
  }, [isGestureActive]);

  // Measure board dynamically for crisp SVG paths & multi-device adaptive tile sizing
  const measureBoard = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setBoardSize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    measureBoard();
    window.addEventListener('resize', measureBoard);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(measureBoard);
      ro.observe(containerRef.current);
    }
    return () => {
      window.removeEventListener('resize', measureBoard);
      ro?.disconnect();
    };
  }, [measureBoard]);

  const registerNodeElement = useCallback((nodeId: string, el: HTMLDivElement | null) => {
    if (el) {
      nodeElementsRef.current.set(nodeId, el);
    } else {
      nodeElementsRef.current.delete(nodeId);
    }
  }, []);

  const hitTestNodeAtClientPoint = useCallback(
    (clientX: number, clientY: number): DotNode | null => {
      const hitPad = 8; // Forgiving touch margin for phones, tablets & large interactive TVs
      for (const node of nodes) {
        const el = nodeElementsRef.current.get(node.id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (
          clientX >= r.left - hitPad &&
          clientX <= r.right + hitPad &&
          clientY >= r.top - hitPad &&
          clientY <= r.bottom + hitPad
        ) {
          return node;
        }
      }
      return null;
    },
    [nodes]
  );

  const handlePointerDownNode = (node: DotNode, e: React.PointerEvent) => {
    e.stopPropagation();
    if (disabled) return;
    sound.unlock();
    setIsGestureActive(true);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    try {
      containerRef.current.setPointerCapture(e.pointerId);
    } catch {
      // Ignore unsupported environments
    }

    if (interactionMode === 'swap_line') {
      const existingIdx = selectedNodeIds.indexOf(node.id);
      const isLastSelected =
        existingIdx !== -1 && existingIdx === selectedNodeIds.length - 1;
      const isEarlierSelected = existingIdx !== -1 && !isLastSelected;

      let initialChain = [...selectedNodeIds];
      if (existingIdx === -1 && selectedNodeIds.length < nodes.length) {
        initialChain = [...selectedNodeIds, node.id];
        if (onConnectNode) {
          onConnectNode(node.id, e.clientX, e.clientY);
        } else {
          onToggleNode(node.id, e.clientX, e.clientY);
        }
      }

      swipeStateRef.current = {
        pointerId: e.pointerId,
        startNodeId: node.id,
        startedOnExistingTip: isLastSelected,
        startedOnEarlierSelected: isEarlierSelected,
        movedAcrossAnotherNode: false,
        chain: initialChain,
        lastHoveredId: node.id,
      };

      setHoveredNodeId(node.id);
      if (initialChain.length > 0) {
        setLiveLineEnd({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      return;
    }

    // Classic Move & Tap mode
    const nodePxX = (node.x / 100) * rect.width;
    const nodePxY = (node.y / 100) * rect.height;

    dragStateRef.current = {
      nodeId: node.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      offsetX: e.clientX - rect.left - nodePxX,
      offsetY: e.clientY - rect.top - nodePxY,
    };
  };

  const handlePointerMoveBoard = (e: React.PointerEvent) => {
    if (!containerRef.current) return;

    // 1. Swap Line drag-to-connect interaction
    const swipe = swipeStateRef.current;
    if (interactionMode === 'swap_line' && swipe && swipe.pointerId === e.pointerId) {
      const rect = containerRef.current.getBoundingClientRect();
      if (swipe.chain.length > 0) {
        setLiveLineEnd({
          x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
          y: Math.max(0, Math.min(rect.height, e.clientY - rect.top)),
        });
      }

      const hitNode = hitTestNodeAtClientPoint(e.clientX, e.clientY);
      setHoveredNodeId(hitNode ? hitNode.id : null);

      if (hitNode && hitNode.id !== swipe.lastHoveredId) {
        swipe.lastHoveredId = hitNode.id;
        swipe.movedAcrossAnotherNode = true;

        const alreadyInChain = swipe.chain.includes(hitNode.id);
        if (!alreadyInChain && swipe.chain.length < nodes.length) {
          swipe.chain = [...swipe.chain, hitNode.id];
          if (onConnectNode) {
            onConnectNode(hitNode.id, e.clientX, e.clientY);
          } else {
            onToggleNode(hitNode.id, e.clientX, e.clientY);
          }
        } else if (
          swipe.chain.length >= 2 &&
          hitNode.id === swipe.chain[swipe.chain.length - 2] &&
          onDisconnectLast
        ) {
          swipe.chain = swipe.chain.slice(0, -1);
          onDisconnectLast();
        }
      } else if (!hitNode) {
        swipe.lastHoveredId = null;
      }
      return;
    }

    // 2. Classic Move & Tap tile dragging
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const dist = Math.hypot(dx, dy);

    if (!drag.hasMoved && dist > 7) {
      drag.hasMoved = true;
      setDraggingNodeId(drag.nodeId);
      sound.playPickup();
      triggerBackdropBurst(e.clientX, e.clientY, '#38BDF8', 8);
    }

    if (drag.hasMoved) {
      const rect = containerRef.current.getBoundingClientRect();
      const targetPxX = e.clientX - rect.left - drag.offsetX;
      const targetPxY = e.clientY - rect.top - drag.offsetY;

      const xPct = Math.max(8, Math.min(92, (targetPxX / rect.width) * 100));
      const yPct = Math.max(12, Math.min(88, (targetPxY / rect.height) * 100));

      onMoveNode(drag.nodeId, xPct, yPct);
    }
  };

  const handlePointerUpBoard = (e: React.PointerEvent) => {
    if (containerRef.current) {
      try {
        containerRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
    }

    // 1. Finish Swap Line gesture
    const swipe = swipeStateRef.current;
    if (swipe && swipe.pointerId === e.pointerId) {
      if (!swipe.movedAcrossAnotherNode && (swipe.startedOnExistingTip || swipe.startedOnEarlierSelected)) {
        onToggleNode(swipe.startNodeId, e.clientX, e.clientY);
      }
      swipeStateRef.current = null;
      setLiveLineEnd(null);
      setHoveredNodeId(null);
      setIsGestureActive(false);
      return;
    }

    // 2. Finish Move & Tap gesture
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== e.pointerId) {
      setIsGestureActive(false);
      return;
    }

    if (drag.hasMoved) {
      sound.playDrop();
      const node = nodes.find(n => n.id === drag.nodeId);
      const color = node ? CANDY_COLORS[node.colorIndex].hex : '#F59E0B';
      triggerBackdropBurst(e.clientX, e.clientY, color, 10);
    } else {
      onToggleNode(drag.nodeId, e.clientX, e.clientY);
    }

    dragStateRef.current = null;
    setDraggingNodeId(null);
    setIsGestureActive(false);
  };

  // Build lookup of node positions & selected order
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const selectedOrderMap = new Map<string, number>();
  selectedNodeIds.forEach((id, idx) => selectedOrderMap.set(id, idx));

  // Responsive measurements adapted dynamically to mobile, tablet, laptop, or Smart TV
  const minDim = Math.min(boardSize.width, boardSize.height);
  const isTinyBoard = boardSize.width < 460 || boardSize.height < 220;
  const isShortBoard = boardSize.height < 320 && !isTinyBoard;
  const isLargeTV = boardSize.width >= 1080 && boardSize.height >= 540 && !compact;
  const strokeScale = Math.max(0.68, Math.min(1.45, minDim / 480));
  const useCompactCard = compact || boardSize.width < 540 || boardSize.height < 350;

  // Build glowing curved SVG paths connecting selected nodes in the player's chosen order
  const connectionSegments: {
    d: string;
    color: string;
    x2: number;
    y2: number;
  }[] = [];

  for (let i = 0; i < selectedNodeIds.length - 1; i++) {
    const n1 = nodeMap.get(selectedNodeIds[i]);
    const n2 = nodeMap.get(selectedNodeIds[i + 1]);
    if (!n1 || !n2) continue;

    const x1 = (n1.x / 100) * boardSize.width;
    const y1 = (n1.y / 100) * boardSize.height;
    const x2 = (n2.x / 100) * boardSize.width;
    const y2 = (n2.y / 100) * boardSize.height;

    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const cx = mx - dy * 0.12;
    const cy = my + dx * 0.12;

    connectionSegments.push({
      d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
      color: CANDY_COLORS[n1.colorIndex].hex,
      x2,
      y2,
    });
  }

  // Live rubber-band Swap Line from the current tip node to the pointer
  const tipNodeId = selectedNodeIds[selectedNodeIds.length - 1];
  const tipNode = tipNodeId ? nodeMap.get(tipNodeId) : undefined;
  const tipColor = tipNode ? CANDY_COLORS[tipNode.colorIndex].hex : '#0EA5E9';
  const tipX = tipNode ? (tipNode.x / 100) * boardSize.width : 0;
  const tipY = tipNode ? (tipNode.y / 100) * boardSize.height : 0;

  // Dynamic tile styling scaled smoothly to screen/board size
  const tileSizingClass =
    item.mode === 'sentence'
      ? isTinyBoard
        ? 'px-2.5 py-1 rounded-xl min-w-[50px] text-sm tracking-wide'
        : compact || isShortBoard
        ? 'px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl min-w-[62px] text-base sm:text-xl tracking-wide'
        : isLargeTV
        ? 'px-7 py-4 rounded-3xl min-w-[116px] text-3xl xl:text-4xl tracking-wide'
        : 'px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-3xl min-w-[82px] sm:min-w-[96px] text-lg sm:text-2xl lg:text-3xl tracking-wide'
      : isTinyBoard
      ? 'w-[46px] h-[46px] rounded-full text-xl'
      : compact || isShortBoard
      ? 'w-[52px] h-[52px] sm:w-[62px] sm:h-[62px] rounded-full text-2xl sm:text-3xl'
      : isLargeTV
      ? 'w-[104px] h-[104px] rounded-full text-5xl'
      : 'w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] lg:w-[92px] lg:h-[92px] rounded-full text-3xl sm:text-4xl lg:text-5xl';

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMoveBoard}
      onPointerUp={handlePointerUpBoard}
      onPointerCancel={handlePointerUpBoard}
      onLostPointerCapture={handlePointerUpBoard}
      onContextMenu={e => e.preventDefault()}
      className={`relative w-full h-full flex-1 overflow-hidden select-none rounded-3xl border-2 shadow-2xl ${
        isGestureActive ? 'touch-none' : 'touch-auto'
      } ${
        compact ? 'board-min-h-compact' : 'board-min-h'
      } ${
        interactionMode === 'swap_line' ? 'cursor-crosshair' : ''
      } ${
        teamAccent === 'blue'
          ? 'border-sky-300/90 bg-sky-50/40'
          : teamAccent === 'coral'
          ? 'border-orange-300/90 bg-orange-50/40'
          : 'border-white/85 bg-white/40'
      }`}
    >
      {/* Complex inner lighting vignette & sunlit rim glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.45),transparent_60%)]" />

      {/* Clue illustration card at top-left */}
      <div
        className={
          useCompactCard
            ? 'absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-20 pointer-events-auto'
            : 'absolute top-3 left-3 sm:top-5 sm:left-5 z-20 pointer-events-auto'
        }
      >
        <IllustrationCard
          item={item}
          hintUsed={hintUsed}
          onUseHint={() => setHintUsed(prev => !prev)}
          compact={useCompactCard}
        />
      </div>

      {/* SVG Canvas for Glowing Curved Connections & Live Swap Line */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        {connectionSegments.map((seg, idx) => (
          <g key={idx}>
            <path
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth={18 * strokeScale}
              strokeLinecap="round"
              opacity="0.24"
            />
            <path
              d={seg.d}
              fill="none"
              stroke={seg.color}
              strokeWidth={8 * strokeScale}
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke="#FFFFFF"
              strokeWidth={3 * strokeScale}
              strokeLinecap="round"
              strokeDasharray="6 8"
              className="animate-dash-flow"
              opacity="0.9"
            />
            <circle cx={seg.x2} cy={seg.y2} r={5 * strokeScale} fill="#FFFFFF" opacity="0.85" />
          </g>
        ))}

        {/* Live rubber-band Swap Line following cursor / finger / stylus */}
        {interactionMode === 'swap_line' && tipNode && liveLineEnd && (
          <g>
            <line
              x1={tipX}
              y1={tipY}
              x2={liveLineEnd.x}
              y2={liveLineEnd.y}
              stroke={tipColor}
              strokeWidth={16 * strokeScale}
              strokeLinecap="round"
              opacity="0.24"
            />
            <line
              x1={tipX}
              y1={tipY}
              x2={liveLineEnd.x}
              y2={liveLineEnd.y}
              stroke={tipColor}
              strokeWidth={7 * strokeScale}
              strokeLinecap="round"
              strokeDasharray="10 8"
            />
            <circle
              cx={liveLineEnd.x}
              cy={liveLineEnd.y}
              r={9 * strokeScale}
              fill={tipColor}
              stroke="#FFFFFF"
              strokeWidth={3 * strokeScale}
            />
          </g>
        )}
      </svg>

      {/* Interactive Word / Letter Tiles */}
      {nodes.map(node => {
        const orderIdx = selectedOrderMap.get(node.id);
        const isSelected = orderIdx !== undefined;
        const isDragging = draggingNodeId === node.id;
        const isHoveredInSwipe = hoveredNodeId === node.id;
        const color = CANDY_COLORS[node.colorIndex];

        const slotAudit: SlotAuditStatus | undefined =
          isSelected && auditResults ? auditResults[orderIdx] : undefined;

        return (
          <div
            key={node.id}
            ref={el => registerNodeElement(node.id, el)}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
            }}
            onPointerDown={e => handlePointerDownNode(node, e)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 select-none touch-none transition-transform duration-150 ${
              interactionMode === 'swap_line'
                ? 'cursor-pointer'
                : 'cursor-grab active:cursor-grabbing'
            } ${
              isDragging
                ? 'z-40 scale-115 -rotate-2'
                : isHoveredInSwipe
                ? 'z-40 scale-112'
                : isSelected
                ? 'z-30 scale-105 hover:scale-110'
                : 'z-20 hover:scale-108 active:scale-95'
            }`}
          >
            {/* Main Big Tactile Tile */}
            <div
              style={{
                boxShadow: isDragging
                  ? `0 18px 30px -6px ${color.glow}, 0 0 0 6px ${color.glow}`
                  : isSelected || isHoveredInSwipe
                  ? `0 10px 20px -4px ${color.glow}, 0 0 0 4px ${color.glow}`
                  : '0 8px 16px -4px rgba(15, 23, 42, 0.18)',
              }}
              className={`relative flex items-center justify-center font-display font-bold border-4 transition-colors duration-200 ${tileSizingClass} ${
                slotAudit === 'correct'
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 border-white text-white'
                  : slotAudit === 'wrong'
                  ? 'bg-gradient-to-b from-rose-400 to-rose-600 border-white text-white animate-shake'
                  : isSelected
                  ? `bg-gradient-to-b ${color.bg} border-white text-white`
                  : isHoveredInSwipe
                  ? 'bg-sky-50 border-sky-400 text-sky-900'
                  : 'bg-white border-amber-200 text-slate-800 hover:border-sky-300'
              }`}
            >
              {/* Glossy top inner rim light */}
              <div className="absolute inset-x-3 top-1.5 h-2 rounded-full bg-white/35 pointer-events-none" />

              {/* Big readable text */}
              <span className="relative pointer-events-none leading-none">
                {node.text}
              </span>

              {/* Order badge ONLY showing user's chosen sequence order on already-selected dots */}
              {isSelected && (
                <div className="absolute -top-3 -right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400 text-amber-950 font-black text-[11px] sm:text-xs border-2 border-white shadow-md flex items-center justify-center pointer-events-none">
                  {orderIdx + 1}
                </div>
              )}

              {/* Optional manual number hints if user explicitly turned on Show Number Hints in Settings */}
              {!isSelected && modeConfig.showNumberHints && (
                <div className="absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full bg-sky-100 text-sky-800 font-black text-xs border-2 border-white shadow flex items-center justify-center pointer-events-none">
                  {node.targetIndex + 1}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
