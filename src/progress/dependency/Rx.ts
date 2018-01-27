import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { ReduxStore, RxReducer } from 'reactive-rx-redux-js';
import { IncompletableSubject, Nullable, Try } from 'javascriptutilities';
import { State as S } from 'type-safe-state-js';
import { MVVM } from 'react-base-utilities-js';
import * as Base from './base';
import { ProgressItem } from './base';

export namespace Action {
  /**
   * Provide an action that includes the progress trigger.
   * @extends {Base.Action.Type} Base action extension.
   */
  export interface Type extends Base.Action.Type {
    progressDisplayStream: Observable<Nullable<ProgressItem>>;
    progressDisplayTrigger: Observer<Nullable<ProgressItem>>;
  }

  /**
   * Provide action for progress display view model.
   */
  export interface ProviderType {
    progress: Type;
  }

  /**
   * Create default progress display action. The top action should provide this 
   * action with 'progress' namespace. We need a IncompletableSubject wrapper 
   * because this is a global subject - otherwise, it may be prematurely 
   * terminated.
   */
  export let createDefault = (): Type => {
    let subject = new BehaviorSubject<Nullable<ProgressItem>>(undefined);
    let wrapper = new IncompletableSubject(subject);
    
    return {
      fullProgressValuePath: 'progress.value',
      progressDisplayStream: wrapper.asObservable(),
      progressDisplayTrigger: wrapper,
    };
  };
}

export namespace Provider {
  /**
   * Provide the relevant dependencies for this view model.
   * @extends {ReduxStore.Provider.Type} Store provider extension.
   */
  export interface Type extends ReduxStore.Provider.Type {
    action: Action.ProviderType;
  }
}

export namespace Reducer {
  /**
   * Create default reducer for progress display.
   * @param {Action.ProviderType} action Action provider.
   * @returns {Observable<RxReducer<any>>} An Observable instance.
   */
  export let createDefault = (action: Action.ProviderType): Observable<RxReducer<any>> => {
    let pAction = action.progress;
    let path = pAction.fullProgressValuePath;
    let pgStream = pAction.progressDisplayStream;

    return ReduxStore.Rx.createReducer(pgStream, (state, v) => {
      return state.updatingValue(path, v.value);
    });
  };
}

export namespace ViewModel {
  /**
   * View model for progress display.
   * @extends {Base.ViewModel.DisplayType} DisplayType extension.
   */
  export interface Type extends Base.ViewModel.DisplayType {}

  /**
   * Use this class to handle app-wide progress display.
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
      return this.provider.action.progress.progressDisplayTrigger;
    }

    public progressDisplayStream(): Observable<Try<ProgressItem>> {
      return this.baseVM.progressDisplayStream();
    }

    public progressForState(state: Readonly<Nullable<S.Self<any>>>): Try<ProgressItem> {
      return this.baseVM.progressForState(state);
    }
  }
}