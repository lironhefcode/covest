import { describe, expect, it } from "vitest"
import { validateAlertThreshold } from "@/lib/alert-utils"

describe("validateAlertThreshold", () => {
  it("rejects non-numeric, zero and negative thresholds", () => {
    const message = "Please enter a valid price threshold"
    expect(validateAlertThreshold("upper", "abc", 100)).toBe(message)
    expect(validateAlertThreshold("upper", 0, 100)).toBe(message)
    expect(validateAlertThreshold("lower", -5, 100)).toBe(message)
  })

  it("skips the price comparison when the current price is unknown", () => {
    expect(validateAlertThreshold("upper", 50, NaN)).toBeNull()
  })

  it("requires upper alerts to be above the current price", () => {
    expect(validateAlertThreshold("upper", 100, 100)).toBe("An above alert must be higher than $100.00")
    expect(validateAlertThreshold("upper", 90, 100)).toBe("An above alert must be higher than $100.00")
    expect(validateAlertThreshold("upper", "110", 100)).toBeNull()
  })

  it("requires lower alerts to be below the current price", () => {
    expect(validateAlertThreshold("lower", 100, 100)).toBe("A below alert must be lower than $100.00")
    expect(validateAlertThreshold("lower", 110, 100)).toBe("A below alert must be lower than $100.00")
    expect(validateAlertThreshold("lower", "90", 100)).toBeNull()
  })
})
