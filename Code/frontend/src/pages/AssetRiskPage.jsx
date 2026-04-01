import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  ResponsiveContainer,
  Bar,
  Line,
} from "recharts";

import { PageMetaRow } from "../components/shared/PageMetaRow";
import { AccordionSection } from "../components/shared/AccordionSection";
import { assetKPIs, barData, terrorBlacklistData } from "../data/assetRisk";
import { pieData, donutData, recentRisks } from "../data/overview";
import { formatAmountDisplay } from "../utils/amount";

export function AssetRiskPage() {
  const [subTab, setSubTab] = useState("应收账款逾期");

  const navSections = [
    {
      title: "涉恐交易风险",
      items: [
        { label: "涉恐黑名单" },
        { label: "业务逻辑配置" },
        { label: "交易数据" },
        { label: "xxxxxx" },
        { label: "xxxxxx" },
      ],
    },
    {
      title: "xx二级主题",
      items: [],
    },
    {
      title: "xx二级主题",
      items: [],
    },
  ];


  return (
    <div style={{ padding: "0 24px 24px" }}>
      <PageMetaRow showActions />
      <div style={{ display: "flex", gap: 0, alignItems: "flex-start" }}>
        <div
          style={{
            background: "white",
            borderRadius: 10,
            boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            width: 160,
            flexShrink: 0,
            border: "1px solid #f0f0f0",
            overflow: "hidden",
          }}
        >
          {navSections.map((section) => (
            <AccordionSection
              key={section.title}
              title={section.title}
              items={section.items}
              activeItem={subTab}
              onSelect={setSubTab}
            />
          ))}
        </div>

        <div
          style={{
            flex: 1,
            marginLeft: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 12,
            }}
          >
            {assetKPIs.map((kpi) => (
              <div
                key={kpi.title}
                style={{
                  background: "white",
                  borderRadius: 12,
                  padding: "16px 18px",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#666",
                    marginBottom: 6,
                  }}
                >
                  {kpi.title}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#e05c5c",
                    marginBottom: 4,
                  }}
                >
                  {shouldFormatAmountText(kpi.value) ? formatAmountDisplay(kpi.value) : kpi.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#aaa",
                    marginBottom: 12,
                  }}
                >
                  {kpi.sub}
                </div>
                {[
                  { label: "高风险", val: 0, color: "#e05c5c" },
                  { label: "预警关注", val: 2, color: "#e8a020" },
                  { label: "问题提示", val: 3, color: "#3a7bd5" },
                ].map((r) => (
                  <div
                    key={r.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 11,
                      marginBottom: 3,
                    }}
                  >
                    <span style={{ color: "#888" }}>• {r.label}</span>
                    <span style={{ color: r.color, fontWeight: 600 }}>
                      {r.val}条
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          

          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}
            >
              涉恐黑名单
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(220px, 2.2fr) minmax(120px, 1fr) minmax(120px, 0.9fr) minmax(100px, 0.8fr) minmax(140px, 1fr)",
                borderTop: "1px solid #f0f0f0",
              }}
            >
              {[
                "公司名称",
                "涉及金额",
                "所属单位",
                "风险等级",
                "更新时间",
              ].map((header) => (
                <div
                  key={header}
                  style={{
                    fontSize: 12,
                    color: "#888",
                    padding: "10px 12px",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: 600,
                    textAlign: "center",
                    background: "#fafafa",
                  }}
                >
                  {header}
                </div>
              ))}
              {terrorBlacklistData.map((item) => (
                <div key={item.name} style={{ display: "contents" }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#444",
                      padding: "10px 12px",
                      borderBottom: "1px solid #f8f8f8",
                      textAlign: "center",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#e05c5c",
                      padding: "10px 12px",
                      borderBottom: "1px solid #f8f8f8",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {formatAmountDisplay(item.amount)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#444",
                      padding: "10px 12px",
                      borderBottom: "1px solid #f8f8f8",
                      textAlign: "center",
                    }}
                  >
                    {item.owner}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color:
                        item.level === "高"
                          ? "#e05c5c"
                          : item.level === "中"
                            ? "#e8a020"
                            : "#3a7bd5",
                      padding: "10px 12px",
                      borderBottom: "1px solid #f8f8f8",
                      fontWeight: 600,
                      textAlign: "center",
                    }}
                  >
                    {item.level}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#444",
                      padding: "10px 12px",
                      borderBottom: "1px solid #f8f8f8",
                      textAlign: "center",
                    }}
                  >
                    {item.updatedAt}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1.2fr",
              gap: 12,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}
              >
                风险等级分布
              </div>
              <div
                style={{ display: "flex", gap: 10, marginBottom: 6 }}
              >
                {pieData.map((d) => (
                  <span
                    key={d.name}
                    style={{
                      fontSize: 11,
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: d.color,
                        display: "inline-block",
                      }}
                    />
                    {d.name}
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    label={({ value, percent }) =>
                      `${value} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                    fontSize={10}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}
              >
                风险处理进度
              </div>
              <div
                style={{ display: "flex", gap: 10, marginBottom: 6 }}
              >
                {[
                  { name: "待处理", color: "#e05c5c" },
                  { name: "跟进中", color: "#7ab3e0" },
                ].map((d) => (
                  <span
                    key={d.name}
                    style={{
                      fontSize: 11,
                      color: "#555",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: d.color,
                        display: "inline-block",
                      }}
                    />
                    {d.name}
                  </span>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={44}
                    outerRadius={65}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={18}
                    fontWeight={700}
                    fill="#333"
                  >
                    60%
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              style={{
                background: "white",
                borderRadius: 12,
                padding: 20,
                boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
              }}
            >
              <div
                style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}
              >
                近期新增风险
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 2fr",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    padding: "4px 0",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  组织名称
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#888",
                    padding: "4px 0",
                    borderBottom: "1px solid #f0f0f0",
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  风险事项
                </div>
                {recentRisks.map((r, i) => (
                  <div
                    key={`asset-recent-risk-${i}`}
                    style={{ display: "contents" }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "#444",
                        padding: "6px 0",
                        borderBottom: "1px solid #f8f8f8",
                      }}
                    >
                      {r.org}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#444",
                        padding: "6px 0",
                        borderBottom: "1px solid #f8f8f8",
                      }}
                    >
                      {r.event}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bar chart — inside right column so left nav stretches full height */}
          <div
            style={{
              background: "white",
              borderRadius: 12,
              padding: 24,
              boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
            }}
          >
            <div
              style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}
            >
              逾期应收账款组织分布
            </div>
            <div
              style={{
                display: "flex",
                gap: 16,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {[
                { color: "#3a7bd5", label: "逾期应收占比-集团内", type: "bar" },
                { color: "#9dc3e6", label: "逾期应收占比-集团外", type: "bar" },
                { color: "#2563eb", label: "逾期笔数-集团内", type: "line" },
                { color: "#93c5fd", label: "逾期笔数-集团外", type: "line" },
              ].map((l) => (
                <span
                  key={l.label}
                  style={{
                    fontSize: 12,
                    color: "#555",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {l.type === "bar" ? (
                    <span
                      style={{
                        width: 12,
                        height: 10,
                        background: l.color,
                        display: "inline-block",
                        borderRadius: 2,
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 20,
                        height: 2,
                        background: l.color,
                        display: "inline-block",
                        borderRadius: 1,
                      }}
                    />
                  )}
                  {l.label}
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={barData} margin={{ left: 0, right: 40 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar
                  yAxisId="left"
                  dataKey="inner"
                  fill="#3a7bd5"
                  name="逾期应收占比-集团内"
                  barSize={14}
                />
                <Bar
                  yAxisId="left"
                  dataKey="outer"
                  fill="#9dc3e6"
                  name="逾期应收占比-集团外"
                  barSize={14}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lineIn"
                  stroke="#2563eb"
                  dot={false}
                  name="逾期笔数-集团内"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="lineOut"
                  stroke="#93c5fd"
                  dot={false}
                  name="逾期笔数-集团外"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function shouldFormatAmountText(value) {
  return /(元|万元|亿元)\s*$/.test(String(value ?? "").trim());
}
