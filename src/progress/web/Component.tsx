import { Subscription } from 'rxjs';
import * as React from 'react';
import { Component, ReactNode } from 'react';
import { Try } from 'javascriptutilities';
import { State } from 'typesafereduxstate-js';
import * as Presets from './presets';
import { ViewModel, Identity } from './Dependency';

export namespace Props {
  /**
   * Props type for progress display component.
   */
  export interface Type {
    identity?: Identity.ProviderType;
    viewModel: ViewModel.Self;

    /**
     * We can declare the preset progress display component here.
     */
    presetComponent?: Presets.Case;

    /**
     * If we do not want to default progress display item, we can create a
     * custom one here.
     * @returns {ReactNode} A ReactNode instance.
     */
    displayComponent?(): ReactNode;
  }
}

/**
 * Component for progress display.
 * @extends {Component<Props.Type,State.Self<any>>} Component extension.
 */
export class Self extends Component<Props.Type,State.Self<any>> {
  private readonly viewModel: ViewModel.Self;
  private readonly subscription: Subscription;

  public constructor(props: Props.Type) {
    super(props);
    this.viewModel = props.viewModel;
    this.subscription = new Subscription();
  }

  public componentWillMount() {
    this.viewModel.initialize();

    this.viewModel.stateStream()
      .mapNonNilOrEmpty(v => v)
      .distinctUntilChanged()
      .doOnNext(v => this.setState(v))
      .subscribe()
      .toBeDisposedBy(this.subscription);
  }

  public componentWillUnmount() {
    this.viewModel.deinitialize();
    this.subscription.unsubscribe();
  }

  /**
   * Create a progress display component, either using a custom component or
   * a default preset. 
   * @returns {ReactNode} A ReactNode instance.
   */
  private createDisplayComponent = (): ReactNode => {
    let props = this.props;

    if (props.displayComponent !== undefined) {
      return props.displayComponent();
    } else {
      let presetComponent = props.presetComponent || Presets.Case.CICLE;
      let vm = this.viewModel.progressDisplayPreset_viewModel();
      let pProps: Presets.Props.Type = { viewModel: vm };
      return Presets.Utils.createPresetComponent(presetComponent, pProps);
    }
  }

  public render(): JSX.Element {
    let props = this.props;
    let viewModel = this.viewModel;

    let enabled = viewModel.progressForState(this.state)
      .map(v => typeof v === 'boolean' ? v : true)
      .getOrElse(false);

    let displayComponent = enabled ? this.createDisplayComponent() : <div/>;

    let identity = Try.unwrap(props.identity)
      .flatMap(v => Try.unwrap(v.progress))
      .getOrElse(() => Identity.createDefaultSelector());

    return <div {...identity.containerIdentity(enabled).value}>
      <div {...identity.backgroundIdentity(enabled).value}/>
      <div {...identity.identity(enabled).value}>{displayComponent}</div>
    </div>;
  }
}