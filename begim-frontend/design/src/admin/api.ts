// Begim бэк-офис — мост к общему слою (@begim/shared) с graceful fallback на моки.
// Пока админ-API не отдаёт все поля — недостающие берём из adminStats (data.ts).

import { useEffect, useState } from "react";
import { getAdminDashboard } from "@begim/shared";
import { adminStats } from "./data";

export type AdminStats = typeof adminStats;

/** Сливает живые агрегаты из API в форму adminStats; при ошибке — мок целиком. */
export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    const d = await getAdminDashboard();
    return {
      ...adminStats,
      todayOrders: d.orders_total ?? adminStats.todayOrders,
      todayRevenue: d.gmv_minor ? Math.round(d.gmv_minor / 100) : adminStats.todayRevenue,
      activeSellers: d.sellers_total ?? adminStats.activeSellers,
      totalUsers: d.users_total ?? adminStats.totalUsers,
      pendingSellers: d.sellers_pending ?? adminStats.pendingSellers,
    };
  } catch {
    return adminStats;
  }
}

/** Хук дашборда: стартует на моке, подменяет живыми данными, когда API ответит. */
export function useAdminStats(): AdminStats {
  const [stats, setStats] = useState<AdminStats>(adminStats);
  useEffect(() => {
    let alive = true;
    fetchAdminStats()
      .then((s) => {
        if (alive) setStats(s);
      })
      .catch(() => {
        /* остаёмся на моке */
      });
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}
