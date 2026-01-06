const AddReplyUseCase = require('../AddReplyUseCase');
const NewReply = require('../../../Domains/replies/entities/NewReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const payload = { content: 'sebuah balasan' };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    const mockThreadRepository = {
      verifyThreadAvailable: jest.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      verifyCommentInThread: jest.fn().mockResolvedValue(),
    };

    const mockReplyRepository = {
      addReply: jest.fn().mockResolvedValue({
        id: 'reply-abc',
        content: 'sebuah balasan',
        owner: 'user-123',
      }),
    };

    const useCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const result = await useCase.execute({
      threadId, commentId, owner, payload,
    });

    expect(mockThreadRepository.verifyThreadAvailable).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentInThread).toBeCalledWith(commentId, threadId);
    expect(mockReplyRepository.addReply).toBeCalledWith(commentId, owner, new NewReply(payload));
    expect(result).toStrictEqual(new AddedReply({
      id: 'reply-abc',
      content: 'sebuah balasan',
      owner: 'user-123',
    }));
  });
});
