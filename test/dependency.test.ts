import { Observable, Subscription } from 'rxjs'; 
import { Numbers } from 'javascriptutilities';
import { Strings } from 'javascriptutilities/dist/src/string';
import { ReduxStore } from 'reactiveredux-js';
import { Data } from 'reactutilities-js';
import { ProgressDisplay } from './../src';

let timeout = 100;
type ViewModel = ProgressDisplay.Base.ViewModel.DisplayType;

describe('Progress view model should be implemented correctly', () => {
  var dispatchStore: ReduxStore.Dispatch.Self;
  var rxStore: ReduxStore.Rx.Self;
  var dispatchProvider: ProgressDisplay.Dispatch.Provider.Type;
  var rxProvider: ProgressDisplay.Rx.Provider.Type;
  var dispatchVM: ProgressDisplay.Dispatch.ViewModel.Type;
  var rxVM: ProgressDisplay.Rx.ViewModel.Type;

  beforeEach(() => {
    let rxAction = ProgressDisplay.Rx.Action.createDefault();
    let rxActionProvider = { progress: rxAction };
    let rxReducer = ProgressDisplay.Rx.Reducer.createDefault(rxActionProvider);
    let dispatchReducer = ProgressDisplay.Dispatch.Reducer.createDefault();
    dispatchStore = new ReduxStore.Dispatch.Self();
    rxStore = new ReduxStore.Rx.Self(rxReducer);

    dispatchProvider = {
      action: { progress: ProgressDisplay.Dispatch.Action.createDefault() },
      store: dispatchStore,
      substateSeparator: '.',
    };

    rxProvider = {
      action: rxActionProvider,
      store: rxStore,
      substateSeparator: '.',
    };

    dispatchStore.initialize(dispatchReducer);
    dispatchVM = new ProgressDisplay.Dispatch.ViewModel.Self(dispatchProvider);
    rxVM = new ProgressDisplay.Rx.ViewModel.Self(rxProvider);
  });

  let testProgressViewModel = (viewModel: ViewModel, done: Function) => {
    /// Setup
    let waitTime = 0.1;
    let times = 100;
    
    let progressItems: Data.Progress.Type[] = Numbers.range(0, times)
      .map(() => ({ description: Strings.randomString(10) }));

    var progressResults: Data.Progress.Type[] = [];
    let trigger = viewModel.progressDisplayTrigger();

    viewModel.progressDisplayStream()
      .mapNonNilOrEmpty(v => v)
      .map(v => v as Data.Progress.Type)
      .doOnNext(v => progressResults.push(v))
      .subscribe();

    /// When
    Observable.from(progressItems)
      .flatMap((v, i) => Observable.of(v)
        .delay(i * waitTime)
        .doOnNext(v1 => trigger.next(v1)))
      .toArray().delay(waitTime)
      .doOnNext(() => expect(progressResults).toEqual(progressItems))
      .doOnCompleted(() => done())
      .subscribe();
  };

  let testProgressDisplayable = (viewModel: ViewModel, done: Function) => {
    /// Setup
    let waitTime = 0.1;
    let times = 100;

    let progressItems: Data.Progress.Type[] = Numbers.range(0, times)
      .map(() => ({ description: Strings.randomString(10) }));

    let trigger = viewModel.progressDisplayTrigger();
    var displayCount = 0;

    let displayable: ProgressDisplay.Displayble.Type = {
      viewModel,
      toggleProgress: () => displayCount += 1,
      subscription: new Subscription(),
    };

    ProgressDisplay.Displayble.setupBindings(displayable);

    /// When
    Observable.from(progressItems)
      .flatMap((v, i) => Observable.of(v)
        .delay(i * waitTime)
        .doOnNext(v1 => trigger.next(v1)))
      .toArray().delay(waitTime)
      .doOnNext(() => expect(displayCount).toBe(times + 1))
      .doOnCompleted(() => done())
      .subscribe();
  };

  it('Dispatch progress view model should work correctly', done => {
    testProgressViewModel(dispatchVM, done);
  }, timeout);

  it('Rx progress view model should work correctly', done => {
    testProgressViewModel(rxVM, done);
  }, timeout);

  it('Dispatch displayable should be implemented correctly', done => {
    testProgressDisplayable(dispatchVM, done);
  }, timeout);

  it('Rx displayable should be implemented correctly', done => {
    testProgressDisplayable(rxVM, done);
  }, timeout);
});