import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const distAssetsDir = new URL("../dist/assets/", import.meta.url);
const distAssetsPath = fileURLToPath(distAssetsDir);

const budgets = [
  {
    name: "entry bundle",
    match: (file) => file.startsWith("index-") && file.endsWith(".js"),
    maxBytes: 160 * 1024,
  },
  {
    name: "react vendor chunk",
    match: (file) => file.startsWith("react-vendor-") && file.endsWith(".js"),
    maxBytes: 200 * 1024,
  },
  {
    name: "charts chunk",
    match: (file) => file.startsWith("charts-") && file.endsWith(".js"),
    maxBytes: 425 * 1024,
  },
  {
    name: "route chunk",
    match: (file) =>
      /^(OverviewPage|FundSafetySummaryPage|TerrorRiskTopicPage|AlertDetailPage|BlacklistConfigPage|RuleConfigPage|TransactionDataPage)-.+\.js$/.test(file),
    maxBytes: 30 * 1024,
    allowMultiple: true,
  },
];

function getBudgetLimitBytes(budget, file) {
  if (budget.name === "route chunk" && file.startsWith("TerrorRiskTopicPage-")) {
    return 36 * 1024;
  }

  return budget.maxBytes;
}

const allAssetFiles = readdirSync(distAssetsPath).filter((file) => file.endsWith(".js"));
const failures = [];
const reports = [];

for (const budget of budgets) {
  const matches = allAssetFiles.filter(budget.match);

  if (!matches.length) {
    failures.push(`Missing expected output for ${budget.name}.`);
    continue;
  }

  for (const file of matches) {
    const size = statSync(join(distAssetsPath, file)).size;
    const limitBytes = getBudgetLimitBytes(budget, file);
    reports.push(`${budget.name}: ${file} ${(size / 1024).toFixed(2)} kB / limit ${(limitBytes / 1024).toFixed(0)} kB`);

    if (size > limitBytes) {
      failures.push(
        `${budget.name} exceeded budget: ${file} is ${(size / 1024).toFixed(2)} kB, limit is ${(limitBytes / 1024).toFixed(0)} kB.`,
      );
    }

    if (!budget.allowMultiple) {
      break;
    }
  }
}

const unclassifiedLargeChunks = allAssetFiles
  .filter((file) => !budgets.some((budget) => budget.match(file)))
  .map((file) => ({
    file,
    size: statSync(join(distAssetsPath, file)).size,
  }))
  .filter(({ size }) => size > 200 * 1024);

for (const chunk of unclassifiedLargeChunks) {
  failures.push(
    `Unclassified JS chunk exceeded fallback limit: ${chunk.file} is ${(chunk.size / 1024).toFixed(2)} kB, limit is 200 kB.`,
  );
}

console.log("Bundle budget report");
for (const report of reports) {
  console.log(`- ${report}`);
}

if (failures.length) {
  console.error("\nBundle budget check failed");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("\nBundle budget check passed");
