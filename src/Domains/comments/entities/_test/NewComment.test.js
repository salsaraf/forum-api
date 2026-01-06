const NewComment = require('../NewComment');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');

describe('NewComment entities', () => {
  it('should throw InvariantError when payload not contain needed property', () => {
    expect(() => new NewComment({})).toThrow(InvariantError);
  });

  it('should throw InvariantError when payload not meet data type specification', () => {
    expect(() => new NewComment({ content: 123 })).toThrow(InvariantError);
  });

  it('should create NewComment object correctly', () => {
    const payload = { content: 'sebuah comment' };
    const newComment = new NewComment(payload);

    expect(newComment.content).toEqual(payload.content);
  });
});
