import { Subscription } from 'rxjs';
import { Nullable } from 'javascriptutilities';
import { Base } from './dependency';
import { ProgressItem } from './dependency/base';

/**
 * Displayable interface that can display progress. The top app component should
 * implement this to handle progress displaying.
 */
export interface Type {
  viewModel: Readonly<Base.ViewModel.Type>;
  subscription: Subscription;
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