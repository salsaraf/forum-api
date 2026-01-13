class LikesHandler {
  constructor(container) {
    this._container = container;
    this.toggleCommentLikeHandler = this.toggleCommentLikeHandler.bind(this);
  }

  async toggleCommentLikeHandler(request, h) {
    try {
      const { threadId, commentId } = request.params;
      const { id: userId } = request.auth.credentials;

      const toggleCommentLikeUseCase = this._container.getInstance('ToggleCommentLikeUseCase');

      await toggleCommentLikeUseCase.execute({
        threadId,
        commentId,
        userId,
      });

      const response = h.response({
        status: 'success',
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error.message.includes('tidak ditemukan')) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(404);
      }

      if (error.message.includes('tidak dapat')) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(400);
      }

      // Default error
      return h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      }).code(500);
    }
  }
}

module.exports = LikesHandler;
