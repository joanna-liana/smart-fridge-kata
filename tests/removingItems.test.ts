import { SmartFridge, StoredItem } from '../src/fridge/SmartFridge';
import { FridgeTestActions, setCurrentDate, testActionsFor } from './utils';

describe('Removing items from a smart fridge', () => {
  let fridge: SmartFridge;
  let _: FridgeTestActions;

  const item = (name: string): StoredItem => ({
    name,
    expiry: new Date(2021, 9, 22),
    addedAt: new Date(),
    condition: 'sealed'
  })

  describe(
    'an item is removed',
    () => {
      it(
        'from a fridge with a single item',
        () => {
          // given
          fridge = new SmartFridge([item('Bacon')]);
          _ = testActionsFor(fridge);

          _.fridgeDoorOpened();

          // when
          _.itemRemoved({ name: 'Bacon' });

          // then
          expect(fridge.items).toEqual([]);
        }
      );
      it(
        'from a fridge with multiple items',
        () => {
          // given
          setCurrentDate('16/10/2021');
          fridge = new SmartFridge([
            item('Bacon'),
            item('Milk')
          ]);
          _ = testActionsFor(fridge);

          // when
          _.itemRemoved({ name: 'Bacon' });

          // then
          expect(fridge.items).toEqual([
            expect.objectContaining({
              name: 'Milk'
            })
          ]);
        }
      );
    }
  );
});
