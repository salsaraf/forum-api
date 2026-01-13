const createServer = require('../createServer');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  beforeAll(() => {
    process.env.ACCESS_TOKEN_KEY = 'access_token_secret';
    process.env.ACCESS_TOKEN_AGE = '3000';
    process.env.REFRESH_TOKEN_KEY = 'refresh_token_secret';
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const registerAndLogin = async (server, username) => {
    const password = 'secret';
    const fullname = 'Dicoding Indonesia';

    const registerRes = await server.inject({
      method: 'POST',
      url: '/users',
      payload: { username, password, fullname },
    });

    const { data: { addedUser } } = JSON.parse(registerRes.payload);

    const loginRes = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username, password },
    });

    const { data: { accessToken } } = JSON.parse(loginRes.payload);

    return { userId: addedUser.id, accessToken };
  };

  it('PUT should respond 200 and like comment when not liked', async () => {
    const server = await createServer(container);

    const { userId, accessToken } = await registerAndLogin(
      server,
      `user_${Date.now()}`,
    );

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: userId,
    });

    const res = await server.inject({
      method: 'PUT',
      url: '/threads/thread-123/comments/comment-123/likes',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(res.statusCode).toBe(200);

    const likes = await CommentLikesTableTestHelper.findLikesByCommentId(
      'comment-123',
    );
    expect(likes).toHaveLength(1);
    expect(likes[0].user_id).toBe(userId);
  });

  it('PUT should respond 200 and unlike comment when already liked', async () => {
    const server = await createServer(container);

    const { userId, accessToken } = await registerAndLogin(
      server,
      `user_${Date.now()}`,
    );

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: userId,
    });

    await CommentLikesTableTestHelper.addLike({
      commentId: 'comment-123',
      userId,
    });

    const res = await server.inject({
      method: 'PUT',
      url: '/threads/thread-123/comments/comment-123/likes',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(res.statusCode).toBe(200);

    const likes = await CommentLikesTableTestHelper.findLikesByCommentId(
      'comment-123',
    );
    expect(likes).toHaveLength(0);
  });

  it('PUT should respond 401 when request without authentication', async () => {
    const server = await createServer(container);

    const res = await server.inject({
      method: 'PUT',
      url: '/threads/thread-123/comments/comment-123/likes',
    });

    expect(res.statusCode).toBe(401);
  });

  it('PUT should respond 404 when thread not found', async () => {
    const server = await createServer(container);

    const { accessToken } = await registerAndLogin(
      server,
      `user_${Date.now()}`,
    );

    const res = await server.inject({
      method: 'PUT',
      url: '/threads/thread-x/comments/comment-123/likes',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(res.statusCode).toBe(404);

    const body = JSON.parse(res.payload);
    expect(body.status).toBe('fail');
  });

  it('PUT should respond 404 when comment not found', async () => {
    const server = await createServer(container);

    const { userId, accessToken } = await registerAndLogin(
      server,
      `user_${Date.now()}`,
    );

    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: userId });

    const res = await server.inject({
      method: 'PUT',
      url: '/threads/thread-123/comments/comment-x/likes',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(res.statusCode).toBe(404);

    const body = JSON.parse(res.payload);
    expect(body.status).toBe('fail');
  });
});
