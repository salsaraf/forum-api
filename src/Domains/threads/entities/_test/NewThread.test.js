const NewThread = require('../NewThread');

describe('NewThread entity', () => {
  it('should throw error when payload not contain needed property', () => {
    expect(() => new NewThread({ title: 'a thread' }))
      .toThrowError('NEW_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type spec', () => {
    expect(() => new NewThread({ title: 123, body: true }))
      .toThrowError('NEW_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThread object correctly', () => {
    const payload = { title: 'sebuah thread', body: 'sebuah body' };
    const newThread = new NewThread(payload);

    expect(newThread.title).toEqual(payload.title);
    expect(newThread.body).toEqual(payload.body);
  });
});
