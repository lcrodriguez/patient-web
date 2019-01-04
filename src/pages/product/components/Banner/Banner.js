import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import General from '../General/General';
import Selects from '../Selects/Selects';
import Bag from '../Bag/Bag';

import mastercard from '../../../../images/payments/mastercard.svg';
import visa from '../../../../images/payments/visa.svg';
import aexpress from '../../../../images/payments/aexpress.svg';
import paypal from '../../../../images/payments/paypal.svg';

import s from './Banner.scss';

const Banner = ({ image }) => (
  <div className={s.productDetailsBanner}>
    <div className={s.productPhoto} style={{ backgroundImage: `url(${image})` }} />
    <div className={s.productInfo}>
      <General rating={4.8} title="Trainers" subtitle="trainers in white" price={76} />
      <a href="#" className={s.productGuide}>Size Guide</a>
      <Selects sizes={[1, 2, 3, 4, 5]} quantity={[1, 2, 3, 4, 5, 6, 7]} />
      <Bag />
      <div className={s.payments}>
        <div style={{ backgroundImage: `url(${visa})` }} />
        <div style={{ backgroundImage: `url(${mastercard})` }} />
        <div style={{ backgroundImage: `url(${aexpress})` }} />
        <div style={{ backgroundImage: `url(${paypal})` }} />
      </div>
      <span className={s.delivery}>FREE Delivery & Returns</span>
    </div>
  </div >
);

Banner.propTypes = {
  image: PropTypes.string.isRequired,
};

export default withStyles(s)(Banner);
