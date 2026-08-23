"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LimitProgress } from "@/components/ui/progress";
import { TableSkeleton, EmptyState } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Plus, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";


const emptyForm = {
  bank_name: "",
  holder_name: "",
  account_number: "",
  currency: "USD",
  country: "US",
  min_amount: 0,
  max_amount: 0,
  daily_limit: 100000,
};

// Реквизиты трейдера: он сам заводит счета и задаёт лимиты на операцию.
export default function MerchantRequisitesPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-requisites"],
    queryFn: () => api.getMerchantRequisites(),
  });

  // Реквизиты доступны только трейдеру; профиль берём из дашборда.
  const { data: dashboard } = useQuery({
    queryKey: ["merchant-dashboard"],
    queryFn: () => api.getMerchantDashboard(),
  });
  const isTrader = dashboard?.profile?.merchant_type === "trader";


  const createMutation = useMutation({
    mutationFn: (payload: typeof formData) => api.createMerchantRequisite(payload),
    onSuccess: () => {
      toast.success("Реквизит создан");
      queryClient.invalidateQueries({ queryKey: ["merchant-requisites"] });
      setShowCreate(false);
      setFormData(emptyForm);
    },
    onError: (e: Error) => toast.error(e.message || "Не удалось создать реквизит"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteMerchantRequisite(id),
    onSuccess: () => {
      toast.success("Реквизит удалён");
      queryClient.invalidateQueries({ queryKey: ["merchant-requisites"] });
    },
    onError: () => toast.error("Не удалось удалить реквизит"),
  });

  if (isLoading) return <TableSkeleton rows={6} />;

  const requisites = Array.isArray(data) ? data : [];

  // Аккаунт-мерчант отдаёт трафик и реквизитов не ведёт — показываем заглушку.
  if (!isTrader) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Мои реквизиты</h1>
          <p className="text-muted-foreground">Ваши банковские счета и лимиты на операцию</p>
        </div>
        <EmptyState
          icon={Lock}
          title="Реквизиты доступны только трейдерам"
          description="Ваш аккаунт работает в режиме мерчанта (отдаёт трафик). Реквизиты ведут аккаунты-трейдеры."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои реквизиты</h1>
          <p className="text-muted-foreground">Ваши банковские счета и лимиты на операцию</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить реквизит
        </Button>
      </div>


      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Новый реквизит</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(formData);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Банк</label>
                  <Input
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="Название банка"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Владелец</label>
                  <Input
                    value={formData.holder_name}
                    onChange={(e) => setFormData({ ...formData, holder_name: e.target.value })}
                    placeholder="ФИО держателя"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Номер счёта / карты</label>
                <Input
                  value={formData.account_number}
                  onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                  placeholder="****1234"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Валюта</label>
                  <Input
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    maxLength={3}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Страна</label>
                  <Input
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    maxLength={2}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Мин. сумма</label>
                  <Input
                    type="number"
                    value={formData.min_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, min_amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Макс. сумма</label>
                  <Input
                    type="number"
                    value={formData.max_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, max_amount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Дневной лимит</label>
                  <Input
                    type="number"
                    value={formData.daily_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, daily_limit: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Создание..." : "Создать"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {requisites.length === 0 && !showCreate && (
        <EmptyState
          icon={CreditCard}
          title="Нет реквизитов"
          description="Добавьте банковские счета, чтобы принимать платежи."
        />
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {requisites.map((req) => (
          <Card key={req.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-base">{req.bank_name}</CardTitle>
                <p className="text-sm text-muted-foreground">{req.holder_name}</p>
              </div>
              <Badge status={req.status}>{req.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="text-muted-foreground">Счёт</p>
                <p className="font-mono">{req.account_number}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Валюта</p>
                  <p>{req.currency}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Страна</p>
                  <p>{req.country}</p>
                </div>
              </div>
              <LimitProgress used={req.used_limit} limit={req.daily_limit} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Использовано: {formatCurrency(req.used_limit, req.currency)}</span>
                <span>Лимит: {formatCurrency(req.daily_limit, req.currency)}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => deleteMutation.mutate(req.id)}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Удалить
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
