import { updatePhoto } from "../services/dbService.js";

export default function PhotoAssign({ photo, albums, onAssigned }) {
  const el = document.createElement("div");
  el.className = "photo-assign";
  const select = document.createElement("select");
  for (const album of albums) {
    const option = document.createElement("option");
    option.value = album.id;
    option.textContent = album.title;
    select.appendChild(option);
  }
  select.value = photo.albumId || "";
  select.addEventListener("change", async (e) => {
    photo.albumId = e.target.value;
    await updatePhoto(photo);
    if (onAssigned) onAssigned(photo);
  });
  el.appendChild(select);
  return el;
}
