// Конфигурация бота Begim
// Меняйте эти значения на свои перед деплоем!

export const BOT_CONFIG = {
  // Username вашего бота (без @)
  botUsername: "begim_uz_bot",

  // Прямые ссылки (формируются автоматически)
  get botLink() { return `https://t.me/${this.botUsername}`; },
  get miniAppLink() { return `https://t.me/${this.botUsername}/app`; },
  get startLink() { return `https://t.me/${this.botUsername}?start=app`; },
  get shareLink() { return `https://t.me/share/url?url=${encodeURIComponent(this.miniAppLink)}&text=${encodeURIComponent("🥮 Begim — uy shirinliklari bozori!")}`; },

  // Поддержка
  supportUsername: "begim_support",
  get supportLink() { return `https://t.me/${this.supportUsername}`; },

  // Канал с новостями
  channelUsername: "begim_uz",
  get channelLink() { return `https://t.me/${this.channelUsername}`; },
};
