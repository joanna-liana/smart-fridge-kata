import {
  FridgeDoorOpened,
  ItemAdded,
  ItemAddedPayload,
  SmartFridge
} from '../src/SmartFridge';
import { setCurrentDate } from './utils';

// TODO: set timezone, check with GH actions
describe('Opening smart fridge', () => {
  let fridge: SmartFridge;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    setCurrentDate('18/10/2021');

    fridge = new SmartFridge();
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

        fridge.handle(ItemAdded(sealedItem));

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T22:00:00.000Z',
          name: 'Bacon'
        }]);

        // when, then
        fridgeDoorOpened();

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T21:00:00.000Z',
          name: 'Bacon'
        }]);

        fridgeDoorOpened();

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T20:00:00.000Z',
          name: 'Bacon'
        }]);
      });

      it('opened item - degraded by 4 hours', () => {
        // given
        const sealedItem: ItemAddedPayload = {
          name: 'Bacon',
          expiry: EXPIRY_DATE,
          condition: 'opened'
        };

        fridge.handle(ItemAdded(sealedItem));

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T22:00:00.000Z',
          name: 'Bacon'
        }]);

        // when, then
        fridgeDoorOpened();

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T18:00:00.000Z',
          name: 'Bacon'
        }]);

        fridgeDoorOpened();

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T14:00:00.000Z',
          name: 'Bacon'
        }]);
      });
    }
  );

  function fridgeDoorOpened() {
    fridge.handle(FridgeDoorOpened());
  }
});
