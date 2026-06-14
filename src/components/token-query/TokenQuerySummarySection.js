import React from 'react';
import { Button, Card, Typography } from '@douyinfe/semi-ui';
import { IconCopy } from '@douyinfe/semi-icons';
import { buildSummaryCards } from './TokenQueryFormatters';

const { Text } = Typography;

const TokenQuerySummarySection = ({
  enabled,
  activeTabData,
  copyTokenInfo,
}) => {
  if (!enabled) {
    return null;
  }

  const summaryCards = buildSummaryCards(activeTabData);

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
          flexWrap: 'wrap',
        }}
      >
        <Text strong style={{ fontSize: 16 }}>令牌信息概览</Text>
        <Button
          icon={<IconCopy />}
          theme="light"
          type="primary"
          onClick={copyTokenInfo}
          disabled={!activeTabData.tokenValid}
        >
          复制令牌信息
        </Button>
      </div>
      <div className="token-query-summary-grid" style={{ marginTop: 0 }}>
        {summaryCards.map((item) => (
          <Card
            key={item.label}
            className="token-query-summary-card"
            bordered={false}
            bodyStyle={{ padding: 18 }}
          >
            <Text type="tertiary" size="small">{item.label}</Text>
            <div className="token-query-summary-card__value">{item.value}</div>
            <Text type="secondary" size="small">{item.caption}</Text>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TokenQuerySummarySection;
