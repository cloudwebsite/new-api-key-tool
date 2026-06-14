import React from 'react';
import { Typography } from '@douyinfe/semi-ui';

const { Text } = Typography;

const PricingDetailSectionHeader = ({
  title,
  subtitle,
  startColor = '#6366f1',
  endColor = '#3b82f6',
  action = null,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${startColor}, ${endColor})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: `0 10px 20px ${startColor}33`,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.96)',
          }}
        />
      </div>
      <div style={{ minWidth: 0 }}>
        <Text strong style={{ fontSize: 16 }}>{title}</Text>
        {subtitle ? (
          <div style={{ marginTop: 2 }}>
            <Text type="secondary" size="small">{subtitle}</Text>
          </div>
        ) : null}
      </div>
    </div>
    {action}
  </div>
);

export default PricingDetailSectionHeader;
