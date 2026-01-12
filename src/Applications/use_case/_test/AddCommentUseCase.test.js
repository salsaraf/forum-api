const AddCommentUseCase = require('../AddCommentUseCase');
const NewComment = require('../../../Domains/comments/entities/NewComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = { content: 'sebuah comment' };
    const credentialId = 'user-123';
    const threadId = 'thread-123';

    const mockThreadRepository = {
      verifyThreadAvailable: jest.fn().mockResolvedValue(),
    };

    const mockCommentRepository = {
      addComment: jest.fn().mockResolvedValue({
        id: 'comment-abc',
        content: 'sebuah comment',
        owner: 'user-123',
      }),
    };

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const addedComment = await addCommentUseCase.execute(credentialId, threadId, useCasePayload);

    expect(mockThreadRepository.verifyThreadAvailable).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.addComment).toHaveBeenCalledWith(
      threadId,
      credentialId,
      new NewComment(useCasePayload),
    );

    expect(addedComment).toStrictEqual(new AddedComment({
      id: 'comment-abc',
      content: 'sebuah comment',
      owner: 'user-123',
    }));
  });
});
