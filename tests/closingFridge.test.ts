import { SmartFridge } from '../src/fridge/SmartFridge';
import { FridgeTestActions, testActionsFor } from './utils';

describe('Closing a smart fridge', () => {
  let fridge: SmartFridge;
  let actions: FridgeTestActions;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    fridge = new SmartFridge();
    actions = testActionsFor(fridge);

  });

  it('does not work on an already closed fridge', () => {
    actions.fridgeDoorOpened();
    actions.fridgeDoorClosed();

    expect(() => actions.fridgeDoorClosed())
      .toThrowError('Cannot close an already closed fridge');
  });
});
