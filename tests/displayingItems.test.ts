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

  // TODO: decide how to display multiple expired items
  it.each([
    ["exactly the same expiry as the current date", new Date(2021, 0, 2)],
    ["expiry before the current date", new Date(2021, 0, 1, 23, 59, 59)],
  ])('shows EXPIRED for items past their expiry date - %s', (_scenario, expiry) => {
    setCurrentDate('01/02/2021');

    fridge = new SmartFridge([
      item("Milk", expiry)
    ]);

    expect(fridge.display).toEqual(`EXPIRED: Milk`);
  });
});
