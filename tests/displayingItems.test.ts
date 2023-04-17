import { SmartFridge, StoredItem } from '../src/fridge/SmartFridge';
import { FridgeTestActions, setCurrentDate, testActionsFor } from './utils';

describe('Displaying the status of the items stored in a smart fridge', () => {
  let fridge: SmartFridge;
  let _: FridgeTestActions;

  const item = (name: string, expiry: Date): StoredItem => ({
    name,
    expiry: expiry,
    addedAt: new Date(),
    condition: 'sealed'
  })

  beforeEach(() => {
    jest.useFakeTimers();
    setCurrentDate('01/02/2021');
  })

  // TODO: decide how to display multiple expired items
  describe("shows EXPIRED for items past their expiry date", () => {
    it.each([
      ["exactly the same expiry as the current date", new Date(2021, 0, 2)],
      ["expiry before the current date", new Date(2021, 0, 1, 23, 59, 59)],
    ])('%s', (_scenario, expiry) => {
      fridge = new SmartFridge([
        item("Milk", expiry)
      ]);

      expect(fridge.display).toEqual(`EXPIRED: Milk`);
    });
  })

  describe("shows the days left until an item's expiry", () => {
    describe("0 days for items expiring on the same day", () => {
      it.each([
        ["1 hour left", new Date(2021, 1, 1, 1)],
        ["23 hours left", new Date(2021, 1, 1, 23, 59, 59)],
      ])('%s', (_scenario, expiry) => {
        fridge = new SmartFridge([
          item("Milk", expiry)
        ]);

        expect(fridge.display).toEqual(`Milk: 0 days remaining`);
      });
    })
  })
});
