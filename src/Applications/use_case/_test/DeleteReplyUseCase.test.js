const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrating the delete reply action correctly', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const replyId = 'reply-123';
    const owner = 'user-123';

    const mockThreadRepository = {
      verifyThreadAvailable: jest.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      verifyCommentInThread: jest.fn().mockResolvedValue(),
    };

    const mockReplyRepository = {
      verifyReplyInComment: jest.fn().mockResolvedValue(),
      verifyReplyOwner: jest.fn().mockResolvedValue(),
      deleteReply: jest.fn().mockResolvedValue(),
    };

    const useCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await useCase.execute({
      threadId, commentId, replyId, owner,
    });

    expect(mockThreadRepository.verifyThreadAvailable).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentInThread).toBeCalledWith(commentId, threadId);
    expect(mockReplyRepository.verifyReplyInComment).toBeCalledWith(replyId, commentId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId);
  });
});
