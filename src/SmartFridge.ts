import { parse } from 'date-fns';

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


const INPUT_FORMAT_STRING = 'dd/MM/yy';

class ISODate {
  public readonly value;

  constructor(formatted: string) {
    this.value = parse(
      formatted,
      INPUT_FORMAT_STRING,
      new Date()
    );
  }

  toString() {
    return this.value.toISOString();
  }
}

export class SmartFridge {
  constructor(
    private readonly eventStore: FridgeEvent<ItemAddedPayload>[] = []
  ) {}

  get itemsInFridge(): ItemInFridgeDto[] {
    return this.eventStore.map(
      ({ payload, timestamp }: FridgeEvent<ItemAddedPayload>) => {
        return ({
          expiry: payload.expiry,
          name: payload.name,
          addedAt: timestamp.toISOString()
        });
      }
    );
  }

  handle(event: FridgeEvent) {
    if (event.name === 'ItemAdded') {
      const itemAdded = event as FridgeEvent<ItemToAdd>;

      this.eventStore.push({
        ...itemAdded,
        payload: {
          ...itemAdded.payload,
          expiry: new ISODate(
            itemAdded.payload.expiry
          ).toString()
        }
      });
    }
  }
}
