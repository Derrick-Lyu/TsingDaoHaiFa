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
