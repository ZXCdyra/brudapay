"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign,
  ArrowLeftRight,
  CreditCard,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/services/api";
import { StatCard } from "@/components/widgets/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

// Кабинет мерчанта/трейдера: баланс, оборот, страховой депозит и активация.
export default function MerchantDashboardPage() {
  const queryClient = useQueryClient();
  const [topupAmount, setTopupAmount] = useState(100);

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-dashboard"],
    queryFn: () => api.getMerchantDashboard(),
    refetchInterval: 30000,
  });

  const topupMutation = useMutation({
    mutationFn: (amount: number) => api.topUpInsurance(amount),
    onSuccess: () => {
      toast.success("Страховой депозит пополнен");
      queryClient.invalidateQueries({ queryKey: ["merchant-dashboard"] });
    },
    onError: () => toast.error("Не удалось пополнить депозит"),
  });

  const profile = data?.profile;
  const insuranceDeposit = profile?.insurance_deposit ?? 0;
  const insuranceRequired = profile?.insurance_required ?? 100;
  const isActive = profile?.is_active_trader ?? false;
  const insuranceProgress = insuranceRequired > 0
    ? Math.min(100, (insuranceDeposit / insuranceRequired) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Мой кабинет</h1>
        <p className="text-muted-foreground">
          {profile?.name ?? "Обзор вашего аккаунта и операций"}
        </p>
      </div>

      {!isActive && (
        <Card className="border-yellow-500/40 bg-yellow-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">Аккаунт не активен</p>
              <p className="text-sm text-muted-foreground">
                Чтобы начать работу, внесите страховой депозит минимум{" "}
                {formatCurrency(insuranceRequired, data?.currency ?? "USD")}.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            title="Баланс"
            value={data?.balance ?? 0}
            format="currency"
            icon={DollarSign}
          />
          <StatCard
            title="Оборот"
            value={data?.turnover ?? 0}
            format="currency"
            icon={ArrowLeftRight}
          />
          <StatCard
            title="Транзакции"
            value={data?.transaction_count ?? 0}
            format="number"
            icon={Activity}
          />
          <StatCard
            title="Конверсия"
            value={data?.conversion_rate ?? 0}
            format="percent"
            icon={CreditCard}
          />
        </motion.div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Страховой депозит
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Внесено</span>
                <span className="font-medium">
                  {formatCurrency(insuranceDeposit, data?.currency ?? "USD")} /{" "}
                  {formatCurrency(insuranceRequired, data?.currency ?? "USD")}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${insuranceProgress}%` }}
                />
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                topupMutation.mutate(topupAmount);
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1">
                <label className="text-sm font-medium">Сумма пополнения</label>
                <Input
                  type="number"
                  min={1}
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <Button type="submit" disabled={topupMutation.isPending}>
                {topupMutation.isPending ? "Пополнение..." : "Пополнить"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Реквизиты аккаунта</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">API Key</span>
              <span className="font-mono">{profile?.api_key ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Статус</span>
              <span>{profile?.status ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Тип аккаунта</span>
              <span>{profile?.merchant_type === "trader" ? "Трейдер" : "Мерчант"}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Активный трейдер</span>
              <span>{isActive ? "Да" : "Нет"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Активные реквизиты</span>
              <span>{data?.active_requisites ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Заморожено</span>
              <span>{formatCurrency(data?.frozen_balance ?? 0, data?.currency ?? "USD")}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
