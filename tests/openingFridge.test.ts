import {
  FridgeDoorOpened,
  ItemAdded,
  ItemAddedPayload,
  SmartFridge
} from '../src/SmartFridge';
import { setCurrentDate } from './utils';

describe('Opening smart fridge', () => {
  let fridge: SmartFridge;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    setCurrentDate('18/10/2021');
  });

  describe(
    'degrades the expiry of the items in the fridge based on their condition',
    () => {
      const EXPIRY_DATE = '22/10/21';

      it('sealed item - degraded by 1 hour', () => {
        // given
        const sealedItem: ItemAddedPayload = {
          name: 'Bacon',
          expiry: EXPIRY_DATE,
          condition: 'sealed'
        };

        fridge = new SmartFridge([
          ItemAdded(sealedItem),
        ]);

        // when, then
        fridgeDoorOpened();

        expect(fridge.itemsInFridge).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T23:00:00.000Z',
          name: 'Bacon'
        }]);

        fridgeDoorOpened();

        expect(fridge.itemsInFridge).toEqual([{
          addedAt: '2021-10-21T23:00:00.000Z',
          expiry: '2021-10-21T22:00:00.000Z',
          name: 'Bacon'
        }]);
      });
    }
  );

  function fridgeDoorOpened() {
    fridge.handle(FridgeDoorOpened());
  }
});
