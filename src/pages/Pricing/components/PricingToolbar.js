import React from 'react';
import {
  Button,
  Input,
  Select,
  Space,
  Switch,
  Typography,
} from '@douyinfe/semi-ui';
import {
  IconGridView1,
  IconMenu,
  IconSearch,
} from '@douyinfe/semi-icons';

const { Text } = Typography;

const PricingToolbar = ({
  searchValue,
  setSearchValue,
  vendorFilter,
  setVendorFilter,
  quotaFilter,
  setQuotaFilter,
  modelTypeFilter,
  setModelTypeFilter,
  groupFilter,
  setGroupFilter,
  selectedGroup,
  setSelectedGroup,
  vendorOptions,
  modelTypeOptions,
  groupOptions,
  displayGroupOptions,
  tokenUnit,
  setTokenUnit,
  showRatio,
  setShowRatio,
  viewMode,
  setViewMode,
  filteredCount,
  loading,
  onRefresh,
}) => {
  return (
    <div style={{ width: '100%' }}>
      <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
        <Space wrap>
          <Input
            showClear
            value={searchValue}
            onChange={(value) => setSearchValue(value)}
            placeholder="搜索模型名称 / 供应商 / 标签 / 描述"
            prefix={<IconSearch />}
            style={{ width: 360, maxWidth: '100%' }}
          />
          <Select
            value={vendorFilter}
            onChange={(value) => setVendorFilter(value)}
            optionList={vendorOptions}
            style={{ width: 180 }}
          />
          <Select
            value={quotaFilter}
            onChange={(value) => setQuotaFilter(String(value))}
            optionList={[
              { label: '全部计费', value: 'all' },
              { label: '按量计费', value: '0' },
              { label: '按次计费', value: '1' },
            ]}
            style={{ width: 140 }}
          />
          <Select
            value={modelTypeFilter}
            onChange={(value) => setModelTypeFilter(value)}
            optionList={modelTypeOptions}
            style={{ width: 140 }}
          />
          <Select
            value={groupFilter}
            onChange={(value) => setGroupFilter(value)}
            optionList={groupOptions}
            style={{ width: 180 }}
          />
          <Select
            value={selectedGroup}
            onChange={(value) => setSelectedGroup(value)}
            optionList={displayGroupOptions}
            style={{ width: 180 }}
          />
          <Space>
            <Text type="secondary">倍率</Text>
            <Switch checked={showRatio} onChange={setShowRatio} />
          </Space>
          <Space>
            <Button
              theme={tokenUnit === 'K' ? 'solid' : 'outline'}
              type={tokenUnit === 'K' ? 'primary' : 'tertiary'}
              onClick={() => setTokenUnit(tokenUnit === 'K' ? 'M' : 'K')}
            >
              {tokenUnit}
            </Button>
            <Button
              theme={viewMode === 'card' ? 'solid' : 'light'}
              type={viewMode === 'card' ? 'primary' : 'tertiary'}
              icon={<IconGridView1 />}
              onClick={() => setViewMode('card')}
            >
              卡片
            </Button>
            <Button
              theme={viewMode === 'table' ? 'solid' : 'light'}
              type={viewMode === 'table' ? 'primary' : 'tertiary'}
              icon={<IconMenu />}
              onClick={() => setViewMode('table')}
            >
              表格
            </Button>
          </Space>
        </Space>
        <Space>
          <Text type="secondary">共 {filteredCount} 条</Text>
          <Button onClick={onRefresh} loading={loading}>
            刷新
          </Button>
        </Space>
      </Space>
      <div style={{ marginTop: 8 }}>
        <Text type="tertiary" size="small">
          提示：筛选分组只影响列表里显示哪些模型；展示分组只影响价格按哪一组计算。未指定展示分组时，默认显示该模型最低价分组；开启显示倍率后，会展示模型倍率、补全倍率和当前展示分组倍率。
        </Text>
      </div>
    </div>
  );
};

export default PricingToolbar;
