import { inngest } from "@/lib/inngest/client";
import { sendDailyNewsSummary, sendSignUpEmail, checkPriceAlerts, cleanupDemoUsers } from "@/lib/inngest/functions";

import { serve } from "inngest/next";
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendSignUpEmail, sendDailyNewsSummary, checkPriceAlerts, cleanupDemoUsers],
});
