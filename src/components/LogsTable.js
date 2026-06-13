import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Typography, Table, Tag, Spin, Card, Collapse, Toast, Space, Tabs, DatePicker } from '@douyinfe/semi-ui';
import { IconSearch, IconCopy, IconDownload } from '@douyinfe/semi-icons';
import { API, timestamp2string } from '../helpers';
import { stringToColor } from '../helpers/render';
import { ITEMS_PER_PAGE } from '../constants';
import { renderModelPrice, renderQuota } from '../helpers/render';
import Paragraph from '@douyinfe/semi-ui/lib/es/typography/paragraph';
import { Tooltip, Modal } from '@douyinfe/semi-ui';
import Papa from 'papaparse';

// 检测是否是移动端
const isMobile = () => {
    return window.innerWidth <= 768;
};

const { Text } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;
let baseUrls;
try {
    baseUrls = JSON.parse(process.env.REACT_APP_BASE_URL);
    // 兼容单字符串格式
    if (typeof baseUrls === 'string') {
        baseUrls = { 'default': baseUrls };
    }
} catch (e) {
    // 如果JSON解析失败，直接作为字符串处理
    baseUrls = { 'default': process.env.REACT_APP_BASE_URL };
}

function renderTimestamp(timestamp) {
    return timestamp2string(timestamp);
}

function formatDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function renderIsStream(bool) {
    if (bool) {
        return <Tag color="blue" size="large">流</Tag>;
    } else {
        return <Tag color="purple" size="large">非流</Tag>;
    }
}

function renderUseTime(type) {
    const time = parseInt(type);
    if (time < 101) {
        return <Tag color="green" size="large"> {time} 秒 </Tag>;
    } else if (time < 300) {
        return <Tag color="orange" size="large"> {time} 秒 </Tag>;
    } else {
        return <Tag color="red" size="large"> {time} 秒 </Tag>;
    }
}

const LogsTable = () => {
    const [apikey, setAPIKey] = useState('');
    const [activeTabKey, setActiveTabKey] = useState('');
    const [tabData, setTabData] = useState({});
    const [loading, setLoading] = useState(false);
    const [activeKeys, setActiveKeys] = useState([]);
    const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
    const [baseUrl, setBaseUrl] = useState('');
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        return [start, end];
    });
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    });
    const [endDate, setEndDate] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    });
    const [isMobileView, setIsMobileView] = useState(isMobile());
    const ignoreNextPageChangeRef = useRef(false);

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(isMobile());
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const normalizeRange = (range) => {
        const toDate = (d) => (d instanceof Date ? d : new Date(d));
        let start = toDate(range?.[0]);
        let end = toDate(range?.[1]);
        if (!start || isNaN(start.getTime())) {
            const now = new Date();
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        }
        if (!end || isNaN(end.getTime())) {
            end = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
        }
        return [start, end];
    };

    // 处理移动端开始日期变化
    const handleStartDateChange = (date) => {
        const newStart = new Date(date);
        newStart.setHours(0, 0, 0, 0);
        setStartDate(newStart);
        
        // 同步更新dateRange
        const newEnd = new Date(endDate);
        setDateRange([newStart, newEnd]);
    };

    // 处理移动端结束日期变化
    const handleEndDateChange = (date) => {
        const newEnd = new Date(date);
        newEnd.setHours(23, 59, 59, 999);
        setEndDate(newEnd);
        
        // 同步更新dateRange
        const newStart = new Date(startDate);
        setDateRange([newStart, newEnd]);
    };

    // 处理桌面端日期范围变化
    const handleDateRangeChange = (range) => {
        const normalized = normalizeRange(range);
        setDateRange(normalized);
        setStartDate(normalized[0]);
        setEndDate(normalized[1]);
    };
    useEffect(() => {
        // 默认设置第一个地址为baseUrl
        const firstKey = Object.keys(baseUrls)[0];
        setActiveTabKey(firstKey);
        setBaseUrl(baseUrls[firstKey]);
    }, []);

    const handleTabChange = (key) => {
        setActiveTabKey(key);
        setBaseUrl(baseUrls[key]);
    };

    const resetData = (key) => {
        setTabData((prevData) => ({
            ...prevData,
            [key]: {
                balance: 0,
                usage: 0,
                accessdate: "未知",
                logs: [],
                tokenValid: false,
                token_name: undefined,
                hasFetchedBalance: false,
            }
        }));
    };

    const fetchData = async (params = {}) => {
        if (apikey === '') {
            Toast.warning('请先输入令牌，再进行查询');
            return;
        }
        // 检查令牌格式
        if (!/^sk-[a-zA-Z0-9]{48}$/.test(apikey)) {
            Toast.error('令牌格式非法！');
            return;
        }
        setLoading(true);
        try {
            const checkRes = await API.get(`${baseUrl}/api/check.php`, { params: { key: apikey } });
            if (checkRes.data !== 'ok') {
                Toast.error('无效令牌');
                setLoading(false);
                return;
            }
        } catch (e) {
            console.log(e);
            Toast.error('无效令牌');
            setLoading(false);
            return;
        }
        const currentPage = params.page ?? (tabData[activeTabKey]?.page ?? 1);
        let currentPageSize = params.page_size ?? pageSize;
        let currentRange = normalizeRange(params.range ?? dateRange);
        const startTs = Math.floor(currentRange[0].setHours(0, 0, 0, 0) / 1000);
        const endTs = Math.floor(currentRange[1].setHours(23, 59, 59, 999) / 1000);
        const prev = tabData[activeTabKey] || { balance: 0, usage: 0, accessdate: "未知", tokenValid: false, token_name: undefined, hasFetchedBalance: false, page: 1, total: 0 };
        let newTabData = { ...prev, logs: [], page: currentPage, total: prev.total };

        try {
            const shouldFetchBalance = params.forceBalanceUsage === true || !(tabData[activeTabKey]?.hasFetchedBalance);
            if (shouldFetchBalance && process.env.REACT_APP_SHOW_BALANCE === "true") {
                const subscription = await API.get(`${baseUrl}/v1/dashboard/billing/subscription`, {
                    headers: { Authorization: `Bearer ${apikey}` },
                });
                const subscriptionData = subscription.data;
                newTabData.balance = subscriptionData.hard_limit_usd;
                newTabData.accessdate = subscriptionData.access_until || 0;
                newTabData.tokenValid = true;
                if (subscriptionData.token_name) {
                    newTabData.token_name = subscriptionData.token_name;
                }
                const start_date = formatDate(new Date(currentRange[0]));
                const end_date = formatDate(new Date(currentRange[1]));
                const res = await API.get(`${baseUrl}/v1/dashboard/billing/usage?start_date=${start_date}&end_date=${end_date}`, {
                    headers: { Authorization: `Bearer ${apikey}` },
                });
                const data = res.data;
                newTabData.usage = data.total_usage / 100;
                newTabData.hasFetchedBalance = true;
            }
        } catch (e) {
            console.log(e)
            Toast.error("令牌已用尽");
            resetData(activeTabKey); // 如果发生错误，重置所有数据为默认值
            setLoading(false);
        }
        try {
            if (process.env.REACT_APP_SHOW_DETAIL === "true") {
                const logRes = await API.get(`${baseUrl}/api/log/token`, {
                    params: {
                        key: apikey,
                        page: currentPage,
                        page_size: currentPageSize,
                        start_timestamp: startTs,
                        end_timestamp: endTs,
                    }
                });
                const payload = logRes.data;
                if (payload && payload.success === true) {
                    let list = [];
                    let total = 0;
                    let pageFromResp;
                    let sizeFromResp;
                    if (Array.isArray(payload.data)) {
                        list = payload.data;
                        total = payload.total !== undefined ? payload.total : list.length;
                    } else if (payload.data && Array.isArray(payload.data.items)) {
                        list = payload.data.items;
                        total = payload.data.total !== undefined ? payload.data.total : list.length;
                        pageFromResp = payload.data.page;
                        sizeFromResp = payload.data.page_size;
                    } else if (Array.isArray(payload.items)) {
                        list = payload.items;
                        total = payload.total !== undefined ? payload.total : list.length;
                        pageFromResp = payload.page;
                        sizeFromResp = payload.page_size;
                    }
                    newTabData.logs = list;
                    newTabData.total = total || list.length;
                    newTabData.page = pageFromResp !== undefined ? pageFromResp : currentPage;
                    currentPageSize = sizeFromResp !== undefined ? sizeFromResp : currentPageSize;

                    const tokenNameFromLogs = (list || []).find(item => (item && (item.type === 0 || item.type === 2) && item.token_name))?.token_name;
                    if (!newTabData.token_name && tokenNameFromLogs) {
                        newTabData.token_name = tokenNameFromLogs;
                    }
                    setActiveKeys(['1', '2']);
                } else {
                    Toast.error('查询调用详情失败，请输入正确的令牌');
                }
            }
        } catch (e) {
            Toast.error("查询失败，请输入正确的令牌");
            resetData(activeTabKey); // 如果发生错误，重置所有数据为默认值
            setLoading(false);
        }
        setPageSize(currentPageSize);
        setTabData((prevData) => ({
            ...prevData,
            [activeTabKey]: newTabData,
        }));
        setLoading(false);

    };

    const copyText = async (text) => {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                Toast.success('已复制：' + text);
                return;
            }

            // Fallback for Safari and older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            try {
                document.execCommand('copy');
                textArea.remove();
                Toast.success('已复制：' + text);
            } catch (err) {
                textArea.remove();
                Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
            }
        } catch (err) {
            Modal.error({ title: '无法复制到剪贴板，请手动复制', content: text });
        }
    };

    const columns = [
        {
            title: '时间',
            dataIndex: 'created_at',
            render: renderTimestamp,
            sorter: (a, b) => a.created_at - b.created_at,
        },
        {
            title: '模型',
            dataIndex: 'model_name',
            render: (text, record, index) => {
                return record.type === 0 || record.type === 2 ? (
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
                ) : (
                    <></>
                );
            },
            sorter: (a, b) => ('' + a.model_name).localeCompare(b.model_name),
        },
        {
            title: '用时',
            dataIndex: 'use_time',
            render: (text, record, index) => {
                return record.model_name.startsWith('mj_') ? null : (
                    <div>
                        <Space>
                            {renderUseTime(text)}
                            {renderIsStream(record.is_stream)}
                        </Space>
                    </div>
                );
            },
            sorter: (a, b) => a.use_time - b.use_time,
        },
        {
            title: '提示',
            dataIndex: 'prompt_tokens',
            render: (text, record, index) => {
                return record.model_name.startsWith('mj_') ? null : (
                    record.type === 0 || record.type === 2 ? <div>{<span> {text} </span>}</div> : <></>
                );
            },
            sorter: (a, b) => a.prompt_tokens - b.prompt_tokens,
        },
        {
            title: '补全',
            dataIndex: 'completion_tokens',
            render: (text, record, index) => {
                return parseInt(text) > 0 && (record.type === 0 || record.type === 2) ? (
                    <div>{<span> {text} </span>}</div>
                ) : (
                    <></>
                );
            },
            sorter: (a, b) => a.completion_tokens - b.completion_tokens,
        },
        {
            title: '花费',
            dataIndex: 'quota',
            render: (text, record, index) => {
                return record.type === 0 || record.type === 2 ? <div>{renderQuota(text, 6)}</div> : <></>;
            },
            sorter: (a, b) => a.quota - b.quota,
        },
        {
            title: '详情',
            dataIndex: 'content',
            render: (text, record, index) => {
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
                let content = renderModelPrice(
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
        }
    ];

    const copyTokenInfo = (e) => {
        e.stopPropagation();
        const activeTabData = tabData[activeTabKey] || {};
        const { balance, usage, accessdate } = activeTabData;
        const info = `令牌总额: ${balance === 100000000 ? '无限' : `${balance.toFixed(3)}`}
剩余额度: ${balance === 100000000 ? '无限制' : `${(balance - usage).toFixed(3)}`}
已用额度: ${balance === 100000000 ? '不进行计算' : `${usage.toFixed(3)}`}
有效期至: ${accessdate === 0 ? '永不过期' : renderTimestamp(accessdate)}`;
        copyText(info);
    };

    const [exporting, setExporting] = useState(false);

    const searchControlsStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
    };

    const searchInputStyle = {
        flex: '1 1 360px',
        minWidth: 260,
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
    };

    const exportCSV = async (e) => {
        e.stopPropagation();
        
        if (apikey === '') {
            Toast.warning('请先输入令牌');
            return;
        }

        setExporting(true);
        Toast.info('正在获取所有数据，请稍候...');

        try {
            // 获取当前日期范围
            const currentRange = normalizeRange(dateRange);
            const startTs = Math.floor(currentRange[0].setHours(0, 0, 0, 0) / 1000);
            const endTs = Math.floor(currentRange[1].setHours(23, 59, 59, 999) / 1000);

            // 先获取总数
            const activeTabData = tabData[activeTabKey] || { total: 0 };
            const total = activeTabData.total || 0;

            if (total === 0) {
                Toast.warning('没有可导出的数据');
                setExporting(false);
                return;
            }

            // 一次性获取所有数据（使用较大的 page_size）
            const logRes = await API.get(`${baseUrl}/api/log/token`, {
                params: {
                    key: apikey,
                    page: 1,
                    page_size: total, // 请求所有数据
                    start_timestamp: startTs,
                    end_timestamp: endTs,
                }
            });

            const payload = logRes.data;
            let allLogs = [];

            if (payload && payload.success === true) {
                if (Array.isArray(payload.data)) {
                    allLogs = payload.data;
                } else if (payload.data && Array.isArray(payload.data.items)) {
                    allLogs = payload.data.items;
                } else if (Array.isArray(payload.items)) {
                    allLogs = payload.items;
                }
            }

            if (allLogs.length === 0) {
                Toast.warning('没有可导出的数据');
                setExporting(false);
                return;
            }

            const csvData = allLogs.map(log => ({
                '时间': renderTimestamp(log.created_at),
                '模型': log.model_name,
                '用时': log.use_time,
                '提示': log.prompt_tokens,
                '补全': log.completion_tokens,
                '花费': log.quota,
                '详情': log.content,
            }));
            const csvString = '\ufeff' + Papa.unparse(csvData);

            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'data.csv';

            // For Safari compatibility
            if (navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') === -1) {
                link.target = '_blank';
                link.setAttribute('target', '_blank');
            }

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);

            Toast.success(`成功导出 ${allLogs.length} 条记录`);
        } catch (err) {
            Toast.error('导出失败，请稍后重试');
            console.error('Export failed:', err);
        } finally {
            setExporting(false);
        }
    };

    const activeTabData = tabData[activeTabKey] || { logs: [], balance: 0, usage: 0, accessdate: "未知", tokenValid: false };

    const renderContent = () => (
        <>
            <Card style={{ marginTop: 24, overflowX: 'auto' }}>
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
                        type='primary'
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
            </Card>
            <Card style={{ marginTop: 24 }}>
                <Collapse activeKey={activeKeys} onChange={(keys) => setActiveKeys(keys)}>
                    {process.env.REACT_APP_SHOW_BALANCE === "true" && (
                        <Panel
                            header="令牌信息"
                            itemKey="1"
                            extra={
                                <Button icon={<IconCopy />} theme='borderless' type='primary' onClick={(e) => copyTokenInfo(e)} disabled={!activeTabData.tokenValid}>
                                    复制令牌信息
                                </Button>
                            }
                        >
                            <Spin spinning={loading}>
                                <div style={{ marginBottom: 16 }}>
                                    <Text type="secondary">
                                        令牌总额：{activeTabData.balance === 100000000 ? "无限" : activeTabData.balance === "未知" || activeTabData.balance === undefined ? "未知" : `${activeTabData.balance.toFixed(3)}`}
                                    </Text>
                                    <br /><br />
                                    <Text type="secondary">
                                        剩余额度：{activeTabData.balance === 100000000 ? "无限制" : activeTabData.balance === "未知" || activeTabData.usage === "未知" || activeTabData.balance === undefined || activeTabData.usage === undefined ? "未知" : `${(activeTabData.balance - activeTabData.usage).toFixed(3)}`}
                                    </Text>
                                    <br /><br />
                                    <Text type="secondary">
                                        已用额度：{activeTabData.balance === 100000000 ? "不进行计算" : activeTabData.usage === "未知" || activeTabData.usage === undefined ? "未知" : `${activeTabData.usage.toFixed(3)}`}
                                    </Text>
                                    <br /><br />
                                    <Text type="secondary">
                                        有效期至：{activeTabData.accessdate === 0 ? '永不过期' : activeTabData.accessdate === "未知" ? '未知' : renderTimestamp(activeTabData.accessdate)}
                                    </Text>
                                </div>
                            </Spin>
                        </Panel>
                    )}
                    {process.env.REACT_APP_SHOW_DETAIL === "true" && (
                        <Panel
                            header="调用详情"
                            itemKey="2"
                            extra={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Tag shape='circle' color='green' style={{ marginRight: 5 }}>计算汇率：$1 = 50 0000 tokens</Tag>
                                    <Button icon={<IconDownload />} theme='borderless' type='primary' onClick={(e) => exportCSV(e)} disabled={!activeTabData.tokenValid || activeTabData.logs.length === 0 || exporting} loading={exporting}>
                                        {exporting ? '正在导出...' : '导出为CSV文件'}
                                    </Button>
                                </div>
                            }
                        >
                            <Spin spinning={loading}>
                                <Table
                                    columns={columns}
                                    dataSource={activeTabData.logs}
                                    pagination={{
                                        pageSize: pageSize,
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
                                        total: (activeTabData.total !== undefined) ? activeTabData.total : activeTabData.logs.length,
                                        style: { marginTop: 12 },
                                    }}
                                />
                            </Spin>
                        </Panel>
                    )}
                </Collapse>
            </Card>
        </>
    );

    return (
        <>
            {Object.keys(baseUrls).length > 1 ? (
                <Tabs type="line" onChange={handleTabChange}>
                    {Object.entries(baseUrls).map(([key, url]) => (
                        <TabPane tab={key} itemKey={key} key={key}>
                            {renderContent()}
                        </TabPane>
                    ))}
                </Tabs>
            ) : (
                renderContent()
            )}
        </>
    );
};

export default LogsTable;
