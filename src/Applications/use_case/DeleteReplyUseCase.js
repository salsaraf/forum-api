class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({
    threadId, commentId, replyId, owner,
  }) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentInThread(commentId, threadId);

    await this._replyRepository.verifyReplyInComment(replyId, commentId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);

    await this._replyRepository.deleteReply(replyId);
  }
}

module.exports = DeleteReplyUseCase;
