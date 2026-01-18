/* global vi, describe, it, expect */
import AlbumView from "../../src/components/AlbumView.js";

vi.mock("../../src/services/dbService.js", () => ({
  getPhotosByAlbumId: async (albumId) => albumId === "empty" ? [] : [
    { id: "p1", thumbnail: null, metadata: { name: "photo1" } },
    { id: "p2", thumbnail: "", metadata: { name: "photo2" } },
  ]
}));

describe("AlbumView (追加ケース)", () => {
  it("写真が0枚のアルバムでもエラーにならない", async () => {
    const album = { id: "empty", title: "Empty Album" };
    const el = await AlbumView({ album });
    expect(el.querySelectorAll(".photo-thumb").length).toBe(0);
  });

  it("サムネイルがnull/空でもimg要素は生成される", async () => {
    const album = { id: "a1", title: "Test Album" };
    const el = await AlbumView({ album });
    const imgs = el.querySelectorAll(".photo-thumb");
    expect(imgs.length).toBe(2);
    expect(imgs[0].src.endsWith("/") || imgs[0].src === "").toBe(true);
    expect(imgs[1].src.endsWith("/") || imgs[1].src === "").toBe(true);
  });
});
