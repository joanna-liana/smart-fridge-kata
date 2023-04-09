import { parse, subHours } from 'date-fns';

export const DATE_FORMAT = 'dd/MM/yyyy';

type FridgeEventName = 'ItemAdded' | 'FridgeDoorOpened';
type ItemCondition = 'sealed' | 'opened';

export interface ItemAddedPayload {
  name: string;
  expiry: string;
  condition?: ItemCondition;
}

interface ItemToAdd {
  name: string;
  expiry: string;
}

export interface ItemAddedPayload {
  name: string;
  expiry: string;
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

interface StoredItem {
  name: string;
  expiry: Date;
  addedAt: Date;
}

export class SmartFridge {
  constructor(
    private readonly itemRepository: StoredItem[] = [],
    // TODO: fix the format of dates - ensure ISO strings
    // TODO: events should be immutable
    private readonly eventStore: FridgeEvent<
      ItemAddedPayload | FridgeDoorOpenedPayload
    >[] = [],
  ) {}

  get items(): ItemInFridgeDto[] {
    return this.itemRepository.map(item => ({
      ...item,
      expiry: item.expiry.toISOString(),
      addedAt: item.addedAt.toISOString()
    }));
  }

  handle(event: FridgeEvent) {
    if (event.name === 'ItemAdded') {
      const itemAdded = event as FridgeEvent<ItemToAdd>;

      this.eventStore.push(itemAdded);

      return this.itemRepository.push({
        expiry: new ISODate(itemAdded.payload.expiry).value,
        name: itemAdded.payload.name,
        addedAt: itemAdded.timestamp
      });
    }

    if (event.name === 'FridgeDoorOpened') {
      this.eventStore.push(event as FridgeEvent<FridgeDoorOpenedPayload>);

      this.itemRepository.forEach(item => {
        item.expiry = subHours(new Date(item.expiry), 1);
      });
    }
  }
}
