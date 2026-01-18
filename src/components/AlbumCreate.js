import { createAlbumsFromPhotos } from "../services/albumService.js";
import { getAllPhotos } from "../services/dbService.js";

export default function AlbumCreate({ onAlbumsCreated }) {
  const handleCreateAlbums = async () => {
    const photos = await getAllPhotos();
    const albums = await createAlbumsFromPhotos(photos);
    if (onAlbumsCreated) onAlbumsCreated(albums);
  };

  const el = document.createElement("div");
  const btn = document.createElement("button");
  btn.textContent = "日付ごとにアルバムを作成";
  btn.addEventListener("click", handleCreateAlbums);
  el.appendChild(btn);
  return el;
}
