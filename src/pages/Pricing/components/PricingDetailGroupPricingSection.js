import React from 'react';
import {
  Button,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IconChevronDown,
  IconChevronUp,
} from '@douyinfe/semi-icons';
import { formatNumber } from '../pricingUtils';
import { renderPriceSummaryGroup } from './PricingPriceSummary';
import PricingDetailSectionHeader from './PricingDetailSectionHeader';
import { PricingQuotaTypeTag } from './PricingSharedRenderers';

const { Text } = Typography;

const PricingDetailGroupPricingSection = ({
  items,
  visibleItems,
  expanded,
  onToggleExpanded,
  quotaType,
  showRatio,
}) => (
  <div>
    <PricingDetailSectionHeader
      title="分组价格"
      subtitle="不同分组的价格信息"
      startColor="#10b981"
      endColor="#059669"
      action={items.length > 3 ? (
        <Button
          theme="borderless"
          type="tertiary"
          size="small"
          icon={expanded ? <IconChevronUp /> : <IconChevronDown />}
          onClick={onToggleExpanded}
        >
          {expanded ? '收起分组' : `展开全部 ${items.length} 个分组`}
        </Button>
      ) : null}
    />
    <div
      style={{
        marginTop: 12,
        border: '1px solid rgba(148, 163, 184, 0.16)',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#ffffff',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(140px, 1fr) minmax(110px, 140px) minmax(0, 2fr)',
          gap: 16,
          padding: '12px 16px',
          background: 'linear-gradient(180deg, #f8fafc, #f1f5f9)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.16)',
        }}
      >
        <Text strong>分组</Text>
        <Text strong>计费类型</Text>
        <Text strong>价格摘要</Text>
      </div>
      {visibleItems.map((item, index) => (
        <div
          key={item.group}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(140px, 1fr) minmax(110px, 140px) minmax(0, 2fr)',
            gap: 16,
            padding: '16px',
            alignItems: 'start',
            borderBottom: index < visibleItems.length - 1 ? '1px solid rgba(148, 163, 184, 0.16)' : 'none',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Tag color="green" style={{ width: 'fit-content' }}>{item.group}</Tag>
            {showRatio ? (
              <Text type="secondary" size="small">
                分组倍率 {formatNumber(item.ratio)}
              </Text>
            ) : null}
            {item.description ? (
              <Text type="tertiary" size="small" style={{ lineHeight: 1.6 }}>
                {item.description}
              </Text>
            ) : null}
          </div>
          <div style={{ paddingTop: 2 }}>
            <PricingQuotaTypeTag value={quotaType} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {renderPriceSummaryGroup(item.pricing)}
          </div>
        </div>
      ))}
      {!expanded && items.length > visibleItems.length ? (
        <div
          style={{
            padding: '12px 16px',
            background: 'rgba(34, 197, 94, 0.05)',
            borderTop: '1px dashed rgba(34, 197, 94, 0.16)',
          }}
        >
          <Text type="secondary" size="small">
            还有 {items.length - visibleItems.length} 个分组未展开显示
          </Text>
        </div>
      ) : null}
    </div>
  </div>
);

export default PricingDetailGroupPricingSection;
