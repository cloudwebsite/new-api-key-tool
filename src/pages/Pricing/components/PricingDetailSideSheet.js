import React, { useMemo, useState } from 'react';
import { Divider, SideSheet } from '@douyinfe/semi-ui';
import { getModelGroupPricingRows } from '../pricingUtils';
import PricingDetailBasicInfoSection from './PricingDetailBasicInfoSection';
import PricingDetailEndpointsSection from './PricingDetailEndpointsSection';
import PricingDetailGroupPricingSection from './PricingDetailGroupPricingSection';

const PricingDetailSideSheet = ({
  visible,
  onClose,
  model,
  groupRatios,
  usableGroups,
  autoGroups,
  copyText,
  tokenUnit,
  showRatio,
}) => {
  const [apiEndpointsExpanded, setApiEndpointsExpanded] = useState(false);
  const [groupPricingExpanded, setGroupPricingExpanded] = useState(false);

  const selectedModelGroupPricing = useMemo(
    () => getModelGroupPricingRows(model, groupRatios, usableGroups, tokenUnit),
    [groupRatios, model, tokenUnit, usableGroups],
  );

  const selectedModelAutoGroupChain = useMemo(() => {
    if (!model || !Array.isArray(model.enable_groups)) {
      return [];
    }
    return autoGroups.filter((group) => model.enable_groups.includes(group));
  }, [autoGroups, model]);

  const visibleSelectedModelGroupPricing = useMemo(() => {
    if (groupPricingExpanded) {
      return selectedModelGroupPricing;
    }
    return selectedModelGroupPricing.slice(0, 3);
  }, [groupPricingExpanded, selectedModelGroupPricing]);

  React.useEffect(() => {
    setApiEndpointsExpanded(false);
    setGroupPricingExpanded(false);
  }, [model]);

  return (
    <SideSheet
      placement="right"
      visible={visible}
      width={640}
      onCancel={onClose}
      title={model?.model_name || '模型详情'}
    >
      {model ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <PricingDetailBasicInfoSection
            model={model}
            copyText={copyText}
            autoGroupChain={selectedModelAutoGroupChain}
            usableGroups={usableGroups}
          >
            <PricingDetailGroupPricingSection
              items={selectedModelGroupPricing}
              visibleItems={visibleSelectedModelGroupPricing}
              expanded={groupPricingExpanded}
              onToggleExpanded={() => setGroupPricingExpanded((prev) => !prev)}
              quotaType={model.quota_type}
              showRatio={showRatio}
            />
          </PricingDetailBasicInfoSection>

          <Divider margin={4} />

          <PricingDetailEndpointsSection
            model={model}
            copyText={copyText}
            expanded={apiEndpointsExpanded}
            onToggleExpanded={() => setApiEndpointsExpanded((prev) => !prev)}
          />
        </div>
      ) : null}
    </SideSheet>
  );
};

export default PricingDetailSideSheet;
