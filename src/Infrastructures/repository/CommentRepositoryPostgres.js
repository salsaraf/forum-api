const CommentRepository = require('../../Domains/comments/CommentRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(threadId, owner, newComment) {
    const { content } = newComment;
    const id = `comment-${this._idGenerator(16)}`;

    const query = {
      text: `
        INSERT INTO comments (id, thread_id, content, owner)
        VALUES ($1, $2, $3, $4)
        RETURNING id, content, owner
      `,
      values: [id, threadId, content, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyCommentAvailable(commentId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('COMMENT.NOT_FOUND');
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT owner FROM comments WHERE id = $1',
      values: [commentId],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('COMMENT.NOT_FOUND');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('COMMENT.NOT_OWNER');
    }
  }

  async verifyCommentInThread(commentId, threadId) {
    const query = {
      text: 'SELECT id FROM comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('COMMENT.NOT_FOUND');
    }
  }

  async deleteComment(commentId) {
    const query = {
      text: 'UPDATE comments SET is_delete = TRUE WHERE id = $1 RETURNING id',
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('COMMENT.NOT_FOUND');
    }
  }

  async getCommentsByThreadId(threadId) {
    const query = {
      text: `SELECT 
        comments.id,
        comments.content,
        comments.thread_id,
        comments.is_delete,
        comments.created_at as date,
        users.username
      FROM comments
      LEFT JOIN users ON users.id = comments.owner
      WHERE comments.thread_id = $1
      ORDER BY comments.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      username: row.username,
      date: row.date.toISOString(),
      content: row.content,
      isDelete: row.is_delete,
    }));
  }
}

module.exports = CommentRepositoryPostgres;
