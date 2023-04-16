
import { isBefore } from 'date-fns';
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
  private state: OpenedSmartFridge | ClosedSmartFridge;
  private readonly ensureValidStateToHandleEvent: Record<FridgeEventName, () => void> = {
    FridgeDoorClosed: () => {
      if (this.state instanceof ClosedSmartFridge) {
        throw new Error('Cannot close an already closed fridge');
      }
    },
    ItemAdded: () => {
      if (this.state instanceof ClosedSmartFridge) {
        throw new Error('Cannot add an item to a closed fridge');
      }
    },
    ItemRemoved: () => {
      if (this.state instanceof ClosedSmartFridge) {
        throw new Error('Cannot remove an item from a closed fridge');
      }
    },
    FridgeDoorOpened: () => {
      if (this.state instanceof OpenedSmartFridge) {
        throw new Error('Cannot open an already opened fridge');
      }
    }
  };

  constructor(
    itemRepository: StoredItem[] = [],
    // TODO: events should be immutable
    private readonly eventStore: SupportedEvent[] = [],
  ) {
    this.state = new ClosedSmartFridge(itemRepository);
  }

  get display(): string {
    const sorted = this.state.itemRepository.sort((itemA, itemB) => {
      return itemA.expiry.getTime() - itemB.expiry.getTime();
    });

    return sorted
      .map(i => isBefore(i.expiry, new Date()) ? `EXPIRED: ${i.name}` : `${i.name}`)
      .join("\n")
  }

  get items(): ItemInFridgeDto[] {
    return this.state.items;
  }

  handle(event: FridgeEvent) {
    const handledEvents = Object.keys(this.ensureValidStateToHandleEvent);

    if (!handledEvents.includes(event.name)) {
      return;
    }

    this.ensureValidStateToHandleEvent[event.name]();

    this.eventStore.push(event as SupportedEvent);

    this.state = this.state.handle(event);
  }
}
