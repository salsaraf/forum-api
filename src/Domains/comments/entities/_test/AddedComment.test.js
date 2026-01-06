const AddedComment = require('../AddedComment');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');

describe('AddedComment entities', () => {
  it('should create AddedComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      owner: 'user-123',
    };

    const addedComment = new AddedComment(payload);

    expect(addedComment).toMatchObject(payload);
  });

  it('should throw InvariantError when payload does not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah comment',
      // owner missing
    };

    expect(() => new AddedComment(payload)).toThrow(InvariantError);
  });

  it('should throw InvariantError when payload property has invalid data type', () => {
    const payload = {
      id: 123, // should be string
      content: true, // should be string
      owner: [], // should be string
    };

    expect(() => new AddedComment(payload)).toThrow(InvariantError);
  });
});
