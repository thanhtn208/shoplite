import { describe, expect, it } from "vitest";
import { getSuggestions, MAX_SUGGESTIONS } from "./suggest-service";

const tenVaConHang = (query: string) =>
  getSuggestions(query).map((item) => [item.name, item.inStock]);

// Mỗi test ứng với một dòng của I/O & Edge-Case Matrix trong spec-7-1-goi-y-tim-kiem.md
describe("getSuggestions", () => {
  it("khớp không dấu theo tên: 'ban phim' ra Bàn phím cơ KeyPro 75%", () => {
    expect(getSuggestions("ban phim")).toEqual([
      {
        slug: "ban-phim-co-keypro-75",
        name: "Bàn phím cơ KeyPro 75%",
        price: 1_890_000,
        inStock: true,
      },
    ]);
  });

  it("còn hàng đứng trước hết hàng dù điểm thấp hơn ('usb')", () => {
    expect(tenVaConHang("usb")).toEqual([
      ["Cáp USB-C bện dù 2m", true],
      ["Micro thu âm PodCast USB", false],
    ]);
  });

  it("cùng 4,5 điểm: sản phẩm còn hàng đứng trước ('po')", () => {
    expect(tenVaConHang("po")).toEqual([
      ["Pin dự phòng PowerGo 20.000mAh", true],
      ["Micro thu âm PodCast USB", false],
    ]);
  });

  it(`tối đa ${MAX_SUGGESTIONS} gợi ý, đúng thứ tự khi 8 sản phẩm khớp ('on')`, () => {
    expect(getSuggestions("on").map((item) => item.name)).toEqual([
      "Tai nghe chụp tai StudioOne",
      "Đồng hồ thông minh FitWatch S2",
      "Tai nghe không dây SoundMax Pro",
      "Pin dự phòng PowerGo 20.000mAh",
      "Chuột không dây SwiftClick",
    ]);
  });

  it("không có sản phẩm nào khớp thì trả mảng rỗng ('xyz')", () => {
    expect(getSuggestions("xyz")).toEqual([]);
  });

  // Không đưa "(.*.*)*!" vào unit test: trên code dựng RegExp, mẫu đó làm treo cả bộ test (ReDoS)
  // thay vì làm test đỏ. Thử nó bằng curl có giới hạn thời gian (bài 7.2).
  it.each(["tai(", "usb++", "[a-z", "*"])(
    "ký tự đặc biệt '%s' được hiểu là chữ: không ném lỗi, trả mảng rỗng",
    (query) => {
      expect(getSuggestions(query)).toEqual([]);
    },
  );
});
