import { SmartFridge } from '../src/fridge/SmartFridge';
import {
  dayOver,
  FridgeTestActions,
  setCurrentDate,
  testActionsFor
} from './utils';

describe('Smart fridge acceptance test', () => {
  let fridgeDisplay: string;
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
    itemRemoved({ name: 'Milk' });
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.itemAdded({ name: 'Milk', expiry: '26/10/21', condition: 'opened' });
    _.itemAdded({ name: 'Peppers', expiry: '23/10/21', condition: 'opened' });
    _.fridgeDoorClosed();

    dayOver();

    _.fridgeDoorOpened();
    itemRemoved({ name: 'Beef' });
    itemRemoved({ name: 'Lettuce' });
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.itemAdded({ name: 'Lettuce', expiry: '22/10/21', condition: 'opened' });
    _.fridgeDoorClosed();

    _.fridgeDoorOpened();
    _.fridgeDoorClosed();

    dayOver();

    // then
    expect(fridgeDisplay).toEqual(`EXPIRED: Milk
Lettuce: 0 days remaining
Peppers: 1 day remaining
Cheese: 31 days remaining`);
  });
});


function itemRemoved(_payload: { name: string }) {
  throw new Error('Function not implemented.');
}
