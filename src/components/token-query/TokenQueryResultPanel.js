import React from 'react';
import {
  Button,
  Card,
  Collapse,
  Spin,
  Table,
  Tag,
} from '@douyinfe/semi-ui';
import { IconDownload } from '@douyinfe/semi-icons';
const { Panel } = Collapse;

const TokenQueryResultPanel = ({
  activeKeys,
  setActiveKeys,
  detailEnabled,
  activeTabData,
  loading,
  exporting,
  exportCSV,
  columns,
  pageSize,
  setPageSize,
  fetchData,
  ignoreNextPageChangeRef,
}) => (
  <Card className="token-query-result-card" bordered={false} bodyStyle={{ padding: 18 }} style={{ marginTop: 20 }}>
    <Collapse activeKey={activeKeys} onChange={(keys) => setActiveKeys(keys)}>
      {detailEnabled && (
        <Panel
          header="调用详情"
          itemKey="2"
          extra={
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <Tag shape="circle" color="green">计算汇率：$1 = 50 0000 tokens</Tag>
              <Button icon={<IconDownload />} theme="borderless" type="primary" onClick={(e) => exportCSV(e)} disabled={!activeTabData.tokenValid || activeTabData.logs.length === 0 || exporting} loading={exporting}>
                {exporting ? '正在导出...' : '导出为CSV文件'}
              </Button>
            </div>
          }
        >
          <Spin spinning={loading}>
            <Table
              className="token-query-table"
              columns={columns}
              dataSource={activeTabData.logs}
              pagination={{
                pageSize,
                currentPage: activeTabData.page || 1,
                hideOnSinglePage: true,
                showSizeChanger: true,
                pageSizeOpts: [10, 20, 50, 100],
                onPageSizeChange: (size) => {
                  ignoreNextPageChangeRef.current = true;
                  setPageSize(size);
                  fetchData({ page: 1, page_size: size });
                },
                onPageChange: (page) => {
                  if (ignoreNextPageChangeRef.current) {
                    ignoreNextPageChangeRef.current = false;
                    return;
                  }
                  fetchData({ page });
                },
                showTotal: (total) => `共 ${total} 条`,
                showQuickJumper: true,
                total: activeTabData.total !== undefined ? activeTabData.total : activeTabData.logs.length,
                style: { marginTop: 12 },
              }}
            />
          </Spin>
        </Panel>
      )}
    </Collapse>
  </Card>
);

export default TokenQueryResultPanel;
