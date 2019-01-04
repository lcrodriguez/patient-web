/**
 *
 * SocialLink
 *
 */

import React from 'react';
import {
  Row,
  Col
} from 'reactstrap';
import * as images from '../../../images';
// import * as images from '../../../images/icons';
import ReactSVG from 'react-svg';


const MedicineIcons = props => (
  <Row className="icon-list">

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.bar} alt="..." />
      <span onClick={() => { props.selectIcon('bar') }} style={{  marginLeft: 7, cursor: 'pointer' }}>bar</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.capsule} alt="..." />
      <span onClick={() => { props.selectIcon('capsule') }} style={{  marginLeft: 7, cursor: 'pointer' }}>capsule</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.cream} alt="..." />
      <span onClick={() => { props.selectIcon('cream') }} style={{  marginLeft: 7, marginTop: -2, cursor: 'pointer' }}>cream</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 15 }} src={images.drops} alt="..." />
      <span onClick={() => { props.selectIcon('drops') }} style={{  marginLeft: 7, cursor: 'pointer' }}>drops</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 20, marginTop: 6, marginLeft: 2 }} src={images.elixir} alt="..." />
      <span onClick={() => { props.selectIcon('elixir') }} style={{  marginLeft: 8, marginTop: 10, cursor: 'pointer' }}>elixir</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 16 }} src={images.enema} alt="..." />
      <span onClick={() => { props.selectIcon('enema') }} style={{  marginLeft: 7, marginTop: 5, cursor: 'pointer' }}>enema</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25, marginTop: 5 }} src={images.film} alt="..." />
      <span onClick={() => { props.selectIcon('film') }} style={{  marginLeft: 7, marginTop: 5, cursor: 'pointer' }}>film</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.foam} alt="..." />
      <span onClick={() => { props.selectIcon('foam') }} style={{  marginLeft: 7, cursor: 'pointer' }}>foam</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.gel_for} alt="..." />
      <span onClick={() => { props.selectIcon('gel_for') }} style={{  marginLeft: 7, cursor: 'pointer' }}>gel for</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.gel_with} alt="..." />
      <span onClick={() => { props.selectIcon('gel_with') }} style={{  marginLeft: 7, cursor: 'pointer' }}>gel with</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.granule} alt="..." />
      <span onClick={() => { props.selectIcon('granule') }} style={{  marginLeft: 7, cursor: 'pointer' }}>granule</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.gum} alt="..." />
      <span onClick={() => { props.selectIcon('gum') }} style={{  marginLeft: 7, cursor: 'pointer' }}>gum</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.inhaler} alt="..." />
      <span onClick={() => { props.selectIcon('inhaler') }} style={{  marginLeft: 7, cursor: 'pointer' }}>tablet</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.tablet} alt="..." />
      <span onClick={() => { props.selectIcon('tablet') }} style={{  marginLeft: 7, cursor: 'pointer' }}>inhaler</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.injection} alt="..." />
      <span onClick={() => { props.selectIcon('injection') }} style={{  marginLeft: 7, cursor: 'pointer' }}>injection</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.kit} alt="..." />
      <span onClick={() => { props.selectIcon('kit') }} style={{  marginLeft: 7, cursor: 'pointer' }}>kit</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.liquid} alt="..." />
      <span onClick={() => { props.selectIcon('liquid') }} style={{  marginLeft: 7, cursor: 'pointer' }}>liquid</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.lozenge} alt="..." />
      <span onClick={() => { props.selectIcon('lozenge') }} style={{  marginLeft: 7, cursor: 'pointer' }}>lozenge</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.pad} alt="..." />
      <span onClick={() => { props.selectIcon('pad') }} style={{  marginLeft: 7, cursor: 'pointer' }}>pad</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.paste} alt="..." />
      <span onClick={() => { props.selectIcon('paste') }} style={{  marginLeft: 7, cursor: 'pointer' }}>paste</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.powder} alt="..." />
      <span onClick={() => { props.selectIcon('powder') }} style={{  marginLeft: 7, cursor: 'pointer' }}>powder</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.powder2} alt="..." />
      <span onClick={() => { props.selectIcon('powder2') }} style={{  marginLeft: 7, cursor: 'pointer' }}>powder2</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.ring} alt="..." />
      <span onClick={() => { props.selectIcon('ring') }} style={{  marginLeft: 7, cursor: 'pointer' }}>ring</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.shampoo} alt="..." />
      <span onClick={() => { props.selectIcon('shampoo') }} style={{  marginLeft: 7, cursor: 'pointer' }}>shampoo</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.spray} alt="..." />
      <span onClick={() => { props.selectIcon('spray') }} style={{  marginLeft: 7, cursor: 'pointer' }}>spray</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.stick} alt="..." />
      <span onClick={() => { props.selectIcon('stick') }} style={{  marginLeft: 7, cursor: 'pointer' }}>stick</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.suppository} alt="..." />
      <span onClick={() => { props.selectIcon('suppository') }} style={{  marginLeft: 7, cursor: 'pointer' }}>suppository</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.swab} alt="..." />
      <span onClick={() => { props.selectIcon('swab') }} style={{  marginLeft: 7, cursor: 'pointer' }}>swab</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.syrup} alt="..." />
      <span onClick={() => { props.selectIcon('syrup') }} style={{  marginLeft: 7, cursor: 'pointer' }}>syrup</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.tablet} alt="..." />
      <span onClick={() => { props.selectIcon('tablet') }} style={{  marginLeft: 7, cursor: 'pointer' }}>tablet</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.tape} alt="..." />
      <span onClick={() => { props.selectIcon('tape') }} style={{  marginLeft: 7, cursor: 'pointer' }}>tape</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.tincture} alt="..." />
      <span onClick={() => { props.selectIcon('tincture') }} style={{  marginLeft: 7, cursor: 'pointer' }}>tincture</span>
    </Col>

    <Col md={4} lg={3} xs={12} className="icon-list-item">
      <img style={{ width: 25 }} src={images.wafer} alt="..." />
      <span onClick={() => { props.selectIcon('wafer') }} style={{  marginLeft: 7, cursor: 'pointer' }}>wafer</span>
    </Col>

  </Row>
);



export default MedicineIcons;
