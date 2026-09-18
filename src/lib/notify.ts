/**
 * Уведомление владельцу в Telegram о заказе или сообщении с сайта.
 * Работает, если заданы переменные TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID;
 * без них молча ничего не делает — сайт продолжает работать.
 *
 * Как получить: создать бота у @BotFather (он выдаст токен), написать боту
 * любое сообщение, затем открыть https://api.telegram.org/bot<токен>/getUpdates
 * и взять число из поля chat.id.
 */
export async function notifyOwner(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text.slice(0, 3900),
        disable_web_page_preview: true,
      }),
      signal: controller.signal,
    });
    if (!response.ok) {
      console.error("Telegram не принял сообщение:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Не удалось отправить уведомление в Telegram:", error);
  } finally {
    clearTimeout(timer);
  }
}
