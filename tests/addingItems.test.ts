describe('Adding items to smart fridge', () => {
  let itemsInFridge: unknown;

  // TODO: scenarios
  // empty fridge
  // fridge with items in it
  // duplicate item? prevent to ensure correct calculation of expiry date
  it('when an item is added, the fridge captures information about that item', () => {
    // given, when
    setCurrentDate('18/10/2021');
    itemAdded({ name: 'Milk', expiry: '21/10/21' });

    setCurrentDate('01/01/2022');
    itemAdded({ name: 'Cheese', expiry: '18/01/22' });

    // then
    expect(fridgeItems).toEqual([
      { name: 'Milk', expiry: '21/10/21', addedAt: '18/10/2021' },
      { name: 'Cheese', expiry: '18/11/21', addedAt: '01/01/2022' },
    ]);
  });
});

function setCurrentDate(_payload: string) {
  throw new Error('Function not implemented.');
}

function itemAdded(_payload: { name: string; expiry: string }) {
  throw new Error('Function not implemented.');
}
