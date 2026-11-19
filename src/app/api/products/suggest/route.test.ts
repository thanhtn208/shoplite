// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { GET } from "./route";

const goi = (q: string) =>
  GET(new NextRequest(`http://localhost/api/products/suggest?q=${encodeURIComponent(q)}`));

describe("GET /api/products/suggest", () => {
  it("200 - trả { suggestions } theo đúng thứ tự của spec", async () => {
    const response = goi("usb");
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.suggestions[0]).toEqual({
      slug: "cap-usb-c-ben-du-2m",
      name: "Cáp USB-C bện dù 2m",
      price: 150_000,
      inStock: true,
    });
  });

  it("200 - ký tự đặc biệt không làm server lỗi 500", async () => {
    const response = goi("tai(");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ suggestions: [] });
  });

  it.each([
    ["quá ngắn", "a"],
    ["quá dài", "x".repeat(51)],
  ])("400 - từ khóa %s", async (_, q) => {
    const response = goi(q);
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("VALIDATION_ERROR");
  });
});
