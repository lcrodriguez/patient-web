import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import $ from 'jquery';
import PropTypes from 'prop-types';
/* eslint-disable */
import 'imports-loader?$=jquery,this=>window!metrojs/release/MetroJs.Full/MetroJs';
/* eslint-enable */

import s from './LiveTile.scss';

class LiveTile extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  static defaultProps = {
    children: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      id: `live-tile-${Math.floor(Math.random() * 255)}`,
    };
  }

  componentDidMount() {
    const el = $(`#${this.state.id}`);
    el.css('height', el.data('height'))
      .liveTile();
  }

  render() {
    const {
      children,
      ...attr
    } = this.props;
    return (
      <div {...attr} id={this.state.id} className="live-tile">
        {children}
      </div>
    );
  }
}

export default withStyles(s)(LiveTile);
