const CommentLike = require('../CommentLike');

describe('CommentLike entities', () => {
  it('should throw error when payload does not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 'comment-123',
      // userId missing
    };

    // Action & Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 123, // should be string
      userId: 'user-123',
    };

    // Action & Assert
    expect(() => new CommentLike(payload)).toThrowError('COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create CommentLike entities correctly', () => {
    // Arrange
    const payload = {
      id: 'like-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    // Action
    const commentLike = new CommentLike(payload);

    // Assert
    expect(commentLike.id).toEqual(payload.id);
    expect(commentLike.commentId).toEqual(payload.commentId);
    expect(commentLike.userId).toEqual(payload.userId);
  });
});
