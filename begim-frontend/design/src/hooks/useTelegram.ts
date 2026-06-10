import { useEffect, useState, useCallback } from "react";

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
};

type TelegramWebApp = {
  isAvailable: boolean;
  isExpanded: boolean;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  user: TelegramUser | null;
  initData: string;
  initDataUnsafe: Record<string, any>;
  platform: string;
  version: string;

  // Actions
  expand: () => void;
  close: () => void;
  ready: () => void;
  sendData: (data: string) => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  showConfirm: (message: string, onOk: () => void) => void;
  showPopup: (params: any, onButton?: (id: string) => void) => void;
  haptic: (type?: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  openTelegramLink: (url: string) => void;
  openLink: (url: string) => void;
  shareUrl: (url: string, text?: string) => void;
};

/**
 * Хук для работы с Telegram WebApp API.
 * Безопасно работает и внутри Telegram, и в обычном браузере (возвращает no-op методы).
 */
export function useTelegram(): TelegramWebApp {
  const [isExpanded, setIsExpanded] = useState(false);

  const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
  const isAvailable = !!tg;

  useEffect(() => {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      setIsExpanded(true);
      tg.setHeaderColor?.("#8B2635");
      tg.setBackgroundColor?.("#FBF5EC");

      const onViewportChange = () => setIsExpanded(tg.isExpanded);
      tg.onEvent?.("viewportChanged", onViewportChange);
      return () => tg.offEvent?.("viewportChanged", onViewportChange);
    } catch (e) {
      console.warn("Telegram WebApp init error:", e);
    }
  }, [tg]);

  const expand = useCallback(() => tg?.expand?.(), [tg]);
  const close = useCallback(() => tg?.close?.(), [tg]);
  const ready = useCallback(() => tg?.ready?.(), [tg]);

  const sendData = useCallback(
    (data: string) => {
      if (tg?.sendData) tg.sendData(data);
      else console.warn("[MiniApp] sendData (not in Telegram):", data);
    },
    [tg]
  );

  const showMainButton = useCallback(
    (text: string, onClick: () => void) => {
      if (!tg?.MainButton) return;
      tg.MainButton.text = text;
      tg.MainButton.show();
      tg.MainButton.onClick(onClick);
    },
    [tg]
  );

  const hideMainButton = useCallback(() => {
    tg?.MainButton?.hide?.();
  }, [tg]);

  const showBackButton = useCallback(
    (onClick: () => void) => {
      if (!tg?.BackButton) return;
      tg.BackButton.show();
      tg.BackButton.onClick(onClick);
    },
    [tg]
  );

  const hideBackButton = useCallback(() => {
    tg?.BackButton?.hide?.();
  }, [tg]);

  const showConfirm = useCallback(
    (message: string, onOk: () => void) => {
      if (tg?.showConfirm) {
        tg.showConfirm(message, (ok: boolean) => { if (ok) onOk(); });
      } else if (window.confirm(message)) {
        onOk();
      }
    },
    [tg]
  );

  const showPopup = useCallback(
    (params: any, onButton?: (id: string) => void) => {
      if (tg?.showPopup) tg.showPopup(params, onButton);
      else alert(params.message);
    },
    [tg]
  );

  const haptic = useCallback(
    (type: "light" | "medium" | "heavy" | "rigid" | "soft" = "light") => {
      try {
        tg?.HapticFeedback?.impactOccurred?.(type);
      } catch {}
    },
    [tg]
  );

  const setHeaderColor = useCallback(
    (color: string) => tg?.setHeaderColor?.(color),
    [tg]
  );
  const setBackgroundColor = useCallback(
    (color: string) => tg?.setBackgroundColor?.(color),
    [tg]
  );

  const enableClosingConfirmation = useCallback(
    () => tg?.enableClosingConfirmation?.(),
    [tg]
  );
  const disableClosingConfirmation = useCallback(
    () => tg?.disableClosingConfirmation?.(),
    [tg]
  );

  const openTelegramLink = useCallback(
    (url: string) => tg?.openTelegramLink?.(url),
    [tg]
  );

  const openLink = useCallback(
    (url: string) => tg?.openLink?.(url),
    [tg]
  );

  const shareUrl = useCallback(
    (url: string, text?: string) => {
      const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
      if (tg?.openTelegramLink) tg.openTelegramLink(shareUrl);
      else window.open(shareUrl, "_blank");
    },
    [tg]
  );

  return {
    isAvailable,
    isExpanded,
    colorScheme: tg?.colorScheme || "light",
    themeParams: tg?.themeParams || {},
    user: tg?.initDataUnsafe?.user || null,
    initData: tg?.initData || "",
    initDataUnsafe: tg?.initDataUnsafe || {},
    platform: tg?.platform || "unknown",
    version: tg?.version || "",
    expand, close, ready, sendData,
    showMainButton, hideMainButton,
    showBackButton, hideBackButton,
    showConfirm, showPopup, haptic,
    setHeaderColor, setBackgroundColor,
    enableClosingConfirmation, disableClosingConfirmation,
    openTelegramLink, openLink, shareUrl,
  };
}
