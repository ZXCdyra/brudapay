"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

// Транзакции мерчанта — только его собственные операции.
export default function MerchantTransactionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["merchant-transactions"],
    queryFn: () => api.getMerchantTransactions(),
    refetchInterval: 30000,
  });

  if (isLoading) return <TableSkeleton rows={8} />;

  const transactions = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мои транзакции</h1>
        <p className="text-muted-foreground">История ваших операций</p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="Нет транзакций"
          description="Как только появятся операции, они отобразятся здесь."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Сумма</th>
                    <th className="px-4 py-3 font-medium">Валюта</th>
                    <th className="px-4 py-3 font-medium">Статус</th>
                    <th className="px-4 py-3 font-medium">Реквизит</th>
                    <th className="px-4 py-3 font-medium">Создана</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">
                        {tx.external_id ?? tx.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">{formatCurrency(tx.amount, tx.currency)}</td>
                      <td className="px-4 py-3">{tx.currency}</td>
                      <td className="px-4 py-3">
                        <Badge status={tx.status}>{tx.status}</Badge>
                      </td>
                      <td className="px-4 py-3">{tx.requisite_bank ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(tx.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
