import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

import Rating from '../Rating/Rating';

import s from './General.scss';

const General = ({ rating, title, subtitle, price }) => (
  <div className={s.general}>
    <div className={s.ratingWrapper}>
      <Rating rating={rating} />
    </div>
    <div className={s.dataWrapper}>
      <span className={cx(s.title, 'title')}>{title}</span>
      <span className={cx(s.subtitle, 'subtitle')}>{subtitle}</span></div>
    <span className={s.price}>${price}</span>
  </div>
);

General.propTypes = {
  rating: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  price: PropTypes.any.isRequired,
};

export default withStyles(s)(General);
