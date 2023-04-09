import { setCurrentDate } from './utils';

describe('Smart fridge acceptance test', () => {
  let fridgeDisplay: string;

  it('Interactions with the fridge produce the expected outcome', () => {
    // given, when
    setCurrentDate('18/10/2021');

    fridgeDoorOpened();
    itemAdded({ name: 'Milk', expiry: '21/10/21', condition: 'sealed' });
    itemAdded({ name: 'Cheese', expiry: '18/11/21', condition: 'sealed' });
    itemAdded({ name: 'Beef', expiry: '20/10/21', condition: 'sealed' });
    itemAdded({ name: 'Lettuce', expiry: '22/10/21', condition: 'sealed' });
    fridgeDoorClosed();

    dayOver();

    fridgeDoorOpened();
    fridgeDoorClosed();

    fridgeDoorOpened();
    fridgeDoorClosed();

    fridgeDoorOpened();
    itemRemoved({ name: 'Milk' });
    fridgeDoorClosed();

    fridgeDoorOpened();
    itemAdded({ name: 'Milk', expiry: '26/10/21', condition: 'opened' });
    itemAdded({ name: 'Peppers', expiry: '23/10/21', condition: 'opened' });
    fridgeDoorClosed();

    dayOver();

    fridgeDoorOpened();
    itemRemoved({ name: 'Beef' });
    itemRemoved({ name: 'Lettuce' });
    fridgeDoorClosed();

    fridgeDoorOpened();
    itemAdded({ name: 'Lettuce', expiry: '22/10/21', condition: 'opened' });
    fridgeDoorClosed();

    fridgeDoorOpened();
    fridgeDoorClosed();

    dayOver();

    // then
    expect(fridgeDisplay).toEqual(`EXPIRED: Milk
Lettuce: 0 days remaining
Peppers: 1 day remaining
Cheese: 31 days remaining`);
  });
});


function fridgeDoorOpened() {
  throw new Error('Function not implemented.');
}

function itemAdded(_payload: {
  name: string; expiry: string; condition: string;
}) {
  throw new Error('Function not implemented.');
}

function fridgeDoorClosed() {
  throw new Error('Function not implemented.');
}

function dayOver() {
  throw new Error('Function not implemented.');
}

function itemRemoved(_payload: { name: string }) {
  throw new Error('Function not implemented.');
}
