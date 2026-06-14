import React from 'react';
import {
  Button,
  Card,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IconChevronDown,
  IconChevronUp,
  IconCopy,
} from '@douyinfe/semi-icons';
import PricingDetailSectionHeader from './PricingDetailSectionHeader';

const { Text } = Typography;

const ENDPOINT_META = {
  openai: {
    title: 'OpenAI',
    path: '/v1/chat/completions',
    method: 'POST',
    description: '兼容 OpenAI Chat Completions 调用格式',
    color: 'blue',
    symbol: 'OA',
    accentFrom: '#3b82f6',
    accentTo: '#2563eb',
  },
  'openai-response': {
    title: 'OpenAI Responses',
    path: '/v1/responses',
    method: 'POST',
    description: '兼容 OpenAI Responses 调用格式',
    color: 'indigo',
    symbol: 'OR',
    accentFrom: '#6366f1',
    accentTo: '#4338ca',
  },
  'openai-response-compact': {
    title: 'OpenAI Responses Compact',
    path: '/v1/responses/compact',
    method: 'POST',
    description: '紧凑版 Responses 接口',
    color: 'violet',
    symbol: 'OC',
    accentFrom: '#8b5cf6',
    accentTo: '#7c3aed',
  },
  anthropic: {
    title: 'Anthropic',
    path: '/v1/messages',
    method: 'POST',
    description: '兼容 Claude / Anthropic Messages 格式',
    color: 'green',
    symbol: 'AN',
    accentFrom: '#10b981',
    accentTo: '#059669',
  },
  gemini: {
    title: 'Gemini',
    path: '/v1beta/models/{model}:generateContent',
    method: 'POST',
    description: '兼容 Google Gemini generateContent 格式',
    color: 'amber',
    symbol: 'GM',
    accentFrom: '#f59e0b',
    accentTo: '#d97706',
  },
};

const renderEndpointAvatar = (type, info = {}) => {
  const label = String(info.symbol || info.title || type || '?').trim();
  const shortLabel = label.slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${info.accentFrom || '#6366f1'}, ${info.accentTo || '#3b82f6'})`,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
        boxShadow: `0 10px 20px ${info.accentFrom || '#6366f1'}33`,
      }}
    >
      {shortLabel}
    </div>
  );
};

const PricingDetailEndpointsSection = ({
  model,
  copyText,
  expanded,
  onToggleExpanded,
}) => {
  if (!model) {
    return null;
  }

  const endpoints = Array.isArray(model.supported_endpoint_types)
    ? model.supported_endpoint_types
    : [];
  const visibleEndpoints = expanded ? endpoints : endpoints.slice(0, 2);
  const hasMoreEndpoints = endpoints.length > 2;

  return (
    <div>
      <PricingDetailSectionHeader
        title="API端点"
        subtitle="模型支持的接口端点信息"
        startColor="#8b5cf6"
        endColor="#6366f1"
      />
      <div style={{ marginTop: 12 }}>
        {endpoints.length === 0 ? (
          <Text type="secondary">当前模型没有可展示的 API 端点</Text>
        ) : (
          <Card
            bordered={false}
            style={{
              background: 'linear-gradient(180deg, #f8fafc, #ffffff)',
              border: '1px solid rgba(148, 163, 184, 0.14)',
              borderRadius: 14,
            }}
            bodyStyle={{ padding: 16 }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text type="secondary" size="small">
                  共 {endpoints.length} 个可用端点
                </Text>
                {hasMoreEndpoints ? (
                  <Button
                    theme="borderless"
                    type="tertiary"
                    size="small"
                    icon={expanded ? <IconChevronUp /> : <IconChevronDown />}
                    onClick={onToggleExpanded}
                  >
                    {expanded ? '收起端点' : `展开全部 ${endpoints.length} 个端点`}
                  </Button>
                ) : null}
              </div>
              {visibleEndpoints.map((type) => {
                const key = String(type);
                const info = ENDPOINT_META[key] || {};
                const modelName = model.model_name || '';
                const pathTemplate = info.path || '';
                const finalPath = pathTemplate.includes('{model}')
                  ? pathTemplate.replaceAll('{model}', modelName)
                  : pathTemplate;

                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      background: '#ffffff',
                      border: '1px solid rgba(148, 163, 184, 0.16)',
                      borderRadius: 12,
                      padding: '12px 14px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      {renderEndpointAvatar(key, info)}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <Tag color={info.color || 'blue'} style={{ marginRight: 0 }}>
                            {info.title || key}
                          </Tag>
                          <Text strong>{key}</Text>
                          {info.method ? (
                            <Tag color="white" style={{ marginRight: 0 }}>
                              {info.method}
                            </Tag>
                          ) : null}
                        </div>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary" size="small">
                            {info.description || '当前端点类型已识别，但还没有内置的详细说明'}
                          </Text>
                        </div>
                      </div>
                    </div>
                    {finalPath ? (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid rgba(148, 163, 184, 0.14)',
                          borderRadius: 10,
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'Consolas, Monaco, monospace',
                            wordBreak: 'break-all',
                            color: 'var(--semi-color-text-0)',
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          {finalPath}
                        </div>
                        <Button
                          className="pricing-copy-button"
                          icon={<IconCopy />}
                          theme="borderless"
                          type="tertiary"
                          size="small"
                          onClick={() => copyText(finalPath)}
                        >
                          复制路径
                        </Button>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: '#f8fafc',
                          border: '1px solid rgba(148, 163, 184, 0.14)',
                          borderRadius: 10,
                          padding: '10px 12px',
                        }}
                      >
                        <Text type="tertiary" size="small" style={{ lineHeight: 1.7 }}>
                          当前端点暂无内置路径模板，你可以按 `{key}` 对应的协议自行补充接口地址。
                        </Text>
                      </div>
                    )}
                  </div>
                );
              })}
              {!expanded && hasMoreEndpoints ? (
                <div
                  style={{
                    borderRadius: 12,
                    padding: '10px 12px',
                    background: 'rgba(99, 102, 241, 0.06)',
                    border: '1px dashed rgba(99, 102, 241, 0.18)',
                  }}
                >
                  <Text type="secondary" size="small">
                    还有 {endpoints.length - visibleEndpoints.length} 个端点未展开显示
                  </Text>
                </div>
              ) : null}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PricingDetailEndpointsSection;
