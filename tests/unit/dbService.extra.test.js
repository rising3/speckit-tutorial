/* global describe, it, expect, vi, beforeEach */
import { getAllAlbums, getAllPhotos, getPhotosByAlbumId, updateAlbumOrder } from "../../src/services/dbService.js";

let dbMock;
vi.mock("../../src/db/init.js", () => ({
  getDb: async () => dbMock
}));

describe("dbService (追加ケース)", () => {
  beforeEach(() => {
    dbMock = {
      exec: vi.fn(() => []),
      run: vi.fn()
    };
  });

  it("getAllAlbums: DBが空なら空配列", async () => {
    dbMock.exec.mockReturnValueOnce([]);
    const res = await getAllAlbums();
    expect(res).toEqual([]);
  });

  it("getAllPhotos: DBが空なら空配列", async () => {
    dbMock.exec.mockReturnValueOnce([]);
    const res = await getAllPhotos();
    expect(res).toEqual([]);
  });

  it("getPhotosByAlbumId: albumIdが存在しない場合も空配列", async () => {
    dbMock.exec.mockReturnValueOnce([]);
    const res = await getPhotosByAlbumId("notfound");
    expect(res).toEqual([]);
  });

  it("updateAlbumOrder: 存在しないIDでもエラーにならない", async () => {
    dbMock.run.mockImplementation(() => {});
    await expect(updateAlbumOrder("notfound", 99)).resolves.toBeUndefined();
  });
});
