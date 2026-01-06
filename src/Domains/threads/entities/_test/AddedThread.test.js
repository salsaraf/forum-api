const AddedThread = require('../AddedThread');

describe('AddedThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new AddedThread({ id: 'thread-1', title: 'x' }))
      .toThrowError('ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type spec', () => {
    expect(() => new AddedThread({ id: 1, title: true, owner: [] }))
      .toThrowError('ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedThread object correctly', () => {
    const payload = { id: 'thread-1', title: 'sebuah thread', owner: 'user-1' };
    const added = new AddedThread(payload);

    expect(added.id).toEqual(payload.id);
    expect(added.title).toEqual(payload.title);
    expect(added.owner).toEqual(payload.owner);
  });
});
