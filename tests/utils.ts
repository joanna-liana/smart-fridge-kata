import parse from 'date-fns/parse';

import {
  DATE_FORMAT,
  FridgeDoorClosed,
  FridgeDoorOpened,
  ItemAdded,
  SmartFridge
} from '../src/SmartFridge';

export function setCurrentDate(_payload: string) {
  const date = parse(_payload, DATE_FORMAT, new Date());

  jest.setSystemTime(date);
}

interface ItemAddedPayload {
  name: string;
  expiry: string;
}

export interface FridgeTestActions {
  fridgeDoorOpened: () => void;
  fridgeDoorClosed: () => void;
  itemAdded: (payload: ItemAddedPayload) => void;
}

export function testActionsFor(fridge: SmartFridge) {
  return {
    fridgeDoorOpened: () => fridge.handle(FridgeDoorOpened()),
    fridgeDoorClosed: () => fridge.handle(FridgeDoorClosed()),
    itemAdded: (payload: ItemAddedPayload) => fridge.handle(ItemAdded(payload))
  };
}
