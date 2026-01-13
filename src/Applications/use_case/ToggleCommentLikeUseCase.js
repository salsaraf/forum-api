const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ToggleCommentLikeUseCase {
  constructor({ commentLikeRepository, commentRepository, threadRepository }) {
    this._commentLikeRepository = commentLikeRepository;
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);

    const { threadId, commentId, userId } = useCasePayload;

    try {
      await this._threadRepository.verifyThreadAvailability(threadId);
    } catch (error) {
      if (error.message.includes('NOT_FOUND')) {
        throw new NotFoundError('thread tidak ditemukan');
      }
      throw error;
    }

    try {
      await this._commentRepository.verifyCommentInThread(commentId, threadId);
    } catch (error) {
      if (error.message.includes('NOT_FOUND')) {
        throw new NotFoundError('komentar tidak ditemukan');
      }
      throw error;
    }

    const isLiked = await this._commentLikeRepository.isCommentLiked(commentId, userId);

    if (isLiked) {
      await this._commentLikeRepository.deleteLike(commentId, userId);
    } else {
      await this._commentLikeRepository.addLike(commentId, userId);
    }

    return { status: 'success' };
  }

  _validatePayload(payload) {
    const { threadId, commentId, userId } = payload;

    if (!threadId || !commentId || !userId) {
      throw new Error('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof userId !== 'string') {
      throw new Error('TOGGLE_COMMENT_LIKE_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ToggleCommentLikeUseCase;
