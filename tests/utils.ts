import parse from 'date-fns/parse';

import { DATE_FORMAT } from '../src/SmartFridge';

export function setCurrentDate(_payload: string) {
  const date = parse(_payload, DATE_FORMAT, new Date());

  jest.setSystemTime(date);
}
