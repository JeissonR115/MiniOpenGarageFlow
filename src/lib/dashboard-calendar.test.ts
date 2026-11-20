import { describe, expect, it } from "vitest";
import { groupCustomersByBogotaMonth } from "./dashboard";

describe("customer dashboard month grouping", () => {
  it("groups registrations by the Bogota calendar month", () => {
    expect(
      groupCustomersByBogotaMonth([
        new Date("2026-02-01T04:30:00.000Z"),
        new Date("2026-02-01T05:30:00.000Z"),
        new Date("2026-02-20T12:00:00.000Z"),
      ]),
    ).toMatchObject([
      { month: "2026-01", count: 1 },
      { month: "2026-02", count: 2 },
    ]);
  });

  it("returns no chart points when there are no customer registrations", () => {
    expect(groupCustomersByBogotaMonth([])).toEqual([]);
  });
});
