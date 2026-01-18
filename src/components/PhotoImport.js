import { openFilePicker } from "../lib/filePicker.js";
import { generateThumbnail } from "../lib/thumbnail.js";
import { v4 as uuidv4 } from "uuid";
import { insertPhoto } from "../services/dbService.js";


export default function PhotoImport({ onPhotosImported }) {
  const btn = document.createElement("button");
  btn.textContent = "写真を選択して追加";
  btn.onclick = async () => {
    const files = await openFilePicker({ multiple: true });
    const photos = [];
    for (const file of files) {
      const id = uuidv4();
      const date = file.lastModifiedDate
        ? file.lastModifiedDate.toISOString().slice(0, 10)
        : new Date(file.lastModified).toISOString().slice(0, 10);
      const thumbnail = await generateThumbnail(file);
      const photo = {
        id,
        filePath: file.name,
        thumbnail,
        date,
        albumId: null, // 後で割り当て
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          createdAt: file.lastModified,
        },
      };
      await insertPhoto(photo);
      photos.push(photo);
    }
    if (onPhotosImported) onPhotosImported(photos);
  };
  return btn;
}
