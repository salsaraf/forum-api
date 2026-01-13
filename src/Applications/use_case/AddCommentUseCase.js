const NewComment = require('../../Domains/comments/entities/NewComment');
const AddedComment = require('../../Domains/comments/entities/AddedComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(owner, threadId, useCasePayload) {
    await this._threadRepository.verifyThreadAvailability(threadId);
    const newComment = new NewComment(useCasePayload);
    const added = await this._commentRepository.addComment(threadId, owner, newComment);
    return new AddedComment(added);
  }
}

module.exports = AddCommentUseCase;
