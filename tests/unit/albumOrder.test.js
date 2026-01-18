/* global describe, it, expect, vi, beforeEach */
import { updateAlbumOrder } from "../../src/services/dbService.js";

// runMockをdescribe外で定義
let runMock;
vi.mock("../../src/db/init.js", () => ({
  getDb: async () => ({ run: runMock })
}));

describe("updateAlbumOrder", () => {
  beforeEach(() => {
    runMock = vi.fn();
  });
  it("アルバムのorderが正しく更新される", async () => {
    await updateAlbumOrder("a2", 0);
    expect(runMock).toHaveBeenCalledWith(
      "UPDATE albums SET \"order\" = ? WHERE id = ?",
      [0, "a2"]
    );
  });
});

describe("アルバム順序の永続化シナリオ", () => {
  beforeEach(() => {
    runMock = vi.fn();
  });
  it("複数アルバムのorderを一括更新できる", async () => {
    const newOrder = ["a3", "a1", "a2"];
    for (let i = 0; i < newOrder.length; i++) {
      await updateAlbumOrder(newOrder[i], i);
    }
    expect(runMock).toHaveBeenCalledTimes(3);
    expect(runMock).toHaveBeenNthCalledWith(1, "UPDATE albums SET \"order\" = ? WHERE id = ?", [0, "a3"]);
    expect(runMock).toHaveBeenNthCalledWith(2, "UPDATE albums SET \"order\" = ? WHERE id = ?", [1, "a1"]);
    expect(runMock).toHaveBeenNthCalledWith(3, "UPDATE albums SET \"order\" = ? WHERE id = ?", [2, "a2"]);
  });
});
