import { format } from 'date-fns';

export const DATE_FORMAT = 'dd/MM/yyyy';

type FridgeEventName = 'ItemAdded';

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
  name: FridgeEventName;
  payload: TPayload;
  timestamp: Date;
}

export class SmartFridge {
  constructor(
    private readonly eventStore: FridgeEvent<ItemInFridge>[] = []
  ) {}

  get itemsInFridge(): ItemInFridgeDto[] {
    return this.eventStore.map((e: FridgeEvent<ItemInFridge>) => ({
      ...e.payload,
      addedAt: format(e.timestamp, DATE_FORMAT)
    }));
  }

  handle(event: FridgeEvent) {
    if (event.name === 'ItemAdded') {
      this.eventStore.push(event as FridgeEvent<ItemToAdd>);
    }
  }
}
