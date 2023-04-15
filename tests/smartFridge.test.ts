import { SmartFridge } from '../src/fridge/SmartFridge';
import {
  dayOver,
  FridgeTestActions,
  setCurrentDate,
  testActionsFor
} from './utils';

describe('Smart fridge acceptance test', () => {
  let fridge: SmartFridge;
  let _: FridgeTestActions;

  beforeEach(() => {
    jest.useFakeTimers();

    fridge = new SmartFridge();
    _ = testActionsFor(fridge);
  });


  it('Interactions with the fridge produce the expected outcome', () => {
    // given, when
    setCurrentDate('18/10/2021');

    _.fridgeDoorOpened();
    _.itemAdded({ name: 'Milk', expiry: '21/10/21', condition: 'sealed' });
    _.itemAdded({ name: 'Cheese', expiry: '18/11/21', condition: 'sealed' });
    _.itemAdded({ name: 'Beef', expiry: '20/10/21', condition: 'sealed' });
    _.itemAdded({ name: 'Lettuce', expiry: '22/10/21', condition: 'sealed' });
    _.fridgeDoorClosed();

    dayOver();

    _.fridgeDoorOpened();
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.itemRemoved({ name: 'Milk' });
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.itemAdded({ name: 'Milk', expiry: '26/10/21', condition: 'opened' });
    _.itemAdded({ name: 'Peppers', expiry: '23/10/21', condition: 'opened' });
    _.fridgeDoorClosed();

    dayOver();

    _.fridgeDoorOpened();
    _.itemRemoved({ name: 'Beef' });
    _.itemRemoved({ name: 'Lettuce' });
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.itemAdded({ name: 'Lettuce', expiry: '22/10/21', condition: 'opened' });
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.fridgeDoorClosed();

    dayOver();

    // then
    expect(fridge.display).toEqual(`EXPIRED: Milk
Lettuce: 0 days remaining
Peppers: 1 day remaining
Cheese: 31 days remaining`);
  });
});
