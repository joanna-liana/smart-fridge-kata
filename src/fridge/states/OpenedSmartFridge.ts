import { ISODate } from '../../ISODate';
import { FridgeEvent, ItemAddedPayload, ItemRemovedPayload } from '../SmartFridge';
import { ClosedSmartFridge } from './ClosedSmartFridge';
import { SmartFridgeState } from './SmartFridgeState';


export class OpenedSmartFridge extends SmartFridgeState {
  handle(event: FridgeEvent) {
    if (event.name === 'FridgeDoorClosed') {
      return new ClosedSmartFridge(this.itemRepository);
    }

    if (event.name === 'ItemAdded') {
      const itemAdded = event as FridgeEvent<ItemAddedPayload>;

      this.addItem(itemAdded);
    }

    if (event.name === 'ItemRemoved') {
      const itemRemoved = event as FridgeEvent<ItemRemovedPayload>;

      this.removeItem(itemRemoved);
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

  private removeItem(itemRemoved: FridgeEvent<ItemRemovedPayload>) {
    const itemToRemove = this.itemRepository
      .find(({ name }) => name === itemRemoved.payload.name);

    if (!itemToRemove) {
      throw new Error('There is no item to remove');
    }

    this.itemRepository = this.itemRepository
      .filter(({ name }) => name !== itemRemoved.payload.name);
  }
}
