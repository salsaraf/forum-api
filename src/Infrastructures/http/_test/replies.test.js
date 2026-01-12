const createServer = require('../createServer');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_KEY = 'access_token_secret';
    process.env.ACCESS_TOKEN_AGE = '3000';
    process.env.REFRESH_TOKEN_KEY = 'refresh_token_secret';
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const registerAndLogin = async (
    server,
    { username = `user_${Date.now()}`, password = 'secret', fullname = 'Dicoding Indonesia' } = {},
  ) => {
    const registerRes = await server.inject({
      method: 'POST',
      url: '/users',
      payload: { username, password, fullname },
    });

    expect(registerRes.statusCode).toBe(201);

    const { data: { addedUser } } = JSON.parse(registerRes.payload);

    const loginRes = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username, password },
    });

    expect([200, 201]).toContain(loginRes.statusCode);

    const { data: { accessToken } } = JSON.parse(loginRes.payload);
    return { userId: addedUser.id, accessToken };
  };

  it('POST should respond 201 and persist reply', async () => {
    const server = await createServer(container);

    const { userId, accessToken } = await registerAndLogin(server, { username: `dicoding_${Date.now()}` });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

    const res = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments/comment-123/replies',
      payload: { content: 'sebuah balasan' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(201);

    const body = JSON.parse(res.payload);

    expect(body.status).toBe('success');
    expect(body.data.addedReply).toEqual({
      id: expect.any(String),
      content: 'sebuah balasan',
      owner: userId,
    });
  });

  it('POST should respond 404 when thread not found', async () => {
    const server = await createServer(container);

    const { accessToken } = await registerAndLogin(server, { username: `dicoding_${Date.now()}` });

    const res = await server.inject({
      method: 'POST',
      url: '/threads/thread-x/comments/comment-123/replies',
      payload: { content: 'sebuah balasan' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(404);

    const body = JSON.parse(res.payload);
    expect(body.status).toBe('fail');
    expect(body.message).toEqual(expect.any(String));
  });

  it('POST should respond 404 when comment not in thread', async () => {
    const server = await createServer(container);

    const { userId, accessToken } = await registerAndLogin(server, { username: `dicoding_${Date.now()}` });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });

    const res = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments/comment-x/replies',
      payload: { content: 'sebuah balasan' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(404);

    const body = JSON.parse(res.payload);
    expect(body.status).toBe('fail');
    expect(body.message).toEqual(expect.any(String));
  });

  it('POST should respond 400 when payload invalid', async () => {
    const server = await createServer(container);

    const { userId, accessToken } = await registerAndLogin(server, { username: `dicoding_${Date.now()}` });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });

    const res = await server.inject({
      method: 'POST',
      url: '/threads/thread-123/comments/comment-123/replies',
      payload: {},
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(400);

    const body = JSON.parse(res.payload);
    expect(body.status).toBe('fail');
    expect(body.message).toEqual(expect.any(String));
  });

  it('DELETE should respond 200 and soft delete reply', async () => {
    const server = await createServer(container);

    const { userId, accessToken } = await registerAndLogin(server, { username: `dicoding_${Date.now()}` });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: userId });
    await RepliesTableTestHelper.addReply({
      id: 'reply-123',
      commentId: 'comment-123',
      owner: userId,
      isDelete: false,
    });

    const res = await server.inject({
      method: 'DELETE',
      url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);

    const rows = await RepliesTableTestHelper.findReplyById('reply-123');
    expect(rows[0].is_delete).toBe(true);
  });

  it('DELETE should respond 403 when not reply owner', async () => {
    const server = await createServer(container);

    const { userId: user1Id } = await registerAndLogin(server, { username: `dicoding_${Date.now()}` });
    const { accessToken: tokenUser2 } = await registerAndLogin(server, { username: `johndoe_${Date.now()}` });

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: user1Id });
    await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: user1Id });
    await RepliesTableTestHelper.addReply({
      id: 'reply-123',
      commentId: 'comment-123',
      owner: user1Id,
      isDelete: false,
    });

    const res = await server.inject({
      method: 'DELETE',
      url: '/threads/thread-123/comments/comment-123/replies/reply-123',
      headers: { Authorization: `Bearer ${tokenUser2}` },
    });

    expect(res.statusCode).toBe(403);

    const body = JSON.parse(res.payload);
    expect(body.status).toBe('fail');
    expect(body.message).toEqual(expect.any(String));
  });
});
