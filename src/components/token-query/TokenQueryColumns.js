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

const createTokenQueryColumns = ({ copyText }) => [
  {
    title: '时间',
    dataIndex: 'created_at',
    render: renderTimestamp,
    sorter: (a, b) => a.created_at - b.created_at,
  },
  {
    title: '模型',
    dataIndex: 'model_name',
    render: (text, record) => (
      record.type === 0 || record.type === 2 ? (
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
      ) : <></>
    ),
    sorter: (a, b) => (`${a.model_name || ''}`).localeCompare(b.model_name),
  },
  {
    title: '用时',
    dataIndex: 'use_time',
    render: (text, record) => (
      record.model_name.startsWith('mj_') ? null : (
        <div>
          <Space>
            {renderUseTime(text)}
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
      record.model_name.startsWith('mj_') ? null : (
        record.type === 0 || record.type === 2 ? <div><span> {text} </span></div> : <></>
      )
    ),
    sorter: (a, b) => a.prompt_tokens - b.prompt_tokens,
  },
  {
    title: '补全',
    dataIndex: 'completion_tokens',
    render: (text, record) => (
      parseInt(text, 10) > 0 && (record.type === 0 || record.type === 2) ? (
        <div><span> {text} </span></div>
      ) : <></>
    ),
    sorter: (a, b) => a.completion_tokens - b.completion_tokens,
  },
  {
    title: '花费',
    dataIndex: 'quota',
    render: (text, record) => (
      record.type === 0 || record.type === 2 ? <div>{renderQuota(text, 6)}</div> : <></>
    ),
    sorter: (a, b) => a.quota - b.quota,
  },
  {
    title: '详情',
    dataIndex: 'content',
    render: (text, record) => {
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
              {text}
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
            {text}
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
            {text}
          </Paragraph>
        </Tooltip>
      );
    },
  },
];

export default createTokenQueryColumns;
