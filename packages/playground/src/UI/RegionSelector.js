import { connect } from 'react-redux';
import React from 'react';

import Select from '../Bootstrap/Select';
import setRegion from '../data/actions/setRegion';

const REGIONS = {
  westus: 'West US',
  westus2: 'West US 2',
  eastus: 'East US',
  eastus2: 'East US 2',
  eastasia: 'East Asia',
  southeastasia: 'South East Asia',
  northeurope: 'North Europe',
  westeurope: 'West Europe'
};

const RegionSelector = ({
  disabled,
  region,
  setRegion
}) =>
  <Select
    disabled={ disabled }
    onChange={ setRegion }
    value={ region }
    values={ REGIONS }
  />

export default connect(
  ({
    ponyfillType,
    region
  }) => ({
    disabled: ponyfillType === 'browser',
    region
  }),
  { setRegion }
)(RegionSelector)
