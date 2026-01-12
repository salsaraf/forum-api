const NewReply = require('../NewReply');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');

describe('NewReply entities', () => {
  it('should throw InvariantError when payload not contain needed property', () => {
    expect(() => new NewReply({})).toThrow(InvariantError);
  });

  it('should throw InvariantError when payload not meet data type specification', () => {
    expect(() => new NewReply({ content: 123 })).toThrow(InvariantError);
  });

  it('should create NewReply object correctly', () => {
    const payload = { content: 'sebuah balasan' };
    const newReply = new NewReply(payload);

    expect(newReply.content).toEqual(payload.content);
  });
});
