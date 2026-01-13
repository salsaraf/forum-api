class CommentLike {
  constructor(payload) {
    this._verifyPayload(payload);

    this.id = payload.id;
    this.commentId = payload.commentId;
    this.userId = payload.userId;
  }

  _verifyPayload(payload) {
    const { id, commentId, userId } = payload;

    if (!id || !commentId || !userId) {
      throw new Error('COMMENT_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof commentId !== 'string' || typeof userId !== 'string') {
      throw new Error('COMMENT_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentLike;
