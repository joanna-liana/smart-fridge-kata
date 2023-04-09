import {
  FridgeDoorClosed,
  FridgeDoorOpened,
  SmartFridge,
  StoredItem
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
  });

  describe(
    'degrades the expiry of the items in the fridge based on their condition',
    () => {
      const EXPIRY_DATE = new Date(2021, 9, 22);

      it('sealed item - degraded by 1 hour', () => {
        // given
        const sealedItem: StoredItem = {
          name: 'Bacon',
          expiry: EXPIRY_DATE,
          addedAt: new Date(),
          condition: 'sealed'
        };

        fridge = new SmartFridge([sealedItem]);

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

        fridgeDoorClosed();
        fridgeDoorOpened();

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T20:00:00.000Z',
          name: 'Bacon'
        }]);
      });

      it('opened item - degraded by 4 hours', () => {
        // given
        const openedItem: StoredItem = {
          name: 'Bacon',
          expiry: EXPIRY_DATE,
          addedAt: new Date(),
          condition: 'opened'
        };

        fridge = new SmartFridge([openedItem]);

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

        fridgeDoorClosed();
        fridgeDoorOpened();

        expect(fridge.items).toEqual([{
          addedAt: '2021-10-17T22:00:00.000Z',
          expiry: '2021-10-21T14:00:00.000Z',
          name: 'Bacon'
        }]);
      });
    }
  );

  it('does not open an already opened fridge', () => {
    fridge = new SmartFridge();
    fridgeDoorOpened();

    expect(() => fridgeDoorOpened())
      .toThrowError('Cannot open an already opened fridge');
  });

  function fridgeDoorOpened() {
    fridge.handle(FridgeDoorOpened());
  }

  function fridgeDoorClosed() {
    fridge.handle(FridgeDoorClosed());
  }
});
