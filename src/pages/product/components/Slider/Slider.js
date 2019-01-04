import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Slick from 'react-slick';

import SliderArrow from '../SliderArrow/SliderArrow';
import ProductCard from '../../../products/components/ProductCard/ProductCard';

import s from './Slider.scss';

const Slider = ({ slides }) => {
  const itemsToDisplay = 4;
  const settings = {
    className: s.slick,
    infinite: false,
    speed: 500,
    slidesToShow: itemsToDisplay,
    slidesToScroll: 1,
    initialSlide: 0,
    nextArrow: <SliderArrow orientation="right" itemsToDisplay={itemsToDisplay} />,
    prevArrow: <SliderArrow orientation="left" itemsToDisplay={itemsToDisplay} />,
    responsive: [{
      breakpoint: 992,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 575,
      settings: {
        slidesToShow: 2,
        infinite: true,
      },
    },
    {
      breakpoint: 360,
      settings: {
        slidesToShow: 1,
        infinite: true,
      },
    }],
  };
  return (
    <div className={s.slider} >
      <Slick {...settings}>
        {slides.map(slide =>
          <div className={s.sliderItem} key={slide.id}><ProductCard {...slide} rating={4.6} /></div>)}
      </Slick>
    </div >
  );
};

Slider.propTypes = {
  slides: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default withStyles(s)(Slider);
