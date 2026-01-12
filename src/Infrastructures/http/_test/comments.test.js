const createServer = require('../createServer');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads/{threadId}/comments endpoint', () => {
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

  it('should respond 201 and addedComment correctly when POST /threads/{threadId}/comments', async () => {
    const server = await createServer(container);
    const { userId, accessToken } = await registerAndLogin(server);

    const addThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: 'sebuah thread', body: 'sebuah body thread' },
    });

    expect(addThreadResponse.statusCode).toBe(201);
    const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah comment' },
    });

    const json = JSON.parse(response.payload);

    expect(response.statusCode).toBe(201);
    expect(json.status).toBe('success');
    expect(json.data.addedComment).toEqual({
      id: expect.any(String),
      content: 'sebuah comment',
      owner: userId,
    });
  });

  it('should respond 404 when POST comment to not found thread', async () => {
    const server = await createServer(container);
    const { accessToken } = await registerAndLogin(server);

    const response = await server.inject({
      method: 'POST',
      url: '/threads/thread-notfound/comments',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah comment' },
    });

    const json = JSON.parse(response.payload);

    expect(response.statusCode).toBe(404);
    expect(json.status).toBe('fail');
  });

  it('should respond 200 success when DELETE comment by owner (soft delete)', async () => {
    const server = await createServer(container);
    const { accessToken } = await registerAndLogin(server);

    const addThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: 'sebuah thread', body: 'sebuah body thread' },
    });

    expect(addThreadResponse.statusCode).toBe(201);
    const threadId = JSON.parse(addThreadResponse.payload).data.addedThread.id;

    const addCommentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { content: 'sebuah comment' },
    });

    expect(addCommentResponse.statusCode).toBe(201);
    const commentId = JSON.parse(addCommentResponse.payload).data.addedComment.id;

    const delResponse = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const delJson = JSON.parse(delResponse.payload);

    expect(delResponse.statusCode).toBe(200);
    expect(delJson).toEqual({ status: 'success' });

    const getThreadResponse = await server.inject({
      method: 'GET',
      url: `/threads/${threadId}`,
    });

    const threadJson = JSON.parse(getThreadResponse.payload);

    expect(getThreadResponse.statusCode).toBe(200);
    expect(threadJson.status).toBe('success');
    expect(threadJson.data.thread.comments[0].content).toBe('**komentar telah dihapus**');
  });
});
