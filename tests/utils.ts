import parse from 'date-fns/parse';

import {
  DATE_FORMAT,
  FridgeDoorClosed,
  FridgeDoorOpened,
  SmartFridge
} from '../src/SmartFridge';

export function setCurrentDate(_payload: string) {
  const date = parse(_payload, DATE_FORMAT, new Date());

  jest.setSystemTime(date);
}

export interface FridgeTestActions {
  fridgeDoorOpened: () => void;
  fridgeDoorClosed: () => void;
}

export function testActionsFor(fridge: SmartFridge) {
  return {
    fridgeDoorOpened: () => fridge.handle(FridgeDoorOpened()),
    fridgeDoorClosed: () => fridge.handle(FridgeDoorClosed())
  };
}
