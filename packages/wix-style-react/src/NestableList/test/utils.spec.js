import {
  getSiblingsByNodePosition,
  moveItemVertically,
  VerticalMovementDirection,
} from '../utils';

describe('NestableList utils', function() {
  it('getSiblingsByNodePosition at root level', function() {
    expect(getSiblingsByNodePosition([{ id: 1 }, { id: 2 }], [0])).toEqual([
      { id: 1 },
      { id: 2 },
    ]);
  });

  it('getSiblingsByNodePosition at nested level', function() {
    expect(
      getSiblingsByNodePosition(
        [{ id: 1, children: [{ id: 3 }, { id: 4 }] }, { id: 2 }],
        [0, 0],
      ),
    ).toEqual([{ id: 3 }, { id: 4 }]);
  });

  it('getSiblingsByNodePosition incorrect path', function() {
    expect(getSiblingsByNodePosition([{ id: 1 }, { id: 2 }], [0, 0])).toBe(
      null,
    );
  });

  it('moveItem item to the top if it is already on the most top position', function() {
    expect(
      moveItemVertically(
        [{ id: 1 }, { id: 2 }],
        { id: 1 },
        VerticalMovementDirection.top,
      ),
    ).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('moveItem item to the bottom if it is already on the most bottom position', function() {
    expect(moveItemVertically([{ id: 1 }, { id: 2 }], { id: 2 }, 1)).toEqual([
      { id: 1 },
      { id: 2 },
    ]);
  });

  it('moveItem item to the bottom ', function() {
    expect(
      moveItemVertically(
        [{ id: 1 }, { id: 2 }],
        { id: 1 },
        VerticalMovementDirection.bottom,
      ),
    ).toEqual([{ id: 2 }, { id: 1 }]);
  });

  it('moveItem item to the top', function() {
    expect(
      moveItemVertically(
        [{ id: 1 }, { id: 2 }],
        { id: 2 },
        VerticalMovementDirection.top,
      ),
    ).toEqual([{ id: 2 }, { id: 1 }]);
  });

  it('moveItem item to the top from one parent to another', function() {
    expect(
      moveItemVertically(
        [{ id: 1 }, { id: 3, children: [{ id: 2 }] }],
        { id: 2 },
        VerticalMovementDirection.top,
      ),
    ).toEqual([
      { id: 1, children: [{ id: 2 }] },
      { id: 3, children: [] },
    ]);
  });

  it('moveItem item to the top into parent sibling', function() {
    expect(
      moveItemVertically(
        [
          { id: 1 },
          {
            id: 3,
            children: [
              { id: 5, children: [{ id: 6 }] },
              { id: 2, children: [{ id: 4 }] },
            ],
          },
        ],
        { id: 4 },
        VerticalMovementDirection.top,
      ),
    ).toEqual([
      { id: 1 },
      {
        id: 3,
        children: [
          { id: 5, children: [{ id: 6 }, { id: 4 }] },
          { id: 2, children: [] },
        ],
      },
    ]);
  });

  it('moveItem item to the bottom into parent sibling', function() {
    expect(
      moveItemVertically(
        [
          { id: 1 },
          {
            id: 3,
            children: [
              { id: 5, children: [{ id: 4 }] },
              { id: 2, children: [{ id: 6 }] },
            ],
          },
        ],
        { id: 4 },
        VerticalMovementDirection.bottom,
      ),
    ).toEqual([
      { id: 1 },
      {
        id: 3,
        children: [
          { id: 5, children: [] },
          { id: 2, children: [{ id: 4 }, { id: 6 }] },
        ],
      },
    ]);
  });

  it('moveItem item to the top from one parent to another in case of multiple children', function() {
    expect(
      moveItemVertically(
        [
          { id: 1, children: [{ id: 4 }] },
          { id: 3, children: [{ id: 2 }] },
        ],
        { id: 2 },
        VerticalMovementDirection.top,
      ),
    ).toEqual([
      { id: 1, children: [{ id: 4 }, { id: 2 }] },
      { id: 3, children: [] },
    ]);
  });

  it('moveItem item to the bottom from one parent to another in case of multiple children', function() {
    expect(
      moveItemVertically(
        [
          { id: 1, children: [{ id: 4 }] },
          { id: 3, children: [{ id: 2 }] },
        ],
        { id: 4 },
        VerticalMovementDirection.bottom,
      ),
    ).toEqual([
      { id: 1, children: [] },
      { id: 3, children: [{ id: 4 }, { id: 2 }] },
    ]);
  });

  it('moveItem item to the bottom from one parent to another', function() {
    expect(
      moveItemVertically(
        [{ id: 1, children: [{ id: 3 }] }, { id: 2 }],
        { id: 3 },
        VerticalMovementDirection.bottom,
      ),
    ).toEqual([
      { id: 1, children: [] },
      { id: 2, children: [{ id: 3 }] },
    ]);
  });

  it('moveItem to the top one parent to another and skip one ', function() {
    expect(
      moveItemVertically(
        [
          { id: 1, children: [{ id: 2 }] },
          { id: 4 },
          { id: 5, children: [{ id: 6, children: [{ id: 3 }] }] },
        ],
        { id: 3 },
        VerticalMovementDirection.top,
      ),
    ).toEqual([
      { id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
      { id: 4 },
      { id: 5, children: [{ id: 6, children: [] }] },
    ]);
  });

  it('moveItem to the bottom third level node ', function() {
    expect(
      moveItemVertically(
        [
          {
            id: 4,
            children: [{ id: 5, children: [{ id: 6, children: [{ id: 7 }] }] }],
          },
          { id: 3 },
          {
            id: 1,
            children: [
              { id: 9 },
              { id: 2, children: [{ id: 8, children: [{ id: 10 }] }] },
            ],
          },
        ],
        { id: 7 },
        VerticalMovementDirection.bottom,
      ),
    ).toEqual([
      {
        id: 4,
        children: [{ id: 5, children: [{ id: 6, children: [] }] }],
      },
      { id: 3 },
      {
        id: 1,
        children: [
          { id: 9 },
          { id: 2, children: [{ id: 8, children: [{ id: 7 }, { id: 10 }] }] },
        ],
      },
    ]);
  });

  it('moveItem to the top deep level node ', function() {
    expect(
      moveItemVertically(
        [
          { id: 1, children: [{ id: 2, children: [{ id: 8 }] }, { id: 9 }] },
          { id: 3 },
          {
            id: 4,
            children: [{ id: 5, children: [{ id: 6, children: [{ id: 7 }] }] }],
          },
        ],
        { id: 7 },
        VerticalMovementDirection.top,
      ),
    ).toEqual([
      {
        id: 1,
        children: [
          { id: 2, children: [{ id: 8, children: [{ id: 7 }] }] },
          { id: 9 },
        ],
      },
      { id: 3 },
      {
        id: 4,
        children: [{ id: 5, children: [{ id: 6, children: [] }] }],
      },
    ]);
  });

  it('moveItem to the bottom from one parent to another and skip one ', function() {
    expect(
      moveItemVertically(
        [
          { id: 1, children: [{ id: 2, children: [{ id: 3 }] }] },
          { id: 4 },
          { id: 5, children: [{ id: 6 }] },
        ],
        { id: 3 },
        VerticalMovementDirection.bottom,
      ),
    ).toEqual([
      { id: 1, children: [{ id: 2, children: [] }] },
      { id: 4 },
      { id: 5, children: [{ id: 6, children: [{ id: 3 }] }] },
    ]);
  });

  it('moveItem real case, fix issue', function() {
    expect(
      moveItemVertically(
        [
          {
            id: 4,
            children: [
              {
                id: 6,
                children: [
                  {
                    id: 7,
                  },
                ],
              },
              {
                id: 5,
              },
            ],
          },
        ],
        { id: 6, children: [{ id: 7 }] },
        VerticalMovementDirection.bottom,
      ),
    ).toEqual([
      {
        id: 4,
        children: [
          {
            id: 5,
          },
          {
            id: 6,
            children: [
              {
                id: 7,
              },
            ],
          },
        ],
      },
    ]);
  });

  it('moveItem respect childProp key ', function() {
    expect(
      moveItemVertically(
        [
          { id: 1, nodes: [{ id: 2, nodes: [{ id: 3 }] }] },
          { id: 4 },
          { id: 5, nodes: [{ id: 6 }] },
        ],
        { id: 3 },
        VerticalMovementDirection.bottom,
        'nodes',
      ),
    ).toEqual([
      { id: 1, nodes: [{ id: 2, nodes: [] }] },
      { id: 4 },
      { id: 5, nodes: [{ id: 6, nodes: [{ id: 3 }] }] },
    ]);
  });
});
