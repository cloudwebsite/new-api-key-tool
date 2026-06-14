import React from 'react';
import {
  Button,
  Card,
  Empty,
  Pagination,
  Space,
  Spin,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import { IconCopy } from '@douyinfe/semi-icons';
import PricingPriceSummary from './PricingPriceSummary';
import { formatNumber } from '../pricingUtils';
import {
  PricingModelTypeTag,
  PricingQuotaTypeTag,
  parseListValue,
} from './PricingSharedRenderers';

const { Text } = Typography;

const CARD_META_TAG_STYLES = [
  {
    background: 'rgba(37, 99, 235, 0.1)',
    color: '#1d4ed8',
    border: '1px solid rgba(37, 99, 235, 0.16)',
  },
  {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#047857',
    border: '1px solid rgba(16, 185, 129, 0.16)',
  },
  {
    background: 'rgba(139, 92, 246, 0.1)',
    color: '#6d28d9',
    border: '1px solid rgba(139, 92, 246, 0.16)',
  },
  {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#b45309',
    border: '1px solid rgba(245, 158, 11, 0.16)',
  },
  {
    background: 'rgba(236, 72, 153, 0.1)',
    color: '#be185d',
    border: '1px solid rgba(236, 72, 153, 0.16)',
  },
];

const renderCardMetaTags = (vendorName, tagsValue) => {
  const tags = parseListValue(tagsValue);

  if ((!vendorName || vendorName === '-') && tags.length === 0) {
    return null;
  }

  let colorIndex = 0;
  const getNextStyle = () => {
    const style = CARD_META_TAG_STYLES[colorIndex % CARD_META_TAG_STYLES.length];
    colorIndex += 1;
    return style;
  };

  return (
    <Space wrap>
      {vendorName && vendorName !== '-' ? (
        <Tag style={{ marginRight: 0, ...getNextStyle() }}>
          {vendorName}
        </Tag>
      ) : null}
      {tags.map((tag) => (
        <Tag key={tag} style={{ marginRight: 0, ...getNextStyle() }}>
          {tag}
        </Tag>
      ))}
    </Space>
  );
};

const PricingCardView = ({
  models,
  totalCount,
  loading,
  pageSize,
  currentPage,
  setCurrentPage,
  setPageSize,
  copyText,
  onOpenModel,
  selectedGroup,
  showRatio,
}) => {
  if (loading) {
    return (
      <Spin spinning={loading} style={{ width: '100%' }}>
        <div style={{ minHeight: 240 }} />
      </Spin>
    );
  }

  if (models.length === 0) {
    return (
      <Empty
        description="暂无模型定价数据"
        style={{ padding: 32 }}
      />
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {models.map((model) => (
          <Card
            key={model.key}
            className="pricing-model-card"
            shadows="hover"
            style={{
              borderRadius: 18,
              border: '1px solid rgba(99, 102, 241, 0.12)',
              background: 'linear-gradient(135deg, var(--semi-color-primary-light-default), var(--semi-color-bg-1))',
              height: '100%',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
            bodyStyle={{ height: '100%', padding: 18 }}
            onClick={() => onOpenModel(model)}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, minWidth: 0, flex: 1 }}>
                  <div
                    className="pricing-model-card-avatar"
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 15,
                      fontWeight: 700,
                      flexShrink: 0,
                      boxShadow: '0 12px 24px rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    {String(model.model_name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      className="pricing-model-card-head-tags pricing-model-header-tags"
                      style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                    >
                      <Text
                        strong
                        className="pricing-model-title"
                        style={{
                          fontSize: 18,
                          lineHeight: '26px',
                          wordBreak: 'break-word',
                        }}
                      >
                        {model.model_name}
                      </Text>
                      <PricingQuotaTypeTag value={model.quota_type} />
                      <PricingModelTypeTag value={model.model_type} />
                    </div>
                    <div
                      className="pricing-model-card-meta-tags"
                      style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}
                    >
                      {renderCardMetaTags(model.vendor_name, model.tags)}
                    </div>
                  </div>
                </div>
                <Button
                  className="pricing-copy-button"
                  icon={<IconCopy />}
                  theme="light"
                  type="tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyText(model.model_name);
                  }}
                >
                  复制
                </Button>
              </div>

              <div
                className="pricing-model-card-desc"
                style={{
                  color: 'var(--semi-color-text-1)',
                  background: 'rgba(255, 255, 255, 0.62)',
                  border: '1px solid rgba(255, 255, 255, 0.72)',
                  borderRadius: 14,
                  padding: 14,
                  minHeight: 78,
                  flex: 1,
                  lineHeight: 1.7,
                  wordBreak: 'break-word',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                }}
              >
                <Text type="secondary" size="small">模型描述</Text>
                <div
                  style={{
                    marginTop: 8,
                    color: 'var(--semi-color-text-0)',
                  }}
                >
                  {model.description || '暂无描述'}
                </div>
              </div>

              {model.displayPricing ? (
                <div
                  className="pricing-model-card-price"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.88), var(--semi-color-fill-0))',
                    border: '1px solid rgba(99, 102, 241, 0.1)',
                    borderRadius: 14,
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginTop: 'auto',
                    boxShadow: '0 10px 24px rgba(99, 102, 241, 0.08)',
                  }}
                >
                  <PricingPriceSummary
                    pricingInfo={model.displayPricing}
                    selectedGroup={selectedGroup}
                    variant="subtle"
                  />
                  {showRatio ? (
                    <div
                      style={{
                        marginTop: 4,
                        paddingTop: 8,
                        borderTop: '1px dashed rgba(99, 102, 241, 0.15)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 8,
                      }}
                    >
                      <Text type="secondary" size="small">
                        模型：{Number(model.quota_type) === 0 ? formatNumber(model.model_ratio) : '无'}
                      </Text>
                      <Text type="secondary" size="small">
                        补全：{Number(model.quota_type) === 0 ? formatNumber(model.completion_ratio) : '无'}
                      </Text>
                      <Text type="secondary" size="small">
                        分组：{formatNumber(model.displayPricing?.ratio)}
                      </Text>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          total={totalCount}
          showSizeChanger
          pageSizeOptions={[10, 20, 50, 100]}
          onPageChange={(page) => setCurrentPage(page)}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default PricingCardView;
