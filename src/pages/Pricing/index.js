import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Space, Toast, Typography } from '@douyinfe/semi-ui';
import { API } from '../../helpers';
import PricingCardView from './components/PricingCardView';
import PricingDetailSideSheet from './components/PricingDetailSideSheet';
import PricingTableView from './components/PricingTableView';
import PricingToolbar from './components/PricingToolbar';
import { getModelDisplayPricing } from './pricingUtils';

const { Text } = Typography;
const PRICING_CACHE_TTL = 3 * 60 * 60 * 1000;
const PRICING_CACHE_KEY_PREFIX = 'pricing-page-cache:';

const normalizeBaseUrls = () => {
  const raw = (process.env.REACT_APP_BASE_URL || '').trim();
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') {
      return { default: parsed.trim() };
    }
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch (e) {
    // Fall through to plain string mode.
  }

  return { default: raw.replace(/^['"]|['"]$/g, '') };
};

const baseUrls = normalizeBaseUrls();
const firstBaseUrl = Object.values(baseUrls)[0] || '';

const getPricingCacheKey = (baseUrl) => `${PRICING_CACHE_KEY_PREFIX}${baseUrl || 'default'}`;

const readPricingCache = (baseUrl) => {
  try {
    const raw = window.localStorage.getItem(getPricingCacheKey(baseUrl));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (!parsed.timestamp || Date.now() - parsed.timestamp > PRICING_CACHE_TTL) {
      window.localStorage.removeItem(getPricingCacheKey(baseUrl));
      return null;
    }
    return parsed.payload || null;
  } catch (e) {
    return null;
  }
};

const writePricingCache = (baseUrl, payload) => {
  try {
    window.localStorage.setItem(
      getPricingCacheKey(baseUrl),
      JSON.stringify({
        timestamp: Date.now(),
        payload,
      }),
    );
  } catch (e) {
    // Ignore cache write failures.
  }
};

const Pricing = () => {
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [vendorFilter, setVendorFilter] = useState('all');
  const [quotaFilter, setQuotaFilter] = useState('all');
  const [modelTypeFilter, setModelTypeFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [tokenUnit, setTokenUnit] = useState('M');
  const [showRatio, setShowRatio] = useState(false);
  const [viewMode, setViewMode] = useState('card');
  const [selectedModel, setSelectedModel] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [groupRatios, setGroupRatios] = useState({});
  const [usableGroups, setUsableGroups] = useState({});
  const [apiAutoGroups, setApiAutoGroups] = useState([]);

  const copyText = useCallback(async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      Toast.success(`已复制：${text}`);
    } catch (e) {
      Toast.error('复制失败');
    }
  }, []);

  const applyPricingPayload = useCallback((payload) => {
    const vendorList = Array.isArray(payload?.vendors) ? payload.vendors : [];
    const vendorMap = new Map(
      vendorList.map((item) => [item.id, item.name || item.vendor_name || '']),
    );

    let list = [];
    if (Array.isArray(payload)) {
      list = payload;
    } else if (Array.isArray(payload?.data)) {
      list = payload.data;
    } else if (payload?.success === false) {
      throw new Error(payload.message || '加载模型定价失败');
    }

    const normalized = list.map((item, index) => ({
      key: item.model_name || `pricing-${index}`,
      ...item,
      vendor_name:
        item.vendor_name ||
        vendorMap.get(item.vendor_id) ||
        item.owner_by ||
        '-',
    }));

    setModels(normalized);
    setGroupRatios(
      payload?.group_ratio && typeof payload.group_ratio === 'object'
        ? payload.group_ratio
        : {},
    );
    setUsableGroups(
      payload?.usable_group && typeof payload.usable_group === 'object'
        ? payload.usable_group
        : {},
    );
    setApiAutoGroups(Array.isArray(payload?.auto_groups) ? payload.auto_groups : []);
    setAvailableGroups(
      Array.isArray(payload?.auto_groups)
        ? payload.auto_groups
        : Array.from(
            new Set(
              normalized.flatMap((item) =>
                Array.isArray(item.enable_groups) ? item.enable_groups : [],
              ),
            ),
          ),
    );
  }, []);

  const fetchPricing = useCallback(async (forceRefresh = false) => {
    if (!firstBaseUrl) {
      Toast.error('未配置可用的 BaseURL');
      return;
    }

    if (!forceRefresh) {
      const cachedPayload = readPricingCache(firstBaseUrl);
      if (cachedPayload) {
        applyPricingPayload(cachedPayload);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await API.get(`${firstBaseUrl}/api/pricing_new`);
      const payload = res.data;
      applyPricingPayload(payload);
      writePricingCache(firstBaseUrl, payload);
    } catch (e) {
      console.error(e);
      setModels([]);
      setAvailableGroups([]);
      setGroupRatios({});
      setUsableGroups({});
      setApiAutoGroups([]);
      Toast.error(e?.message || '加载模型定价失败');
    } finally {
      setLoading(false);
    }
  }, [applyPricingPayload]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, vendorFilter, quotaFilter, modelTypeFilter, groupFilter, selectedGroup]);

  const vendorOptions = useMemo(() => {
    const values = Array.from(
      new Set(models.map((item) => item.vendor_name).filter((item) => item && item !== '-')),
    ).sort((a, b) => a.localeCompare(b));
    return [{ label: '全部供应商', value: 'all' }].concat(
      values.map((item) => ({ label: item, value: item })),
    );
  }, [models]);

  const modelTypeOptions = useMemo(() => {
    const values = Array.from(
      new Set(models.map((item) => item.model_type).filter(Boolean)),
    ).sort((a, b) => a.localeCompare(b));
    return [{ label: '全部类型', value: 'all' }].concat(
      values.map((item) => ({ label: item, value: item })),
    );
  }, [models]);

  const groupOptions = useMemo(() => {
    const values = Array.from(new Set(availableGroups.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
    return [{ label: '全部分组', value: 'all' }].concat(
      values.map((item) => ({ label: item, value: item })),
    );
  }, [availableGroups]);

  const displayGroupOptions = useMemo(() => {
    const values = Array.from(new Set(availableGroups.filter(Boolean))).sort((a, b) =>
      a.localeCompare(b),
    );
    return [{ label: '自动最低价分组', value: 'all' }].concat(
      values.map((item) => ({ label: `按 ${item} 分组展示`, value: item })),
    );
  }, [availableGroups]);

  const filteredModels = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();
    return models.filter((item) => {
      if (vendorFilter !== 'all' && item.vendor_name !== vendorFilter) {
        return false;
      }
      if (quotaFilter !== 'all' && String(item.quota_type) !== quotaFilter) {
        return false;
      }
      if (modelTypeFilter !== 'all' && item.model_type !== modelTypeFilter) {
        return false;
      }
      if (
        groupFilter !== 'all' &&
        !(Array.isArray(item.enable_groups) && item.enable_groups.includes(groupFilter))
      ) {
        return false;
      }
      if (!keyword) {
        return true;
      }

      const searchable = [
        item.model_name,
        item.vendor_name,
        item.description,
        item.model_type,
        item.tags,
        Array.isArray(item.enable_groups) ? item.enable_groups.join(' ') : '',
        Array.isArray(item.supported_endpoint_types)
          ? item.supported_endpoint_types.join(' ')
          : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchable.includes(keyword);
    });
  }, [groupFilter, models, modelTypeFilter, quotaFilter, searchValue, vendorFilter]);

  const displayModels = useMemo(
    () =>
      filteredModels.map((item) => ({
        ...item,
        displayPricing: getModelDisplayPricing(item, selectedGroup, groupRatios, tokenUnit),
      })),
    [filteredModels, groupRatios, selectedGroup, tokenUnit],
  );

  const pagedModels = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayModels.slice(start, start + pageSize);
  }, [currentPage, displayModels, pageSize]);

  const openModelDetail = useCallback((model) => {
    setSelectedModel(model);
    setDetailVisible(true);
  }, []);

  return (
    <>
      <Card style={{ marginTop: 24 }}>
        <Space vertical align="start" style={{ width: '100%' }} spacing="medium">
          <div style={{ width: '100%' }}>
            <Text strong style={{ fontSize: 18 }}>
              模型定价
            </Text>
          </div>

          <PricingToolbar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            vendorFilter={vendorFilter}
            setVendorFilter={setVendorFilter}
            quotaFilter={quotaFilter}
            setQuotaFilter={setQuotaFilter}
            modelTypeFilter={modelTypeFilter}
            setModelTypeFilter={setModelTypeFilter}
            groupFilter={groupFilter}
            setGroupFilter={setGroupFilter}
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            vendorOptions={vendorOptions}
            modelTypeOptions={modelTypeOptions}
            groupOptions={groupOptions}
            displayGroupOptions={displayGroupOptions}
            tokenUnit={tokenUnit}
            setTokenUnit={setTokenUnit}
            showRatio={showRatio}
            setShowRatio={setShowRatio}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filteredCount={displayModels.length}
            loading={loading}
            onRefresh={() => fetchPricing(true)}
          />

          <div style={{ width: '100%' }}>
            {viewMode === 'card' ? (
              <PricingCardView
                models={pagedModels}
                totalCount={displayModels.length}
                loading={loading}
                pageSize={pageSize}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setPageSize={setPageSize}
                copyText={copyText}
                onOpenModel={openModelDetail}
                selectedGroup={selectedGroup}
                showRatio={showRatio}
              />
            ) : (
              <PricingTableView
                models={pagedModels}
                totalCount={displayModels.length}
                loading={loading}
                pageSize={pageSize}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setPageSize={setPageSize}
                copyText={copyText}
                onOpenModel={openModelDetail}
                selectedGroup={selectedGroup}
                showRatio={showRatio}
              />
            )}
          </div>
        </Space>
      </Card>

      <PricingDetailSideSheet
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        model={selectedModel}
        groupRatios={groupRatios}
        usableGroups={usableGroups}
        autoGroups={apiAutoGroups}
        copyText={copyText}
        tokenUnit={tokenUnit}
        showRatio={showRatio}
      />
    </>
  );
};

export default Pricing;
