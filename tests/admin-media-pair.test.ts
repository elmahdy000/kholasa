import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaService } from "@/services/media.service";

const image = () => new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "cover.png", { type: "image/png" });
const audio = () => new File(["ID3-audio"], "audio.mp3", { type: "audio/mpeg" });

describe("paired media uploads", () => {
  afterEach(() => vi.restoreAllMocks());
  it("rejects bad audio contents before saving either file", async () => {
    const save = vi.spyOn(MediaService, "saveUploadedBuffer");
    await expect(MediaService.saveUploadedPair(image(), new File(["invalid"], "audio.mp3", { type: "audio/mpeg" }))).rejects.toThrow("لا يطابق");
    expect(save).not.toHaveBeenCalled();
  });
  it("rejects reversed file categories before writing", async () => {
    const save = vi.spyOn(MediaService, "saveUploadedBuffer");
    await expect(MediaService.saveUploadedPair(audio(), image())).rejects.toThrow("بالنوع الصحيح");
    expect(save).not.toHaveBeenCalled();
  });
  it("removes only the newly saved cover when audio saving fails", async () => {
    vi.spyOn(MediaService, "saveUploadedBuffer").mockResolvedValueOnce({ success: true, filename: "images/new-cover.png", url: "/api/media/images/new-cover.png", size: 8, type: "image/png" }).mockRejectedValueOnce(new Error("storage full"));
    const remove = vi.spyOn(MediaService, "deleteMediaFile").mockResolvedValue({ success: true });
    await expect(MediaService.saveUploadedPair(image(), audio())).rejects.toThrow("storage full");
    expect(remove).toHaveBeenCalledExactlyOnceWith("images/new-cover.png");
  });
});
