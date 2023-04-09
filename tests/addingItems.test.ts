import { ItemAdded, SmartFridge } from '../src/SmartFridge';
import { setCurrentDate } from './utils';

// TODO: scenarios
// duplicate item? prevent to ensure correct calculation of expiry date
// TODO: should you be able to add an item before opening the fridge first?
describe('Adding items to smart fridge', () => {
  let fridge: SmartFridge;

  beforeAll(() => {

    jest.useFakeTimers();
  });

  describe(
    'when an item is added, the fridge captures information about that item',
    () => {
      it(
        'empty fridge',
        () => {
          // given
          fridge = new SmartFridge([]);

          // when
          setCurrentDate('18/10/2021');
          itemAdded({ name: 'Milk', expiry: '21/10/21' });

          setCurrentDate('01/01/2022');
          itemAdded({ name: 'Cheese', expiry: '18/01/22' });

          // then
          expect(fridge.items).toEqual([
            {
              name: 'Milk',
              expiry: '2021-10-20T22:00:00.000Z',
              addedAt: '2021-10-17T22:00:00.000Z'
            },
            {
              name: 'Cheese',
              expiry: '2022-01-17T23:00:00.000Z',
              addedAt: '2021-12-31T23:00:00.000Z'
            },
          ]);
        }
      );
      it(
        'fridge with items',
        () => {
          // given
          setCurrentDate('16/10/2021');
          fridge = new SmartFridge([
            {
              name: 'Bacon',
              expiry: new Date(2021, 9, 22),
              addedAt: new Date(),
              condition: 'sealed'
            }
          ]);

          // when
          setCurrentDate('18/10/2021');
          itemAdded({ name: 'Milk', expiry: '21/10/21' });

          setCurrentDate('01/01/2022');
          itemAdded({ name: 'Cheese', expiry: '18/01/22' });

          // then
          expect(fridge.items).toEqual([{
            addedAt: '2021-10-15T22:00:00.000Z',
            expiry: '2021-10-21T22:00:00.000Z',
            name: 'Bacon'
          },
          {
            addedAt: '2021-10-17T22:00:00.000Z',
            expiry: '2021-10-20T22:00:00.000Z',
            name: 'Milk'
          },
          {
            addedAt: '2021-12-31T23:00:00.000Z',
            expiry: '2022-01-17T23:00:00.000Z',
            name: 'Cheese'
          }]);
        }
      );
    }
  );

  it('an item cannot be added without opening the fridge first', () => {
    fridge = new SmartFridge([]);

    expect(
      () => itemAdded({ name: 'Cheese', expiry: '18/01/22' })
    ).toThrowError('Cannot add an item to a closed fridge');

    expect(fridge.items).toEqual([]);
  });

  function itemAdded(payload: { name: string; expiry: string }) {
    fridge.handle(ItemAdded(payload));
  }
});
