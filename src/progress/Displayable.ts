import { Subscription } from 'rxjs';
import { Nullable } from 'javascriptutilities';
import * as Base from './base';
import { ProgressItem } from './base';

/**
 * Displayable interface that can display progress. The top app component should
 * implement this to handle progress displaying.
 */
export interface Type {
  readonly viewModel: Readonly<Base.ViewModel.Type>;
  readonly subscription: Subscription;
  toggleProgress(progress: Nullable<ProgressItem>): void;
}

/**
 * Setup bindings for a displayable type. Call this when the component is being
 * set-up.
 * @param {Type} displayable A Type instance.
 */
export let setupBindings = (displayable: Type): void => {
  let viewModel = displayable.viewModel;
  let subscription = displayable.subscription;

  viewModel
    .progressDisplayStream()
    .doOnNext(v => displayable.toggleProgress(v.value))
    .subscribe()
    .toBeDisposedBy(subscription);
};