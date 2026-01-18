/* global vi, describe, it, expect */
import AlbumView from "../../src/components/AlbumView.js";

// モック: getPhotosByAlbumId
vi.mock("../../src/services/dbService.js", () => ({
  // eslint-disable-next-line no-unused-vars
  getPhotosByAlbumId: async (albumId) => [
    { id: "p1", thumbnail: "thumb1.jpg", metadata: { name: "photo1" } },
    { id: "p2", thumbnail: "thumb2.jpg", metadata: { name: "photo2" } },
  ]
}));

describe("AlbumView (photo tile grid)", () => {
  it("アルバム内の写真がタイル状に表示される", async () => {
    const album = { id: "a1", title: "Test Album" };
    const el = await AlbumView({ album });
    const grid = el.querySelector(".photo-grid");
    expect(grid).not.toBeNull();
    const imgs = grid.querySelectorAll(".photo-thumb");
    expect(imgs.length).toBe(2);
    expect(imgs[0].src).toContain("thumb1.jpg");
    expect(imgs[1].alt).toBe("photo2");
  });
});