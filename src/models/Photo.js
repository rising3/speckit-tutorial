export class Photo {
  constructor({ id, filePath, thumbnail, date, albumId, metadata = {} }) {
    this.id = id;
    this.filePath = filePath;
    this.thumbnail = thumbnail;
    this.date = date;
    this.albumId = albumId;
    this.metadata = metadata;
  }
}
