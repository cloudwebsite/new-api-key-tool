import React from 'react';
import { Tag, Typography } from '@douyinfe/semi-ui';
import { formatNumber, getPricingGroupLabel } from '../pricingUtils';

const { Text } = Typography;

export const renderPriceSummaryItem = (label, value) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Text type="secondary">{label}</Text>
      <Text strong style={{ fontSize: 16 }}>
        {value}
      </Text>
    </div>
  );
};

export const renderPriceSummaryGroup = (pricing) => {
  if (!pricing) {
    return null;
  }
  if (pricing.isDynamicPricing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Tag color="amber" style={{ marginRight: 0 }}>
          动态计费
        </Tag>
        <Text type="secondary">{pricing.dynamicLabel}</Text>
      </div>
    );
  }
  if (pricing.billingType === '按次计费') {
    return renderPriceSummaryItem('固定价格', pricing.fixedPriceText);
  }
  return (
    <>
      {renderPriceSummaryItem('输入价格', pricing.inputPriceText)}
      {renderPriceSummaryItem('补全价格', pricing.completionPriceText)}
      {pricing.cacheHitPriceText
        ? renderPriceSummaryItem('缓存命中价格', pricing.cacheHitPriceText)
        : null}
    </>
  );
};

export const renderGroupLabel = (pricingInfo, selectedGroup = 'all') => {
  const label = getPricingGroupLabel(pricingInfo, selectedGroup);
  if (!label || !pricingInfo?.group) {
    return null;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <Text type="tertiary" size="small">
        {label}
      </Text>
      <Tag color={label === '展示分组' ? 'blue' : 'green'} size="small" style={{ marginRight: 0 }}>
        {pricingInfo.group}
      </Tag>
      <Text type="tertiary" size="small">
        当前展示倍率 {formatNumber(pricingInfo.ratio)}
      </Text>
    </div>
  );
};

const PricingPriceSummary = ({
  pricingInfo,
  selectedGroup = 'all',
  variant = 'default',
}) => {
  const pricing = pricingInfo?.pricing;
  if (!pricing) {
    return '-';
  }

  const background =
    variant === 'subtle'
      ? 'var(--semi-color-fill-0)'
      : 'linear-gradient(135deg, var(--semi-color-primary-light-default), var(--semi-color-fill-0))';
  const minWidth = pricing.billingType === '按次计费' ? 140 : 180;

  return (
    <div
      className="pricing-table-price"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 6,
        background,
        borderRadius: 12,
        padding: '10px 12px',
        width: '100%',
        minWidth,
      }}
    >
      {renderGroupLabel(pricingInfo, selectedGroup)}
      {renderPriceSummaryGroup(pricing)}
    </div>
  );
};

export default PricingPriceSummary;
