class GetThreadDetailUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    commentLikeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._commentLikeRepository = commentLikeRepository;
  }

  async execute(threadId) {
    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(threadId);

    const commentIds = comments.map((c) => c.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(commentIds);
    const likeCounts = await this._commentLikeRepository.getLikeCountsByCommentIds(commentIds);

    const repliesByCommentId = replies.reduce((acc, r) => {
      if (!acc[r.commentId]) acc[r.commentId] = [];

      acc[r.commentId].push({
        id: r.id,
        content: r.isDelete ? '**balasan telah dihapus**' : r.content,
        date: r.date,
        username: r.username,
      });

      return acc;
    }, {});

    const mappedComments = comments.map((c) => ({
      id: c.id,
      username: c.username,
      date: c.date,
      content: c.isDelete ? '**komentar telah dihapus**' : c.content,
      likeCount: likeCounts[c.id] || 0,
      replies: repliesByCommentId[c.id] || [],
    }));

    return {
      ...thread,
      comments: mappedComments,
    };
  }
}

module.exports = GetThreadDetailUseCase;
