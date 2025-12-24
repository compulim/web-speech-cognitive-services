import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback } from 'react';

import getPonyfillCapabilities from '../getPonyfillCapabilities.js';
import Select, { Option } from '../Bootstrap/Select.tsx';
import setRegion from '../data/actions/setRegion.ts';

const RegionSelector = () => {
  const { ponyfillType, region } = useSelector(({ ponyfillType, region }) => ({
    ponyfillType,
    region
  }));

  const dispatch = useDispatch();
  const dispatchSetRegion = useCallback(value => dispatch(setRegion(value)), [dispatch]);
  const ponyfillCapabilities = getPonyfillCapabilities(ponyfillType);

  return (
    <Select disabled={!ponyfillCapabilities.speechServices} onChange={dispatchSetRegion} value={region}>
      <Option text="West US" value="westus" />
      <Option text="West US 2" value="westus2" />
      <Option text="East US" value="eastus" />
      <Option text="East US 2" value="eastus2" />
      <Option text="East Asia" value="eastasia" />
      <Option text="South East Asia" value="southeastasia" />
      <Option text="North Europe" value="northeurope" />
      <Option text="West Europe" value="westeurope" />
    </Select>
  );
};

export default RegionSelector;
