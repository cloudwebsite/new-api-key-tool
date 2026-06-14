import React from 'react';
import {
  Button,
  Card,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import { IconCopy } from '@douyinfe/semi-icons';
import {
  PricingGroupList,
  PricingModelTypeTag,
  PricingQuotaTypeTag,
  PricingTagList,
} from './PricingSharedRenderers';
import PricingDetailSectionHeader from './PricingDetailSectionHeader';

const { Text } = Typography;

const PricingDetailBasicInfoSection = ({
  model,
  copyText,
  autoGroupChain,
  usableGroups,
  children,
}) => {
  if (!model) {
    return null;
  }

  const endpointCount = Array.isArray(model.supported_endpoint_types)
    ? model.supported_endpoint_types.length
    : 0;
  const groupCount = Array.isArray(model.enable_groups) ? model.enable_groups.length : 0;
  const tagCount = model.tags
    ? String(model.tags).split(',').map((item) => item.trim()).filter(Boolean).length
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card
        className="pricing-model-detail-hero"
        bordered={false}
        style={{
          background: 'linear-gradient(135deg, #eff6ff, #ffffff 58%, #eef2ff)',
          border: '1px solid rgba(99, 102, 241, 0.14)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 16px 34px rgba(59, 130, 246, 0.08)',
        }}
        bodyStyle={{ padding: 18 }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 14, minWidth: 0, flex: 1 }}>
              <div
                className="pricing-model-detail-avatar"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                  boxShadow: '0 14px 30px rgba(59, 130, 246, 0.22)',
                }}
              >
                {String(model.model_name || '?').slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="pricing-model-header-tags" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Text strong className="pricing-model-title pricing-model-title-lg" style={{ fontSize: 22, lineHeight: '30px', wordBreak: 'break-word' }}>
                    {model.model_name}
                  </Text>
                  <PricingQuotaTypeTag value={model.quota_type} />
                  <PricingModelTypeTag value={model.model_type} />
                  {model.vendor_name && model.vendor_name !== '-' ? (
                    <Tag color="white">{model.vendor_name}</Tag>
                  ) : null}
                </div>
                <div className="pricing-model-header-stats" style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Tag className="pricing-model-card-stat-tag" color="blue" style={{ marginRight: 0 }}>
                    API端点 {endpointCount}
                  </Tag>
                  <Tag className="pricing-model-card-stat-tag pricing-model-card-stat-tag-green" color="green" style={{ marginRight: 0 }}>
                    适用分组 {groupCount}
                  </Tag>
                  {model.tags ? (
                    <Tag className="pricing-model-card-stat-tag pricing-model-card-stat-tag-grey" color="grey" style={{ marginRight: 0 }}>
                      标签 {tagCount}
                    </Tag>
                  ) : null}
                </div>
              </div>
            </div>
            <Button
              className="pricing-copy-button"
              icon={<IconCopy />}
              theme="light"
              type="tertiary"
              onClick={() => copyText(model.model_name)}
            >
              复制
            </Button>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.78)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              borderRadius: 14,
              padding: 14,
            }}
          >
            <Text type="secondary" size="small">模型描述</Text>
            <div
              style={{
                marginTop: 8,
                lineHeight: 1.8,
                wordBreak: 'break-word',
                color: 'var(--semi-color-text-0)',
              }}
            >
              {model.description || '暂无描述'}
            </div>
          </div>
        </div>
      </Card>

      {children}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <div>
          <PricingDetailSectionHeader
            title="适用分组"
            subtitle="当前模型可用的分组范围"
            startColor="#22c55e"
            endColor="#16a34a"
          />
          <div
            style={{
              marginTop: 12,
              background: '#ffffff',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              borderRadius: 14,
              padding: 14,
              minHeight: 92,
            }}
          >
            <PricingGroupList value={model.enable_groups} />
          </div>
        </div>
        <div>
          <PricingDetailSectionHeader
            title="标签"
            subtitle="当前模型的能力与用途标签"
            startColor="#64748b"
            endColor="#475569"
          />
          <div
            style={{
              marginTop: 12,
              background: '#ffffff',
              border: '1px solid rgba(148, 163, 184, 0.16)',
              borderRadius: 14,
              padding: 14,
              minHeight: 92,
            }}
          >
            <PricingTagList value={model.tags} />
          </div>
        </div>
      </div>

      <div>
        <PricingDetailSectionHeader
          title="auto分组调用链路"
          subtitle="按 auto 分组命中的顺序展示当前模型可能走到的调用链路"
          startColor="#8b5cf6"
          endColor="#6366f1"
        />
        <div style={{ marginTop: 12 }}>
          {autoGroupChain.length > 0 ? (
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(180deg, #f8fafc, #ffffff)',
                border: '1px solid rgba(148, 163, 184, 0.14)',
                borderRadius: 14,
              }}
              bodyStyle={{ padding: 16 }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {autoGroupChain.map((group, index) => (
                  <div
                    key={group}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px minmax(0, 1fr)',
                      gap: 12,
                      alignItems: 'start',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minHeight: index < autoGroupChain.length - 1 ? 72 : 36,
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#4f46e5',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {index + 1}
                      </div>
                      {index < autoGroupChain.length - 1 ? (
                        <div
                          style={{
                            width: 2,
                            flex: 1,
                            marginTop: 6,
                            borderRadius: 999,
                            background: 'linear-gradient(180deg, rgba(129, 140, 248, 0.6), rgba(203, 213, 225, 0.9))',
                          }}
                        />
                      ) : null}
                    </div>
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid rgba(148, 163, 184, 0.16)',
                        borderRadius: 12,
                        padding: '10px 12px',
                        marginBottom: index < autoGroupChain.length - 1 ? 12 : 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Tag color="blue" style={{ width: 'fit-content', marginRight: 0 }}>
                          {group}
                        </Tag>
                        <Text type="tertiary" size="small">
                          第 {index + 1} 跳
                        </Text>
                      </div>
                      {usableGroups[group] ? (
                        <Text type="secondary" size="small" style={{ lineHeight: 1.7 }}>
                          {usableGroups[group]}
                        </Text>
                      ) : (
                        <Text type="tertiary" size="small">
                          当前分组暂无额外说明
                        </Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Text type="secondary">当前模型没有可展示的 auto 分组链路</Text>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingDetailBasicInfoSection;
