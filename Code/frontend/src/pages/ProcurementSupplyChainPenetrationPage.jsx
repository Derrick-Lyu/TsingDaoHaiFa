import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

const COLORS = ["#0f766e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const COLORS_RING = ["#14b8a6", "#06b6d4", "#3b82f6", "#6366f1"];

const DEMO_DATA = {
  updatedAt: "2026-04-15 10:30",
  // 全量指标（6 列）
  overallMetrics: [
    { label: "建立项目", overallValue: "51,244", overallUnit: "亿元", serviceValue: "245", serviceUnit: "万个", serviceGrowth: "0.21%", serviceRing: "1.2%", overallGrowth: "1.21%", overallRing: "2.2%" },
    { label: "招标采购", overallValue: "42,986", overallUnit: "亿元", serviceValue: "233", serviceUnit: "万个", serviceGrowth: "5.41%", serviceRing: "7.2%", overallGrowth: "3.31%", overallRing: "2.23%" },
    { label: "合同签订", overallValue: "41,004", overallUnit: "亿元", serviceValue: "206", serviceUnit: "万个", serviceGrowth: "2.15%", serviceRing: "4.31%", overallGrowth: "2.14%", overallRing: "3.11%" },
    { label: "物资到货", overallValue: "8,244", overallUnit: "亿元", serviceValue: "45", serviceUnit: "万个", serviceGrowth: "7.21%", serviceRing: "7.2%", overallGrowth: "2.36%", overallRing: "3.11%" },
    { label: "消耗入账", overallValue: "30,064", overallUnit: "亿元", serviceValue: "139", serviceUnit: "万个", serviceGrowth: "2.14%", serviceRing: "1.4%", overallGrowth: "4.21%", overallRing: "3.23%" },
    { label: "应付情况", overallValue: "244", overallUnit: "亿元", serviceValue: "45", serviceUnit: "万个", serviceGrowth: "2.10%", serviceRing: "5.01%", overallGrowth: "7.21%", overallRing: "7.21%" },
  ],
  // 紧急物资采购场景
  emergencyProcurement: [
    { label: "紧急采购异常率", value: 11, unit: "%" },
    { label: "紧急采购一致率", value: 98, unit: "%" },
    { label: "紧急采购程序规范率", value: 96, unit: "%" },
    { label: "紧急采购申报合理率", value: 97, unit: "%" },
  ],
  // 物资出入库管理
  inventoryManagement: [
    { label: "虚假入库", count: "1,873 项", amount: "5,849 万元", rate: 4.24, rateLabel: "虚假入库率" },
    { label: "虚假出库", count: "413 条", amount: "1,420 万元", rate: 89.21, rateLabel: "虚假出库率" },
    { label: "退库不规范", count: "43 条", amount: "4,153 万元", rate: 98.45, rateLabel: "退库规范率" },
    { label: "成本购置资产", count: "544 条", amount: "4,158 万元", rate: 96.34, rateLabel: "异常拦截率" },
  ],
  // 客商履约风险预警分布（堆叠柱状图）
  contractRiskDistribution: {
    categories: ["禁止发生类", "重点监控类", "提醒警告类"],
    data: [
      { name: "经营异常", values: [24, 65, 45] },
      { name: "围标串标", values: [2, 71, 70] },
      { name: "行政处罚", values: [18, 131, 93] },
      { name: "失信人", values: [3, 188, 105] },
      { name: "严重违法", values: [4, 187, 132] },
      { name: "挂靠国企", values: [14, 167, 139] },
      { name: "抽检不合格", values: [24, 65, 45] },
      { name: "发生过租赁串通投标", values: [2, 71, 70] },
      { name: "投标材料造假", values: [18, 131, 93] },
      { name: "已破产倒闭", values: [34, 188, 105] },
      { name: "履约或服务不到位", values: [44, 187, 132] },
      { name: "疑似虚开增值税专用发...", values: [41, 189, 117] },
      { name: "疑似空转走单", values: [22, 131, 93] },
      { name: "往来款项管理混乱", values: [12, 188, 70] },
      { name: "拖欠农民工工资遭失信供应商", values: [21, 187, 45] },
    ],
  },
  // 物资出库方式占比
  outboundMethodDistribution: [
    { name: "直发现场", value: 19 },
    { name: "入库领用", value: 81 },
  ],
};

export function ProcurementSupplyChainPenetrationPage({ onUpdateTimeChange }) {
  const [data, setData] = useState(DEMO_DATA);
  const [status, setStatus] = useState("ready");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setStatus("loading");
      try {
        // TODO: 调用后端 API 获取数据
        // const apiData = await requestJson("/procurement-supply-chain/summary");
        if (!cancelled) {
          setData(DEMO_DATA);
          setStatus("ready");
          // Notify parent component of update time
          if (onUpdateTimeChange && DEMO_DATA.updatedAt) {
            onUpdateTimeChange(DEMO_DATA.updatedAt);
          }
        }
      } catch {
        if (!cancelled) {
          setData(DEMO_DATA);
          setStatus("ready");
          if (onUpdateTimeChange && DEMO_DATA.updatedAt) {
            onUpdateTimeChange(DEMO_DATA.updatedAt);
          }
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [onUpdateTimeChange]);

  return (
    <div style={pageShellStyle}>
      {/* 全量/服务/物资指标卡 */}
      <section style={sectionStyle}>
        <div style={overallGridStyle}>
          {data.overallMetrics.map((metric, index) => (
            <div key={index} style={overallCardStyle}>
              <div style={overallLabelStyle}>{metric.label}</div>
              <div style={overallValueStyle}>{metric.overallValue} <span style={overallUnitStyle}>{metric.overallUnit}</span></div>
              <div style={overallGrowthStyle}>
                <span style={growthTagStyle}>同比 {metric.overallGrowth}</span>
                <span style={growthTagStyle}>环比 {metric.overallRing}</span>
              </div>
              <div style={serviceRowStyle}>
                <div style={serviceLabelStyle}>物资</div>
                <div style={serviceValueStyle}>{metric.serviceValue} <span style={serviceUnitStyle}>{metric.serviceUnit}</span></div>
                <div style={serviceGrowthStyle}>
                  <span style={serviceGrowthTagStyle}>同比 {metric.serviceGrowth}</span>
                  <span style={serviceGrowthTagStyle}>环比 {metric.serviceRing}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 紧急物资采购场景 + 物资出入库管理 */}
      <section style={insightGridStyle}>
        {/* 紧急物资采购场景 */}
        <section style={compactPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>紧急物资采购场景</div>
          </div>
          <div style={emergencyListStyle}>
            {data.emergencyProcurement.map((item, index) => (
              <div key={index} style={emergencyItemStyle}>
                <div style={emergencyLabelStyle}>{item.label}</div>
                <div style={emergencyValueStyle}>{item.value}<span style={emergencyUnitStyle}>{item.unit}</span></div>
              </div>
            ))}
          </div>
        </section>

        {/* 物资出入库管理 */}
        <section style={compactPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>物资出入库管理</div>
          </div>
          <div style={inventoryGridStyle}>
            {data.inventoryManagement.map((item, index) => (
              <div key={index} style={inventoryCardStyle}>
                <div style={inventoryLabelStyle}>{item.label}</div>
                <div style={inventoryCountStyle}>{item.count}</div>
                <div style={inventoryAmountStyle}>{item.amount}</div>
                <div style={ringChartWrapStyle}>
                  <div style={ringChartStyle}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "达标", value: item.rate },
                            { name: "未达标", value: 100 - item.rate },
                          ]}
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={0}
                          startAngle={90}
                          endAngle={90 - (item.rate / 100) * 360}
                          dataKey="value"
                        >
                          <Cell fill="#14b8a6" />
                          <Cell fill="#e5e7eb" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={ringValueStyle}>{item.rate}%</div>
                </div>
                <div style={inventoryRateLabelStyle}>{item.rateLabel}</div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {/* 客商履约风险预警分布 + 物资出库方式占比 */}
      <section style={insightGridStyle}>
        {/* 客商履约风险预警分布 */}
        <section style={insightPanelStyle}>
          <div style={panelHeaderWithLegendStyle}>
            <div style={panelTitleStyle}>客商履约风险预警分布</div>
            <div style={legendInlineStyle}>
              {data.contractRiskDistribution.categories.map((cat, index) => (
                <div key={cat} style={legendItemStyle}>
                  <div
                    style={{
                      ...legendIconStyle,
                      backgroundColor: index === 0 ? "#ef4444" : index === 1 ? "#14b8a6" : "#3b82f6",
                    }}
                  />
                  <span style={legendTextStyle}>{cat}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={chartContainerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.contractRiskDistribution.data}
                margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e7edf7" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#64748b", fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip />
                {data.contractRiskDistribution.categories.map((cat, index) => (
                  <Bar
                    key={cat}
                    dataKey={(entry) => entry.values[index]}
                    name={cat}
                    fill={index === 0 ? "#ef4444" : index === 1 ? "#14b8a6" : "#3b82f6"}
                    stackId="stack"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 物资出库方式占比 */}
        <section style={compactPanelStyle}>
          <div style={panelHeaderStyle}>
            <div style={panelTitleStyle}>物资出库方式占比</div>
          </div>
          <div style={pieChartContainerStyle}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.outboundMethodDistribution}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                >
                  {data.outboundMethodDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>
    </div>
  );
}

const pageShellStyle = {
  padding: "0 24px 28px",
  display: "grid",
  gap: 18,
};

const sectionStyle = {
  padding: 20,
  borderRadius: 20,
  border: "1px solid #e8eef7",
  background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, #fef9f3 100%)",
};

const overallGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: 14,
};

const overallCardStyle = {
  display: "grid",
  gap: 8,
  padding: 14,
  borderRadius: 14,
  background: "rgba(255,255,255,0.9)",
  border: "1px solid #e8eef7",
};

const overallLabelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#6b7280",
};

const overallValueStyle = {
  fontSize: 24,
  fontWeight: 800,
  color: "#102c57",
};

const overallUnitStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  marginLeft: 4,
};

const overallGrowthStyle = {
  display: "flex",
  gap: 8,
  fontSize: 11,
};

const growthTagStyle = {
  padding: "3px 6px",
  borderRadius: 6,
  background: "#eef4ff",
  color: "#1a3a8f",
  fontWeight: 700,
};

const serviceRowStyle = {
  display: "grid",
  gap: 6,
  padding: "8px 0 0",
  borderTop: "1px dashed #e5e7eb",
};

const serviceLabelStyle = {
  fontSize: 11,
  fontWeight: 800,
  color: "#fff",
  background: "#14b8a6",
  padding: "2px 6px",
  borderRadius: 6,
  display: "inline-block",
  width: "fit-content",
};

const serviceValueStyle = {
  fontSize: 18,
  fontWeight: 800,
  color: "#0f766e",
};

const serviceUnitStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: "#6b7280",
  marginLeft: 4,
};

const serviceGrowthStyle = {
  display: "flex",
  gap: 6,
  fontSize: 10,
};

const serviceGrowthTagStyle = {
  padding: "2px 4px",
  borderRadius: 4,
  background: "#f0fdf4",
  color: "#166534",
  fontWeight: 700,
};

const insightGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: 16,
  alignItems: "stretch",
};

const panelStyle = {
  padding: 22,
  borderRadius: 22,
  border: "1px solid #dde4ee",
  background: "white",
  boxShadow: "0 16px 28px rgba(15,23,42,0.05)",
};

const compactPanelStyle = {
  ...panelStyle,
  minHeight: "auto",
};

const insightPanelStyle = {
  ...panelStyle,
  minHeight: 360,
  display: "flex",
  flexDirection: "column",
};

const panelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
};

const panelHeaderWithLegendStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 16,
  flexWrap: "wrap",
};

const legendInlineStyle = {
  display: "flex",
  gap: 12,
  alignItems: "center",
};

const legendItemStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const legendIconStyle = {
  width: 10,
  height: 10,
  borderRadius: 2,
};

const legendTextStyle = {
  fontSize: 11,
  fontWeight: 500,
  color: "#64748b",
};

const panelTitleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#102033",
};

const emergencyListStyle = {
  display: "grid",
  gap: 12,
};

const emergencyItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 14px",
  borderRadius: 12,
  background: "rgba(248, 250, 253, 0.8)",
  border: "1px solid #e7edf6",
};

const emergencyLabelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#334155",
};

const emergencyValueStyle = {
  fontSize: 20,
  fontWeight: 800,
  color: "#102c57",
};

const emergencyUnitStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#6b7280",
  marginLeft: 4,
};

const inventoryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
};

const inventoryCardStyle = {
  display: "grid",
  gap: 6,
  padding: 12,
  borderRadius: 14,
  background: "rgba(240, 253, 244, 0.6)",
  border: "1px solid #d1fae5",
  alignItems: "center",
};

const inventoryLabelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#475569",
};

const inventoryCountStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#1e293b",
};

const inventoryAmountStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: "#64748b",
};

const ringChartWrapStyle = {
  position: "relative",
  height: 100,
  display: "grid",
  placeItems: "center",
};

const ringChartStyle = {
  width: 100,
  height: 100,
};

const ringValueStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: 16,
  fontWeight: 800,
  color: "#0f766e",
};

const inventoryRateLabelStyle = {
  fontSize: 11,
  fontWeight: 700,
  color: "#6b7280",
  textAlign: "center",
};

const chartContainerStyle = {
  flex: 1,
  minHeight: 320,
};

const pieChartContainerStyle = {
  height: 220,
  padding: 10,
};
