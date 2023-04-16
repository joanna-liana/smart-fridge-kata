import { FridgeEvent, ItemInFridgeDto, StoredItem } from '../SmartFridge';


export abstract class SmartFridgeState {
  constructor(
    // TODO add proper repo
    public itemRepository: StoredItem[] = []
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
