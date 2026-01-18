
import { getPhotosByAlbumId } from "../services/dbService.js";

/**
 * アルバム詳細ビュー（タイル＋プレビュー）
 * @param {{ album: object }} param0
 * @returns {Promise<HTMLElement>}
 */
export default async function AlbumView({ album }) {
  const el = document.createElement("div");
  el.className = "album-view";
  const title = document.createElement("h2");
  title.textContent = album.title;
  el.appendChild(title);
  const photos = await getPhotosByAlbumId(album.id);
  const grid = document.createElement("div");
  grid.className = "photo-grid";
  for (const photo of photos) {
    const img = document.createElement("img");
    img.src = photo.thumbnail ? photo.thumbnail : "";
    img.alt = photo.metadata.name || "no image";
    img.className = "photo-thumb";
    img.setAttribute("tabindex", "0");
    img.addEventListener("click", () => showPreview(photo));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") showPreview(photo);
    });
    grid.appendChild(img);
  }
  el.appendChild(grid);

  // プレビュー用モーダル生成
  function showPreview(photo) {
    let modal = document.createElement("div");
    modal.className = "photo-modal";
      modal.innerHTML = `<div class="photo-modal-backdrop"></div><div class="photo-modal-content"><img src="${photo.thumbnail}" alt="${photo.metadata.name}" /><div class="photo-modal-caption">${photo.metadata.name}</div></div>`;
    modal.tabIndex = -1;
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.classList.contains("photo-modal-backdrop")) {
        modal.remove();
      }
    });
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") modal.remove();
    });
    document.body.appendChild(modal);
    modal.focus();
  }

  return el;
}
