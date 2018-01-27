import * as React from 'react';
import { ReactNode } from 'react';
import { Case } from './Case';
import * as Circle from './Circle';
import * as CubeGrid from './CubeGrid';
import { Props } from './Dependency';

/**
 * Create preset components.
 * @param {Case} preset A Case instance.
 * @param {Props} props A Props type instance.
 * @returns {ReactNode} A ReactNode instance.
 */
export let createPresetComponent = (preset: Case, props: Props.Type): ReactNode => {
  switch (preset) {
    case Case.CICLE: return <Circle.Component.Self {...props}/>;
    case Case.CUBE_GRID: return <CubeGrid.Component.Self {...props}/>;
  }
};