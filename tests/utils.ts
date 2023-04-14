import { addDays, parse } from 'date-fns';

import {
  DATE_FORMAT,
  FridgeDoorClosed,
  FridgeDoorOpened,
  ItemAdded,
  ItemAddedPayload,
  SmartFridge
} from '../src/fridge/SmartFridge';

export function setCurrentDate(_payload: string) {
  const date = parse(_payload, DATE_FORMAT, new Date());

  jest.setSystemTime(date);
}

export function dayOver() {
  const nextDay = addDays(new Date(), 1);

  jest.setSystemTime(nextDay);
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
