import * as React from 'react';
import { Numbers } from 'javascriptutilities';
import { Props } from './Dependency';

export namespace Component {
  /**
   * Create a circle progress display component.
   * @param {Props.Type} props A Props type instance.
   * @returns {JSX.Element} A JSX Element instance.
   */
  export let Self = (props: Props.Type): JSX.Element => {
    let viewModel = props.viewModel;
    let style = viewModel.style;
    let ballStyle = { color: style.progressItemColor };

    let balls = Numbers.range(0, 12).map(v => {
      return <div className='pd-circle' style={ballStyle} key={v}/>;
    });
  
    return <div className='pd-circle-container'>{balls}</div>;
  };
}