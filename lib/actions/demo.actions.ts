"use server"

import crypto from "crypto"
import { Types } from "mongoose"

import { Alert } from "@/db/models/alert"
import { Group } from "@/db/models/group"
import { GroupMember, StockPosition } from "@/db/models/groupMember"
import { Watchlist } from "@/db/models/watchlist"
import { connectToDatabase } from "@/db/mongoose"
import { auth } from "../better-auth/auth"
import { getStockChange } from "./finnhub.actions"

const DEMO_WATCHLIST = ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META"]

// Used when Finnhub doesn't return a quote, so alert thresholds still make sense
const FALLBACK_PRICES: Record<string, number> = {
  AAPL: 230,
  MSFT: 420,
  NVDA: 140,
  TSLA: 250,
  AMZN: 200,
  GOOGL: 175,
  META: 580,
}

const COMPANY_NAMES: Record<string, string> = {
  AAPL: "Apple Inc",
  MSFT: "Microsoft Corp",
  NVDA: "NVIDIA Corp",
  TSLA: "Tesla Inc",
  AMZN: "Amazon.com Inc",
  GOOGL: "Alphabet Inc",
  META: "Meta Platforms Inc",
}

const DEMO_MEMBERS: { username: string; positions: StockPosition[] }[] = [
  {
    username: "Maya R.",
    positions: [
      { symbol: "NVDA", amountInvested: 6000 },
      { symbol: "AMD", amountInvested: 2500 },
    ],
  },
  {
    username: "Daniel K.",
    positions: [
      { symbol: "AAPL", amountInvested: 4000 },
      { symbol: "MSFT", amountInvested: 4000 },
      { symbol: "GOOGL", amountInvested: 2000 },
    ],
  },
  {
    username: "Noa S.",
    positions: [
      { symbol: "TSLA", amountInvested: 3500 },
      { symbol: "META", amountInvested: 1500 },
    ],
  },
  {
    username: "Itay B.",
    positions: [
      { symbol: "AMZN", amountInvested: 5000 },
      { symbol: "NFLX", amountInvested: 2000 },
    ],
  },
  {
    username: "Shira L.",
    positions: [
      { symbol: "JPM", amountInvested: 3000 },
      { symbol: "V", amountInvested: 3000 },
      { symbol: "KO", amountInvested: 1500 },
    ],
  },
]

const round = (n: number) => parseFloat(n.toFixed(2))

const seedDemoData = async (userId: string, username: string) => {
  const quotes = (await getStockChange(DEMO_WATCHLIST)) as Record<string, QuoteData | undefined>
  const priceOf = (symbol: string) => quotes[symbol]?.c || FALLBACK_PRICES[symbol]

  await Watchlist.insertMany(DEMO_WATCHLIST.map((symbol) => ({ userId, symbol })))

  const activeAlerts = [
    { symbol: "NVDA", alertType: "upper" as const, factor: 1.08 },
    { symbol: "TSLA", alertType: "lower" as const, factor: 0.92 },
    { symbol: "AAPL", alertType: "upper" as const, factor: 1.05 },
  ].map(({ symbol, alertType, factor }) => {
    const price = priceOf(symbol)
    return {
      userId,
      symbol,
      company: COMPANY_NAMES[symbol],
      alertName: `${symbol} ${alertType === "upper" ? "breakout" : "dip"}`,
      alertType,
      threshold: round(price * factor),
      priceAtCreation: round(price),
      lastCheckedPrice: round(price),
      status: "active",
    }
  })

  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000)
  const triggeredAlerts = [
    { symbol: "MSFT", alertType: "upper" as const, factor: 0.98, triggeredAt: hoursAgo(2) },
    { symbol: "META", alertType: "lower" as const, factor: 1.02, triggeredAt: hoursAgo(5) },
  ].map(({ symbol, alertType, factor, triggeredAt }) => {
    const price = priceOf(symbol)
    return {
      userId,
      symbol,
      company: COMPANY_NAMES[symbol],
      alertName: `${symbol} ${alertType === "upper" ? "breakout" : "dip"}`,
      alertType,
      threshold: round(price * factor),
      priceAtCreation: round(alertType === "upper" ? price * 0.93 : price * 1.07),
      lastCheckedPrice: round(price),
      status: "triggered",
      triggeredAt,
      createdAt: hoursAgo(72),
    }
  })

  await Alert.insertMany([...activeAlerts, ...triggeredAlerts])

  const group = await Group.create({
    name: "Demo League",
    inviteCode: `DEMO${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    creatorId: userId,
  })

  await GroupMember.insertMany([
    {
      groupId: group._id,
      userId,
      username,
      positions: [
        { symbol: "AAPL", amountInvested: 3000 },
        { symbol: "NVDA", amountInvested: 2500 },
        { symbol: "MSFT", amountInvested: 2000 },
      ],
    },
    ...DEMO_MEMBERS.map((member) => ({
      groupId: group._id,
      userId: new Types.ObjectId().toString(),
      username: member.username,
      positions: member.positions,
    })),
  ])
}

export const startDemo = async () => {
  try {
    const mongoose = await connectToDatabase()
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Database connection not established")
    }

    const id = crypto.randomBytes(6).toString("hex")
    const name = "Demo Investor"
    const res = await auth.api.signUpEmail({
      body: {
        email: `demo-${id}@demo.covest.local`,
        password: crypto.randomBytes(16).toString("hex"),
        name,
        country: "US",
        investmentGoals: "Growth",
        riskTolerance: "Medium",
        preferredIndustry: "Technology",
        receiveDailyEmails: false,
      },
    })

    const userId = res.user.id
    await db.collection("user").updateOne({ _id: new Types.ObjectId(userId) }, { $set: { isDemo: true } })
    await seedDemoData(userId, name)

    return { success: true }
  } catch (error) {
    console.error("Start demo error:", error)
    return { success: false, error: "Could not start the demo. Please try again." }
  }
}
