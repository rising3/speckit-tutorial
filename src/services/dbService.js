export async function updateAlbumOrder(albumId, newOrder) {
  const db = await getDb();
  db.run(
    "UPDATE albums SET \"order\" = ? WHERE id = ?",
    [newOrder, albumId]
  );
}
import { getDb } from "../db/init.js";

export async function insertAlbum(album) {
  const db = await getDb();
  db.run(
    "INSERT INTO albums (id, title, date, \"order\") VALUES (?, ?, ?, ?)",
    [album.id, album.title, album.date, album.order]
  );
}

export async function insertPhoto(photo) {
  const db = await getDb();
  db.run(
    "INSERT INTO photos (id, filePath, thumbnail, date, albumId, metadata) VALUES (?, ?, ?, ?, ?, ?)",
    [photo.id, photo.filePath, photo.thumbnail, photo.date, photo.albumId, JSON.stringify(photo.metadata)]
  );
}


export async function getAllPhotos() {
  const db = await getDb();
  const res = db.exec("SELECT * FROM photos");
  if (!res[0]) return [];
  return res[0].values.map(row => {
    const [id, filePath, thumbnail, date, albumId, metadata] = row;
    return { id, filePath, thumbnail, date, albumId, metadata: JSON.parse(metadata) };
  });
}

export async function getAllAlbums() {
  const db = await getDb();
  const res = db.exec("SELECT * FROM albums");
  if (!res[0]) return [];
  return res[0].values.map(row => {
    const [id, title, date, order] = row;
    return { id, title, date, order };
  });
}

export async function getPhotosByAlbumId(albumId) {
  const db = await getDb();
  const res = db.exec("SELECT * FROM photos WHERE albumId = ?", [albumId]);
  if (!res[0]) return [];
  return res[0].values.map(row => {
    const [id, filePath, thumbnail, date, albumId, metadata] = row;
    return { id, filePath, thumbnail, date, albumId, metadata: JSON.parse(metadata) };
  });
}

export async function updatePhoto(photo) {
  const db = await getDb();
  db.run(
    "UPDATE photos SET filePath = ?, thumbnail = ?, date = ?, albumId = ?, metadata = ? WHERE id = ?",
    [photo.filePath, photo.thumbnail, photo.date, photo.albumId, JSON.stringify(photo.metadata), photo.id]
  );
}
