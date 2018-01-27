import { Observable, Observer } from 'rxjs';
import { ReduxStore } from 'reactive-rx-redux-js';
import { Nullable, Try } from 'javascriptutilities';
import { State as S } from 'type-safe-state-js';
import { Data, MVVM } from 'react-base-utilities-js';

export type ProgressItem = Data.Progress.Type | boolean;

export namespace Action {
  /**
   * Base action for progress display view model.
   */
  export interface Type {
    fullProgressValuePath: string;
  }

  /**
   * Provide action for progress display view model.
   */
  export interface ProviderType {
    progress: Type;
  }
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

export namespace ViewModel {
  /**
   * View model for progress display. This is the generic version that all
   * view models can implement.
   */
  export interface Type {
    progressDisplayTrigger(): Observer<Nullable<ProgressItem>>;
    progressDisplayStream(): Observable<Try<ProgressItem>>;
  }

  /**
   * This view model provides more specific functionalities, and is meant to be
   * used for a separate progress display component.
   * @extends {MVVM.ViewModel.ReduxType} View model extension.
   * @extends {Type} Type extension.
   */
  export interface DisplayType extends MVVM.ViewModel.ReduxType, Type {
    progressForState(state: Readonly<Nullable<S.Self<any>>>): Try<ProgressItem>;
  }

  /**
   * Provide view model for progress display component.
   */
  export interface ProviderType {
    progressDisplay_viewModel(): DisplayType;
  }

  /**
   * Base view model class to handle app-wide progress display.
   * @implements {DisplayType} DisplayType implementation.
   */
  export class Self implements DisplayType {
    private readonly provider: Provider.Type;

    public get screen(): Nullable<MVVM.Navigation.Screen.Type> {
      return undefined;
    }

    private get fullProgressValuePath(): string {
      return this.provider.action.progress.fullProgressValuePath;
    }

    private get substatePath(): string {
      let path = this.fullProgressValuePath;
      let separator = this.provider.substateSeparator;
      return S.separateSubstateAndValuePaths(path, separator)[0];
    }

    private get progressValuePath(): string {
      let path = this.fullProgressValuePath;
      let separator = this.provider.substateSeparator;
      return S.separateSubstateAndValuePaths(path, separator)[1];
    }

    public constructor(provider: Provider.Type) {
      this.provider = provider;
    }

    public initialize = (): void => {};
    public deinitialize = (): void => {};

    public stateStream = (): Observable<Try<S.Self<any>>> => {
      let path = this.substatePath;
      return this.provider.store.stateStream().map(v => v.substateAtNode(path));
    }

    public progressDisplayTrigger(): Observer<Nullable<ProgressItem>> {
      throw new Error(`Must override this for ${this}`);
    }

    public progressDisplayStream(): Observable<Try<ProgressItem>> {
      let provider = this.provider;
      let store = provider.store;
      let path = provider.action.progress.fullProgressValuePath;

      return store.valueAtNode(path)
        .map(v => v.filter(
          v1 => Data.Progress.isInstance(v1),
          v => `${v} is not a progress item`,
        ))
        .map(v => v.map(v1 => v1 as ProgressItem));
    }

    public progressForState(state: Nullable<Readonly<S.Self<any>>>): Try<ProgressItem> {
      let path = this.progressValuePath;

      return Try.unwrap(state)
        .flatMap(v => v.valueAtNode(path))
        .filter(
          v => typeof v === 'boolean' || Data.Progress.isInstance(v), 
          v => `${v} is not a progress item`,
        )
        .map(v => v as ProgressItem);
    }
  }
}