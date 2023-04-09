import { parse, subHours } from 'date-fns';

export const DATE_FORMAT = 'dd/MM/yyyy';

type FridgeEventName = 'ItemAdded' | 'FridgeDoorOpened' | 'FridgeDoorClosed';
type ItemCondition = 'sealed' | 'opened';

export interface ItemAddedPayload {
  name: string;
  expiry: string;
  condition?: ItemCondition;
}


// TODO: add type aliases - undefined payload
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FridgeDoorOpenedPayload {
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FridgeDoorClosedPayload {
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

export const FridgeDoorClosed = (): FridgeEvent<void> => ({
  name: 'FridgeDoorClosed',
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

class BaseSmartFridge {
  constructor(
    protected readonly itemRepository: StoredItem[] = [],
  ) {}

  get items(): ItemInFridgeDto[] {
    return this.itemRepository.map(item => ({
      name: item.name,
      expiry: item.expiry.toISOString(),
      addedAt: item.addedAt.toISOString()
    }));
  }
}

class OpenedSmartFridge extends BaseSmartFridge {
  handle(event: FridgeEvent) {
    if (event.name === 'ItemAdded') {
      const itemAdded = event as FridgeEvent<ItemAddedPayload>;

      return this.addItem(itemAdded);
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
}

class ClosedSmartFridge extends BaseSmartFridge {
  handle(event: FridgeEvent) {
    if (event.name === 'FridgeDoorOpened') {
      this.downgradeItemExpiry();
    }
  }

  private downgradeItemExpiry() {
    this.itemRepository.forEach(item => {
      const hoursToDegradeBy = item.condition === 'sealed' ? 1 : 4;

      item.expiry = subHours(new Date(item.expiry), hoursToDegradeBy);
    });
  }
}

export class SmartFridge {
  private fridge: OpenedSmartFridge | ClosedSmartFridge;

  constructor(
    private readonly itemRepository: StoredItem[] = [],
    // TODO: events should be immutable
    private readonly eventStore: FridgeEvent<
      ItemAddedPayload | FridgeDoorOpenedPayload
    >[] = [],
  ) {
    this.fridge = new ClosedSmartFridge(this.itemRepository);
  }

  get items(): ItemInFridgeDto[] {
    return this.fridge.items;
  }

  handle(event: FridgeEvent) {
    if (event.name === 'ItemAdded') {
      // TODO: precondition
      if (this.fridge instanceof ClosedSmartFridge) {
        throw new Error('Cannot add an item to a closed fridge');
      }

      this.eventStore.push(event as FridgeEvent<ItemAddedPayload>);

      this.fridge.handle(event);
    }

    if (event.name === 'FridgeDoorOpened') {
      if (this.fridge instanceof OpenedSmartFridge) {
        throw new Error('Cannot open an already opened fridge');
      }

      this.eventStore.push(event as FridgeEvent<FridgeDoorOpenedPayload>);

      this.fridge.handle(event);
      this.open();
    }

    if (event.name === 'FridgeDoorClosed') {
      this.eventStore.push(event as FridgeEvent<FridgeDoorClosedPayload>);

      this.close();
    }
  }

  // TODO: handle from within state fridge
  private open() {
    this.fridge = new OpenedSmartFridge(this.itemRepository);
  }

  private close() {
    this.fridge = new ClosedSmartFridge(this.itemRepository);
  }
}
