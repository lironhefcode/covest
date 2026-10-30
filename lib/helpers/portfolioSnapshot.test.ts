import { describe, expect, it } from "vitest"
import { calculateGainPercent, validatePortfolioSnapshot } from "@/lib/helpers/portfolioSnapshot"

describe("validatePortfolioSnapshot", () => {
  it("rejects non-numeric amounts", () => {
    expect(validatePortfolioSnapshot({ initialValue: NaN, currentValue: 100 })).toEqual({
      valid: false,
      message: "Amounts must be valid numbers",
    })
    expect(validatePortfolioSnapshot({ initialValue: 100, currentValue: Infinity })).toEqual({
      valid: false,
      message: "Amounts must be valid numbers",
    })
  })

  it("rejects a non-positive initial value", () => {
    expect(validatePortfolioSnapshot({ initialValue: 0, currentValue: 100 })).toEqual({
      valid: false,
      message: "Total cost must be greater than zero",
    })
  })

  it("rejects a negative current value", () => {
    expect(validatePortfolioSnapshot({ initialValue: 100, currentValue: -1 })).toEqual({
      valid: false,
      message: "Current value cannot be negative",
    })
  })

  it("accepts valid amounts and rounds them to 2 decimals", () => {
    expect(validatePortfolioSnapshot({ initialValue: 100.456, currentValue: 0 })).toEqual({
      valid: true,
      data: { initialValue: 100.46, currentValue: 0 },
    })
  })
})

describe("calculateGainPercent", () => {
  it("calculates positive and negative gains", () => {
    expect(calculateGainPercent({ initialValue: 100, currentValue: 125 })).toBe(25)
    expect(calculateGainPercent({ initialValue: 200, currentValue: 150 })).toBe(-25)
  })

  it("rounds to 2 decimals", () => {
    expect(calculateGainPercent({ initialValue: 3, currentValue: 4 })).toBe(33.33)
  })

  it("returns 0 when the initial value is not positive", () => {
    expect(calculateGainPercent({ initialValue: 0, currentValue: 100 })).toBe(0)
  })
})
