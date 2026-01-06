const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    const credentialId = 'user-123';
    const threadId = 'thread-123';
    const commentId = 'comment-123';

    const mockThreadRepository = {
      verifyThreadAvailable: jest.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      verifyCommentAvailable: jest.fn().mockResolvedValue(),
      verifyCommentInThread: jest.fn().mockResolvedValue(),
      verifyCommentOwner: jest.fn().mockResolvedValue(),
      deleteComment: jest.fn().mockResolvedValue(),
    };

    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    await deleteCommentUseCase.execute(credentialId, threadId, commentId);

    expect(mockThreadRepository.verifyThreadAvailable).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentAvailable).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentInThread).toBeCalledWith(commentId, threadId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, credentialId);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId);
  });
});
