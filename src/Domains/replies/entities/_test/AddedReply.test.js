const AddedReply = require('../AddedReply');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');

describe('AddedReply entities', () => {
  it('should create AddedReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-123',
    };

    const addedReply = new AddedReply(payload);

    expect(addedReply).toMatchObject(payload);
  });

  it('should throw InvariantError when payload does not contain needed property', () => {
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      // owner missing
    };

    expect(() => new AddedReply(payload)).toThrow(InvariantError);
  });

  it('should throw InvariantError when payload property has invalid data type', () => {
    const payload = {
      id: 123, // should be string
      content: true, // should be string
      owner: [], // should be string
    };

    expect(() => new AddedReply(payload)).toThrow(InvariantError);
  });
});
