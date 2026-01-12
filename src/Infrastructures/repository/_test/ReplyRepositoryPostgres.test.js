const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should persist and return added reply correctly', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    const added = await repo.addReply('comment-123', 'user-123', { content: 'sebuah balasan' });

    expect(added).toStrictEqual({
      id: 'reply-abc',
      content: 'sebuah balasan',
      owner: 'user-123',
    });

    const rows = await RepliesTableTestHelper.findReplyById('reply-abc');
    expect(rows).toHaveLength(1);
  });

  it('verifyReplyAvailable should throw NotFoundError when reply not found', async () => {
    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyReplyAvailable('reply-x')).rejects.toThrow(NotFoundError);
  });

  it('verifyReplyAvailable should not throw when reply exists', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyReplyAvailable('reply-123')).resolves.not.toThrow();
  });

  it('verifyReplyOwner should throw NotFoundError when reply not found', async () => {
    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyReplyOwner('reply-x', 'user-123')).rejects.toThrow(NotFoundError);
  });

  it('verifyReplyOwner should throw AuthorizationError when not owner', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-999', username: 'john' });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyReplyOwner('reply-123', 'user-999')).rejects.toThrow(AuthorizationError);
  });

  it('verifyReplyOwner should not throw when owner is correct', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyReplyOwner('reply-123', 'user-123')).resolves.not.toThrow();
  });

  it('verifyReplyInComment should throw NotFoundError when reply not in comment', async () => {
    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyReplyInComment('reply-x', 'comment-x')).rejects.toThrow(NotFoundError);
  });

  it('verifyReplyInComment should not throw when reply exists in comment', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });
    await RepliesTableTestHelper.addReply({ id: 'reply-123', commentId: 'comment-123', owner: 'user-123' });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.verifyReplyInComment('reply-123', 'comment-123')).resolves.not.toThrow();
  });

  it('deleteReply should soft delete reply', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

    await RepliesTableTestHelper.addReply({
      id: 'reply-123',
      commentId: 'comment-123',
      owner: 'user-123',
      isDelete: false,
    });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await repo.deleteReply('reply-123');

    const rows = await RepliesTableTestHelper.findReplyById('reply-123');
    expect(rows[0].is_delete).toBe(true);
  });

  it('deleteReply should throw NotFoundError when reply not found', async () => {
    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    await expect(repo.deleteReply('reply-x')).rejects.toThrow(NotFoundError);
  });

  it('getRepliesByCommentIds should return replies ordered by date asc and mapped', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-2', username: 'johndoe' });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-1' });

    await RepliesTableTestHelper.addReply({
      id: 'reply-1',
      commentId: 'comment-123',
      owner: 'user-1',
      content: 'r1',
      createdAt: new Date('2021-08-08T08:07:01.522Z'),
      isDelete: false,
    });

    await RepliesTableTestHelper.addReply({
      id: 'reply-2',
      commentId: 'comment-123',
      owner: 'user-2',
      content: 'r2',
      createdAt: new Date('2021-08-08T07:59:48.766Z'),
      isDelete: true,
    });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    const replies = await repo.getRepliesByCommentIds(['comment-123']);

    expect(replies).toHaveLength(2);
    expect(replies[0].id).toBe('reply-2');
    expect(replies[1].id).toBe('reply-1');

    expect(replies[0].content).toBe('r2');
    expect(replies[1].content).toBe('r1');

    expect(replies[0].isDelete).toBe(true);
    expect(replies[1].isDelete).toBe(false);
  });

  it('getRepliesByCommentIds should return [] when commentIds is undefined', async () => {
    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    const replies = await repo.getRepliesByCommentIds(undefined);
    expect(replies).toEqual([]);
  });

  it('getRepliesByCommentIds should return [] when commentIds is null', async () => {
    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    const replies = await repo.getRepliesByCommentIds(null);
    expect(replies).toEqual([]);
  });

  it('getRepliesByCommentIds should return [] when commentIds is empty array', async () => {
    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    const replies = await repo.getRepliesByCommentIds([]);
    expect(replies).toEqual([]);
  });

  it('getRepliesByCommentIds should map username, date ISO string, commentId correctly', async () => {
    await UsersTableTestHelper.addUser({ id: 'user-1', username: 'dicoding' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-1' });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-1' });

    await RepliesTableTestHelper.addReply({
      id: 'reply-123',
      commentId: 'comment-123',
      owner: 'user-1',
      content: 'hello',
      createdAt: new Date('2021-08-08T08:07:01.522Z'),
      isDelete: false,
    });

    const repo = new ReplyRepositoryPostgres(pool, () => 'abc');
    const replies = await repo.getRepliesByCommentIds(['comment-123']);

    expect(replies).toHaveLength(1);
    expect(replies[0]).toEqual({
      id: 'reply-123',
      commentId: 'comment-123',
      username: 'dicoding',
      date: '2021-08-08T08:07:01.522Z',
      content: 'hello',
      isDelete: false,
    });
  });
});
