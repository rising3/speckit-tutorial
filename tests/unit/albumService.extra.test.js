/* global vi, describe, it, expect */
// uuid.v4を固定値でモック
vi.doMock("uuid", () => ({ v4: () => "mock-album-id" }));
// localStorageダミー
globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};
import { groupPhotosByDate, createAlbumsFromPhotos } from "../../src/services/albumService.js";

describe("createAlbumsFromPhotos", () => {
  it("新規日付のアルバムが作成される", async () => {
    const photos = [
      { id: "1", date: "2024-01-01", filePath: "a.jpg", thumbnail: "a", albumId: undefined, metadata: {} },
      { id: "2", date: "2024-01-02", filePath: "b.jpg", thumbnail: "b", albumId: undefined, metadata: {} },
    ];
    const insertAlbumMock = vi.fn((album) => album);
    const updatePhotoMock = vi.fn();
    const getAllAlbumsMock = vi.fn(() => Promise.resolve([]));
    const uuidMock = vi.fn(() => "mock-album-id");
    const albums = await createAlbumsFromPhotos(photos, {
      getAllAlbums: getAllAlbumsMock,
      insertAlbum: insertAlbumMock,
      updatePhoto: updatePhotoMock,
      uuid: uuidMock,
    });
    expect(insertAlbumMock).toHaveBeenCalledTimes(2);
    expect(updatePhotoMock).toHaveBeenCalledTimes(2);
    expect(albums.length).toBe(2);
    expect(albums[0].date).toBe("2024-01-01");
    expect(albums[1].date).toBe("2024-01-02");
  });

  it("既存日付のアルバムには新規写真だけが追加される", async () => {
    const photos = [
      { id: "1", date: "2024-01-01", filePath: "a.jpg", thumbnail: "a", albumId: undefined, metadata: {} },
      { id: "2", date: "2024-01-01", filePath: "b.jpg", thumbnail: "b", albumId: undefined, metadata: {} },
      { id: "3", date: "2024-01-02", filePath: "c.jpg", thumbnail: "c", albumId: undefined, metadata: {} },
    ];
    const insertAlbumMock = vi.fn();
    const updatePhotoMock = vi.fn();
    const getAllAlbumsMock = vi.fn(() => Promise.resolve([{ id: "a1", date: "2024-01-01" }]));
    const uuidMock = vi.fn(() => "mock-album-id");
    const albums = await createAlbumsFromPhotos(photos, {
      getAllAlbums: getAllAlbumsMock,
      insertAlbum: insertAlbumMock,
      updatePhoto: updatePhotoMock,
      uuid: uuidMock,
    });
    expect(insertAlbumMock).toHaveBeenCalledTimes(1); // 2024-01-02のみ新規
    expect(updatePhotoMock).toHaveBeenCalledTimes(3); // 全写真update
    expect(albums.length).toBe(1);
    expect(albums[0].date).toBe("2024-01-02");
  });

  it("空配列の場合は空配列を返す", async () => {
    const insertAlbumMock = vi.fn();
    const updatePhotoMock = vi.fn();
    const getAllAlbumsMock = vi.fn(() => Promise.resolve([]));
    const uuidMock = vi.fn(() => "mock-album-id");
    const albums = await createAlbumsFromPhotos([], {
      getAllAlbums: getAllAlbumsMock,
      insertAlbum: insertAlbumMock,
      updatePhoto: updatePhotoMock,
      uuid: uuidMock,
    });
    expect(albums).toEqual([]);
  });

  it("すべて既存アルバムの場合はinsertAlbumされない", async () => {
    const photos = [
      { id: "1", date: "2024-01-01", filePath: "a.jpg", thumbnail: "a", albumId: undefined, metadata: {} },
      { id: "2", date: "2024-01-01", filePath: "b.jpg", thumbnail: "b", albumId: undefined, metadata: {} },
    ];
    const insertAlbumMock = vi.fn();
    const updatePhotoMock = vi.fn();
    const getAllAlbumsMock = vi.fn(() => Promise.resolve([{ id: "a1", date: "2024-01-01" }]));
    const uuidMock = vi.fn(() => "mock-album-id");
    const albums = await createAlbumsFromPhotos(photos, {
      getAllAlbums: getAllAlbumsMock,
      insertAlbum: insertAlbumMock,
      updatePhoto: updatePhotoMock,
      uuid: uuidMock,
    });
    expect(insertAlbumMock).not.toHaveBeenCalled();
    expect(updatePhotoMock).toHaveBeenCalledTimes(2);
    expect(albums.length).toBe(0);
  });
});

describe("groupPhotosByDate (追加ケース)", () => {
  it("日付がnull/undefined/空文字の写真もグループ化される", () => {
    const photos = [
      { id: "1", date: null },
      { id: "2", date: undefined },
      { id: "3", date: "" },
      { id: "4", date: "2024-01-01" },
      { id: "5", date: "2024-01-01" },
    ];
    const grouped = groupPhotosByDate(photos);
    expect(grouped[null].length).toBe(1);
    expect(grouped[undefined].length).toBe(1);
    expect(grouped[""] .length).toBe(1);
    expect(grouped["2024-01-01"].length).toBe(2);
  });

  it("同じ日付が複数回現れても正しくグループ化", () => {
    const photos = [
      { id: "1", date: "2024-01-01" },
      { id: "2", date: "2024-01-01" },
      { id: "3", date: "2024-01-01" },
    ];
    const grouped = groupPhotosByDate(photos);
    expect(grouped["2024-01-01"].length).toBe(3);
  });
});
