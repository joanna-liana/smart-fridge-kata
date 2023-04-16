import { subHours } from 'date-fns';

import { FridgeEvent } from '../SmartFridge';
import { OpenedSmartFridge } from './OpenedSmartFridge';
import { SmartFridgeState } from './SmartFridgeState';

export class ClosedSmartFridge extends SmartFridgeState {
  handle(event: FridgeEvent) {
    if (event.name === 'FridgeDoorOpened') {
      this.downgradeItemExpiry();
    }

    return new OpenedSmartFridge(this.itemRepository);
  }

  private downgradeItemExpiry() {
    this.itemRepository.forEach(item => {
      const hoursToDegradeBy = item.condition === 'sealed' ? 1 : 5;

      item.expiry = subHours(new Date(item.expiry), hoursToDegradeBy);
    });
  }
}
