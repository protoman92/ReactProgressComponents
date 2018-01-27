import { Observable, Observer } from 'rxjs';
import { Nullable, Try } from 'javascriptutilities';
import { State as S } from 'type-safe-state-js';
import { DispatchReducer, ReduxStore as Store } from 'reactive-rx-redux-js';
import { MVVM } from 'react-base-utilities-js';
import * as Base from './base';
import { ProgressItem } from './base';

export namespace Action {
  export let UPDATE_PROGRESS_ACTION = 'UPDATE_PROGRESS_ACTION';

  /**
   * Provide actions for the dispatch store.
   * @extends {Base.Action.Type} Base action extension.
   */
  export interface CreatorType extends Base.Action.Type {
    createUpdateAction(progress: Nullable<ProgressItem>): Store.Dispatch.Action.Type<Nullable<ProgressItem>>;
  }

  /**
   * Provide the action creator progress namespace.
   */
  export interface ProviderType {
    progress: CreatorType;
  }

  /**
   * Create default progress action creator.
   */
  export let createDefault = (): CreatorType => {  
    let fullProgressValuePath = 'progress.value';

    return {
      fullProgressValuePath,
      createUpdateAction: (progress: Nullable<ProgressItem>) => ({
        id: UPDATE_PROGRESS_ACTION,
        fullValuePath: fullProgressValuePath,
        payload: progress,
      }),
    };
  };

  /**
   * Check if an action is a progress action.
   * @param {ReduxStore.Dispatch.Action.Type<any>} action An Action instance.
   * @returns {boolean} A boolean value.
   */
  export function isInstance(action: Store.Dispatch.Action.Type<any>): boolean {
    switch (action.id) {
      case UPDATE_PROGRESS_ACTION: return true;
      default: return false;
    }
  }
}

export namespace Reducer {
  /**
   * Create default reducer for progress display.
   * @returns {DispatchReducer<any>} A DispatchReducer instance.
   */
  export let createDefault = (): DispatchReducer<any> => {
    return (state: S.Self<any>, action: Store.Dispatch.Action.Type<any>) => {
      switch (action.id) {
        case Action.UPDATE_PROGRESS_ACTION:
          return state.updatingValue(action.fullValuePath, action.payload);

        default:
          return state;
      }
    };
  };
}

export namespace Provider {
  /**
   * Provide the relevant dependencies for this view model.
   * @extends {Base.Provider.Type} Base provider extension.
   */
  export interface Type extends Base.Provider.Type {
    action: Action.ProviderType;
    store: Store.Dispatch.Self;
  }
}

export namespace ViewModel {
  /**
   * Dispatch store-based view model.
   * @extends {Base.ViewModel.DisplayType} Base view model extension.
   */
  export interface Type extends Base.ViewModel.DisplayType {}

  /**
   * Use this class to handle progress display.
   * @implements {Type} Type implementation.
   */
  export class Self implements Type {
    private readonly provider: Provider.Type;
    private readonly baseVM: Base.ViewModel.DisplayType;

    public get screen(): Nullable<MVVM.Navigation.Screen.Type> {
      return this.baseVM.screen;
    }

    public constructor(provider: Provider.Type) {
      this.provider = provider;
      this.baseVM = new Base.ViewModel.Self(provider);
    }

    public initialize = (): void => {};
    public deinitialize = (): void => {};

    public stateStream = (): Observable<Try<S.Self<any>>> => {
      return this.baseVM.stateStream();
    }

    public progressDisplayTrigger(): Observer<Nullable<ProgressItem>> {
      let actionFn = this.provider.action.progress.createUpdateAction;
      return this.provider.store.actionTrigger().mapObserver(v => actionFn(v));
    }

    public progressDisplayStream(): Observable<Try<ProgressItem>> {
      return this.baseVM.progressDisplayStream();
    }

    public progressForState(state: Readonly<Nullable<S.Self<any>>>): Try<ProgressItem> {
      return this.baseVM.progressForState(state);
    }
  }
}