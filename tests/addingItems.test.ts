import { format } from 'date-fns';
import parse from 'date-fns/parse';

const DATE_FORMAT = 'dd/MM/yyyy';

describe('Adding items to smart fridge', () => {
  interface ItemToAdd {
    name: string;
    expiry: string;
  }

  interface ItemInFridge {
    name: string;
    expiry: string;
  }

  interface ItemInFridgeDto {
    name: string;
    expiry: string;
    addedAt: string;
  }

  interface FridgeEvent<TPayload = unknown> {
    name: string;
    payload: TPayload;
    timestamp: Date;
  }

  class SmartFridge {
    constructor(
      private readonly eventStore: FridgeEvent<ItemInFridge>[] = []
    ) {}

    get itemsInFridge(): ItemInFridgeDto[] {
      return this.eventStore.map((e: FridgeEvent<ItemInFridge>) => ({
        ...e.payload,
        addedAt: format(e.timestamp, DATE_FORMAT)
      }));
    }

    async addItem(item: ItemToAdd) {
      this.eventStore.push({
        name: 'ItemAdded',
        payload: item,
        timestamp: new Date()
      });
    }
  }

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
          expect(fridge.itemsInFridge).toEqual([
            { name: 'Milk', expiry: '21/10/21', addedAt: '18/10/2021' },
            { name: 'Cheese', expiry: '18/01/22', addedAt: '01/01/2022' },
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
              payload: {
                name: 'Bacon',
                expiry: '22/10/21',
              },
              name: 'ItemAdded',
              timestamp: new Date()
            }
          ]);

          // when
          setCurrentDate('18/10/2021');
          itemAdded({ name: 'Milk', expiry: '21/10/21' });

          setCurrentDate('01/01/2022');
          itemAdded({ name: 'Cheese', expiry: '18/01/22' });

          // then
          expect(fridge.itemsInFridge).toEqual([
            { name: 'Bacon', expiry: '22/10/21', addedAt: '16/10/2021' },
            { name: 'Milk', expiry: '21/10/21', addedAt: '18/10/2021' },
            { name: 'Cheese', expiry: '18/01/22', addedAt: '01/01/2022' },
          ]);
        }
      );
    }
  );

  function setCurrentDate(_payload: string) {
    const date = parse(_payload, DATE_FORMAT, new Date());

    jest.setSystemTime(date);
  }

  function itemAdded(_payload: { name: string; expiry: string }) {
    fridge.addItem(_payload);
  }
});

// TODO: scenarios
// duplicate item? prevent to ensure correct calculation of expiry date
// restore fridge items from events
