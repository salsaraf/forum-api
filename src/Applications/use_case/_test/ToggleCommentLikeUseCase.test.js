const ToggleCommentLikeUseCase = require('../ToggleCommentLikeUseCase');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ToggleCommentLikeUseCase', () => {
  it('should orchestrating like comment action correctly when comment not liked yet', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';

    const mockCommentLikeRepository = {
      isCommentLiked: jest.fn(() => Promise.resolve(false)),
      addLike: jest.fn(),
      deleteLike: jest.fn(),
    };

    const mockCommentRepository = {
      verifyCommentInThread: jest.fn(),
    };

    const mockThreadRepository = {
      verifyThreadAvailability: jest.fn(),
    };

    const useCase = new ToggleCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await useCase.execute({ threadId, commentId, userId });

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentInThread).toHaveBeenCalledWith(commentId, threadId);
    expect(mockCommentLikeRepository.isCommentLiked).toHaveBeenCalledWith(commentId, userId);
    expect(mockCommentLikeRepository.addLike).toHaveBeenCalledWith(commentId, userId);
    expect(mockCommentLikeRepository.deleteLike).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'success' });
  });

  it('should orchestrating unlike comment action correctly when comment already liked', async () => {
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const userId = 'user-123';

    const mockCommentLikeRepository = {
      isCommentLiked: jest.fn(() => Promise.resolve(true)),
      addLike: jest.fn(),
      deleteLike: jest.fn(),
    };

    const mockCommentRepository = {
      verifyCommentInThread: jest.fn(),
    };

    const mockThreadRepository = {
      verifyThreadAvailability: jest.fn(),
    };

    const useCase = new ToggleCommentLikeUseCase({
      commentLikeRepository: mockCommentLikeRepository,
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    const result = await useCase.execute({ threadId, commentId, userId });

    expect(mockCommentLikeRepository.deleteLike).toHaveBeenCalledWith(commentId, userId);
    expect(mockCommentLikeRepository.addLike).not.toHaveBeenCalled();
    expect(result).toEqual({ status: 'success' });
  });

  it('should throw error when payload not contain needed property', async () => {
    const useCase = new ToggleCommentLikeUseCase({});

    await expect(useCase.execute({
      threadId: 'thread-123',
      commentId: 'comment-123',
    })).rejects.toThrowError(
      'TOGGLE_COMMENT_LIKE_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });

  it('should throw error when payload not meet data type specification', async () => {
    const useCase = new ToggleCommentLikeUseCase({});

    await expect(useCase.execute({
      threadId: 'thread-123',
      commentId: 123,
      userId: 'user-123',
    })).rejects.toThrowError(
      'TOGGLE_COMMENT_LIKE_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should throw NotFoundError when thread not found', async () => {
    const useCase = new ToggleCommentLikeUseCase({
      threadRepository: {
        verifyThreadAvailability: jest.fn(() => {
          throw new Error('THREAD.NOT_FOUND');
        }),
      },
      commentRepository: {},
      commentLikeRepository: {},
    });

    await expect(useCase.execute({
      threadId: 'thread-x',
      commentId: 'comment-x',
      userId: 'user-x',
    })).rejects.toThrow(NotFoundError);
  });

  it('should throw NotFoundError when comment not found in thread', async () => {
    const useCase = new ToggleCommentLikeUseCase({
      threadRepository: {
        verifyThreadAvailability: jest.fn(),
      },
      commentRepository: {
        verifyCommentInThread: jest.fn(() => {
          throw new Error('COMMENT.NOT_FOUND');
        }),
      },
      commentLikeRepository: {},
    });

    await expect(useCase.execute({
      threadId: 'thread-123',
      commentId: 'comment-x',
      userId: 'user-123',
    })).rejects.toThrow(NotFoundError);
  });
});
