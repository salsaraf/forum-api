const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should persist and return added thread correctly', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

    const fakeIdGenerator = () => 'abc';
    const repo = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

    const added = await repo.addThread('user-123', { title: 'sebuah thread', body: 'sebuah body' });

    expect(added).toStrictEqual({
      id: 'thread-abc',
      title: 'sebuah thread',
      owner: 'user-123',
    });

    const rows = await ThreadsTableTestHelper.findThreadById('thread-abc');
    expect(rows).toHaveLength(1);
  });

  it('verifyThreadAvailability should throw NotFoundError when not found', async () => {
    const repo = new ThreadRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyThreadAvailability('thread-x')).rejects.toThrow(NotFoundError);
  });

  it('verifyThreadAvailability should not throw when thread exists', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    const repo = new ThreadRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyThreadAvailability('thread-123')).resolves.not.toThrow();
  });

  it('getThreadById should throw NotFoundError when thread not found', async () => {
    const repo = new ThreadRepositoryPostgres(pool, () => 'abc');
    await expect(repo.getThreadById('thread-x')).rejects.toThrow(NotFoundError);
  });

  it('getThreadById should return thread detail correctly', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      owner: 'user-123',
      createdAt: new Date('2021-08-08T07:19:09.775Z'),
    });

    const repo = new ThreadRepositoryPostgres(pool, () => 'abc');
    const thread = await repo.getThreadById('thread-123');

    expect(thread).toStrictEqual({
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body',
      date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
      username: 'dicoding',
    });
  });
});
