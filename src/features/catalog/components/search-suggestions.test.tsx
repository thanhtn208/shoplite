import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSuggestions } from "../suggest-service";
import { SearchSuggestions } from "./search-suggestions";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

/** Giả API gợi ý bằng chính hàm của server, không gọi mạng thật. */
function giaApi() {
  const fetchMock = vi.fn(async (url: string) => {
    const q = new URL(url, "http://localhost").searchParams.get("q") ?? "";
    return new Response(JSON.stringify({ suggestions: getSuggestions(q) }));
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const oTimKiem = () => screen.getByRole("combobox", { name: "Từ khóa tìm kiếm" });

afterEach(() => {
  vi.unstubAllGlobals();
  push.mockReset();
});

describe("SearchSuggestions", () => {
  it("gõ 'usb': còn hàng đứng trước, sản phẩm hết hàng có nhãn Hết hàng", async () => {
    giaApi();
    render(<SearchSuggestions defaultValue="" inputClassName="" />);
    await userEvent.type(oTimKiem(), "usb");

    const options = await screen.findAllByRole("option");
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent("Cáp USB-C bện dù 2m");
    expect(options[0]).not.toHaveTextContent("Hết hàng");
    expect(options[1]).toHaveTextContent("Micro thu âm PodCast USB");
    expect(options[1]).toHaveTextContent("Hết hàng");
  });

  it("dưới 2 ký tự: không gọi API, không hiện danh sách", async () => {
    const fetchMock = giaApi();
    render(<SearchSuggestions defaultValue="" inputClassName="" />);
    await userEvent.type(oTimKiem(), "u");
    await new Promise((resolve) => setTimeout(resolve, 400));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("↓ rồi Enter mở trang chi tiết của gợi ý đang chọn", async () => {
    giaApi();
    render(<SearchSuggestions defaultValue="" inputClassName="" />);
    await userEvent.type(oTimKiem(), "ban phim");
    await screen.findByRole("option");
    await userEvent.keyboard("{ArrowDown}{Enter}");

    expect(push).toHaveBeenCalledWith("/products/ban-phim-co-keypro-75");
  });
});
