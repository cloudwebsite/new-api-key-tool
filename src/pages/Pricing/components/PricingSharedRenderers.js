import React from 'react';
import {
  Tag,
  Tooltip,
} from '@douyinfe/semi-ui';

export const truncateText = (value, maxLength = 15) => {
  const text = String(value || '');
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};

export const parseListValue = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

export const PricingQuotaTypeTag = ({ value }) => {
  if (Number(value) === 1) {
    return <Tag color="teal">按次计费</Tag>;
  }
  if (Number(value) === 0) {
    return <Tag color="violet">按量计费</Tag>;
  }
  return '-';
};

export const PricingModelTypeTag = ({ value }) => {
  if (!value) {
    return null;
  }
  return <Tag color="cyan" size="small">{value}</Tag>;
};

export const PricingTagList = ({
  value,
  empty = '-',
  color,
  size = 'small',
}) => {
  const tags = parseListValue(value);
  if (tags.length === 0) {
    return empty;
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {tags.map((tag) => (
        <Tag key={tag} color={color} size={size}>
          {tag}
        </Tag>
      ))}
    </div>
  );
};

export const PricingGroupList = ({
  value,
  color = 'green',
  empty = '-',
}) => {
  if (!Array.isArray(value) || value.length === 0) {
    return empty;
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {value.map((item) => (
        <Tag key={item} size="small" color={color}>
          {item}
        </Tag>
      ))}
    </div>
  );
};

export const PricingEndpointList = ({ value, empty = '-' }) => {
  if (!Array.isArray(value) || value.length === 0) {
    return empty;
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {value.map((item) => (
        <Tag key={String(item)} color="blue" size="small">
          {String(item)}
        </Tag>
      ))}
    </div>
  );
};

export const PricingDescriptionTooltip = ({
  value,
  empty = '-',
  maxLength = 15,
  maxWidth = 320,
}) => {
  const content = value || empty;
  const shortText = truncateText(content, maxLength);

  return (
    <Tooltip
      content={
        <div style={{ maxWidth: 420, lineHeight: 1.7, wordBreak: 'break-word' }}>
          {content}
        </div>
      }
      position="topLeft"
    >
      <div
        style={{
          color: 'var(--semi-color-text-1)',
          lineHeight: 1.7,
          maxWidth,
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {shortText}
      </div>
    </Tooltip>
  );
};
