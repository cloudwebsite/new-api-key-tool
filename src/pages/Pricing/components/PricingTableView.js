import React, { useMemo } from 'react';
import {
  Button,
  Empty,
  Pagination,
  Space,
  Table,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import { IconCopy } from '@douyinfe/semi-icons';
import PricingPriceSummary from './PricingPriceSummary';
import { formatNumber } from '../pricingUtils';
import {
  PricingDescriptionTooltip,
  PricingEndpointList,
  PricingQuotaTypeTag,
  PricingTagList,
} from './PricingSharedRenderers';

const { Text } = Typography;

const PricingTableView = ({
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
  const columns = useMemo(() => {
    const baseColumns = [
      {
        key: 'model_name',
        title: '模型名称',
        dataIndex: 'model_name',
        sorter: (a, b) => String(a.model_name || '').localeCompare(String(b.model_name || '')),
        width: 260,
        render: (text) => (
          <Space>
            <Text strong>{text}</Text>
            <Button
              className="pricing-copy-button"
              icon={<IconCopy />}
              theme="borderless"
              type="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                copyText(text);
              }}
            />
          </Space>
        ),
      },
      {
        key: 'vendor_name',
        title: '供应商',
        dataIndex: 'vendor_name',
        width: 120,
        render: (text) => (text && text !== '-' ? <Tag color="white">{text}</Tag> : '-'),
      },
      {
        key: 'description',
        title: '描述',
        dataIndex: 'description',
        className: 'pricing-desc-cell',
        width: 320,
        render: (text) => <PricingDescriptionTooltip value={text} maxLength={15} maxWidth={320} />,
      },
      {
        key: 'tags',
        title: '标签',
        dataIndex: 'tags',
        width: 180,
        render: (value) => <PricingTagList value={value} />,
      },
      {
        key: 'quota_type',
        title: '计费类型',
        dataIndex: 'quota_type',
        width: 120,
        render: (value) => <PricingQuotaTypeTag value={value} />,
        sorter: (a, b) => Number(a.quota_type || 0) - Number(b.quota_type || 0),
      },
      {
        key: 'supported_endpoint_types',
        title: '可用端点类型',
        dataIndex: 'supported_endpoint_types',
        width: 220,
        render: (value) => <PricingEndpointList value={value} />,
      },
    ];

    if (showRatio) {
      baseColumns.push({
        key: 'ratio_info',
        title: '倍率信息',
        dataIndex: 'displayPricing',
        width: 240,
        render: (_, record) => {
          const pricingInfo = record.displayPricing;
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Text type="secondary" size="small">
                模型倍率：{Number(record.quota_type) === 0 ? formatNumber(record.model_ratio) : '无'}
              </Text>
              <Text type="secondary" size="small">
                补全倍率：{Number(record.quota_type) === 0 ? formatNumber(record.completion_ratio) : '无'}
              </Text>
              <Text type="secondary" size="small">
                分组倍率：{formatNumber(pricingInfo?.ratio)}
              </Text>
            </div>
          );
        },
      });
    }

    baseColumns.push({
      key: 'display_price',
      title: '模型价格',
      dataIndex: 'displayPricing',
      className: 'pricing-price-cell',
      width: 260,
      fixed: 'right',
      render: (_, record) => (
        <PricingPriceSummary
          pricingInfo={record.displayPricing}
          selectedGroup={selectedGroup}
          variant="default"
        />
      ),
    });

    return baseColumns;
  }, [copyText, selectedGroup, showRatio]);

  return (
    <div className="pricing-table-wrap">
      <Table
        className="pricing-table"
        columns={columns}
        dataSource={models}
        loading={loading}
        onRow={(record) => ({
          onClick: () => onOpenModel(record),
          style: { cursor: 'pointer' },
        })}
        empty={
          <Empty
            description={loading ? '正在加载模型定价' : '暂无模型定价数据'}
            style={{ padding: 32 }}
          />
        }
        pagination={false}
        scroll={{ x: 'max-content' }}
      />
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

export default PricingTableView;
