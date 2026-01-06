const ThreadRepository = require('../ThreadRepository');

describe('ThreadRepository interface', () => {
  it('should throw error when invoke unimplemented method', async () => {
    const repo = new ThreadRepository();

    await expect(repo.addThread('user-123', { title: 't', body: 'b' }))
      .rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(repo.verifyThreadAvailability('thread-123'))
      .rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');

    await expect(repo.getThreadById('thread-123'))
      .rejects
      .toThrowError('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
