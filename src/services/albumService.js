import { Album } from "../models/Album.js";
import { v4 as uuidv4 } from "uuid";
import * as db from "./dbService.js";

export function groupPhotosByDate(photos) {
  const groups = {};
  for (const photo of photos) {
    if (!groups[photo.date]) groups[photo.date] = [];
    groups[photo.date].push(photo);
  }
  return groups;
}

export async function createAlbumsFromPhotos(
  photos,
  {
    getAllAlbums = db.getAllAlbums,
    insertAlbum = db.insertAlbum,
    updatePhoto = db.updatePhoto,
    uuid = uuidv4,
    AlbumClass = Album,
  } = {}
) {
  const grouped = groupPhotosByDate(photos);
  const albums = [];
  let order = 0;
  // 既存アルバム情報取得
  const existingAlbums = await getAllAlbums();
  const dateToAlbum = {};
  for (const a of existingAlbums) dateToAlbum[a.date] = a;
  for (const date in grouped) {
    if (dateToAlbum[date]) {
      // 既存アルバムがある場合は新規写真だけ追加
      const albumId = dateToAlbum[date].id;
      for (const photo of grouped[date]) {
        photo.albumId = albumId;
        await updatePhoto(photo);
      }
    } else {
      // 新規アルバム作成
      const album = new AlbumClass({
        id: uuid(),
        title: date,
        date,
        order: order++,
        photos: grouped[date],
      });
      await insertAlbum(album);
      for (const photo of grouped[date]) {
        photo.albumId = album.id;
        await updatePhoto(photo);
      }
      albums.push(album);
    }
  }
  return albums;
}
