import { format } from 'date-fns';
import parse from 'date-fns/parse';
import { EventEmitter } from 'events';

const DATE_FORMAT = 'dd/MM/yyyy';

enum SmartFridgeEvent {
  ItemAdded = 'ItemAdded'
}

describe('Adding items to smart fridge', () => {
  interface ItemToAdd {
    name: string;
    expiry: string;
  }

  interface ItemInFridgeDto {
    name: string;
    expiry: string;
    addedAt: string;
  }

  interface ItemInFridgeDbEntity {
    name: string;
    expiry: string;
    addedAt: Date;
  }

  interface FridgeEvent<TPayload = unknown> {
    name: SmartFridgeEvent;
    payload: TPayload;
    timestamp: Date;
  }

  type FridgeItemsRepository = ItemInFridgeDbEntity[];


  const Subscription = (
    EVENT_BUS = new EventEmitter(),
    EVENT_STORE: FridgeEvent[] = [],
    FRIDGE_ITEMS_REPOSITORY: FridgeItemsRepository = []
  ) => {

    EVENT_BUS.on(
      SmartFridgeEvent.ItemAdded,
      (event: FridgeEvent<ItemToAdd>) => {
        EVENT_STORE.push(event);

        FRIDGE_ITEMS_REPOSITORY.push({
          ...event.payload,
          addedAt: event.timestamp
        });
      }
    );
  };



  class SmartFridge {
    constructor(
      private readonly eventBus: EventEmitter,
      private readonly fridgeItemsRepository: FridgeItemsRepository
    ) {}

    get itemsInFridge(): ItemInFridgeDto[] {
      return this.fridgeItemsRepository.map(item => ({
        ...item,
        addedAt: format(item.addedAt, DATE_FORMAT)
      }));
    }

    async addItem(item: ItemToAdd) {
      this.eventBus.emit(SmartFridgeEvent.ItemAdded, {
        name: SmartFridgeEvent.ItemAdded,
        payload: item,
        timestamp: new Date(),
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
          const eventBus = new EventEmitter();
          const fridgeItemsRepository: FridgeItemsRepository = [];
          Subscription(eventBus, [], fridgeItemsRepository);

          fridge = new SmartFridge(eventBus, fridgeItemsRepository);

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

      // TODO: what if event store and state db do not equal?
      it(
        'fridge with items',
        () => {
          // given
          const eventBus = new EventEmitter();
          const fridgeItemsRepository: FridgeItemsRepository = [{
            name: 'Bacon',
            expiry: '22/10/21',
            addedAt: new Date(2021, 9, 16)
          }];
          Subscription(eventBus, [], fridgeItemsRepository);

          fridge = new SmartFridge(eventBus, fridgeItemsRepository);

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
