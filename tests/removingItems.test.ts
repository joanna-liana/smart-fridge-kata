import { SmartFridge, StoredItem } from '../src/fridge/SmartFridge';
import { FridgeTestActions, testActionsFor } from './utils';

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
          fridge = new SmartFridge([
            item('Bacon'),
            item('Milk')
          ]);
          _ = testActionsFor(fridge);

          _.fridgeDoorOpened();

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

  describe('an item cannot be removed', () => {
    it('if it does not exist', () => {
      fridge = new SmartFridge([]);
      _ = testActionsFor(fridge);

      _.fridgeDoorOpened();

      expect(
        () => _.itemRemoved({ name: 'Bacon' })
      ).toThrowError('There is no item to remove');

      expect(fridge.items).toEqual([]);
    });
  });

  it('without opening the fridge first', () => {
    fridge = new SmartFridge([]);
    _ = testActionsFor(fridge);

    expect(
      () => _.itemRemoved({ name: 'Bacon' })
    ).toThrowError('Cannot remove an item from a closed fridge');

    expect(fridge.items).toEqual([]);
  });
});
