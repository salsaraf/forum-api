const CommentLikeRepository = require('../CommentLikeRepository');

describe('CommentLikeRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const repository = new CommentLikeRepository();

    await expect(repository.addLike('comment-123', 'user-123'))
      .rejects
      .toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(repository.deleteLike('comment-123', 'user-123'))
      .rejects
      .toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(repository.isCommentLiked('comment-123', 'user-123'))
      .rejects
      .toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(repository.getLikeCountByCommentId('comment-123'))
      .rejects
      .toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(repository.getLikeCountsByCommentIds(['comment-123', 'comment-456']))
      .rejects
      .toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
