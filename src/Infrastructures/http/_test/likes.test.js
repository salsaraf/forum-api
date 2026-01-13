/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');
const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');
const UsersTableTestHelper = require('./UsersTableTestHelper');
const ThreadsTableTestHelper = require('./ThreadsTableTestHelper');
const CommentsTableTestHelper = require('./CommentsTableTestHelper');
const CommentLikesTableTestHelper = require('./CommentLikesTableTestHelper');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  let server;
  let accessToken;
  let threadId;
  let commentId;

  beforeAll(async () => {
    server = await createServer(container);
  });

  beforeEach(async () => {
    // Setup data
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding', password: 'secret' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'johndoe', password: 'secret' });
    
    // Get access token
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });
    
    const { data: { accessToken: token } } = JSON.parse(loginResponse.payload);
    accessToken = token;

    // Create thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        title: 'Test Thread',
        body: 'Test Body',
      },
    });

    const { data: { addedThread: { id: tId } } } = JSON.parse(threadResponse.payload);
    threadId = tId;

    // Create comment
    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: {
        content: 'Test Comment',
      },
    });

    const { data: { addedComment: { id: cId } } } = JSON.parse(commentResponse.payload);
    commentId = cId;
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 200 and like comment when not liked yet', async () => {
      // Arrange & Act
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Verify like is added
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(1);
      expect(likes[0].comment_id).toBe(commentId);
    });

    it('should response 200 and unlike comment when already liked', async () => {
      // Arrange
      // Like first
      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Act (unlike)
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');

      // Verify like is removed
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId(commentId);
      expect(likes).toHaveLength(0);
    });

    it('should response 401 when no authentication', async () => {
      // Arrange & Act
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
      });

      // Assert
      expect(response.statusCode).toEqual(401);
    });

    it('should response 404 when thread not found', async () => {
      // Arrange & Act
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/notfound/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it('should response 404 when comment not found', async () => {
      // Arrange & Act
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/notfound/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.statusCode).toEqual(404);
    });

    it('should include likeCount in thread detail', async () => {
      // Arrange
      // Like the comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${threadId}/comments/${commentId}/likes`,
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Act - Get thread detail
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${threadId}`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.data.thread.comments[0].likeCount).toBe(1);
    });
  });
});