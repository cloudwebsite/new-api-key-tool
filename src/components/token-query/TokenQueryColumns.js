import React from 'react';
import { Space, Tag, Tooltip } from '@douyinfe/semi-ui';
import Paragraph from '@douyinfe/semi-ui/lib/es/typography/paragraph';
import { stringToColor } from '../../helpers/render';
import { renderModelPrice, renderQuota } from '../../helpers/render';
import {
  renderIsStream,
  renderTimestamp,
  renderUseTime,
} from './TokenQueryFormatters';

const PLACEHOLDER = '-';

function isMjModel(modelName) {
  return `${modelName || ''}`.startsWith('mj_');
}

function hasDisplayValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function renderType(type) {
  switch (type) {
    case 1:
      return (
        <Tag color="cyan" shape="circle">
          充值
        </Tag>
      );
    case 2:
      return (
        <Tag color="lime" shape="circle">
          消费
        </Tag>
      );
    case 3:
      return (
        <Tag color="orange" shape="circle">
          管理
        </Tag>
      );
    case 4:
      return (
        <Tag color="purple" shape="circle">
          系统
        </Tag>
      );
    case 5:
      return (
        <Tag color="red" shape="circle">
          错误
        </Tag>
      );
    case 6:
      return (
        <Tag color="teal" shape="circle">
          退款
        </Tag>
      );
    default:
      return (
        <Tag color="grey" shape="circle">
          未知
        </Tag>
      );
  }
}

const createTokenQueryColumns = ({ copyText }) => [
  {
    title: '时间',
    dataIndex: 'created_at',
    render: (text) => (text ? renderTimestamp(text) : PLACEHOLDER),
    sorter: (a, b) => a.created_at - b.created_at,
  },
  {
    title: '类型',
    dataIndex: 'type',
    render: (text) => renderType(text),
    sorter: (a, b) => (a.type ?? 0) - (b.type ?? 0),
  },
  {
    title: '模型',
    dataIndex: 'model_name',
    render: (text, record) => (
      text && !isMjModel(record.model_name) ? (
        <div>
          <Tag
            color={stringToColor(text)}
            size="large"
            onClick={() => {
              copyText(text);
            }}
          >
            {' '}
            {text}{' '}
          </Tag>
        </div>
      ) : PLACEHOLDER
    ),
    sorter: (a, b) => (`${a.model_name || ''}`).localeCompare(b.model_name),
  },
  {
    title: '用时',
    dataIndex: 'use_time',
    render: (text, record) => (
      isMjModel(record.model_name) ? PLACEHOLDER : (
        <div>
          <Space>
            {text === undefined || text === null ? PLACEHOLDER : renderUseTime(text)}
            {renderIsStream(record.is_stream)}
          </Space>
        </div>
      )
    ),
    sorter: (a, b) => a.use_time - b.use_time,
  },
  {
    title: '提示',
    dataIndex: 'prompt_tokens',
    render: (text, record) => (
      isMjModel(record.model_name) ? PLACEHOLDER : (
        <div><span> {hasDisplayValue(text) ? text : PLACEHOLDER} </span></div>
      )
    ),
    sorter: (a, b) => a.prompt_tokens - b.prompt_tokens,
  },
  {
    title: '补全',
    dataIndex: 'completion_tokens',
    render: (text, record) => (
      isMjModel(record.model_name) ? PLACEHOLDER : (
        <div><span> {hasDisplayValue(text) ? text : PLACEHOLDER} </span></div>
      )
    ),
    sorter: (a, b) => a.completion_tokens - b.completion_tokens,
  },
  {
    title: '花费',
    dataIndex: 'quota',
    render: (text, record) => (
      isMjModel(record.model_name) || !hasDisplayValue(text)
        ? PLACEHOLDER
        : <div>{renderQuota(text, 6)}</div>
    ),
    sorter: (a, b) => a.quota - b.quota,
  },
  {
    title: '详情',
    dataIndex: 'content',
    render: (text, record) => {
      const displayText =
        text || (record.type === 5 ? '请求失败,如果多次出现，请排查模型是否下架' : PLACEHOLDER);
      let other = null;
      try {
        if (record.other === '') {
          record.other = '{}';
        }
        other = JSON.parse(record.other);
      } catch (e) {
        return (
          <Tooltip content="该版本不支持显示计算详情">
            <Paragraph
              ellipsis={{
                rows: 2,
              }}
            >
              {displayText}
            </Paragraph>
          </Tooltip>
        );
      }
      if (other == null) {
        return (
          <Paragraph
            ellipsis={{
              rows: 2,
              showTooltip: {
                type: 'popover',
              },
            }}
          >
            {displayText}
          </Paragraph>
        );
      }
      if (record.type !== 2) {
        return (
          <Paragraph
            ellipsis={{
              rows: 2,
              showTooltip: {
                type: 'popover',
              },
            }}
          >
            {displayText}
          </Paragraph>
        );
      }
      const content = renderModelPrice(
        record.prompt_tokens,
        record.completion_tokens,
        other.model_ratio,
        other.model_price,
        other.completion_ratio,
        other.group_ratio,
      );
      return (
        <Tooltip content={content}>
          <Paragraph
            ellipsis={{
              rows: 2,
            }}
          >
            {displayText}
          </Paragraph>
        </Tooltip>
      );
    },
  },
];

export default createTokenQueryColumns;
