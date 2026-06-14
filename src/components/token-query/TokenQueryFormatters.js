import React from 'react';
import { Tag } from '@douyinfe/semi-ui';
import { timestamp2string } from '../../helpers';

export function renderTimestamp(timestamp) {
  return timestamp2string(timestamp);
}

export function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function renderIsStream(bool) {
  if (bool) {
    return <Tag color="blue" size="large">流</Tag>;
  }
  return <Tag color="purple" size="large">非流</Tag>;
}

export function renderUseTime(type) {
  const time = parseInt(type, 10);
  if (time < 101) {
    return <Tag color="green" size="large"> {time} 秒 </Tag>;
  }
  if (time < 300) {
    return <Tag color="orange" size="large"> {time} 秒 </Tag>;
  }
  return <Tag color="red" size="large"> {time} 秒 </Tag>;
}

export function formatBalanceValue(value) {
  if (value === 100000000) {
    return '无限';
  }
  if (value === '未知' || value === undefined || value === null || Number.isNaN(Number(value))) {
    return '未知';
  }
  return Number(value).toFixed(3);
}

export function formatRemainingValue(balance, usage) {
  if (balance === 100000000) {
    return '无限制';
  }
  if (
    balance === '未知' ||
    usage === '未知' ||
    balance === undefined ||
    usage === undefined ||
    Number.isNaN(Number(balance)) ||
    Number.isNaN(Number(usage))
  ) {
    return '未知';
  }
  return (Number(balance) - Number(usage)).toFixed(3);
}

export function formatUsageValue(balance, usage) {
  if (balance === 100000000) {
    return '不进行计算';
  }
  if (usage === '未知' || usage === undefined || Number.isNaN(Number(usage))) {
    return '未知';
  }
  return Number(usage).toFixed(3);
}

export function formatAccessDate(accessdate) {
  if (accessdate === 0) {
    return '永不过期';
  }
  if (accessdate === '未知' || accessdate === undefined || accessdate === null) {
    return '未知';
  }
  return renderTimestamp(accessdate);
}

export function buildSummaryCards(activeTabData) {
  return [
    {
      label: '令牌总额',
      value: formatBalanceValue(activeTabData.balance),
      caption: '可复制完整令牌摘要',
    },
    {
      label: '剩余额度',
      value: formatRemainingValue(activeTabData.balance, activeTabData.usage),
      caption: activeTabData.tokenValid ? '按当前查询范围和总额计算' : '查询成功后展示',
    },
    {
      label: '已用额度',
      value: formatUsageValue(activeTabData.balance, activeTabData.usage),
      caption: '单位：美元',
    },
    {
      label: '有效期',
      value: formatAccessDate(activeTabData.accessdate),
      caption: activeTabData.tokenValid ? '来自订阅接口返回结果' : '未查询到有效期信息',
    },
  ];
}
