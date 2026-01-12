const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating add thread correctly', async () => {
    const useCasePayload = { title: 'sebuah thread', body: 'sebuah body' };
    const owner = 'user-123';

    const mockThreadRepository = {
      addThread: jest.fn(() => Promise.resolve({
        id: 'thread-abc',
        title: useCasePayload.title,
        owner,
      })),
    };

    const useCase = new AddThreadUseCase({ threadRepository: mockThreadRepository });
    const result = await useCase.execute(owner, useCasePayload);

    expect(mockThreadRepository.addThread).toHaveBeenCalledWith(owner, expect.any(Object));
    expect(result.id).toBe('thread-abc');
    expect(result.title).toBe(useCasePayload.title);
    expect(result.owner).toBe(owner);
  });
});
