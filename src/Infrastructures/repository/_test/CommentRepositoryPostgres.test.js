const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should persist and return added comment correctly', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    const added = await repo.addComment('thread-123', 'user-123', { content: 'sebuah comment' });

    expect(added).toStrictEqual({
      id: 'comment-abc',
      content: 'sebuah comment',
      owner: 'user-123',
    });

    const rows = await CommentsTableTestHelper.findCommentById('comment-abc');
    expect(rows).toHaveLength(1);
  });

  it('verifyCommentAvailable should throw NotFoundError when comment not found', async () => {
    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyCommentAvailable('comment-x')).rejects.toThrow(NotFoundError);
  });

  it('verifyCommentAvailable should not throw when comment exists', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
      content: 'sebuah comment',
      isDelete: false,
    });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyCommentAvailable('comment-123')).resolves.not.toThrow();
  });

  it('verifyCommentOwner should throw NotFoundError when comment not found', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyCommentOwner('comment-x', 'user-123')).rejects.toThrow(NotFoundError);
  });

  it('verifyCommentOwner should throw AuthorizationError when not owner', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-999', username: 'john' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
      isDelete: false,
    });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyCommentOwner('comment-123', 'user-999')).rejects.toThrow(AuthorizationError);
  });

  it('verifyCommentOwner should not throw when owner is correct', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
      content: 'sebuah comment',
      isDelete: false,
    });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');

    await expect(repo.verifyCommentOwner('comment-123', 'user-123')).resolves.not.toThrow();
  });

  it('verifyCommentInThread should throw NotFoundError when comment not in thread', async () => {
    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyCommentInThread('comment-x', 'thread-x')).rejects.toThrow(NotFoundError);
  });

  it('verifyCommentInThread should not throw when comment exists in thread', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
      content: 'sebuah comment',
      isDelete: false,
    });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');

    await expect(repo.verifyCommentInThread('comment-123', 'thread-123')).resolves.not.toThrow();
  });

  it('getCommentsByThreadId should map date as ISO string and map isDelete correctly', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

    await CommentsTableTestHelper.addComment({
      id: 'comment-1',
      threadId: 'thread-123',
      owner: 'user-1',
      content: 'c1',
      createdAt: new Date('2021-08-08T07:26:21.338Z'),
      isDelete: true,
    });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    const comments = await repo.getCommentsByThreadId('thread-123');

    expect(comments).toHaveLength(1);

    expect(comments[0]).toEqual({
      id: 'comment-1',
      username: 'dicoding',
      date: '2021-08-08T07:26:21.338Z',
      content: 'c1',
      isDelete: true,
    });
  });

  it('deleteComment should throw NotFoundError when comment not found', async () => {
    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    await expect(repo.deleteComment('comment-x')).rejects.toThrow(NotFoundError);
  });

  it('deleteComment should soft delete comment', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
      isDelete: false,
    });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    await repo.deleteComment('comment-123');

    const rows = await CommentsTableTestHelper.findCommentById('comment-123');
    expect(rows[0].is_delete).toBe(true);
  });

  it('getCommentsByThreadId should return comments ordered by date asc', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-2', username: 'johndoe' });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });

    await CommentsTableTestHelper.addComment({
      id: 'comment-1',
      threadId: 'thread-123',
      owner: 'user-1',
      content: 'c1',
      createdAt: new Date('2021-08-08T07:26:21.338Z'),
      isDelete: true,
    });

    await CommentsTableTestHelper.addComment({
      id: 'comment-2',
      threadId: 'thread-123',
      owner: 'user-2',
      content: 'c2',
      createdAt: new Date('2021-08-08T07:22:33.555Z'),
      isDelete: false,
    });

    const repo = new CommentRepositoryPostgres(pool, () => 'abc');
    const comments = await repo.getCommentsByThreadId('thread-123');

    expect(comments).toHaveLength(2);
    expect(comments[0].id).toBe('comment-2');
    expect(comments[1].id).toBe('comment-1');
  });
});
