const NewReply = require('../../Domains/replies/entities/NewReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({
    threadId, commentId, owner, payload,
  }) {
    const newReply = new NewReply(payload);

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentInThread(commentId, threadId);

    const added = await this._replyRepository.addReply(commentId, owner, newReply);
    return new AddedReply(added);
  }
}

module.exports = AddReplyUseCase;
