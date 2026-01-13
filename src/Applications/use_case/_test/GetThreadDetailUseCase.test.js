const GetThreadDetailUseCase = require('../GetThreadDetailUseCase');

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate get thread detail correctly with soft deleted comments and like count', async () => {
    const threadId = 'thread-123';

    const mockThreadRepository = {
      getThreadById: jest.fn(() => Promise.resolve({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body',
        date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
        username: 'dicoding',
      })),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn(() => Promise.resolve([
        {
          id: 'comment-1',
          username: 'johndoe',
          date: new Date('2021-08-08T07:22:33.555Z').toISOString(),
          content: 'sebuah comment',
          isDelete: false,
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
          content: 'akan diganti',
          isDelete: true,
        },
      ])),
    };

    const mockReplyRepository = {
      getRepliesByCommentIds: jest.fn(() => Promise.resolve([])),
    };

    const mockCommentLikeRepository = {
      getLikeCountsByCommentIds: jest.fn(() => Promise.resolve({
        'comment-1': 2,
        'comment-2': 0,
      })),
    };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    const result = await useCase.execute(threadId);

    expect(mockThreadRepository.getThreadById)
      .toHaveBeenCalledWith(threadId);

    expect(mockCommentRepository.getCommentsByThreadId)
      .toHaveBeenCalledWith(threadId);

    expect(mockReplyRepository.getRepliesByCommentIds)
      .toHaveBeenCalledWith(['comment-1', 'comment-2']);

    expect(mockCommentLikeRepository.getLikeCountsByCommentIds)
      .toHaveBeenCalledWith(['comment-1', 'comment-2']);

    expect(result).toStrictEqual({
      id: threadId,
      title: 'sebuah thread',
      body: 'sebuah body',
      date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
      username: 'dicoding',
      comments: [
        {
          id: 'comment-1',
          username: 'johndoe',
          date: new Date('2021-08-08T07:22:33.555Z').toISOString(),
          content: 'sebuah comment',
          likeCount: 2,
          replies: [],
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
          content: '**komentar telah dihapus**',
          likeCount: 0,
          replies: [],
        },
      ],
    });
  });

  it('should orchestrate get thread detail correctly with soft deleted replies and grouped by commentId with like count', async () => {
    const threadId = 'thread-123';

    const mockThreadRepository = {
      getThreadById: jest.fn(() => Promise.resolve({
        id: threadId,
        title: 'sebuah thread',
        body: 'sebuah body',
        date: new Date('2021-08-08T07:19:09.775Z').toISOString(),
        username: 'dicoding',
      })),
    };

    const mockCommentRepository = {
      getCommentsByThreadId: jest.fn(() => Promise.resolve([
        {
          id: 'comment-1',
          username: 'johndoe',
          date: new Date('2021-08-08T07:22:33.555Z').toISOString(),
          content: 'c1',
          isDelete: false,
        },
        {
          id: 'comment-2',
          username: 'dicoding',
          date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
          content: 'c2',
          isDelete: false,
        },
      ])),
    };

    const mockReplyRepository = {
      getRepliesByCommentIds: jest.fn(() => Promise.resolve([
        {
          id: 'reply-1',
          commentId: 'comment-1',
          username: 'johndoe',
          date: new Date('2021-08-08T07:59:48.766Z').toISOString(),
          content: 'akan diganti',
          isDelete: true,
        },
        {
          id: 'reply-2',
          commentId: 'comment-1',
          username: 'dicoding',
          date: new Date('2021-08-08T08:07:01.522Z').toISOString(),
          content: 'r2',
          isDelete: false,
        },
      ])),
    };

    const mockCommentLikeRepository = {
      getLikeCountsByCommentIds: jest.fn(() => Promise.resolve({
        'comment-1': 5,
        'comment-2': 1,
      })),
    };

    const useCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
      commentLikeRepository: mockCommentLikeRepository,
    });

    const result = await useCase.execute(threadId);

    expect(result.comments[0]).toStrictEqual({
      id: 'comment-1',
      username: 'johndoe',
      date: new Date('2021-08-08T07:22:33.555Z').toISOString(),
      content: 'c1',
      likeCount: 5,
      replies: [
        {
          id: 'reply-1',
          content: '**balasan telah dihapus**',
          date: new Date('2021-08-08T07:59:48.766Z').toISOString(),
          username: 'johndoe',
        },
        {
          id: 'reply-2',
          content: 'r2',
          date: new Date('2021-08-08T08:07:01.522Z').toISOString(),
          username: 'dicoding',
        },
      ],
    });

    expect(result.comments[1]).toStrictEqual({
      id: 'comment-2',
      username: 'dicoding',
      date: new Date('2021-08-08T07:26:21.338Z').toISOString(),
      content: 'c2',
      likeCount: 1,
      replies: [],
    });
  });
});
