import { parse, subHours } from 'date-fns';

export const DATE_FORMAT = 'dd/MM/yyyy';

type FridgeEventName = 'ItemAdded' | 'FridgeDoorOpened';
type ItemCondition = 'sealed' | 'opened';

export interface ItemAddedPayload {
  name: string;
  expiry: string;
  condition?: ItemCondition;
}


// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FridgeDoorOpenedPayload {
}

interface ItemInFridgeDto {
  name: string;
  expiry: string;
  addedAt: string;
}

interface FridgeEvent<TPayload = unknown> {
  name: FridgeEventName;
  payload: TPayload;
  timestamp: Date;
}

export const ItemAdded = (
  payload: ItemAddedPayload
): FridgeEvent<ItemAddedPayload> => ({
  name: 'ItemAdded',
  timestamp: new Date(),
  payload: payload
});

export const FridgeDoorOpened = (): FridgeEvent<void> => ({
  name: 'FridgeDoorOpened',
  timestamp: new Date(),
  payload: undefined
});


class ISODate {
  private readonly INPUT_FORMAT = 'dd/MM/yy';
  public readonly value;

  constructor(formatted: string) {
    this.value = parse(
      formatted,
      this.INPUT_FORMAT,
      new Date()
    );
  }

  toString() {
    return this.value.toISOString();
  }
}

export interface StoredItem {
  name: string;
  expiry: Date;
  addedAt: Date;
  condition: ItemCondition;
}

export class SmartFridge {
  private isClosed = true;

  constructor(
    private readonly itemRepository: StoredItem[] = [],
    // TODO: events should be immutable
    private readonly eventStore: FridgeEvent<
      ItemAddedPayload | FridgeDoorOpenedPayload
    >[] = [],
  ) {}

  get items(): ItemInFridgeDto[] {
    return this.itemRepository.map(item => ({
      name: item.name,
      expiry: item.expiry.toISOString(),
      addedAt: item.addedAt.toISOString()
    }));
  }

  handle(event: FridgeEvent) {
    if (event.name === 'ItemAdded') {
      if (this.isClosed) {
        throw new Error('Cannot add an item to a closed fridge');
      }

      const itemAdded = event as FridgeEvent<ItemAddedPayload>;

      this.eventStore.push(itemAdded);

      return this.addItem(itemAdded);
    }

    if (event.name === 'FridgeDoorOpened') {
      if (!this.isClosed) {
        throw new Error('Cannot open an already opened fridge');
      }

      this.eventStore.push(event as FridgeEvent<FridgeDoorOpenedPayload>);

      this.open();
      this.downgradeItemExpiry();
    }
  }

  private addItem(itemAdded: FridgeEvent<ItemAddedPayload>) {
    return this.itemRepository.push({
      expiry: new ISODate(itemAdded.payload.expiry).value,
      name: itemAdded.payload.name,
      addedAt: itemAdded.timestamp,
      condition: itemAdded.payload.condition ?? 'sealed'
    });
  }

  private downgradeItemExpiry() {
    this.itemRepository.forEach(item => {
      const hoursToDegradeBy = item.condition === 'sealed' ? 1 : 4;

      item.expiry = subHours(new Date(item.expiry), hoursToDegradeBy);
    });
  }

  private open() {
    this.isClosed = false;
  }
}
