class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(owner, threadId, commentId) {
    await this._threadRepository.verifyThreadAvailable(threadId);
    await this._commentRepository.verifyCommentAvailable(commentId);
    await this._commentRepository.verifyCommentInThread(commentId, threadId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }
}

module.exports = DeleteCommentUseCase;
