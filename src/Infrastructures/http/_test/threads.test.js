const createServer = require('../createServer');
const container = require('../../container');
const pool = require('../../database/postgres/pool');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');

describe('/threads endpoint', () => {
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

  it('should respond 201 and addedThread correctly when POST /threads', async () => {
    const server = await createServer(container);
    const { userId, accessToken } = await registerAndLogin(server);

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: 'sebuah thread', body: 'sebuah body thread' },
    });

    const json = JSON.parse(response.payload);

    expect(response.statusCode).toBe(201);
    expect(json.status).toBe('success');
    expect(json.data.addedThread).toEqual({
      id: expect.any(String),
      title: 'sebuah thread',
      owner: userId,
    });
  });

  it('should respond 400 when POST /threads with invalid payload', async () => {
    const server = await createServer(container);
    const { accessToken } = await registerAndLogin(server);

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { title: 'sebuah thread' },
    });

    const json = JSON.parse(response.payload);

    expect(response.statusCode).toBe(400);
    expect(json.status).toBe('fail');
    expect(json.message).toEqual(expect.any(String));
  });

  it('should respond 401 when POST /threads without auth', async () => {
    const server = await createServer(container);

    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 't', body: 'b' },
    });

    expect(response.statusCode).toBe(401);
  });

  it('GET thread detail should include replies inside comments and ordered asc by date', async () => {
    const server = await createServer(container);

    const USERNAME_1 = 'dicoding';
    const USERNAME_2 = 'johndoe';

    const { userId: user1Id } = await registerAndLogin(server, { username: USERNAME_1 });
    const { userId: user2Id } = await registerAndLogin(server, { username: USERNAME_2 });

    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: user1Id,
      title: 'sebuah thread',
      body: 'sebuah body thread',
    });

    await CommentsTableTestHelper.addComment({
      id: 'comment-123',
      threadId: 'thread-123',
      owner: user1Id,
      content: 'sebuah comment',
      createdAt: new Date('2021-08-08T07:59:18.982Z'),
      isDelete: false,
    });

    await RepliesTableTestHelper.addReply({
      id: 'reply-1',
      commentId: 'comment-123',
      owner: user2Id,
      content: 'r1',
      createdAt: new Date('2021-08-08T07:59:48.766Z'),
      isDelete: true,
    });

    await RepliesTableTestHelper.addReply({
      id: 'reply-2',
      commentId: 'comment-123',
      owner: user1Id,
      content: 'r2',
      createdAt: new Date('2021-08-08T08:07:01.522Z'),
      isDelete: false,
    });

    const res = await server.inject({
      method: 'GET',
      url: '/threads/thread-123',
    });

    expect(res.statusCode).toBe(200);

    const body = JSON.parse(res.payload);
    expect(body.status).toBe('success');

    const { thread } = body.data;
    expect(thread.comments).toHaveLength(1);

    const comment = thread.comments[0];
    expect(comment.replies).toHaveLength(2);

    expect(comment.replies[0]).toEqual({
      id: 'reply-1',
      content: '**balasan telah dihapus**',
      date: '2021-08-08T07:59:48.766Z',
      username: USERNAME_2,
    });

    expect(comment.replies[1]).toEqual({
      id: 'reply-2',
      content: 'r2',
      date: '2021-08-08T08:07:01.522Z',
      username: USERNAME_1,
    });
  });
});
