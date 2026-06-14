import React from 'react';
import {
  Button,
  Card,
  DatePicker,
  Input,
  Tag,
  Typography,
} from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import { formatDate } from './TokenQueryFormatters';

const { Text } = Typography;

const searchControlsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  flexWrap: 'wrap',
};

const searchInputStyle = {
  flex: '1 1 420px',
  minWidth: 280,
};

const desktopDatePickerStyle = {
  flex: '0 1 320px',
  minWidth: 260,
};

const mobileDatePickerWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
};

const mobileDatePickerStyle = {
  width: '100%',
};

const searchButtonStyle = {
  flexShrink: 0,
  minWidth: 112,
  height: 36,
};

const TokenQuerySearchPanel = ({
  activeTabKey,
  apikey,
  setAPIKey,
  loading,
  fetchData,
  isMobileView,
  startDate,
  endDate,
  handleStartDateChange,
  handleEndDateChange,
  dateRange,
  handleDateRangeChange,
}) => (
  <>
    <Card
      className="token-query-hero"
      bordered={false}
      bodyStyle={{ padding: 22 }}
      style={{ marginTop: 12 }}
    >
      <div className="token-query-hero__content">
        <div>
          <Text strong style={{ fontSize: 26, lineHeight: '34px' }}>令牌查询</Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              输入令牌后可查询额度、有效期和调用明细，默认按当前日期范围统计。
            </Text>
          </div>
        </div>
        <div className="token-query-hero__meta">
          <Tag color="blue" shape="circle">当前节点：{activeTabKey || 'default'}</Tag>
          <Tag color="green" shape="circle">
            查询范围：{formatDate(startDate)} ~ {formatDate(endDate)}
          </Tag>
        </div>
      </div>
    </Card>

    <Card
      className="token-query-search-card"
      bordered={false}
      bodyStyle={{ padding: 20 }}
      style={{ marginTop: 20, overflowX: 'auto' }}
    >
      <div className="search-controls" style={searchControlsStyle}>
        <Input
          showClear
          value={apikey}
          onChange={(value) => setAPIKey(value)}
          placeholder="请输入要查询的令牌 sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          prefix={<IconSearch />}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              fetchData({ page: 1, forceBalanceUsage: true });
            }
          }}
          className="search-input"
          style={searchInputStyle}
        />
        {isMobileView ? (
          <div className="date-picker-mobile-wrapper" style={mobileDatePickerWrapperStyle}>
            <DatePicker
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              placeholder="开始日期"
              size="small"
              className="search-datepicker-mobile"
              position="bottomLeft"
              style={mobileDatePickerStyle}
            />
            <DatePicker
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              placeholder="结束日期"
              size="small"
              className="search-datepicker-mobile"
              position="bottomLeft"
              style={mobileDatePickerStyle}
            />
          </div>
        ) : (
          <DatePicker
            type="dateRange"
            value={dateRange}
            onChange={handleDateRangeChange}
            size="small"
            className="search-datepicker"
            position="bottomLeft"
            style={desktopDatePickerStyle}
          />
        )}
        <Button
          type="primary"
          theme="solid"
          onClick={() => fetchData({ page: 1, forceBalanceUsage: true })}
          loading={loading}
          disabled={apikey === ''}
          className="search-button"
          style={searchButtonStyle}
        >
          查询
        </Button>
      </div>
      <div style={{ marginTop: 12 }}>
        <Text type="tertiary" size="small">
          提示：支持回车直接查询；若配置了多个节点，可先切换上方标签再查询当前节点数据。
        </Text>
      </div>
    </Card>
  </>
);

export default TokenQuerySearchPanel;
