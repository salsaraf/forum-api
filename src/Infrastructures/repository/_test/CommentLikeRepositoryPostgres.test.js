const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const pool = require('../../database/postgres/pool');
const CommentLikesTableTestHelper = require('../../../../tests/CommentLikesTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('CommentLikeRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({ id: 'user-123', username: 'dicoding' });
    await UsersTableTestHelper.addUser({ id: 'user-456', username: 'dicoding2' });
    await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
    await CommentsTableTestHelper.addComment({
      id: 'comment-123', threadId: 'thread-123', owner: 'user-123', content: 'sebuah comment',
    });
  });

  afterEach(async () => {
    await CommentLikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  describe('addLike function', () => {
    it('should persist like comment correctly', async () => {
      // Arrange
      const idGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, idGenerator);

      // Act
      await commentLikeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId('comment-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].comment_id).toBe('comment-123');
      expect(likes[0].user_id).toBe('user-123');
    });
  });

  describe('deleteLike function', () => {
    it('should delete like comment correctly', async () => {
      // Arrange
      const idGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, idGenerator);
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });

      // Act
      await commentLikeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const likes = await CommentLikesTableTestHelper.findLikesByCommentId('comment-123');
      expect(likes).toHaveLength(0);
    });
  });

  describe('isCommentLiked function', () => {
    it('should return true when comment is liked by user', async () => {
      // Arrange
      const idGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, idGenerator);
      await CommentLikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', userId: 'user-123' });

      // Act
      const isLiked = await commentLikeRepositoryPostgres.isCommentLiked('comment-123', 'user-123');

      // Assert
      expect(isLiked).toBe(true);
    });

    it('should return false when comment is not liked by user', async () => {
      // Arrange
      const idGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, idGenerator);

      // Act
      const isLiked = await commentLikeRepositoryPostgres.isCommentLiked('comment-123', 'user-123');

      // Assert
      expect(isLiked).toBe(false);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return correct like count for comment', async () => {
      // Arrange
      const idGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, idGenerator);

      await CommentLikesTableTestHelper.addLike({ id: 'like-1', commentId: 'comment-123', userId: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-2', commentId: 'comment-123', userId: 'user-456' });

      // Act
      const likeCount = await commentLikeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(likeCount).toBe(2);
    });
  });

  describe('getLikeCountsByCommentIds function', () => {
    it('should return like counts for multiple comments', async () => {
      // Arrange
      const idGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, idGenerator);

      await CommentsTableTestHelper.addComment({ id: 'comment-456', threadId: 'thread-123' });

      await CommentLikesTableTestHelper.addLike({ id: 'like-1', commentId: 'comment-123', userId: 'user-123' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-2', commentId: 'comment-123', userId: 'user-456' });
      await CommentLikesTableTestHelper.addLike({ id: 'like-3', commentId: 'comment-456', userId: 'user-123' });

      // Act
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByCommentIds(['comment-123', 'comment-456']);

      // Assert
      expect(likeCounts).toEqual({
        'comment-123': 2,
        'comment-456': 1,
      });
    });

    it('should return empty object for empty commentIds', async () => {
      // Arrange
      const idGenerator = () => '123';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, idGenerator);

      // Act
      const likeCounts = await commentLikeRepositoryPostgres.getLikeCountsByCommentIds([]);

      // Assert
      expect(likeCounts).toEqual({});
    });
  });
});
