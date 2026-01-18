export class Album {
  constructor({ id, title, date, order, photos = [] }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.order = order;
    this.photos = photos;
  }
}
