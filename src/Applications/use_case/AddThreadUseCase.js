const NewThread = require('../../Domains/threads/entities/NewThread');
const AddedThread = require('../../Domains/threads/entities/AddedThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(owner, useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    const added = await this._threadRepository.addThread(owner, newThread);
    return new AddedThread(added);
  }
}

module.exports = AddThreadUseCase;
