import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "monthly-rollup",
  "10 0 1 * *",
  internal.monthlyRollups.rollupPreviousMonth,
  {},
);

export default crons;
