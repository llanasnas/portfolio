"use client";

import type { Expense, UserNode } from "@/lib/simulations/debt-optimizer";
import styles from "./ExpenseList.module.css";

interface ExpenseListProps {
  expenses: Expense[];
  users: UserNode[];
  selectedExpenseId: string | null;
  onSelectExpense: (id: string | null) => void;
  transferCountByExpense: Record<string, number>;
}

export function ExpenseList({
  expenses,
  users,
  selectedExpenseId,
  onSelectExpense,
  transferCountByExpense,
}: ExpenseListProps) {
  const userById = new Map(users.map((u) => [u.id, u]));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>// expense_log</span>
        <span className={styles.headerCount}>{expenses.length} entries</span>
      </div>

      <div className={styles.list}>
        {expenses.map((exp) => {
          const payer = userById.get(exp.payerId);
          const nonPayers = exp.beneficiaryIds.filter((b) => b !== exp.payerId);
          const share =
            nonPayers.length > 0
              ? Math.round((exp.amount / exp.beneficiaryIds.length) * 100) / 100
              : 0;
          const isSelected = selectedExpenseId === exp.id;
          const txCount = transferCountByExpense[exp.id] ?? 0;

          return (
            <button
              key={exp.id}
              className={`${styles.item} ${isSelected ? styles.itemSelected : ""}`}
              onClick={() => onSelectExpense(exp.id)}
              aria-pressed={isSelected}
            >
              <div className={styles.itemTop}>
                <span className={styles.itemId}>{exp.id}</span>
                <span className={styles.itemName}>{exp.name}</span>
                <span className={styles.itemAmount}>
                  €{exp.amount.toFixed(2)}
                </span>
              </div>

              <div className={styles.itemMeta}>
                <span className={styles.payerTag}>
                  <span className={styles.payerDot} />
                  {payer?.name ?? exp.payerId} paid
                </span>
                {txCount > 0 && (
                  <span className={styles.txBadge}>
                    {txCount} arrow{txCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {nonPayers.length > 0 && (
                <div className={styles.beneficiaries}>
                  {nonPayers.map((bid) => {
                    const b = userById.get(bid);
                    return (
                      <span key={bid} className={styles.beneficiary}>
                        <span className={styles.beneficiaryName}>
                          {b?.name ?? bid}
                        </span>
                        <span className={styles.beneficiaryOwes}>
                          €{share.toFixed(2)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
