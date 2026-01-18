/**
 * シンプルな通知表示関数。エラーや情報を画面右上に表示。
 * @param {string} message - 通知メッセージ
 * @param {'error'|'info'} [type='info']
 */
export function notify(message, type = "info") {
  let n = document.createElement("div");
  n.className = "notify " + type;
  n.textContent = message;
  document.body.appendChild(n);
  setTimeout(() => n.remove(), 3000);
}
