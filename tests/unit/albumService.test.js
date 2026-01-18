/* global describe, it, expect */
import { groupPhotosByDate } from "../../src/services/albumService.js";

describe("groupPhotosByDate", () => {
  it("日付ごとに正しくグループ化される", () => {
    const photos = [
      { id: "1", date: "2024-01-01" },
      { id: "2", date: "2024-01-01" },
      { id: "3", date: "2024-01-02" },
    ];
    const grouped = groupPhotosByDate(photos);
    expect(Object.keys(grouped)).toEqual(["2024-01-01", "2024-01-02"]);
    expect(grouped["2024-01-01"].length).toBe(2);
    expect(grouped["2024-01-02"].length).toBe(1);
  });

  it("空配列の場合は空オブジェクトを返す", () => {
    const grouped = groupPhotosByDate([]);
    expect(grouped).toEqual({});
  });
});
