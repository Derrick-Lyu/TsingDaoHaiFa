BEGIN;

-- Demo snapshot for 2026-03-31.
-- Business-aligned sample data for Qingdao HaiFa:
-- internal entities are shaped like HaiFa产城 / 园区 / 资本 / 产业服务,
-- counterparties are shaped like West Coast district / park construction /
-- industrial support / fund service / high-end manufacturing supply chain /
-- film-cultural supporting services.

INSERT INTO fund_safety_topic_summaries (
  id,
  topic_code,
  topic_name,
  secondary_topic_name,
  summary_title,
  core_metrics,
  risk_conclusion,
  risk_level,
  is_clickable,
  target_page_key,
  data_snapshot_date,
  display_order,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'fs-summary-terror-risk'),
  'fund_safety_terror_risk',
  '资金安全',
  '资金违规支付-涉恐交易风险',
  '涉恐交易风险监测',
  jsonb_build_array(
    jsonb_build_object('label', '预警总数', 'value', 18, 'unit', '笔'),
    jsonb_build_object('label', '高风险命中', 'value', 7, 'unit', '笔'),
    jsonb_build_object('label', '命中黑名单', 'value', 4, 'unit', '笔')
  ),
  '海发产城与海发园区相关对公支付中出现黑名单命中与连续高频支付，建议优先核查园区配套、工程分包和影视文化服务对手方。',
  'high',
  TRUE,
  'terror_risk_topic',
  DATE '2026-03-31',
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'fs-summary-investment-risk'),
  'fund_safety_investment_risk',
  '资金安全',
  '对外投资交易管理风险',
  '投资交易合规监测',
  jsonb_build_array(
    jsonb_build_object('label', '投资项目数', 'value', 12, 'unit', '个'),
    jsonb_build_object('label', '穿透核查异常', 'value', 2, 'unit', '个'),
    jsonb_build_object('label', '重点跟踪项目', 'value', 3, 'unit', '个')
  ),
  '海发资本相关投资链条整体可控，但个别项目的尽调与出资后资料回传不完整，建议补齐穿透资料。',
  'medium',
  FALSE,
  NULL,
  DATE '2026-03-31',
  2,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'fs-summary-bank-deposit-risk'),
  'fund_safety_bank_deposit_risk',
  '资金安全',
  '资金存放安全风险',
  '账户与资金存放监测',
  jsonb_build_array(
    jsonb_build_object('label', '监管账户数', 'value', 18, 'unit', '个'),
    jsonb_build_object('label', '超合作范围开户', 'value', 1, 'unit', '个'),
    jsonb_build_object('label', '资金归集异常', 'value', 0, 'unit', '个')
  ),
  '资金归集总体稳定，但仍存在1个示例账户落在合作银行范围边界，适合在领导汇报中强调可视、可查、可纠偏。',
  'medium',
  FALSE,
  NULL,
  DATE '2026-03-31',
  3,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'fs-summary-ar-growth-risk'),
  'fund_safety_ar_growth_risk',
  '资金安全',
  '两金压降风险-应收账款增幅',
  '应收账款压降监测',
  jsonb_build_array(
    jsonb_build_object('label', '应收账款余额', 'value', 3280, 'unit', '万元'),
    jsonb_build_object('label', '同比增幅', 'value', 1.8, 'unit', '%'),
    jsonb_build_object('label', '重点项目', 'value', 2, 'unit', '个')
  ),
  '园区开发和工程配套相关项目的回款节奏较稳，增幅未明显偏离收入增幅，但存在局部项目回款延后。',
  'low',
  FALSE,
  NULL,
  DATE '2026-03-31',
  4,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'fs-summary-cross-client-risk'),
  'fund_safety_cross_client_transfer_risk',
  '资金安全',
  '集团客户账户间划拨风险-政企客户转账资金跨客户使用',
  '跨客户资金认领监测',
  jsonb_build_array(
    jsonb_build_object('label', '跨客户样例', 'value', 6, 'unit', '起'),
    jsonb_build_object('label', '异常认领', 'value', 1, 'unit', '起'),
    jsonb_build_object('label', '人工复核', 'value', 4, 'unit', '起')
  ),
  '政企资金跨客户认领在样例数据中出现1起异常，适合用来说明系统能够识别并留痕复杂资金流转。',
  'medium',
  FALSE,
  NULL,
  DATE '2026-03-31',
  5,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_blacklist (
  id,
  blacklist_code,
  blacklist_name,
  subject_name,
  subject_type,
  match_keywords,
  risk_level,
  status,
  source_system,
  effective_from,
  effective_to,
  notes,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'terror-blacklist-1'),
  'BL-001',
  '青岛西海岸某工程建设有限公司',
  '青岛西海岸某工程建设有限公司',
  'organization',
  ARRAY['青岛西海岸某工程建设有限公司', '工程建设有限公司结算户'],
  'high',
  'enabled',
  '示例涉恐/合规黑名单',
  DATE '2025-01-01',
  NULL,
  '与海发园区工程配套类支付链路同名命中示例。',
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-blacklist-2'),
  'BL-002',
  '青岛某园区配套服务有限公司',
  '青岛某园区配套服务有限公司',
  'organization',
  ARRAY['青岛某园区配套服务有限公司', '园区配套服务有限公司'],
  'high',
  'enabled',
  '示例涉恐/合规黑名单',
  DATE '2025-01-01',
  NULL,
  '用于演示高频支付链路中的黑名单命中。',
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-blacklist-3'),
  'BL-003',
  '青岛某影视文化配套服务有限公司',
  '青岛某影视文化配套服务有限公司',
  'organization',
  ARRAY['青岛某影视文化配套服务有限公司', '影视文化配套服务有限公司'],
  'medium',
  'enabled',
  '示例涉恐/合规黑名单',
  DATE '2025-01-01',
  NULL,
  '用于演示园区文化配套类交易命中。',
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-blacklist-4'),
  'BL-004',
  '青岛某供应链结算服务有限公司',
  '青岛某供应链结算服务有限公司',
  'organization',
  ARRAY['青岛某供应链结算服务有限公司', '供应链结算服务有限公司'],
  'medium',
  'enabled',
  '示例涉恐/合规黑名单',
  DATE '2025-01-01',
  NULL,
  '用于演示资本管理与供应链支付链路命中。',
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-blacklist-5'),
  'BL-005',
  '青岛某基金服务有限公司',
  '青岛某基金服务有限公司',
  'organization',
  ARRAY['青岛某基金服务有限公司', '基金服务有限公司'],
  'medium',
  'enabled',
  '示例涉恐/合规黑名单',
  DATE '2025-01-01',
  NULL,
  '用于演示资本运作场景中的名单匹配。',
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_rules (
  id,
  rule_code,
  rule_name,
  rule_category,
  rule_description,
  risk_level,
  enabled,
  sort_order,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-blacklist'),
  'blacklist_hit',
  '黑名单命中规则',
  'terror_risk',
  '任意一方账户名称存在于黑名单中则命中。',
  'high',
  TRUE,
  1,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'high_frequency_high_amount',
  '高频大额交易规则',
  'terror_risk',
  '连续10日内同一收款人单日交易次数超过阈值且金额超过阈值则命中。',
  'high',
  TRUE,
  2,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant'),
  'dormant_account_abnormal_payment',
  '长期闲置账户异常交易规则',
  'terror_risk',
  '超过1年未交易账户在连续10日内对同一收款人发生异常支付且金额超过阈值则命中。',
  'high',
  TRUE,
  3,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-threshold-review'),
  'post_review_threshold_notice',
  '模型阈值回顾预警规则',
  'risk_ticket_workflow',
  '针对模型阈值异常事项形成事后预警回顾和跟踪说明。',
  'high',
  TRUE,
  4,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-leader-warning'),
  'leader_attention_notice',
  '领导批示预警规则',
  'risk_ticket_workflow',
  '根据领导批示事项发起风险预警单并跟踪处置进展。',
  'warn',
  TRUE,
  5,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-audit-rectification'),
  'audit_rectification_notice',
  '审计整改预警规则',
  'risk_ticket_workflow',
  '针对审计整改问题开展后续预警跟踪与反馈。',
  'warn',
  TRUE,
  6,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-trend-tip'),
  'trend_change_notice',
  '风险趋势提示规则',
  'risk_ticket_workflow',
  '针对二道防线风险管理要求或内外部风险趋势变化发起提示单。',
  'warn',
  TRUE,
  7,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-typical-event'),
  'typical_event_notice',
  '典型事件提示规则',
  'risk_ticket_workflow',
  '对典型风险事件开展系统内普遍提醒和复盘提示。',
  'warn',
  TRUE,
  8,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-three-warnings'),
  'three_consecutive_warnings',
  '连续三次预警督办规则',
  'risk_ticket_workflow',
  '特定监控模型连续三次预警后自动转入督办跟踪。',
  'high',
  TRUE,
  9,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-rectification-overdue'),
  'rectification_overdue_notice',
  '整改逾期督办规则',
  'risk_ticket_workflow',
  '针对内外部审计整改逾期事项发起督办单并跟踪落实情况。',
  'high',
  TRUE,
  10,
  'demo',
  'demo',
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_rule_params (
  id,
  rule_id,
  param_key,
  param_label,
  param_value,
  value_type,
  unit,
  editable,
  sort_order,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-blacklist-enabled'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-blacklist'),
  'enabled',
  '规则启用',
  'true',
  'boolean',
  NULL,
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-frequency-window'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'window_days',
  '连续天数窗口',
  '10',
  'number',
  '天',
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-frequency-count'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'min_daily_count',
  '单日交易次数阈值',
  '50',
  'number',
  '次',
  TRUE,
  2,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-frequency-corp-amount'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'corp_amount_threshold',
  '对公金额阈值',
  '2000000',
  'number',
  '元',
  TRUE,
  3,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-threshold-review-enabled'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-threshold-review'),
  'enabled',
  '规则启用',
  'true',
  'boolean',
  NULL,
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-leader-warning-enabled'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-leader-warning'),
  'enabled',
  '规则启用',
  'true',
  'boolean',
  NULL,
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-audit-rectification-enabled'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-audit-rectification'),
  'enabled',
  '规则启用',
  'true',
  'boolean',
  NULL,
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-trend-tip-enabled'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-trend-tip'),
  'enabled',
  '规则启用',
  'true',
  'boolean',
  NULL,
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-typical-event-enabled'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-typical-event'),
  'enabled',
  '规则启用',
  'true',
  'boolean',
  NULL,
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-three-warnings-threshold'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-three-warnings'),
  'warning_threshold',
  '连续预警次数阈值',
  '3',
  'number',
  '次',
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-rectification-overdue-enabled'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-rectification-overdue'),
  'enabled',
  '规则启用',
  'true',
  'boolean',
  NULL,
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-frequency-personal-amount'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'personal_amount_threshold',
  '对私金额阈值',
  '500000',
  'number',
  '元',
  TRUE,
  4,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-dormant-days'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant'),
  'dormant_days',
  '长期闲置账户判定天数',
  '365',
  'number',
  '天',
  TRUE,
  1,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-dormant-window'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant'),
  'window_days',
  '连续天数窗口',
  '10',
  'number',
  '天',
  TRUE,
  2,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-dormant-corp-amount'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant'),
  'corp_amount_threshold',
  '对公金额阈值',
  '2000000',
  'number',
  '元',
  TRUE,
  3,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'terror-param-dormant-personal-amount'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant'),
  'personal_amount_threshold',
  '对私金额阈值',
  '500000',
  'number',
  '元',
  TRUE,
  4,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
)
ON CONFLICT (rule_id, param_key) DO UPDATE SET
  param_label = EXCLUDED.param_label,
  param_value = EXCLUDED.param_value,
  value_type = EXCLUDED.value_type,
  unit = EXCLUDED.unit,
  editable = EXCLUDED.editable,
  sort_order = EXCLUDED.sort_order,
  updated_at = EXCLUDED.updated_at;

INSERT INTO payment_transactions (
  id,
  transaction_no,
  transaction_date,
  batch_no,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  currency,
  payee_type,
  business_scenario,
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  source_file_name,
  source_row_no,
  extra_payload,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'tx-benign-1'),
  'TX-20260328-001',
  DATE '2026-03-28',
  'FS-2026-03-31',
  'HF-CITY-001',
  '青岛海发城市更新有限公司',
  '青岛海发城市更新有限公司',
  '622202600001',
  '青岛某项目管理咨询有限公司',
  '942700000101',
  380000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-20',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  1,
  jsonb_build_object(
    'payer_account_name', '海发城市更新有限公司资金结算户',
    'account_status', '正常',
    'remarks', '正常项目咨询付款样例。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-benign-2'),
  'TX-20260329-001',
  DATE '2026-03-29',
  'FS-2026-03-31',
  'HF-CAP-001',
  '青岛海发资本管理有限公司',
  '青岛海发资本管理有限公司',
  '622202600002',
  '山东某高端装备供应链有限公司',
  '942700000102',
  760000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-18',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  2,
  jsonb_build_object(
    'payer_account_name', '海发资本管理有限公司资金结算户',
    'account_status', '正常',
    'remarks', '正常设备采购样例。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-benign-3'),
  'TX-20260330-001',
  DATE '2026-03-30',
  'FS-2026-03-31',
  'HF-SVC-001',
  '青岛海发产业服务有限公司',
  '青岛海发产业服务有限公司',
  '622202600003',
  '青岛某数据服务有限公司',
  '942700000103',
  120000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-25',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  3,
  jsonb_build_object(
    'payer_account_name', '海发产业服务有限公司资金结算户',
    'account_status', '正常',
    'remarks', '正常产业服务支出样例。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-1'),
  'TX-20260304-001',
  DATE '2026-03-04',
  'FS-2026-03-31',
  'HF-PARK-001',
  '青岛海发园区运营有限公司',
  '青岛海发园区运营有限公司',
  '622202600010',
  '青岛西海岸某工程建设有限公司',
  '942700000201',
  860000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-02',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4,
  jsonb_build_object(
    'payer_account_name', '海发园区运营有限公司资金结算户',
    'account_status', '正常',
    'remarks', '黑名单命中样例，匹配园区工程类对手方。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-2'),
  'TX-20260312-001',
  DATE '2026-03-12',
  'FS-2026-03-31',
  'HF-CAP-002',
  '青岛海发资本管理有限公司',
  '青岛海发资本管理有限公司',
  '622202600011',
  '青岛某基金服务有限公司',
  '942700000202',
  1240000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-10',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  5,
  jsonb_build_object(
    'payer_account_name', '海发资本管理有限公司资金结算户',
    'account_status', '正常',
    'remarks', '黑名单命中样例，匹配资本运作服务对手方。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-3'),
  'TX-20260318-001',
  DATE '2026-03-18',
  'FS-2026-03-31',
  'HF-SVC-002',
  '青岛海发产业服务有限公司',
  '青岛海发产业服务有限公司',
  '622202600012',
  '青岛某供应链结算服务有限公司',
  '942700000203',
  730000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-16',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  6,
  jsonb_build_object(
    'payer_account_name', '海发产业服务有限公司资金结算户',
    'account_status', '正常',
    'remarks', '黑名单命中样例，匹配供应链结算服务对手方。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-4'),
  'TX-20260325-001',
  DATE '2026-03-25',
  'FS-2026-03-31',
  'HF-CTI-001',
  '青岛海发产城投资有限公司',
  '青岛海发产城投资有限公司',
  '622202600013',
  '青岛某影视文化配套服务有限公司',
  '942700000204',
  540000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-21',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  7,
  jsonb_build_object(
    'payer_account_name', '海发产城投资有限公司资金结算户',
    'account_status', '正常',
    'remarks', '黑名单命中样例，匹配影视文化配套类对手方。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_transactions (
  id,
  transaction_no,
  transaction_date,
  batch_no,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  currency,
  payee_type,
  business_scenario,
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  source_file_name,
  source_row_no,
  extra_payload,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v5(
    uuid_ns_url(),
    format('hf-frequency-%s-%s', to_char(day_dt, 'YYYYMMDD'), lpad(seq_no::text, 2, '0'))
  ),
  format('HF-%s-%s', to_char(day_dt, 'YYYYMMDD'), lpad(seq_no::text, 2, '0')),
  day_dt,
  'FS-2026-03-31',
  'HF-CTI-002',
  '青岛海发产城投资有限公司',
  '青岛海发产城投资有限公司',
  '622202600020',
  '青岛某园区配套服务有限公司',
  '942700000301',
  50000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-02-20',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  1000 + ((extract(day from day_dt)::int - 1) * 100) + seq_no,
  jsonb_build_object(
    'payer_account_name', '海发产城投资有限公司资金结算户',
    'account_status', '正常',
    'remarks', '连续10日同一收款人高频高额支付样例。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
FROM generate_series(DATE '2026-03-01', DATE '2026-03-10', INTERVAL '1 day') AS g(day_dt)
CROSS JOIN generate_series(1, 51) AS s(seq_no)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_transactions (
  id,
  transaction_no,
  transaction_date,
  batch_no,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  currency,
  payee_type,
  business_scenario,
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  source_file_name,
  source_row_no,
  extra_payload,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v5(
    uuid_ns_url(),
    format('hf-dormant-%s-%s', to_char(day_dt, 'YYYYMMDD'), lpad(seq_no::text, 2, '0'))
  ),
  format('DA-%s-%s', to_char(day_dt, 'YYYYMMDD'), lpad(seq_no::text, 2, '0')),
  day_dt,
  'FS-2026-03-31',
  'HF-PARK-002',
  '青岛海发园区运营有限公司',
  '青岛海发园区运营有限公司',
  '622202600030',
  '青岛某影视文化配套服务有限公司',
  '942700000401',
  120000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2024-02-20',
  TRUE,
  'fund_safety_demo_batch_20260331.xlsx',
  3000 + ((extract(day from day_dt)::int - 1) * 10) + seq_no,
  jsonb_build_object(
    'payer_account_name', '海发园区运营有限公司沉睡账户',
    'account_status', '闲置账户',
    'remarks', '长期闲置账户异常支付样例。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
FROM generate_series(DATE '2026-03-01', DATE '2026-03-10', INTERVAL '1 day') AS g(day_dt)
CROSS JOIN generate_series(1, 2) AS s(seq_no)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_transactions (
  id,
  transaction_no,
  transaction_date,
  batch_no,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  currency,
  payee_type,
  business_scenario,
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  source_file_name,
  source_row_no,
  extra_payload,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-extra-1'),
  'TX-20260307-901',
  DATE '2026-03-07',
  'FS-2026-03-31',
  'HF-FIN-001',
  '青岛海发财务管理有限公司',
  '青岛海发财务管理有限公司',
  '622202600101',
  '青岛西海岸某工程建设有限公司',
  '942700001001',
  980000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-02-28',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4001,
  jsonb_build_object(
    'payer_account_name', '海发财务管理有限公司专项支付户',
    'account_status', '正常',
    'remarks', '新增黑名单命中样例，命中工程建设类名单。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-extra-2'),
  'TX-20260314-902',
  DATE '2026-03-14',
  'FS-2026-03-31',
  'HF-INV-001',
  '青岛海发投资运营有限公司',
  '青岛海发投资运营有限公司',
  '622202600102',
  '青岛某园区配套服务有限公司',
  '942700001002',
  1260000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2026-03-05',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4002,
  jsonb_build_object(
    'payer_account_name', '海发投资运营有限公司经营结算户',
    'account_status', '正常',
    'remarks', '新增黑名单命中样例，命中园区配套类名单。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-extra-3'),
  'TX-20260321-903',
  DATE '2026-03-21',
  'FS-2026-03-31',
  'HF-SUP-001',
  '青岛海发供应链管理有限公司',
  '青岛海发供应链管理有限公司',
  '622202600103',
  '青岛某供应链结算服务有限公司',
  '942700001003',
  880000,
  'CNY',
  'organization',
  '供应链结算',
  1,
  DATE '2026-03-08',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4003,
  jsonb_build_object(
    'payer_account_name', '海发供应链管理有限公司结算户',
    'account_status', '正常',
    'remarks', '新增黑名单命中样例，命中供应链结算类名单。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-blacklist-extra-4'),
  'TX-20260327-904',
  DATE '2026-03-27',
  'FS-2026-03-31',
  'HF-CAP-003',
  '青岛海发资本运营有限公司',
  '青岛海发资本运营有限公司',
  '622202600104',
  '青岛某基金服务有限公司',
  '942700001004',
  1540000,
  'CNY',
  'organization',
  '资本运作付款',
  1,
  DATE '2026-03-11',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4004,
  jsonb_build_object(
    'payer_account_name', '海发资本运营有限公司结算户',
    'account_status', '正常',
    'remarks', '新增黑名单命中样例，命中基金服务类名单。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-frequency-extra-1'),
  'HF-20260313-901',
  DATE '2026-03-13',
  'FS-2026-03-31',
  'HF-OPS-001',
  '青岛海发运营服务有限公司',
  '青岛海发运营服务有限公司',
  '622202600105',
  '青岛某园区综合配套服务有限公司',
  '942700001101',
  42000,
  'CNY',
  'organization',
  '财务公司网银支付',
  55,
  DATE '2026-02-15',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4101,
  jsonb_build_object(
    'payer_account_name', '海发运营服务有限公司经营户',
    'account_status', '正常',
    'remarks', '新增高频大额交易样例，单日交易次数和累计金额均超阈值。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-frequency-extra-2'),
  'HF-20260315-902',
  DATE '2026-03-15',
  'FS-2026-03-31',
  'HF-ENG-001',
  '青岛海发工程服务有限公司',
  '青岛海发工程服务有限公司',
  '622202600106',
  '青岛某工程劳务协作有限公司',
  '942700001102',
  39000,
  'CNY',
  'organization',
  '财务公司网银支付',
  58,
  DATE '2026-02-18',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4102,
  jsonb_build_object(
    'payer_account_name', '海发工程服务有限公司经营户',
    'account_status', '正常',
    'remarks', '新增高频大额交易样例，模拟工程服务高频支付。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-frequency-extra-3'),
  'HF-20260322-903',
  DATE '2026-03-22',
  'FS-2026-03-31',
  'HF-PROP-001',
  '青岛海发物业管理有限公司',
  '青岛海发物业管理有限公司',
  '622202600107',
  '青岛某商业配套运营有限公司',
  '942700001103',
  40500,
  'CNY',
  'organization',
  '财务公司网银支付',
  57,
  DATE '2026-02-22',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4103,
  jsonb_build_object(
    'payer_account_name', '海发物业管理有限公司经营户',
    'account_status', '正常',
    'remarks', '新增高频大额交易样例，模拟商业配套高频支付。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-frequency-extra-4'),
  'HF-20260326-904',
  DATE '2026-03-26',
  'FS-2026-03-31',
  'HF-URB-001',
  '青岛海发城市运营有限公司',
  '青岛海发城市运营有限公司',
  '622202600108',
  '青岛某城市服务外包有限公司',
  '942700001104',
  43000,
  'CNY',
  'organization',
  '财务公司网银支付',
  54,
  DATE '2026-02-26',
  FALSE,
  'fund_safety_demo_batch_20260331.xlsx',
  4104,
  jsonb_build_object(
    'payer_account_name', '海发城市运营有限公司经营户',
    'account_status', '正常',
    'remarks', '新增高频大额交易样例，模拟城市运营外包高频支付。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-dormant-extra-1'),
  'DA-20260305-901',
  DATE '2026-03-05',
  'FS-2026-03-31',
  'HF-HLD-001',
  '青岛海发控股服务有限公司',
  '青岛海发控股服务有限公司',
  '622202600109',
  '青岛某文化会展服务有限公司',
  '942700001201',
  2180000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2024-01-15',
  TRUE,
  'fund_safety_demo_batch_20260331.xlsx',
  4201,
  jsonb_build_object(
    'payer_account_name', '海发控股服务有限公司闲置账户',
    'account_status', '闲置账户',
    'remarks', '新增长期闲置账户异常交易样例。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-dormant-extra-2'),
  'DA-20260309-902',
  DATE '2026-03-09',
  'FS-2026-03-31',
  'HF-RES-001',
  '青岛海发资源管理有限公司',
  '青岛海发资源管理有限公司',
  '622202600110',
  '青岛某仓储物流服务有限公司',
  '942700001202',
  2360000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2024-02-01',
  TRUE,
  'fund_safety_demo_batch_20260331.xlsx',
  4202,
  jsonb_build_object(
    'payer_account_name', '海发资源管理有限公司闲置账户',
    'account_status', '闲置账户',
    'remarks', '新增长期闲置账户异常交易样例，模拟仓储物流支付。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-dormant-extra-3'),
  'DA-20260317-903',
  DATE '2026-03-17',
  'FS-2026-03-31',
  'HF-LAND-001',
  '青岛海发土地开发有限公司',
  '青岛海发土地开发有限公司',
  '622202600111',
  '青岛某资产处置服务有限公司',
  '942700001203',
  2420000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2024-01-28',
  TRUE,
  'fund_safety_demo_batch_20260331.xlsx',
  4203,
  jsonb_build_object(
    'payer_account_name', '海发土地开发有限公司闲置账户',
    'account_status', '闲置账户',
    'remarks', '新增长期闲置账户异常交易样例，模拟资产处置支付。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'tx-dormant-extra-4'),
  'DA-20260324-904',
  DATE '2026-03-24',
  'FS-2026-03-31',
  'HF-IND-001',
  '青岛海发产业发展有限公司',
  '青岛海发产业发展有限公司',
  '622202600112',
  '青岛某设备维保服务有限公司',
  '942700001204',
  2260000,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  DATE '2024-02-10',
  TRUE,
  'fund_safety_demo_batch_20260331.xlsx',
  4204,
  jsonb_build_object(
    'payer_account_name', '海发产业发展有限公司闲置账户',
    'account_status', '闲置账户',
    'remarks', '新增长期闲置账户异常交易样例，模拟设备维保支付。'
  ),
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
)
ON CONFLICT (id) DO NOTHING;

UPDATE payment_transactions
SET amount = CASE transaction_no
  WHEN 'DA-20260305-901' THEN 760000
  WHEN 'DA-20260309-902' THEN 820000
  WHEN 'DA-20260317-903' THEN 780000
  WHEN 'DA-20260324-904' THEN 740000
  ELSE amount
END,
updated_at = TIMESTAMP '2026-03-31 09:00:00'
WHERE transaction_no IN ('DA-20260305-901', 'DA-20260309-902', 'DA-20260317-903', 'DA-20260324-904');

INSERT INTO payment_transactions (
  id,
  transaction_no,
  transaction_date,
  batch_no,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  currency,
  payee_type,
  business_scenario,
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  source_file_name,
  source_row_no,
  extra_payload,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v5(uuid_ns_url(), format('%s-window-%s', group_key, seq_no)),
  format(
    '%s-%s-%s',
    prefix_code,
    to_char(base_date - (10 - seq_no), 'YYYYMMDD'),
    serial_suffix
  ),
  base_date - (10 - seq_no),
  'FS-2026-03-31',
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  'CNY',
  'organization',
  '财务公司网银支付',
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  'fund_safety_demo_batch_20260331.xlsx',
  source_row_start + seq_no,
  extra_payload,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
FROM (
  VALUES
    (
      'tx-frequency-extra-1',
      'HF',
      '911',
      DATE '2026-03-13',
      'HF-OPS-001',
      '青岛海发运营服务有限公司',
      '青岛海发运营服务有限公司',
      '622202600105',
      '青岛某园区综合配套服务有限公司',
      '942700001101',
      42000,
      55,
      DATE '2026-02-15',
      FALSE,
      4300,
      jsonb_build_object(
        'payer_account_name', '海发运营服务有限公司经营户',
        'account_status', '正常',
        'remarks', '补齐连续10日高频支付窗口样例。'
      )
    ),
    (
      'tx-frequency-extra-2',
      'HF',
      '912',
      DATE '2026-03-15',
      'HF-ENG-001',
      '青岛海发工程服务有限公司',
      '青岛海发工程服务有限公司',
      '622202600106',
      '青岛某工程劳务协作有限公司',
      '942700001102',
      39000,
      58,
      DATE '2026-02-18',
      FALSE,
      4310,
      jsonb_build_object(
        'payer_account_name', '海发工程服务有限公司经营户',
        'account_status', '正常',
        'remarks', '补齐连续10日高频支付窗口样例。'
      )
    ),
    (
      'tx-frequency-extra-3',
      'HF',
      '913',
      DATE '2026-03-22',
      'HF-PROP-001',
      '青岛海发物业管理有限公司',
      '青岛海发物业管理有限公司',
      '622202600107',
      '青岛某商业配套运营有限公司',
      '942700001103',
      40500,
      57,
      DATE '2026-02-22',
      FALSE,
      4320,
      jsonb_build_object(
        'payer_account_name', '海发物业管理有限公司经营户',
        'account_status', '正常',
        'remarks', '补齐连续10日高频支付窗口样例。'
      )
    ),
    (
      'tx-frequency-extra-4',
      'HF',
      '914',
      DATE '2026-03-26',
      'HF-URB-001',
      '青岛海发城市运营有限公司',
      '青岛海发城市运营有限公司',
      '622202600108',
      '青岛某城市服务外包有限公司',
      '942700001104',
      43000,
      54,
      DATE '2026-02-26',
      FALSE,
      4330,
      jsonb_build_object(
        'payer_account_name', '海发城市运营有限公司经营户',
        'account_status', '正常',
        'remarks', '补齐连续10日高频支付窗口样例。'
      )
    )
) AS groups(
  group_key,
  prefix_code,
  serial_suffix,
  base_date,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  source_row_start,
  extra_payload
)
CROSS JOIN generate_series(1, 9) AS seq(seq_no)
ON CONFLICT (id) DO NOTHING;

INSERT INTO payment_transactions (
  id,
  transaction_no,
  transaction_date,
  batch_no,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  currency,
  payee_type,
  business_scenario,
  transaction_count,
  account_last_active_date,
  is_dormant_account,
  source_file_name,
  source_row_no,
  extra_payload,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v5(uuid_ns_url(), format('%s-window-%s', group_key, seq_no)),
  format(
    'DA-%s-%s',
    to_char(transaction_date, 'YYYYMMDD'),
    serial_suffix
  ),
  transaction_date,
  'FS-2026-03-31',
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  amount,
  'CNY',
  'organization',
  '财务公司网银支付',
  1,
  account_last_active_date,
  TRUE,
  'fund_safety_demo_batch_20260331.xlsx',
  source_row_start + seq_no,
  extra_payload,
  TIMESTAMP '2026-03-31 09:00:00',
  TIMESTAMP '2026-03-31 09:00:00'
FROM (
  VALUES
    (
      'tx-dormant-extra-1',
      '921',
      DATE '2026-02-28',
      'HF-HLD-001',
      '青岛海发控股服务有限公司',
      '青岛海发控股服务有限公司',
      '622202600109',
      '青岛某文化会展服务有限公司',
      '942700001201',
      DATE '2024-01-15',
      4250,
      jsonb_build_object(
        'payer_account_name', '海发控股服务有限公司闲置账户',
        'account_status', '闲置账户',
        'remarks', '补齐闲置账户连续窗口累计支付样例。'
      )
    ),
    (
      'tx-dormant-extra-2',
      '922',
      DATE '2026-03-02',
      'HF-RES-001',
      '青岛海发资源管理有限公司',
      '青岛海发资源管理有限公司',
      '622202600110',
      '青岛某仓储物流服务有限公司',
      '942700001202',
      DATE '2024-02-01',
      4260,
      jsonb_build_object(
        'payer_account_name', '海发资源管理有限公司闲置账户',
        'account_status', '闲置账户',
        'remarks', '补齐闲置账户连续窗口累计支付样例。'
      )
    ),
    (
      'tx-dormant-extra-3',
      '923',
      DATE '2026-03-10',
      'HF-LAND-001',
      '青岛海发土地开发有限公司',
      '青岛海发土地开发有限公司',
      '622202600111',
      '青岛某资产处置服务有限公司',
      '942700001203',
      DATE '2024-01-28',
      4270,
      jsonb_build_object(
        'payer_account_name', '海发土地开发有限公司闲置账户',
        'account_status', '闲置账户',
        'remarks', '补齐闲置账户连续窗口累计支付样例。'
      )
    ),
    (
      'tx-dormant-extra-4',
      '924',
      DATE '2026-03-18',
      'HF-IND-001',
      '青岛海发产业发展有限公司',
      '青岛海发产业发展有限公司',
      '622202600112',
      '青岛某设备维保服务有限公司',
      '942700001204',
      DATE '2024-02-10',
      4280,
      jsonb_build_object(
        'payer_account_name', '海发产业发展有限公司闲置账户',
        'account_status', '闲置账户',
        'remarks', '补齐闲置账户连续窗口累计支付样例。'
      )
    )
) AS groups(
  group_key,
  serial_suffix,
  anchor_date,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  account_last_active_date,
  source_row_start,
  extra_payload
)
CROSS JOIN (
  VALUES
    (1, 680000, 6),
    (2, 720000, 2)
) AS samples(seq_no, amount, day_gap)
CROSS JOIN LATERAL (
  SELECT anchor_date + day_gap AS transaction_date
) AS tx_window
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_detection_jobs (
  id,
  job_no,
  job_status,
  triggered_by,
  started_at,
  finished_at,
  input_snapshot_at,
  transaction_count,
  matched_count,
  high_risk_count,
  warning_count,
  summary,
  error_message,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  'JT-20260403-001',
  'succeeded',
  'seed',
  TIMESTAMP '2026-04-03 09:00:00',
  TIMESTAMP '2026-04-03 09:15:00',
  TIMESTAMP '2026-03-31 23:59:59',
  3,
  3,
  1,
  2,
  jsonb_build_object(
    'note', 'Seed snapshot for the three risk ticket types',
    'ticket_type_count', 3,
    'manual_ticket_count', 27
  ),
  NULL,
  TIMESTAMP '2026-04-03 09:15:00',
  TIMESTAMP '2026-04-03 09:15:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_alerts (
  id,
  alert_no,
  job_id,
  rule_id,
  rule_code,
  rule_name,
  risk_level,
  alert_status,
  review_status,
  ticket_type,
  trigger_source,
  dispatch_status,
  feedback_status,
  recheck_status,
  ack_status,
  ticket_title,
  ticket_reason,
  ticket_content,
  source_ref_type,
  source_ref_id,
  leader_instruction_flag,
  continuous_warning_count,
  deadline_at,
  completed_at,
  is_overdue,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  transaction_date,
  matched_amount,
  matched_count,
  evidence_count,
  latest_evidence_summary,
  alert_summary,
  extra_payload,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-notice-1'),
  'RT-20260403-001',
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-blacklist'),
  'blacklist_hit',
  '黑名单命中规则',
  'high',
  'closed',
  'approved',
  'warning_notice',
  'model_threshold',
  'dispatched',
  'completed',
  'passed',
  'pending',
  '模型阈值异常预警单',
  '基于近期风险监控结果形成事后回顾说明，需同步提示相关部门关注风险表现和管理改进点。',
  '本单据用于回顾说明风险事项的表现、成因和后续改进安排，并形成反馈审核闭环。',
  'monitoring_model',
  'MODEL-WARN-001',
  FALSE,
  1,
  TIMESTAMP '2026-04-05 18:00:00',
  TIMESTAMP '2026-04-03 15:30:00',
  FALSE,
  'HF-PARK-001',
  '青岛海发园区运营有限公司',
  '青岛海发园区运营有限公司',
  '622202600010',
  '青岛西海岸某工程建设有限公司',
  '942700000201',
  DATE '2026-03-28',
  860000,
  1,
  2,
  '连续高阈值支付并命中黑名单，建议纳入预警单闭环。',
  '建议对工程款支付路径开展核查，并同步形成预警反馈与复核记录。',
  jsonb_build_object(
    'ticket_type', 'warning_notice',
    'trigger_source', 'model_threshold',
    'ticket_title', '模型阈值异常预警单',
    'ticket_reason', '基于近期风险监控结果形成事后回顾说明，需同步提示相关部门关注风险表现和管理改进点。',
    'ticket_content', '本单据用于回顾说明风险事项的表现、成因和后续改进安排，并形成反馈审核闭环。',
    'dispatch_status', 'dispatched',
    'feedback_status', 'completed',
    'recheck_status', 'passed',
    'deadline_at', '2026-04-05T18:00:00+08:00',
    'is_overdue', false,
    'continuous_warning_count', 1,
    'source_ref_type', 'monitoring_model',
    'source_ref_id', 'MODEL-WARN-001',
    'feedback', jsonb_build_object(
      'feedback_status', 'completed',
      'feedback_result', '已完成整改',
      'feedback_comment', '责任单位已补充交易背景说明并完成支付复核。',
      'operator_name', '青岛海发园区运营有限公司',
      'feedback_at', '2026-04-03T15:00:00+08:00'
    ),
    'recheck', jsonb_build_object(
      'recheck_status', 'passed',
      'recheck_result', '复核通过',
      'recheck_comment', '资料完整，闭环完成。',
      'operator_name', '海发集团风控复核人',
      'rechecked_at', '2026-04-03T16:30:00+08:00'
    ),
    'ack_records', '[]'::jsonb,
    'flow_logs', jsonb_build_array(
      jsonb_build_object('action_type', 'dispatch', 'action_result', 'completed', 'action_comment', '已派发至财务管理部和业务部门。', 'operator_name', '系统', 'created_at', '2026-04-03T09:10:00+08:00'),
      jsonb_build_object('action_type', 'feedback', 'action_result', 'submitted', 'action_comment', '已反馈整改计划并附回传说明。', 'operator_name', '青岛海发园区运营有限公司', 'created_at', '2026-04-03T15:00:00+08:00'),
      jsonb_build_object('action_type', 'review', 'action_result', 'approved', 'action_comment', '审核通过，建议复核关闭。', 'operator_name', '海发集团风控专员A', 'created_at', '2026-04-03T16:00:00+08:00'),
      jsonb_build_object('action_type', 'recheck', 'action_result', 'passed', 'action_comment', '复核通过，闭环完成。', 'operator_name', '海发集团风控复核人', 'created_at', '2026-04-03T16:30:00+08:00')
    ),
    'related_transactions',
    jsonb_build_array(
      jsonb_build_object(
        'transaction_no', 'TX-20260304-001',
        'transaction_date', '2026-03-04',
        'amount', '860000',
        'payer_name', '青岛海发园区运营有限公司',
        'payee_name', '青岛西海岸某工程建设有限公司',
        'business_scenario', '财务公司网银支付'
      )
    )
  ),
  TIMESTAMP '2026-04-03 15:30:00',
  TIMESTAMP '2026-04-03 15:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-1'),
  'RT-20260403-002',
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'trend_change_notice',
  '风险提示规则',
  'low',
  'open',
  'pending',
  'risk_tip',
  'trend_change',
  'dispatched',
  'pending',
  'pending',
  'read',
  '二道防线风险提示单',
  '用于对个别单位典型风险事件开展普遍提醒，并提示最新监管与趋势变化。',
  '请各成员单位阅知最新风险管理要求，重点关注外部风险趋势变化和典型事件复盘。',
  'trend_notice',
  'TREND-20260403-001',
  FALSE,
  0,
  NULL,
  NULL,
  FALSE,
  NULL,
  '集团本部',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  0,
  1,
  '二道防线最新提示事项，主要用于阅知。',
  '风险提示单无需反馈闭环，重点在普遍提醒与阅知确认。',
  jsonb_build_object(
    'ticket_type', 'risk_tip',
    'trigger_source', 'trend_change',
    'ticket_title', '二道防线风险提示单',
    'ticket_reason', '用于对个别单位典型风险事件开展普遍提醒，并提示最新监管与趋势变化。',
    'ticket_content', '请各成员单位阅知最新风险管理要求，重点关注外部风险趋势变化和典型事件复盘。',
    'dispatch_status', 'dispatched',
    'feedback_status', 'pending',
    'recheck_status', 'pending',
    'deadline_at', null,
    'is_overdue', false,
    'continuous_warning_count', 0,
    'source_ref_type', 'trend_notice',
    'source_ref_id', 'TREND-20260403-001',
    'feedback', jsonb_build_object(
      'feedback_status', 'pending',
      'feedback_result', '',
      'feedback_comment', '',
      'operator_name', '',
      'feedback_at', null
    ),
    'recheck', jsonb_build_object(
      'recheck_status', 'pending',
      'recheck_result', '',
      'recheck_comment', '',
      'operator_name', '',
      'rechecked_at', null
    ),
    'ack_records', jsonb_build_array(
      jsonb_build_object(
        'ack_status', 'read',
        'operator_name', '集团本部',
        'ack_comment', '已阅知并转发成员单位。',
        'ack_at', '2026-04-03T10:05:00+08:00'
      )
    ),
    'flow_logs', jsonb_build_array(
      jsonb_build_object('action_type', 'dispatch', 'action_result', 'completed', 'action_comment', '风险提示单已发往成员单位阅知。', 'operator_name', '系统', 'created_at', '2026-04-03T09:55:00+08:00'),
      jsonb_build_object('action_type', 'ack', 'action_result', 'read', 'action_comment', '成员单位已阅知风险提示。', 'operator_name', '集团本部', 'created_at', '2026-04-03T10:05:00+08:00')
    ),
    'target_units',
    jsonb_build_array('青岛海发资本管理有限公司', '青岛海发园区运营有限公司')
  ),
  TIMESTAMP '2026-04-03 10:00:00',
  TIMESTAMP '2026-04-03 10:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-1'),
  'RT-20260403-003',
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant'),
  'three_consecutive_warnings',
  '连续高风险预警规则',
  'high',
  'open',
  'pending',
  'supervision',
  'three_consecutive_warnings',
  'dispatched',
  'pending',
  'pending',
  'pending',
  '连续三次预警督办单',
  '基于连续三次预警结果形成督办回顾单，需持续跟踪风险事项的整改进展和管理责任。',
  '本单据用于说明连续预警的演变过程、整改进度和后续督办要求，并保留逾期跟踪记录。',
  'monitoring_model',
  'MODEL-SUP-001',
  TRUE,
  3,
  TIMESTAMP '2026-04-02 18:00:00',
  NULL,
  TRUE,
  'HF-CTI-001',
  '青岛海发产城投资有限公司',
  '青岛海发产城投资有限公司',
  '622202600013',
  '青岛某供应链结算服务有限公司',
  '942700000203',
  DATE '2026-03-25',
  1240000,
  3,
  2,
  '连续三次预警已经触发督办升级，需督促整改落实。',
  '督办单已生成，当前处于待反馈状态。',
  jsonb_build_object(
    'ticket_type', 'supervision',
    'trigger_source', 'three_consecutive_warnings',
    'ticket_title', '连续三次预警督办单',
    'ticket_reason', '基于连续三次预警结果形成督办回顾单，需持续跟踪风险事项的整改进展和管理责任。',
    'ticket_content', '本单据用于说明连续预警的演变过程、整改进度和后续督办要求，并保留逾期跟踪记录。',
    'dispatch_status', 'dispatched',
    'feedback_status', 'pending',
    'recheck_status', 'pending',
    'deadline_at', '2026-04-02T18:00:00+08:00',
    'is_overdue', true,
    'continuous_warning_count', 3,
    'source_ref_type', 'monitoring_model',
    'source_ref_id', 'MODEL-SUP-001',
    'feedback', jsonb_build_object(
      'feedback_status', 'pending',
      'feedback_result', '',
      'feedback_comment', '责任单位尚未提交整改反馈。',
      'operator_name', '',
      'feedback_at', null
    ),
    'recheck', jsonb_build_object(
      'recheck_status', 'pending',
      'recheck_result', '',
      'recheck_comment', '',
      'operator_name', '',
      'rechecked_at', null
    ),
    'ack_records', '[]'::jsonb,
    'flow_logs', jsonb_build_array(
      jsonb_build_object('action_type', 'dispatch', 'action_result', 'completed', 'action_comment', '督办单已下发至责任单位。', 'operator_name', '系统', 'created_at', '2026-04-03T08:40:00+08:00'),
      jsonb_build_object('action_type', 'overdue', 'action_result', 'triggered', 'action_comment', '已超过整改截止时间，系统标记为逾期。', 'operator_name', '系统', 'created_at', '2026-04-03T18:30:00+08:00')
    ),
    'overdue_reason',
    '超过截止时间尚未完成整改反馈'
  ),
  TIMESTAMP '2026-04-03 08:30:00',
  TIMESTAMP '2026-04-03 08:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-1'),
  'RT-20260403-004',
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'audit_rectification_notice',
  '审计整改跟踪预警规则',
  'warn',
  'open',
  'pending',
  'warning_notice',
  'audit_rectification',
  'dispatched',
  'submitted',
  'pending',
  'pending',
  '审计整改跟踪预警单',
  '基于审计整改跟踪情况形成预警回顾单，用于说明问题背景、整改安排和阶段反馈。',
  '本单据用于记录审计问题的回顾说明、整改反馈和后续审核过程，不针对单笔业务作否决处理。',
  'audit_issue',
  'AUDIT-RECT-001',
  FALSE,
  0,
  TIMESTAMP '2026-04-08 18:00:00',
  NULL,
  FALSE,
  'HF-CAP-002',
  '青岛海发资本管理有限公司',
  '青岛海发资本管理有限公司',
  '622202600011',
  '青岛某基金服务有限公司',
  '942700000202',
  DATE '2026-03-12',
  1240000,
  1,
  1,
  '审计问题整改通知已发出，待进一步审核。',
  '该单据用于跟踪审计整改通知与反馈结果。',
  jsonb_build_object(
    'ticket_type', 'warning_notice',
    'trigger_source', 'audit_rectification',
    'ticket_title', '审计整改跟踪预警单',
    'ticket_reason', '基于审计整改跟踪情况形成预警回顾单，用于说明问题背景、整改安排和阶段反馈。',
    'ticket_content', '本单据用于记录审计问题的回顾说明、整改反馈和后续审核过程，不针对单笔业务作否决处理。',
    'dispatch_status', 'dispatched',
    'feedback_status', 'submitted',
    'recheck_status', 'pending',
    'deadline_at', '2026-04-08T18:00:00+08:00',
    'is_overdue', false,
    'continuous_warning_count', 0,
    'source_ref_type', 'audit_issue',
    'source_ref_id', 'AUDIT-RECT-001',
    'feedback', jsonb_build_object(
      'feedback_status', 'submitted',
      'feedback_result', '已提交整改说明',
      'feedback_comment', '责任单位已提交第一轮整改材料，待审核。',
      'operator_name', '青岛海发资本管理有限公司',
      'feedback_at', '2026-04-03T17:10:00+08:00'
    ),
    'recheck', jsonb_build_object(
      'recheck_status', 'pending',
      'recheck_result', '',
      'recheck_comment', '',
      'operator_name', '',
      'rechecked_at', null
    ),
    'ack_records', '[]'::jsonb,
    'flow_logs', jsonb_build_array(
      jsonb_build_object('action_type', 'dispatch', 'action_result', 'completed', 'action_comment', '审计整改预警单已下发。', 'operator_name', '系统', 'created_at', '2026-04-03T11:00:00+08:00'),
      jsonb_build_object('action_type', 'feedback', 'action_result', 'submitted', 'action_comment', '已提交整改反馈，待审核。', 'operator_name', '青岛海发资本管理有限公司', 'created_at', '2026-04-03T17:10:00+08:00')
    ),
    'related_transactions', jsonb_build_array(
      jsonb_build_object(
        'transaction_no', 'TX-20260312-001',
        'transaction_date', '2026-03-12',
        'amount', '1240000',
        'payer_name', '青岛海发资本管理有限公司',
        'payee_name', '青岛某基金服务有限公司',
        'business_scenario', '财务公司网银支付'
      )
    )
  ),
  TIMESTAMP '2026-04-03 11:00:00',
  TIMESTAMP '2026-04-03 17:10:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-1'),
  'RT-20260403-005',
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-blacklist'),
  'leader_attention_notice',
  '领导批示预警单',
  'warn',
  'open',
  'rejected',
  'warning_notice',
  'leader_instruction',
  'dispatched',
  'returned',
  'pending',
  'pending',
  '领导批示预警单',
  '根据领导批示形成专项风险回顾单，用于补充说明风险背景、影响范围和管理建议。',
  '本单据用于归集相关说明材料、补充回顾分析并形成审核复核意见，不直接否决原有业务事项。',
  'leader_instruction',
  'LEADER-WARN-001',
  TRUE,
  0,
  TIMESTAMP '2026-04-07 18:00:00',
  NULL,
  FALSE,
  'HF-SVC-002',
  '青岛海发产业服务有限公司',
  '青岛海发产业服务有限公司',
  '622202600012',
  '青岛某供应链结算服务有限公司',
  '942700000203',
  DATE '2026-03-18',
  730000,
  1,
  1,
  '领导要求专项核查该类支付背景与审批链路。',
  '当前反馈材料不足，审核已退回。',
  jsonb_build_object(
    'ticket_type', 'warning_notice',
    'trigger_source', 'leader_instruction',
    'ticket_title', '领导批示预警单',
    'ticket_reason', '根据领导批示形成专项风险回顾单，用于补充说明风险背景、影响范围和管理建议。',
    'ticket_content', '本单据用于归集相关说明材料、补充回顾分析并形成审核复核意见，不直接否决原有业务事项。',
    'dispatch_status', 'dispatched',
    'feedback_status', 'returned',
    'recheck_status', 'pending',
    'deadline_at', '2026-04-07T18:00:00+08:00',
    'is_overdue', false,
    'continuous_warning_count', 0,
    'source_ref_type', 'leader_instruction',
    'source_ref_id', 'LEADER-WARN-001',
    'feedback', jsonb_build_object(
      'feedback_status', 'returned',
      'feedback_result', '已退回补充',
      'feedback_comment', '缺少合同及审批链路证明材料。',
      'operator_name', '海发集团风控专员C',
      'feedback_at', '2026-04-03T14:20:00+08:00'
    ),
    'recheck', jsonb_build_object(
      'recheck_status', 'pending',
      'recheck_result', '',
      'recheck_comment', '',
      'operator_name', '',
      'rechecked_at', null
    ),
    'ack_records', '[]'::jsonb,
    'flow_logs', jsonb_build_array(
      jsonb_build_object('action_type', 'dispatch', 'action_result', 'completed', 'action_comment', '领导批示预警单已派发。', 'operator_name', '系统', 'created_at', '2026-04-03T12:30:00+08:00'),
      jsonb_build_object('action_type', 'feedback', 'action_result', 'returned', 'action_comment', '反馈材料不完整，退回补充。', 'operator_name', '海发集团风控专员C', 'created_at', '2026-04-03T14:20:00+08:00'),
      jsonb_build_object('action_type', 'review', 'action_result', 'rejected', 'action_comment', '补充完整后重新提交。', 'operator_name', '海发集团风控专员C', 'created_at', '2026-04-03T14:25:00+08:00')
    ),
    'related_transactions', jsonb_build_array(
      jsonb_build_object(
        'transaction_no', 'TX-20260318-001',
        'transaction_date', '2026-03-18',
        'amount', '730000',
        'payer_name', '青岛海发产业服务有限公司',
        'payee_name', '青岛某供应链结算服务有限公司',
        'business_scenario', '财务公司网银支付'
      )
    )
  ),
  TIMESTAMP '2026-04-03 12:30:00',
  TIMESTAMP '2026-04-03 14:25:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-event-1'),
  'RT-20260403-006',
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant'),
  'typical_event_notice',
  '典型事件提示规则',
  'low',
  'open',
  'pending',
  'risk_tip',
  'typical_event',
  'dispatched',
  'pending',
  'pending',
  'pending',
  '典型风险事件提示单',
  '针对近期典型风险事件形成系统内提示单，用于总结案例表现和共性风险特征。',
  '本单据用于开展案例复盘和横向提醒，提示各单位关注类似风险表现和管理启示。',
  'typical_event',
  'TIP-EVENT-001',
  FALSE,
  0,
  NULL,
  NULL,
  FALSE,
  NULL,
  '集团本部',
  NULL,
  NULL,
  NULL,
  NULL,
  NULL,
  0,
  0,
  1,
  '典型事件提示已发出，待成员单位阅知。',
  '用于案例提醒和政策传达。',
  jsonb_build_object(
    'ticket_type', 'risk_tip',
    'trigger_source', 'typical_event',
    'ticket_title', '典型风险事件提示单',
    'ticket_reason', '针对近期典型风险事件形成系统内提示单，用于总结案例表现和共性风险特征。',
    'ticket_content', '本单据用于开展案例复盘和横向提醒，提示各单位关注类似风险表现和管理启示。',
    'dispatch_status', 'dispatched',
    'feedback_status', 'pending',
    'recheck_status', 'pending',
    'deadline_at', null,
    'is_overdue', false,
    'continuous_warning_count', 0,
    'source_ref_type', 'typical_event',
    'source_ref_id', 'TIP-EVENT-001',
    'feedback', jsonb_build_object(
      'feedback_status', 'pending',
      'feedback_result', '',
      'feedback_comment', '',
      'operator_name', '',
      'feedback_at', null
    ),
    'recheck', jsonb_build_object(
      'recheck_status', 'pending',
      'recheck_result', '',
      'recheck_comment', '',
      'operator_name', '',
      'rechecked_at', null
    ),
    'ack_records', '[]'::jsonb,
    'flow_logs', jsonb_build_array(
      jsonb_build_object('action_type', 'dispatch', 'action_result', 'completed', 'action_comment', '典型风险事件提示单已发出。', 'operator_name', '系统', 'created_at', '2026-04-03T13:00:00+08:00')
    ),
    'target_units', jsonb_build_array('青岛海发城市更新有限公司', '青岛海发产业服务有限公司')
  ),
  TIMESTAMP '2026-04-03 13:00:00',
  TIMESTAMP '2026-04-03 13:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-1'),
  'RT-20260403-007',
  uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403'),
  uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency'),
  'rectification_overdue_notice',
  '整改逾期督办规则',
  'high',
  'open',
  'approved',
  'supervision',
  'rectification_overdue',
  'dispatched',
  'completed',
  'returned',
  'pending',
  '整改逾期督办单',
  '基于整改逾期情况形成督办回顾单，用于说明逾期原因、当前进展和后续督办重点。',
  '本单据用于持续跟踪整改落实情况、记录复核意见并说明逾期事项的管理安排。',
  'audit_issue',
  'AUDIT-OVERDUE-001',
  FALSE,
  0,
  TIMESTAMP '2026-04-01 18:00:00',
  NULL,
  TRUE,
  'HF-CTI-002',
  '青岛海发产城投资有限公司',
  '青岛海发产城投资有限公司',
  '622202600020',
  '青岛某园区配套服务有限公司',
  '942700000301',
  DATE '2026-03-10',
  2550000,
  51,
  1,
  '整改逾期已升级为督办，当前复核退回。',
  '该督办单用于跟踪整改逾期通报和落实情况。',
  jsonb_build_object(
    'ticket_type', 'supervision',
    'trigger_source', 'rectification_overdue',
    'ticket_title', '整改逾期督办单',
    'ticket_reason', '基于整改逾期情况形成督办回顾单，用于说明逾期原因、当前进展和后续督办重点。',
    'ticket_content', '本单据用于持续跟踪整改落实情况、记录复核意见并说明逾期事项的管理安排。',
    'dispatch_status', 'dispatched',
    'feedback_status', 'completed',
    'recheck_status', 'returned',
    'deadline_at', '2026-04-01T18:00:00+08:00',
    'is_overdue', true,
    'continuous_warning_count', 0,
    'source_ref_type', 'audit_issue',
    'source_ref_id', 'AUDIT-OVERDUE-001',
    'feedback', jsonb_build_object(
      'feedback_status', 'completed',
      'feedback_result', '已提交整改落实情况',
      'feedback_comment', '责任单位已补充整改计划，但效果验证仍不足。',
      'operator_name', '青岛海发产城投资有限公司',
      'feedback_at', '2026-04-03T16:40:00+08:00'
    ),
    'recheck', jsonb_build_object(
      'recheck_status', 'returned',
      'recheck_result', '复核退回',
      'recheck_comment', '请补充逾期整改完成证明和制度修订记录。',
      'operator_name', '海发集团风控复核人',
      'rechecked_at', '2026-04-03T17:20:00+08:00'
    ),
    'ack_records', '[]'::jsonb,
    'flow_logs', jsonb_build_array(
      jsonb_build_object('action_type', 'dispatch', 'action_result', 'completed', 'action_comment', '整改逾期督办单已发出。', 'operator_name', '系统', 'created_at', '2026-04-03T09:00:00+08:00'),
      jsonb_build_object('action_type', 'feedback', 'action_result', 'completed', 'action_comment', '责任单位已提交整改落实情况。', 'operator_name', '青岛海发产城投资有限公司', 'created_at', '2026-04-03T16:40:00+08:00'),
      jsonb_build_object('action_type', 'recheck', 'action_result', 'returned', 'action_comment', '复核退回，要求补充落实证明。', 'operator_name', '海发集团风控复核人', 'created_at', '2026-04-03T17:20:00+08:00')
    ),
    'related_transactions', jsonb_build_array(
      jsonb_build_object(
        'transaction_no', 'HF-20260310-51',
        'transaction_date', '2026-03-10',
        'amount', '2550000',
        'payer_name', '青岛海发产城投资有限公司',
        'payee_name', '青岛某园区配套服务有限公司',
        'business_scenario', '财务公司网银支付'
      )
    )
  ),
  TIMESTAMP '2026-04-03 09:00:00',
  TIMESTAMP '2026-04-03 17:20:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_alert_evidences (
  id,
  alert_id,
  evidence_type,
  evidence_title,
  evidence_detail,
  evidence_payload,
  evidence_order,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-evidence-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-notice-1'),
  'threshold',
  '阈值异常与黑名单命中',
  '单笔交易金额与连续支付频次均超过正常阈值，同时命中黑名单对手方。',
  jsonb_build_object('threshold', 'warning', 'risk_level', 'high'),
  1,
  TIMESTAMP '2026-04-03 15:30:00',
  TIMESTAMP '2026-04-03 15:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-evidence-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-1'),
  'trend_notice',
  '二道防线趋势提示',
  '近期监管要求强调对典型风险事件的普遍提醒和阅知留痕。',
  jsonb_build_object('audience', 'all_units', 'note', 'read_and_acknowledge'),
  1,
  TIMESTAMP '2026-04-03 10:00:00',
  TIMESTAMP '2026-04-03 10:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-evidence-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-1'),
  'escalation',
  '连续三次预警升级督办',
  '同一监控对象在连续三个周期内重复触发预警，满足督办升级条件。',
  jsonb_build_object('consecutive_warnings', 3, 'overdue', true),
  1,
  TIMESTAMP '2026-04-03 08:30:00',
  TIMESTAMP '2026-04-03 08:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-evidence-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-1'),
  'audit_issue',
  '审计整改通知',
  '内外部审计要求责任单位针对异常支付补充整改说明并限期反馈。',
  jsonb_build_object('source', 'internal_audit', 'tracking_required', true),
  1,
  TIMESTAMP '2026-04-03 11:00:00',
  TIMESTAMP '2026-04-03 11:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-evidence-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-1'),
  'leader_instruction',
  '领导专项关注',
  '领导要求核查业务背景、合同依据和审批链路完整性。',
  jsonb_build_object('leader_flag', true, 'priority', 'special_attention'),
  1,
  TIMESTAMP '2026-04-03 12:30:00',
  TIMESTAMP '2026-04-03 12:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-event-evidence-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-event-1'),
  'typical_event',
  '典型风险事件通报',
  '近期发现长期闲置账户异常支付案例，要求成员单位普遍关注。',
  jsonb_build_object('audience', 'member_units', 'case_type', 'dormant_account'),
  1,
  TIMESTAMP '2026-04-03 13:00:00',
  TIMESTAMP '2026-04-03 13:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-evidence-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-1'),
  'rectification_overdue',
  '整改逾期升级督办',
  '审计问题整改超过截止时间仍未形成有效闭环，需升级督办。',
  jsonb_build_object('overdue_days', 2, 'needs_followup', true),
  1,
  TIMESTAMP '2026-04-03 09:00:00',
  TIMESTAMP '2026-04-03 09:00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_alert_reviews (
  id,
  alert_id,
  review_status,
  reviewer_name,
  review_result,
  review_comment,
  reviewed_at,
  assignment_status,
  assigned_reviewer_name,
  assigned_at,
  created_by,
  updated_by,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-review-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-notice-1'),
  'approved',
  '海发集团风控专员A',
  '已核实异常支付并确认需要预警闭环。',
  '建议继续跟踪整改反馈和复核结果。',
  TIMESTAMP '2026-04-03 16:00:00',
  'assigned',
  '海发集团风控专员A',
  TIMESTAMP '2026-04-03 09:20:00',
  'demo',
  'demo',
  TIMESTAMP '2026-04-03 16:00:00',
  TIMESTAMP '2026-04-03 16:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-review-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-1'),
  'pending',
  NULL,
  NULL,
  NULL,
  NULL,
  'unassigned',
  NULL,
  NULL,
  'demo',
  'demo',
  TIMESTAMP '2026-04-03 10:00:00',
  TIMESTAMP '2026-04-03 10:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-review-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-1'),
  'pending',
  NULL,
  NULL,
  NULL,
  NULL,
  'assigned',
  '海发集团风控专员B',
  TIMESTAMP '2026-04-03 08:45:00',
  'demo',
  'demo',
  TIMESTAMP '2026-04-03 08:45:00',
  TIMESTAMP '2026-04-03 08:45:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-review-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-1'),
  'pending',
  NULL,
  NULL,
  NULL,
  NULL,
  'assigned',
  '海发集团审计整改跟踪专员',
  TIMESTAMP '2026-04-03 11:05:00',
  'demo',
  'demo',
  TIMESTAMP '2026-04-03 11:05:00',
  TIMESTAMP '2026-04-03 11:05:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-review-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-1'),
  'rejected',
  '海发集团风控专员C',
  '反馈材料不完整，退回补充。',
  '请补充合同、审批单和用途说明。',
  TIMESTAMP '2026-04-03 14:25:00',
  'assigned',
  '海发集团风控专员C',
  TIMESTAMP '2026-04-03 12:35:00',
  'demo',
  'demo',
  TIMESTAMP '2026-04-03 12:35:00',
  TIMESTAMP '2026-04-03 14:25:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-event-review-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-event-1'),
  'pending',
  NULL,
  NULL,
  NULL,
  NULL,
  'unassigned',
  NULL,
  NULL,
  'demo',
  'demo',
  TIMESTAMP '2026-04-03 13:00:00',
  TIMESTAMP '2026-04-03 13:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-review-1'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-1'),
  'approved',
  '海发集团督办专员',
  '督办单已确认继续跟踪整改落实。',
  '复核未通过，继续补充材料。',
  TIMESTAMP '2026-04-03 17:00:00',
  'assigned',
  '海发集团督办专员',
  TIMESTAMP '2026-04-03 09:05:00',
  'demo',
  'demo',
  TIMESTAMP '2026-04-03 09:05:00',
  TIMESTAMP '2026-04-03 17:00:00'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO terror_ticket_flow_logs (
  id,
  alert_id,
  action_type,
  action_result,
  action_comment,
  operator_name,
  operator_role,
  attachments,
  extra_payload,
  created_at,
  updated_at
) VALUES
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-flow-dispatch'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-notice-1'),
  'dispatch',
  'completed',
  '已派发至财务管理部和业务部门。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice'),
  TIMESTAMP '2026-04-03 09:10:00',
  TIMESTAMP '2026-04-03 09:10:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-flow-feedback'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-notice-1'),
  'feedback',
  'submitted',
  '已反馈整改计划并附回传说明。',
  '海发集团风控专员A',
  'reviewer',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice'),
  TIMESTAMP '2026-04-03 15:00:00',
  TIMESTAMP '2026-04-03 15:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-flow-review'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-notice-1'),
  'review',
  'approved',
  '审核通过，建议复核关闭。',
  '海发集团风控专员A',
  'reviewer',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice'),
  TIMESTAMP '2026-04-03 16:00:00',
  TIMESTAMP '2026-04-03 16:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-flow-recheck'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-notice-1'),
  'recheck',
  'passed',
  '复核通过，闭环完成。',
  '海发集团风控复核人',
  'rechecker',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice'),
  TIMESTAMP '2026-04-03 16:30:00',
  TIMESTAMP '2026-04-03 16:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-flow-dispatch'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-1'),
  'dispatch',
  'completed',
  '风险提示单已发往成员单位阅知。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'risk_tip'),
  TIMESTAMP '2026-04-03 09:55:00',
  TIMESTAMP '2026-04-03 09:55:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-flow-ack'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-1'),
  'ack',
  'read',
  '成员单位已阅知风险提示。',
  '集团本部',
  'reader',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'risk_tip'),
  TIMESTAMP '2026-04-03 10:05:00',
  TIMESTAMP '2026-04-03 10:05:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-flow-dispatch'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-1'),
  'dispatch',
  'completed',
  '督办单已下发至责任单位。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'supervision'),
  TIMESTAMP '2026-04-03 08:40:00',
  TIMESTAMP '2026-04-03 08:40:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-flow-overdue'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-1'),
  'overdue',
  'triggered',
  '已超过整改截止时间，系统标记为逾期。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'supervision', 'is_overdue', true),
  TIMESTAMP '2026-04-03 18:30:00',
  TIMESTAMP '2026-04-03 18:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-flow-dispatch'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-1'),
  'dispatch',
  'completed',
  '审计整改跟踪预警单已派发。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice', 'trigger_source', 'audit_rectification'),
  TIMESTAMP '2026-04-03 11:00:00',
  TIMESTAMP '2026-04-03 11:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-flow-feedback'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-audit-1'),
  'feedback',
  'submitted',
  '责任单位已提交整改反馈。',
  '青岛海发资本管理有限公司',
  'member_unit',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice', 'trigger_source', 'audit_rectification'),
  TIMESTAMP '2026-04-03 17:10:00',
  TIMESTAMP '2026-04-03 17:10:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-flow-dispatch'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-1'),
  'dispatch',
  'completed',
  '领导批示预警单已下发。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice', 'trigger_source', 'leader_instruction'),
  TIMESTAMP '2026-04-03 12:30:00',
  TIMESTAMP '2026-04-03 12:30:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-flow-return'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-warning-leader-1'),
  'review',
  'rejected',
  '反馈材料不完整，已退回。',
  '海发集团风控专员C',
  'reviewer',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'warning_notice', 'trigger_source', 'leader_instruction'),
  TIMESTAMP '2026-04-03 14:25:00',
  TIMESTAMP '2026-04-03 14:25:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-event-flow-dispatch'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-tip-event-1'),
  'dispatch',
  'completed',
  '典型事件提示单已推送阅知。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'risk_tip', 'trigger_source', 'typical_event'),
  TIMESTAMP '2026-04-03 13:00:00',
  TIMESTAMP '2026-04-03 13:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-flow-dispatch'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-1'),
  'dispatch',
  'completed',
  '整改逾期督办单已发出。',
  '系统',
  'system',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'supervision', 'trigger_source', 'rectification_overdue'),
  TIMESTAMP '2026-04-03 09:00:00',
  TIMESTAMP '2026-04-03 09:00:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-flow-feedback'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-1'),
  'feedback',
  'completed',
  '整改落实情况已提交。',
  '青岛海发产城投资有限公司',
  'member_unit',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'supervision', 'trigger_source', 'rectification_overdue'),
  TIMESTAMP '2026-04-03 16:40:00',
  TIMESTAMP '2026-04-03 16:40:00'
),
(
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-flow-recheck'),
  uuid_generate_v5(uuid_ns_url(), 'risk-ticket-supervision-audit-1'),
  'recheck',
  'returned',
  '复核退回，要求补充证明材料。',
  '海发集团风控复核人',
  'rechecker',
  '[]'::jsonb,
  jsonb_build_object('ticket_type', 'supervision', 'trigger_source', 'rectification_overdue'),
  TIMESTAMP '2026-04-03 17:20:00',
  TIMESTAMP '2026-04-03 17:20:00'
)
ON CONFLICT (id) DO NOTHING;

WITH extra_tickets AS (
  SELECT
    gs AS seq,
    uuid_generate_v5(uuid_ns_url(), format('risk-ticket-extra-%s', gs)) AS id,
    format('RT-20260403-%s', lpad((gs + 7)::text, 3, '0')) AS alert_no,
    uuid_generate_v5(uuid_ns_url(), 'terror-ticket-job-seed-20260403') AS job_id,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency')
        WHEN 2 THEN uuid_generate_v5(uuid_ns_url(), 'terror-rule-blacklist')
        ELSE uuid_generate_v5(uuid_ns_url(), 'terror-rule-blacklist')
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant')
        ELSE uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency')
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN uuid_generate_v5(uuid_ns_url(), 'terror-rule-frequency')
        ELSE uuid_generate_v5(uuid_ns_url(), 'terror-rule-dormant')
      END
    END AS rule_id,
    CASE
      WHEN gs <= 8 THEN 'warning_notice'
      WHEN gs <= 14 THEN 'risk_tip'
      ELSE 'supervision'
    END AS ticket_type,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN 'audit_rectification'
        WHEN 2 THEN 'leader_instruction'
        ELSE 'model_threshold'
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN 'typical_event'
        ELSE 'trend_change'
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN 'rectification_overdue'
        ELSE 'three_consecutive_warnings'
      END
    END AS trigger_source,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN 'post_review_audit_notice'
        WHEN 2 THEN 'post_review_leader_notice'
        ELSE 'post_review_threshold_notice'
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN 'typical_event_notice'
        ELSE 'trend_change_notice'
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN 'rectification_overdue_notice'
        ELSE 'three_consecutive_warnings'
      END
    END AS rule_code,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN '审计整改回顾预警单'
        WHEN 2 THEN '领导批示预警单'
        ELSE '模型阈值回顾预警单'
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN '典型事件提示单'
        ELSE '风险趋势提示单'
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN '整改逾期督办单'
        ELSE '连续预警督办单'
      END
    END AS ticket_title,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN '审计整改回顾预警单'
        WHEN 2 THEN '领导批示预警单'
        ELSE '模型阈值回顾预警单'
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN '典型事件提示单'
        ELSE '风险趋势提示单'
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN '整改逾期督办单'
        ELSE '连续预警督办单'
      END
    END AS rule_name,
    CASE
      WHEN gs <= 8 THEN CASE WHEN gs % 2 = 0 THEN 'warn' ELSE 'high' END
      WHEN gs <= 14 THEN 'low'
      ELSE 'high'
    END AS risk_level,
    'open' AS alert_status,
    CASE
      WHEN gs <= 8 THEN CASE (gs % 3)
        WHEN 0 THEN 'rejected'
        WHEN 1 THEN 'pending'
        ELSE 'approved'
      END
      WHEN gs <= 14 THEN 'pending'
      ELSE CASE (gs % 3)
        WHEN 1 THEN 'pending'
        ELSE 'approved'
      END
    END AS review_status,
    'dispatched' AS dispatch_status,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN 'pending'
      ELSE CASE (gs % 4)
        WHEN 0 THEN 'returned'
        WHEN 1 THEN 'pending'
        WHEN 2 THEN 'submitted'
        ELSE 'completed'
      END
    END AS feedback_status,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN 'pending'
      ELSE CASE (gs % 3)
        WHEN 0 THEN 'returned'
        WHEN 1 THEN 'pending'
        ELSE 'passed'
      END
    END AS recheck_status,
    CASE
      WHEN gs > 8 AND gs <= 14 AND gs % 3 <> 0 THEN 'read'
      ELSE 'pending'
    END AS ack_status,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN '基于近期审计整改跟踪情况形成的事后风险回顾单，用于说明问题表现、原因分析和整改计划。'
        WHEN 2 THEN '根据领导批示对相关风险线索形成事后回顾说明，提示责任单位补充背景、成因和管理建议。'
        ELSE '基于监控模型识别结果形成的事后风险回顾单，用于说明风险特征、影响范围和后续管理动作。'
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN '围绕近期典型风险事件形成提示单，用于总结案例表现、共性特征和管理启示。'
        ELSE '围绕最新风险趋势变化形成提示单，用于向成员单位说明趋势影响和关注重点。'
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN '围绕整改逾期事项形成督办单，用于总结逾期原因、当前进度和后续督办要求。'
        ELSE '围绕连续预警事项形成督办单，用于复盘风险演变过程并持续跟踪落实情况。'
      END
    END AS ticket_reason,
    CASE
      WHEN gs <= 8 THEN '本单据用于形成风险事项的事后说明、回顾和总结，派发相关单位补充反馈并形成审核复核记录。'
      WHEN gs <= 14 THEN '本单据用于进行风险提示的派发与阅知留痕，便于成员单位开展事后学习和横向提醒。'
      ELSE '本单据用于督办风险事项的整改反馈、审核复核和逾期跟踪，形成持续跟进记录。'
    END AS ticket_content,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN 'audit_issue'
        WHEN 2 THEN 'leader_instruction'
        ELSE 'monitoring_model'
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN 'typical_event'
        ELSE 'trend_notice'
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN 'audit_issue'
        ELSE 'monitoring_model'
      END
    END AS source_ref_type,
    format('EXTRA-SRC-%s', lpad(gs::text, 3, '0')) AS source_ref_id,
    CASE WHEN gs <= 8 AND ((gs - 1) % 3) = 2 THEN TRUE ELSE FALSE END AS leader_instruction_flag,
    CASE WHEN gs > 14 AND gs % 2 = 1 THEN 3 ELSE 0 END AS continuous_warning_count,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN NULL
      ELSE TIMESTAMP '2026-04-10 18:00:00' + (gs || ' hours')::interval
    END AS deadline_at,
    CASE
      WHEN gs <= 8 AND (gs % 4) = 3 THEN TIMESTAMP '2026-04-05 18:00:00' + (gs || ' hours')::interval
      ELSE NULL
    END AS completed_at,
    CASE WHEN gs > 14 AND gs % 2 = 0 THEN TRUE ELSE FALSE END AS is_overdue,
    CASE (gs % 4)
      WHEN 1 THEN 'HF-PARK-001'
      WHEN 2 THEN 'HF-CAP-002'
      WHEN 3 THEN 'HF-SVC-002'
      ELSE 'HF-CTI-001'
    END AS member_unit_code,
    CASE (gs % 4)
      WHEN 1 THEN '青岛海发园区运营有限公司'
      WHEN 2 THEN '青岛海发资本管理有限公司'
      WHEN 3 THEN '青岛海发产业服务有限公司'
      ELSE '青岛海发产城投资有限公司'
    END AS member_unit_name,
    CASE WHEN gs <= 14 AND gs > 8 THEN NULL ELSE CASE (gs % 4)
      WHEN 1 THEN '青岛海发园区运营有限公司'
      WHEN 2 THEN '青岛海发资本管理有限公司'
      WHEN 3 THEN '青岛海发产业服务有限公司'
      ELSE '青岛海发产城投资有限公司'
    END END AS payer_name,
    CASE WHEN gs <= 14 AND gs > 8 THEN NULL ELSE CASE (gs % 4)
      WHEN 1 THEN '622202600010'
      WHEN 2 THEN '622202600011'
      WHEN 3 THEN '622202600012'
      ELSE '622202600013'
    END END AS payer_account,
    CASE WHEN gs <= 14 AND gs > 8 THEN NULL ELSE CASE (gs % 4)
      WHEN 1 THEN '青岛西海岸某工程建设有限公司'
      WHEN 2 THEN '青岛某基金服务有限公司'
      WHEN 3 THEN '青岛某供应链结算服务有限公司'
      ELSE '青岛某园区配套服务有限公司'
    END END AS payee_name,
    CASE WHEN gs <= 14 AND gs > 8 THEN NULL ELSE CASE (gs % 4)
      WHEN 1 THEN '942700000201'
      WHEN 2 THEN '942700000202'
      WHEN 3 THEN '942700000203'
      ELSE '942700000301'
    END END AS payee_account,
    CASE WHEN gs <= 14 AND gs > 8 THEN NULL ELSE DATE '2026-03-01' + gs END AS transaction_date,
    CASE WHEN gs <= 14 AND gs > 8 THEN 0 ELSE 420000 + (gs * 35000) END AS matched_amount,
    CASE WHEN gs <= 14 AND gs > 8 THEN 0 ELSE 1 + (gs % 3) END AS matched_count,
    1 AS evidence_count,
    CASE
      WHEN gs <= 8 THEN '围绕近期风险监测结果形成回顾说明，已提炼主要异常特征和影响范围。'
      WHEN gs <= 14 THEN '围绕趋势变化或典型事件形成提示说明，便于成员单位统一阅知。'
      ELSE '围绕连续预警或整改逾期情况形成督办回顾，需持续跟踪落实情况。'
    END AS latest_evidence_summary,
    CASE
      WHEN gs <= 8 THEN '该单据用于对已识别风险事项进行事后回顾、原因说明和改进安排。'
      WHEN gs <= 14 THEN '该单据用于对风险趋势或典型事件进行总结提示和横向提醒。'
      ELSE '该单据用于对重点风险事项进行督办跟踪、整改说明和复核记录。'
    END AS alert_summary,
    CASE WHEN gs <= 14 AND gs > 8 THEN '集团风险联络人' ELSE format('风控专员%s', gs) END AS assigned_reviewer_name,
    TIMESTAMP '2026-04-04 09:00:00' + (gs || ' hours')::interval AS assigned_at,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN NULL
      WHEN gs % 3 = 1 THEN NULL
      ELSE format('风控专员%s', gs)
    END AS reviewer_name,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN ''
      WHEN gs % 3 = 0 THEN '建议补充风险说明后再归档。'
      WHEN gs % 3 = 2 THEN '审核确认该事项已形成完整风险回顾。'
      ELSE ''
    END AS review_result,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN ''
      WHEN gs % 3 = 0 THEN '请补充影响范围、原因分析和后续安排。'
      WHEN gs % 3 = 2 THEN '审核意见已记录，可进入下一步复核。'
      ELSE ''
    END AS review_comment,
    CASE
      WHEN gs <= 14 AND gs > 8 OR gs % 3 = 1 THEN NULL
      ELSE TIMESTAMP '2026-04-04 15:00:00' + (gs || ' hours')::interval
    END AS reviewed_at,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN ''
      WHEN (gs % 4) = 0 THEN '已退回补充回顾材料'
      WHEN (gs % 4) = 2 THEN '已提交阶段性回顾说明'
      WHEN (gs % 4) = 3 THEN '已完成补充说明和改进总结'
      ELSE ''
    END AS feedback_result,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN ''
      WHEN (gs % 4) = 0 THEN '请补充风险成因、影响范围和后续计划。'
      WHEN (gs % 4) = 2 THEN '责任单位已提交阶段性回顾材料。'
      WHEN (gs % 4) = 3 THEN '责任单位已形成完整的风险回顾和改进说明。'
      ELSE ''
    END AS feedback_comment,
    CASE
      WHEN gs <= 14 AND gs > 8 OR (gs % 4) = 1 THEN ''
      ELSE CASE (gs % 4)
        WHEN 1 THEN ''
        WHEN 2 THEN CASE (gs % 4)
          WHEN 1 THEN '青岛海发园区运营有限公司'
          WHEN 2 THEN '青岛海发资本管理有限公司'
          WHEN 3 THEN '青岛海发产业服务有限公司'
          ELSE '青岛海发产城投资有限公司'
        END
        WHEN 3 THEN CASE (gs % 4)
          WHEN 1 THEN '青岛海发园区运营有限公司'
          WHEN 2 THEN '青岛海发资本管理有限公司'
          WHEN 3 THEN '青岛海发产业服务有限公司'
          ELSE '青岛海发产城投资有限公司'
        END
        ELSE format('风控专员%s', gs)
      END
    END AS feedback_operator_name,
    CASE
      WHEN gs <= 14 AND gs > 8 OR (gs % 4) = 1 THEN NULL
      ELSE TIMESTAMP '2026-04-04 13:00:00' + (gs || ' hours')::interval
    END AS feedback_at,
    CASE
      WHEN gs <= 14 AND gs > 8 OR (gs % 3) = 1 THEN ''
      WHEN (gs % 3) = 2 THEN '复核确认说明完整'
      ELSE '需补充复核说明'
    END AS recheck_result,
    CASE
      WHEN gs <= 14 AND gs > 8 OR (gs % 3) = 1 THEN ''
      WHEN (gs % 3) = 2 THEN '复核后确认可以作为阶段总结归档。'
      ELSE '请补充后续跟踪结果和制度改进说明。'
    END AS recheck_comment,
    CASE
      WHEN gs <= 14 AND gs > 8 OR (gs % 3) = 1 THEN ''
      ELSE '海发集团风控复核人'
    END AS recheck_operator_name,
    CASE
      WHEN gs <= 14 AND gs > 8 OR (gs % 3) = 1 THEN NULL
      ELSE TIMESTAMP '2026-04-04 17:00:00' + (gs || ' hours')::interval
    END AS rechecked_at,
    CASE WHEN gs > 8 AND gs <= 14 AND gs % 3 <> 0 THEN '集团本部风险联系人' ELSE '' END AS ack_operator_name,
    CASE WHEN gs > 8 AND gs <= 14 AND gs % 3 <> 0 THEN '已阅知并纳入近期风险提示学习。' ELSE '' END AS ack_comment,
    CASE WHEN gs > 8 AND gs <= 14 AND gs % 3 <> 0 THEN TIMESTAMP '2026-04-04 11:00:00' + (gs || ' hours')::interval ELSE NULL END AS ack_at,
    TIMESTAMP '2026-04-04 09:00:00' + (gs || ' hours')::interval AS created_at,
    TIMESTAMP '2026-04-04 09:00:00' + (gs || ' hours')::interval AS updated_at
  FROM generate_series(1, 20) AS t(gs)
)
INSERT INTO terror_alerts (
  id,
  alert_no,
  job_id,
  rule_id,
  rule_code,
  rule_name,
  risk_level,
  alert_status,
  review_status,
  ticket_type,
  trigger_source,
  dispatch_status,
  feedback_status,
  recheck_status,
  ack_status,
  ticket_title,
  ticket_reason,
  ticket_content,
  source_ref_type,
  source_ref_id,
  leader_instruction_flag,
  continuous_warning_count,
  deadline_at,
  completed_at,
  is_overdue,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  transaction_date,
  matched_amount,
  matched_count,
  evidence_count,
  latest_evidence_summary,
  alert_summary,
  extra_payload,
  created_at,
  updated_at
)
SELECT
  id,
  alert_no,
  job_id,
  rule_id,
  rule_code,
  rule_name,
  risk_level,
  alert_status,
  review_status,
  ticket_type,
  trigger_source,
  dispatch_status,
  feedback_status,
  recheck_status,
  ack_status,
  ticket_title,
  ticket_reason,
  ticket_content,
  source_ref_type,
  source_ref_id,
  leader_instruction_flag,
  continuous_warning_count,
  deadline_at,
  completed_at,
  is_overdue,
  member_unit_code,
  member_unit_name,
  payer_name,
  payer_account,
  payee_name,
  payee_account,
  transaction_date,
  matched_amount,
  matched_count,
  evidence_count,
  latest_evidence_summary,
  alert_summary,
  jsonb_build_object(
    'ticket_type', ticket_type,
    'trigger_source', trigger_source,
    'ticket_title', ticket_title,
    'ticket_reason', ticket_reason,
    'ticket_content', ticket_content,
    'dispatch_status', dispatch_status,
    'feedback_status', feedback_status,
    'recheck_status', recheck_status,
    'deadline_at', deadline_at,
    'is_overdue', is_overdue,
    'continuous_warning_count', continuous_warning_count,
    'source_ref_type', source_ref_type,
    'source_ref_id', source_ref_id,
    'feedback', jsonb_build_object(
      'feedback_status', feedback_status,
      'feedback_result', feedback_result,
      'feedback_comment', feedback_comment,
      'operator_name', feedback_operator_name,
      'feedback_at', feedback_at
    ),
    'recheck', jsonb_build_object(
      'recheck_status', recheck_status,
      'recheck_result', recheck_result,
      'recheck_comment', recheck_comment,
      'operator_name', recheck_operator_name,
      'rechecked_at', rechecked_at
    ),
    'ack_records', CASE
      WHEN ack_operator_name <> '' THEN jsonb_build_array(
        jsonb_build_object(
          'ack_status', 'read',
          'operator_name', ack_operator_name,
          'ack_comment', ack_comment,
          'ack_at', ack_at
        )
      )
      ELSE '[]'::jsonb
    END,
    'flow_logs',
      jsonb_build_array(
        jsonb_build_object(
          'action_type', 'dispatch',
          'action_result', 'completed',
          'action_comment', '已完成单据派发，进入后续回顾说明流程。',
          'operator_name', '系统',
          'created_at', created_at
        )
      )
      || CASE
        WHEN ack_operator_name <> '' THEN jsonb_build_array(
          jsonb_build_object(
            'action_type', 'ack',
            'action_result', 'read',
            'action_comment', ack_comment,
            'operator_name', ack_operator_name,
            'created_at', ack_at
          )
        )
        ELSE '[]'::jsonb
      END
      || CASE
        WHEN feedback_status <> 'pending' AND ticket_type <> 'risk_tip' THEN jsonb_build_array(
          jsonb_build_object(
            'action_type', 'feedback',
            'action_result', feedback_status,
            'action_comment', feedback_comment,
            'operator_name', feedback_operator_name,
            'created_at', feedback_at
          )
        )
        ELSE '[]'::jsonb
      END
      || CASE
        WHEN review_status <> 'pending' AND ticket_type <> 'risk_tip' THEN jsonb_build_array(
          jsonb_build_object(
            'action_type', 'review',
            'action_result', review_status,
            'action_comment', review_comment,
            'operator_name', reviewer_name,
            'created_at', reviewed_at
          )
        )
        ELSE '[]'::jsonb
      END
      || CASE
        WHEN recheck_status <> 'pending' AND ticket_type <> 'risk_tip' THEN jsonb_build_array(
          jsonb_build_object(
            'action_type', 'recheck',
            'action_result', recheck_status,
            'action_comment', recheck_comment,
            'operator_name', recheck_operator_name,
            'created_at', rechecked_at
          )
        )
        ELSE '[]'::jsonb
      END
      || CASE
        WHEN is_overdue THEN jsonb_build_array(
          jsonb_build_object(
            'action_type', 'overdue',
            'action_result', 'triggered',
            'action_comment', '已记录逾期情况，继续纳入督办跟踪。',
            'operator_name', '系统',
            'created_at', deadline_at
          )
        )
        ELSE '[]'::jsonb
      END,
    'related_transactions', CASE
      WHEN transaction_date IS NULL THEN '[]'::jsonb
      ELSE jsonb_build_array(
        jsonb_build_object(
          'transaction_no', format('TX-EXTRA-%s', lpad(seq::text, 3, '0')),
          'transaction_date', transaction_date,
          'amount', matched_amount,
          'payer_name', payer_name,
          'payee_name', payee_name,
          'business_scenario', '风险事项回顾说明'
        )
      )
    END
  ),
  created_at,
  updated_at
FROM extra_tickets
ON CONFLICT (id) DO NOTHING;

WITH extra_tickets AS (
  SELECT
    gs AS seq,
    uuid_generate_v5(uuid_ns_url(), format('risk-ticket-extra-%s', gs)) AS alert_id,
    CASE
      WHEN gs <= 8 THEN CASE (gs % 3)
        WHEN 0 THEN 'rejected'
        WHEN 1 THEN 'pending'
        ELSE 'approved'
      END
      WHEN gs <= 14 THEN 'pending'
      ELSE CASE (gs % 3)
        WHEN 1 THEN 'pending'
        ELSE 'approved'
      END
    END AS review_status,
    CASE WHEN gs <= 14 AND gs > 8 THEN 'assigned' ELSE 'assigned' END AS assignment_status,
    CASE WHEN gs <= 14 AND gs > 8 THEN '集团风险联络人' ELSE format('风控专员%s', gs) END AS assigned_reviewer_name,
    TIMESTAMP '2026-04-04 09:00:00' + (gs || ' hours')::interval AS assigned_at,
    CASE
      WHEN gs <= 14 AND gs > 8 OR gs % 3 = 1 THEN NULL
      ELSE format('风控专员%s', gs)
    END AS reviewer_name,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN NULL
      WHEN gs % 3 = 0 THEN '建议补充回顾说明后归档。'
      WHEN gs % 3 = 2 THEN '审核确认该事项回顾内容完整。'
      ELSE NULL
    END AS review_result,
    CASE
      WHEN gs <= 14 AND gs > 8 THEN NULL
      WHEN gs % 3 = 0 THEN '请补充复盘材料、影响范围和改进安排。'
      WHEN gs % 3 = 2 THEN '审核意见已确认，可转入下一步复核。'
      ELSE NULL
    END AS review_comment,
    CASE
      WHEN gs <= 14 AND gs > 8 OR gs % 3 = 1 THEN NULL
      ELSE TIMESTAMP '2026-04-04 15:00:00' + (gs || ' hours')::interval
    END AS reviewed_at,
    TIMESTAMP '2026-04-04 09:00:00' + (gs || ' hours')::interval AS created_at,
    TIMESTAMP '2026-04-04 09:00:00' + (gs || ' hours')::interval AS updated_at
  FROM generate_series(1, 20) AS t(gs)
)
INSERT INTO terror_alert_reviews (
  id,
  alert_id,
  review_status,
  reviewer_name,
  review_result,
  review_comment,
  reviewed_at,
  assignment_status,
  assigned_reviewer_name,
  assigned_at,
  created_by,
  updated_by,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v5(uuid_ns_url(), format('risk-ticket-extra-review-%s', seq)),
  alert_id,
  review_status,
  reviewer_name,
  review_result,
  review_comment,
  reviewed_at,
  assignment_status,
  assigned_reviewer_name,
  assigned_at,
  'demo',
  'demo',
  created_at,
  updated_at
FROM extra_tickets
ON CONFLICT (id) DO NOTHING;

WITH extra_tickets AS (
  SELECT
    gs AS seq,
    uuid_generate_v5(uuid_ns_url(), format('risk-ticket-extra-%s', gs)) AS alert_id,
    CASE
      WHEN gs <= 8 THEN 'warning_notice'
      WHEN gs <= 14 THEN 'risk_tip'
      ELSE 'supervision'
    END AS ticket_type,
    CASE
      WHEN gs <= 8 THEN CASE ((gs - 1) % 3)
        WHEN 1 THEN 'audit_rectification'
        WHEN 2 THEN 'leader_instruction'
        ELSE 'model_threshold'
      END
      WHEN gs <= 14 THEN CASE (gs % 2)
        WHEN 0 THEN 'typical_event'
        ELSE 'trend_change'
      END
      ELSE CASE (gs % 2)
        WHEN 0 THEN 'rectification_overdue'
        ELSE 'three_consecutive_warnings'
      END
    END AS trigger_source,
    TIMESTAMP '2026-04-04 09:00:00' + (gs || ' hours')::interval AS created_at
  FROM generate_series(1, 20) AS t(gs)
)
INSERT INTO terror_alert_evidences (
  id,
  alert_id,
  evidence_type,
  evidence_title,
  evidence_detail,
  evidence_payload,
  evidence_order,
  created_at,
  updated_at
)
SELECT
  uuid_generate_v5(uuid_ns_url(), format('risk-ticket-extra-evidence-%s', seq)),
  alert_id,
  trigger_source,
  CASE
    WHEN ticket_type = 'warning_notice' THEN '风险事项回顾依据'
    WHEN ticket_type = 'risk_tip' THEN '提示事项来源'
    ELSE '督办事项依据'
  END,
  CASE
    WHEN ticket_type = 'warning_notice' THEN '结合近期识别结果和管理反馈，形成事后风险回顾与说明。'
    WHEN ticket_type = 'risk_tip' THEN '结合近期风险趋势或典型事件，形成提示与阅知说明。'
    ELSE '结合连续预警或整改逾期情况，形成督办跟踪与整改回顾。'
  END,
  jsonb_build_object(
    'ticket_type', ticket_type,
    'trigger_source', trigger_source,
    'note', '示例数据用于演示不同单据类型的回顾说明与跟踪流程'
  ),
  1,
  created_at,
  created_at
FROM extra_tickets
ON CONFLICT (id) DO NOTHING;

COMMIT;
