import { Observable, Observer } from 'rxjs';
import { Nullable, Try } from 'javascriptutilities';
import { State as S } from 'typesafereduxstate-js';
import { Component, MVVM } from 'reactutilities-js';
import { Base, ProgressItem } from './../dependency';
import * as Presets from './presets';

export namespace Identity {
  /**
   * Identity for progress display component.
   * @extends {Component.Web.Identity.Type} Common identity extension.
   */
  export interface Type extends Component.Web.Identity.Type {}

  /**
   * Identity for progress display background.   
   * @extends {Component.Identity.Type} Common identity extension.
   */
  export interface BackgroundType extends Component.Web.Identity.Type {}

  /**
   * Identity for progress display container.
   * @extends {Component.Web.Identity.Type} Common identity extension.
   */
  export interface ContainerType extends Component.Web.Identity.Type {}

  /**
   * Selector for progress display container.
   */
  export interface SelectorType {
    identity(enabled: boolean): Try<Type>;
    backgroundIdentity(enabled: boolean): Try<BackgroundType>;
    containerIdentity(enabled: boolean): Try<ContainerType>;
  }

  /**
   * Provide identity for progress display component.
   */
  export interface ProviderType {
    progress?: SelectorType;
  }

  /**
   * Create a default identity selector.
   * @returns {SelectorType} A SelectorType instance.
   */
  export let createDefaultSelector = (): SelectorType => {
    return {
      identity: (enabled: boolean): Try<Type> => {
        let common = 'progress-display';

        if (enabled) {
          return Try.success({ id: undefined, className: common });
        } else {
          return Try.success({
            id: undefined,
            className: `progress-display-hidden ${common}`,
          });
        }
      },

      backgroundIdentity: (enabled: boolean): Try<BackgroundType> => {
        let common = 'progress-display-background';

        if (enabled) {
          return Try.success({ id: undefined, className: common });
        } else {
          return Try.success({
            id: undefined,
            className: `progress-display-background-hidden ${common}`,
          });
        }
      },

      containerIdentity: (enabled: boolean): Try<ContainerType> => {
        let common = 'progress-display-container display-container';

        if (enabled) {
          return Try.success({ id: undefined, className: common });
        } else {
          return Try.success({
            id: undefined,
            className: `progress-display-container-hidden ${common}`,
          });
        }
      }
    };
  };
}

export namespace Provider {
  /**
   * Provide the relevant dependencies for a web component.   
   * @extends {Base.Provider.Type} Base provider extension.
   * @extends {Presets.Provider.Type} Presets provider extension.
   */
  export interface Type extends Base.Provider.Type, Presets.Provider.Type {}
}

export namespace ViewModel {
  /**
   * View model for progress display.
   * @extends {Presets.ViewModel.ProviderType} Presets VM extension.
   */
  export interface Type extends Presets.ViewModel.ProviderType {}

  /**
   * Provide view model for progress display component.
   */
  export interface ProviderType {
    progressDisplay_viewModel(): Type;
  }

  /**
   * Use this class to handle app-wide progress display. We can push a boolean
   * flag to global state that the top app component listens to.
   * @implements {Type} Type implementation.
   */
  export class Self implements Type {
    private readonly provider: Provider.Type;
    private readonly pgVM: Base.ViewModel.DisplayType;

    public get screen(): Nullable<MVVM.Navigation.Screen.Type> {
      return undefined;
    }

    public constructor(provider: Provider.Type, vm: Base.ViewModel.DisplayType) {
      this.provider = provider;
      this.pgVM = vm;
    }

    public initialize = (): void => {};
    public deinitialize = (): void => {};

    public stateStream = (): Observable<Try<S.Self<any>>> => {
      return this.pgVM.stateStream();
    }

    public progressDisplayTrigger(): Observer<Nullable<ProgressItem>> {
      return this.pgVM.progressDisplayTrigger();
    }

    public progressDisplayStream(): Observable<Try<ProgressItem>> {
      return this.pgVM.progressDisplayStream();
    }

    public progressDisplayPreset_viewModel(): Presets.ViewModel.Type {
      return new Presets.ViewModel.Self(this.provider);
    }

    public progressForState(state: Readonly<Nullable<S.Self<any>>>): Try<ProgressItem> {
      return this.pgVM.progressForState(state);
    }
  }
}