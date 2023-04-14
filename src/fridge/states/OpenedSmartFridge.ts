import { ISODate } from '../../ISODate';
import { FridgeEvent, ItemAddedPayload } from '../SmartFridge';
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
