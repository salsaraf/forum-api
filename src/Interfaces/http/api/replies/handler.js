class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyHandler = this.postReplyHandler.bind(this);
    this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
  }

  async postReplyHandler(request, h) {
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;

    const addReplyUseCase = this._container.getInstance('AddReplyUseCase');
    const addedReply = await addReplyUseCase.execute({
      threadId,
      commentId,
      owner,
      payload: request.payload,
    });

    return h.response({
      status: 'success',
      data: { addedReply },
    }).code(201);
  }

  async deleteReplyHandler(request) {
    const { threadId, commentId, replyId } = request.params;
    const { id: owner } = request.auth.credentials;

    const deleteReplyUseCase = this._container.getInstance('DeleteReplyUseCase');
    await deleteReplyUseCase.execute({
      threadId,
      commentId,
      replyId,
      owner,
    });

    return { status: 'success' };
  }
}

module.exports = RepliesHandler;
