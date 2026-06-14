export const formatNumber = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return '-';
  }
  if (Number.isInteger(num)) {
    return String(num);
  }
  return num.toFixed(4).replace(/\.?0+$/, '');
};

export const getRatioNumber = (value, fallback = 1) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const isDynamicPricingRecord = (record) =>
  record?.billing_mode === 'tiered_expr' && Boolean(record?.billing_expr);

export const getModelEnabledGroups = (record) =>
  Array.isArray(record?.enable_groups) ? record.enable_groups.filter(Boolean) : [];

const getLowestRatioGroup = (enabledGroups, groupRatios = {}) => {
  let usedGroup = null;
  let usedGroupRatio;
  let minRatio = Number.POSITIVE_INFINITY;

  enabledGroups.forEach((group) => {
    const ratio = groupRatios[group];
    if (ratio !== undefined && ratio < minRatio) {
      minRatio = ratio;
      usedGroup = group;
      usedGroupRatio = ratio;
    }
  });

  return {
    group: usedGroup,
    ratio: usedGroupRatio,
  };
};

export const getEffectivePricingGroup = (
  record,
  selectedGroup = 'all',
  groupRatios = {},
) => {
  const enabledGroups = getModelEnabledGroups(record);
  const selectedGroupRatio = groupRatios[selectedGroup];
  const hasExplicitGroup = selectedGroup && selectedGroup !== 'all';
  const canUseSelectedGroup =
    hasExplicitGroup &&
    selectedGroupRatio !== undefined &&
    (enabledGroups.length === 0 || enabledGroups.includes(selectedGroup));

  if (canUseSelectedGroup) {
    return {
      group: selectedGroup,
      ratio: getRatioNumber(selectedGroupRatio, 1),
      mode: 'selected',
      enabledGroups,
    };
  }

  const lowestRatioGroup = getLowestRatioGroup(enabledGroups, groupRatios);
  if (lowestRatioGroup.ratio !== undefined) {
    return {
      group: lowestRatioGroup.group,
      ratio: getRatioNumber(lowestRatioGroup.ratio, 1),
      mode: 'lowest',
      enabledGroups,
    };
  }

  if (hasExplicitGroup && selectedGroupRatio !== undefined) {
    return {
      group: selectedGroup,
      ratio: getRatioNumber(selectedGroupRatio, 1),
      mode: 'selected-fallback',
      enabledGroups,
    };
  }

  return {
    group: enabledGroups[0] || null,
    ratio: 1,
    mode: 'default',
    enabledGroups,
  };
};

export const getTokenPriceBreakdown = (record, groupRatio = 1, tokenUnit = 'M') => {
  const ratio = getRatioNumber(groupRatio, 1);

  if (isDynamicPricingRecord(record)) {
    return {
      billingType: '动态计费',
      isDynamicPricing: true,
      dynamicLabel: '按规则动态计算',
    };
  }

  if (Number(record?.quota_type) === 1) {
    const fixedPrice = Number(record?.model_price || 0) * ratio;
    return {
      billingType: '按次计费',
      fixedPrice,
      fixedPriceText: `💰${fixedPrice.toFixed(4)}/次`,
    };
  }

  const inputPrice = Number(record?.model_ratio || 0) * 2 * ratio;
  const completionMultiplier = getRatioNumber(record?.completion_ratio, 0);
  const unitDivisor = tokenUnit === 'K' ? 1000 : 1;
  const unitLabel = tokenUnit === 'K' ? 'K' : 'M';
  const cacheMultiplier =
    record?.cache_ratio === undefined || record?.cache_ratio === null
      ? null
      : getRatioNumber(record?.cache_ratio, 0);

  return {
    billingType: '按量计费',
    inputPrice,
    completionPrice: inputPrice * completionMultiplier,
    cacheHitPrice: cacheMultiplier === null ? null : inputPrice * cacheMultiplier,
    inputPriceText: `💰${(inputPrice / unitDivisor).toFixed(4)}/${unitLabel}`,
    completionPriceText: `💰${((inputPrice * completionMultiplier) / unitDivisor).toFixed(4)}/${unitLabel}`,
    cacheHitPriceText:
      cacheMultiplier === null
        ? null
        : `💰${((inputPrice * cacheMultiplier) / unitDivisor).toFixed(4)}/${unitLabel}`,
  };
};

export const getModelDisplayPricing = (
  record,
  selectedGroup = 'all',
  groupRatios = {},
  tokenUnit = 'M',
) => {
  if (!record) {
    return null;
  }

  const effectiveGroup = getEffectivePricingGroup(record, selectedGroup, groupRatios);
  return {
    ...effectiveGroup,
    pricing: getTokenPriceBreakdown(record, effectiveGroup.ratio, tokenUnit),
  };
};

export const getModelGroupPricingRows = (
  record,
  groupRatios = {},
  usableGroups = {},
  tokenUnit = 'M',
) => {
  return getModelEnabledGroups(record).map((group) => ({
    group,
    ratio: getRatioNumber(groupRatios[group], 1),
    description: usableGroups[group] || '',
    pricing: getTokenPriceBreakdown(
      record,
      getRatioNumber(groupRatios[group], 1),
      tokenUnit,
    ),
  }));
};

export const getPricingGroupLabel = (pricingInfo, selectedGroup = 'all') => {
  if (!pricingInfo?.group) {
    return null;
  }
  if (selectedGroup && selectedGroup !== 'all' && pricingInfo.mode === 'selected') {
    return '展示分组';
  }
  return '最低分组';
};
