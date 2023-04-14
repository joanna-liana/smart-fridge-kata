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

abstract class SmartFridgeState {
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

  abstract handle(event: FridgeEvent): SmartFridgeState;
}

class OpenedSmartFridge extends SmartFridgeState {
  handle(event: FridgeEvent) {
    if (event.name === 'FridgeDoorClosed') {
      return new ClosedSmartFridge(this.itemRepository);
    }

    if (event.name === 'ItemAdded') {
      const itemAdded = event as FridgeEvent<ItemAddedPayload>;

      this.addItem(itemAdded);
    }

    return this;
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

class ClosedSmartFridge extends SmartFridgeState {
  handle(event: FridgeEvent) {
    if (event.name === 'FridgeDoorOpened') {
      this.downgradeItemExpiry();
    }

    return new OpenedSmartFridge(this.itemRepository);
  }

  private downgradeItemExpiry() {
    this.itemRepository.forEach(item => {
      const hoursToDegradeBy = item.condition === 'sealed' ? 1 : 4;

      item.expiry = subHours(new Date(item.expiry), hoursToDegradeBy);
    });
  }
}

type SupportedEvent = FridgeEvent<ItemAddedPayload | FridgeDoorOpenedPayload>;

export class SmartFridge {
  private fridge: OpenedSmartFridge | ClosedSmartFridge;
  private readonly preconditionByEvent: Record<FridgeEventName, () => void> = {
    FridgeDoorClosed: () => {
      if (this.fridge instanceof ClosedSmartFridge) {
        throw new Error('Cannot close an already closed fridge');
      }
    },
    ItemAdded: () => {
      if (this.fridge instanceof ClosedSmartFridge) {
        throw new Error('Cannot add an item to a closed fridge');
      }
    },
    FridgeDoorOpened: () => {
      if (this.fridge instanceof OpenedSmartFridge) {
        throw new Error('Cannot open an already opened fridge');
      }
    }
  };

  constructor(
    private readonly itemRepository: StoredItem[] = [],
    // TODO: events should be immutable
    private readonly eventStore: SupportedEvent[] = [],
  ) {
    this.fridge = new ClosedSmartFridge(this.itemRepository);
  }

  get items(): ItemInFridgeDto[] {
    return this.fridge.items;
  }

  handle(event: FridgeEvent) {
    const handledEvents = Object.keys(this.preconditionByEvent);

    if (!handledEvents.includes(event.name)) {
      return;
    }

    this.preconditionByEvent[event.name]();

    this.eventStore.push(event as SupportedEvent);

    this.fridge = this.fridge.handle(event);
  }
}
