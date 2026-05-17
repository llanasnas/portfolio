"use client";

import { useMemo, useState } from "react";
import type { Transfer, UserNode } from "@/lib/simulations/debt-optimizer";
import { GlowButton } from "@/components/ui/GlowButton";
import styles from "./DebtCanvas.module.css";

interface DebtCanvasProps {
  users: UserNode[];
  transfers: Transfer[];
  selectedTransferId: string | null;
  filterExpenseId?: string | null;
  onSelectTransfer: (id: string | null) => void;
  onReroute: (id: string, newTo: string) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onAddTransfer: (from: string, to: string, amount: number) => void;
  optimal?: boolean;
  netByUser?: Record<string, number>;
  canEdit?: boolean;
}

const VIEW_W = 800;
const VIEW_H = 560;
const NODE_R = 30;

interface NodePos {
  user: UserNode;
  x: number;
  y: number;
  net: number;
}

export function DebtCanvas({
  users,
  transfers,
  selectedTransferId,
  filterExpenseId,
  onSelectTransfer,
  onReroute,
  onDelete,
  onDeleteAll,
  onAddTransfer,
  optimal = false,
  netByUser,
  canEdit = true,
}: DebtCanvasProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFrom, setAddFrom] = useState(users[0]?.id ?? "");
  const [addTo, setAddTo] = useState(users[1]?.id ?? "");
  const [addAmount, setAddAmount] = useState("");

  const visibleTransfers = useMemo(() => {
    if (!filterExpenseId) return transfers;
    return transfers.filter((t) => t.expenseId === filterExpenseId);
  }, [transfers, filterExpenseId]);
  const positions = useMemo<NodePos[]>(() => {
    const n = users.length;
    const radius = Math.min(VIEW_W, VIEW_H) * 0.36;
    const cx = VIEW_W / 2;
    const cy = VIEW_H / 2;
    return users.map((u, i) => {
      const theta = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        user: u,
        x: cx + Math.cos(theta) * radius,
        y: cy + Math.sin(theta) * radius,
        net: netByUser?.[u.id] ?? 0,
      };
    });
  }, [users, netByUser]);

  const posById = useMemo(() => {
    const m = new Map<string, NodePos>();
    positions.forEach((p) => m.set(p.user.id, p));
    return m;
  }, [positions]);

  const selectedTransfer =
    visibleTransfers.find((t) => t.id === selectedTransferId) ?? null;

  const handleNodeClick = (userId: string) => {
    if (selectedTransfer) {
      onReroute(selectedTransfer.id, userId);
    }
  };

  return (
    <div className={styles.canvasWrap}>
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className={styles.svg}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(184,123,255,0.65)" />
          </marker>
          <marker
            id="arrow-hi"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#5ad7ff" />
          </marker>
          <marker
            id="arrow-opt"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#4ade80" />
          </marker>
        </defs>

        {/* Transfers (under nodes) */}
        <g>
          {visibleTransfers.map((t) => {
            const from = posById.get(t.from);
            const to = posById.get(t.to);
            if (!from || !to) return null;
            const isSelected = t.id === selectedTransferId;
            const isDimmed =
              !!filterExpenseId && t.expenseId !== filterExpenseId;
            return (
              <TransferLine
                key={t.id}
                transfer={t}
                from={from}
                to={to}
                selected={isSelected}
                optimal={optimal}
                dimmed={isDimmed}
                onClick={() =>
                  canEdit && onSelectTransfer(isSelected ? null : t.id)
                }
              />
            );
          })}
        </g>

        {/* Nodes (on top) */}
        <g>
          {positions.map((p) => {
            const isCreditor = p.net > 0.01;
            const isDebtor = p.net < -0.01;
            const isTarget =
              !!selectedTransfer &&
              selectedTransfer.to !== p.user.id &&
              selectedTransfer.from !== p.user.id;
            return (
              <g
                key={p.user.id}
                className={[
                  styles.node,
                  isCreditor ? styles.nodeCreditor : "",
                  isDebtor ? styles.nodeDebtor : "",
                ].join(" ")}
                onClick={() => handleNodeClick(p.user.id)}
                tabIndex={0}
                role="button"
                aria-label={`Node ${p.user.name}`}
                transform={`translate(${p.x}, ${p.y})`}
              >
                <circle
                  r={NODE_R}
                  className={`${styles.nodeRing} ${isTarget ? styles.nodeRingTarget : ""}`}
                />
                <circle r={5} className={styles.nodeCenter} />
                <text y={NODE_R + 16} className={styles.nodeLabel}>
                  {p.user.name}
                </text>
                {netByUser ? (
                  <text y={NODE_R + 28} className={styles.nodeBalance}>
                    {p.net >= 0 ? "+" : ""}
                    {p.net.toFixed(2)}
                  </text>
                ) : null}
              </g>
            );
          })}
        </g>
      </svg>

      <div className={styles.legend} aria-hidden="true">
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: "var(--success)" }}
          />
          creditor
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: "var(--danger)" }}
          />
          debtor
        </span>
        <span className={styles.legendItem}>
          <span
            className={styles.legendDot}
            style={{ background: "var(--accent-violet)" }}
          />
          transfer
        </span>
      </div>

      <div className={styles.helper} aria-live="polite">
        {selectedTransfer
          ? `> reroute ${selectedTransfer.from} → ? · click target node`
          : optimal
            ? "> optimized network · greedy minimum"
            : filterExpenseId
              ? `> filtered by expense · ${visibleTransfers.length} arrow(s) shown`
              : "> click a transfer · then click a node to reroute"}
      </div>

      {canEdit && (
        <div className={styles.actions}>
          {selectedTransfer ? (
            <GlowButton
              variant="danger"
              size="sm"
              onClick={() => onDelete(selectedTransfer.id)}
            >
              ✕ Delete
            </GlowButton>
          ) : null}
          {!optimal && transfers.length > 0 && !selectedTransfer && (
            <GlowButton variant="ghost" size="sm" onClick={onDeleteAll}>
              ✕ Clear All
            </GlowButton>
          )}
          {!optimal && !selectedTransfer && (
            <GlowButton
              variant="ghost"
              size="sm"
              onClick={() => setShowAddForm((v) => !v)}
            >
              {showAddForm ? "✕ Cancel" : "+ Add Transfer"}
            </GlowButton>
          )}
        </div>
      )}

      {showAddForm && canEdit && !optimal && (
        <div className={styles.addForm}>
          <span className={styles.addFormLabel}>from</span>
          <select
            className={styles.addSelect}
            value={addFrom}
            onChange={(e) => setAddFrom(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <span className={styles.addFormLabel}>→</span>
          <select
            className={styles.addSelect}
            value={addTo}
            onChange={(e) => setAddTo(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <input
            className={styles.addInput}
            type="number"
            min="0.01"
            step="0.01"
            placeholder="€ amount"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
          />
          <GlowButton
            variant="primary"
            size="sm"
            onClick={() => {
              const amt = parseFloat(addAmount);
              if (!isNaN(amt) && amt > 0 && addFrom !== addTo) {
                onAddTransfer(addFrom, addTo, amt);
                setAddAmount("");
                setShowAddForm(false);
              }
            }}
          >
            Add
          </GlowButton>
        </div>
      )}
    </div>
  );
}

interface TransferLineProps {
  transfer: Transfer;
  from: NodePos;
  to: NodePos;
  selected: boolean;
  optimal: boolean;
  dimmed: boolean;
  onClick: () => void;
}

function TransferLine({
  transfer,
  from,
  to,
  selected,
  optimal,
  dimmed,
  onClick,
}: TransferLineProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const curve = 30;
  const mx = (from.x + to.x) / 2 + nx * curve;
  const my = (from.y + to.y) / 2 + ny * curve;
  // Trim endpoints so the line doesn't enter the node.
  const trim = NODE_R + 4;
  const ux = dx / len;
  const uy = dy / len;
  const sx = from.x + ux * trim;
  const sy = from.y + uy * trim;
  const ex = to.x - ux * trim;
  const ey = to.y - uy * trim;
  const d = `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`;
  const labelX = mx;
  const labelY = my - 4;
  const markerEnd = optimal
    ? "url(#arrow-opt)"
    : selected
      ? "url(#arrow-hi)"
      : "url(#arrow)";
  return (
    <g>
      <path d={d} className={styles.transferHit} onClick={onClick} />
      <path
        d={d}
        className={[
          styles.transferPath,
          selected ? styles.transferPathHi : "",
          optimal ? styles.transferPathOptimal : "",
          dimmed ? styles.transferPathDimmed : "",
        ].join(" ")}
        markerEnd={markerEnd}
        onClick={onClick}
      />
      <text x={labelX} y={labelY} className={styles.transferAmount}>
        €{transfer.amount.toFixed(2)}
      </text>
    </g>
  );
}
