import * as React from 'react';
import { Numbers } from 'javascriptutilities';
import { Props } from './Dependency';

export namespace Component {
  /**
   * Create a cube-grid progress display component.
   * @param {Props.Type} props 
   * @returns {JSX.Element} 
   */
  export let Self = (props: Props.Type): JSX.Element => {
    let viewModel = props.viewModel;
    let styles = viewModel.style;
    let cubeStyle = { color: styles.progressItemColor };

    let squares = Numbers.range(0, 9).map(v => {
      return <div className='pd-cube-grid' style={cubeStyle} key={v}/>;
    });

    return <div className='pd-cube-grid-container'>{squares}</div>;
  };
}