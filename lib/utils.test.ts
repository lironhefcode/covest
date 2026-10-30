import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  calculateNewsDistribution,
  formatChangePercent,
  formatCurrency,
  formatMarketCapValue,
  formatTimeAgo,
  formatTodayGain,
  getAlertText,
  getChangeColorClass,
  getInitials,
} from "@/lib/utils"

describe("formatMarketCapValue", () => {
  // Input is in millions of USD
  it("formats trillions, billions and millions", () => {
    expect(formatMarketCapValue(3_100_000)).toBe("$3.10T")
    expect(formatMarketCapValue(900_000)).toBe("$900.00B")
    expect(formatMarketCapValue(25)).toBe("$25.00M")
  })

  it("shows the full amount below one million", () => {
    expect(formatMarketCapValue(0.5)).toBe("$500000.00")
  })

  it("returns N/A for zero, negative and non-finite values", () => {
    expect(formatMarketCapValue(0)).toBe("N/A")
    expect(formatMarketCapValue(-10)).toBe("N/A")
    expect(formatMarketCapValue(NaN)).toBe("N/A")
    expect(formatMarketCapValue(Infinity)).toBe("N/A")
  })
})

describe("formatChangePercent", () => {
  it("adds a plus sign for positive changes", () => {
    expect(formatChangePercent(1.234)).toBe("+1.23%")
  })

  it("keeps the minus sign for negative changes", () => {
    expect(formatChangePercent(-2.5)).toBe("-2.50%")
  })

  it("returns an empty string for zero or undefined", () => {
    expect(formatChangePercent(0)).toBe("")
    expect(formatChangePercent(undefined)).toBe("")
  })
})

describe("getChangeColorClass", () => {
  it("returns the matching color class", () => {
    expect(getChangeColorClass(1)).toBe("text-green-500")
    expect(getChangeColorClass(-1)).toBe("text-red-500")
    expect(getChangeColorClass(0)).toBe("text-gray-400")
    expect(getChangeColorClass(undefined)).toBe("text-gray-400")
  })
})

describe("getInitials", () => {
  it("returns up to two uppercase initials", () => {
    expect(getInitials("john doe")).toBe("JD")
    expect(getInitials("Mary Jane Watson")).toBe("MJ")
    expect(getInitials("alice")).toBe("A")
  })
})

describe("formatCurrency", () => {
  it("formats as whole US dollars", () => {
    expect(formatCurrency(1234.56)).toBe("$1,235")
    expect(formatCurrency(0)).toBe("$0")
  })
})

describe("formatTodayGain", () => {
  it("formats gains with a sign", () => {
    expect(formatTodayGain(3.456)).toBe("+3.46%")
    expect(formatTodayGain(0)).toBe("+0.00%")
    expect(formatTodayGain(-1.2)).toBe("-1.20%")
  })

  it("falls back to 0.00% for non-finite values", () => {
    expect(formatTodayGain(NaN)).toBe("0.00%")
    expect(formatTodayGain(Infinity)).toBe("0.00%")
  })
})

describe("calculateNewsDistribution", () => {
  it("gives 3 items per symbol for fewer than 3 symbols", () => {
    expect(calculateNewsDistribution(2)).toEqual({ itemsPerSymbol: 3, targetNewsCount: 6 })
  })

  it("gives 2 items per symbol for exactly 3 symbols", () => {
    expect(calculateNewsDistribution(3)).toEqual({ itemsPerSymbol: 2, targetNewsCount: 6 })
  })

  it("gives 1 item per symbol for more than 3 symbols", () => {
    expect(calculateNewsDistribution(10)).toEqual({ itemsPerSymbol: 1, targetNewsCount: 6 })
  })
})

describe("formatTimeAgo", () => {
  const now = new Date("2026-01-15T12:00:00Z").getTime()
  const secondsAgo = (seconds: number) => now / 1000 - seconds

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("formats minutes", () => {
    expect(formatTimeAgo(secondsAgo(60))).toBe("1 minute ago")
    expect(formatTimeAgo(secondsAgo(5 * 60))).toBe("5 minutes ago")
  })

  it("formats hours", () => {
    expect(formatTimeAgo(secondsAgo(60 * 60))).toBe("1 hour ago")
    expect(formatTimeAgo(secondsAgo(3 * 60 * 60))).toBe("3 hours ago")
  })

  it("formats days once more than 24 hours have passed", () => {
    expect(formatTimeAgo(secondsAgo(25 * 60 * 60))).toBe("1 day ago")
    expect(formatTimeAgo(secondsAgo(3 * 24 * 60 * 60))).toBe("3 days ago")
  })
})

describe("getAlertText", () => {
  const baseAlert: Alert = {
    id: "1",
    symbol: "AAPL",
    company: "Apple Inc.",
    alertName: "Apple alert",
    alertType: "upper",
    threshold: 200,
    priceAtCreation: 180,
    status: "active",
  } as Alert

  it("uses > for upper alerts", () => {
    expect(getAlertText(baseAlert)).toBe("Price > $200")
  })

  it("uses < for lower alerts", () => {
    expect(getAlertText({ ...baseAlert, alertType: "lower", threshold: 150 })).toBe("Price < $150")
  })
})
