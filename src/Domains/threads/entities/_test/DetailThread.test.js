const DetailThread = require('../DetailThread');

describe('DetailThread entity', () => {
  it('should throw error when payload not complete', () => {
    expect(() => new DetailThread({ id: 'thread-1' }))
      .toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type spec', () => {
    expect(() => new DetailThread({
      id: 'thread-1',
      title: 't',
      body: 'b',
      date: 123,
      username: 'u',
      comments: [],
    })).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create DetailThread correctly', () => {
    const payload = {
      id: 'thread-1',
      title: 't',
      body: 'b',
      date: new Date().toISOString(),
      username: 'dicoding',
      comments: [],
    };

    const entity = new DetailThread(payload);

    expect(entity.id).toEqual(payload.id);
    expect(entity.title).toEqual(payload.title);
    expect(entity.body).toEqual(payload.body);
    expect(entity.date).toEqual(payload.date);
    expect(entity.username).toEqual(payload.username);
    expect(entity.comments).toEqual(payload.comments);
  });
});
