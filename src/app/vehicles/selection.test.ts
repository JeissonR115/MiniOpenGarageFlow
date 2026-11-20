import { describe, expect, it } from "vitest";
import { getExistingCustomerId } from "./selection";

describe("vehicle owner preselection", () => {
  it("preselects an existing customer requested from the customer detail", () => {
    expect(getExistingCustomerId([2, 5, 9], 5)).toBe(5);
  });

  it("does not preselect a missing or invalid customer", () => {
    expect(getExistingCustomerId([2, 5, 9], 7)).toBeUndefined();
    expect(getExistingCustomerId([2, 5, 9], undefined)).toBeUndefined();
  });
});
