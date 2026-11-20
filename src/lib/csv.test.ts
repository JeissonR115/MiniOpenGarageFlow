import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("CSV serialization", () => {
  it("quotes delimiters, quotes, and line breaks and neutralizes spreadsheet formulas", () => {
    expect(
      toCsv(
        ["Name", "Phone", "Notes"],
        [
          ['Ana, "Ani"', "+57 300 123", "Line one\nLine two"],
          ["=SUM(1,2)", null, undefined],
        ],
      ),
    ).toBe(
      `"Name","Phone","Notes"\r\n"Ana, ""Ani""","'+57 300 123","Line one\nLine two"\r\n"'=SUM(1,2)","",""\r\n`,
    );
  });
});
