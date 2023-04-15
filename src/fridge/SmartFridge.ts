
import { ClosedSmartFridge } from './states/ClosedSmartFridge';
import { OpenedSmartFridge } from './states/OpenedSmartFridge';

export const DATE_FORMAT = 'dd/MM/yyyy';

// TODO: move types to states or events
type FridgeEventName = 'ItemRemoved'
  | 'ItemAdded'
  | 'FridgeDoorOpened'
  | 'FridgeDoorClosed';

type ItemCondition = 'sealed' | 'opened';

export interface ItemRemovedPayload {
  name: string;
}

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

export interface ItemInFridgeDto {
  name: string;
  expiry: string;
  addedAt: string;
}

export interface FridgeEvent<TPayload = unknown> {
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

export const ItemRemoved = (
  payload: ItemRemovedPayload
): FridgeEvent<ItemRemovedPayload> => ({
  name: 'ItemRemoved',
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

export interface StoredItem {
  name: string;
  expiry: Date;
  addedAt: Date;
  condition: ItemCondition;
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
    ItemRemoved: () => true,
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
