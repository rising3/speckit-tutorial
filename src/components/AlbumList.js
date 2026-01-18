/**
 * アルバム一覧UIを生成する
 * @param {{ onAlbumSelect: function }} param0
 * @returns {Promise<HTMLElement>}
 */

import { getAllAlbums, updateAlbumOrder } from "../services/dbService.js";
import Sortable from "sortablejs";

export default async function AlbumList({ onAlbumSelect }) {
  const albums = await getAllAlbums();
  const el = document.createElement("div");
  el.className = "album-list";
  albums.sort((a, b) => a.order - b.order);
  for (const album of albums) {
    const albumEl = document.createElement("div");
    albumEl.className = "album-item";
    albumEl.textContent = album.title;
    albumEl.dataset.albumId = album.id;
    albumEl.addEventListener("click", () => onAlbumSelect && onAlbumSelect(album));
    el.appendChild(albumEl);
  }

  // ドラッグ&ドロップ有効化
  new Sortable(el, {
    animation: 150,
     onEnd: async () => {
      // 並び順変更時のコールバック（永続化）
      // 並び替え後のDOM順でorderを再設定
      const items = Array.from(el.children);
      for (let i = 0; i < items.length; i++) {
        const albumId = items[i].dataset.albumId;
        await updateAlbumOrder(albumId, i);
      }
    },
  });

  return el;
}
