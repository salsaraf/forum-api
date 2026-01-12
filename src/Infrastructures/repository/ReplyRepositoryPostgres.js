const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(commentId, owner, newReply) {
    const id = `reply-${this._idGenerator()}`;
    const { content } = newReply;

    const query = {
      text: `
        INSERT INTO replies (id, comment_id, content, owner)
        VALUES ($1, $2, $3, $4)
        RETURNING id, content, owner
      `,
      values: [id, commentId, content, owner],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyReplyAvailable(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('REPLY.NOT_FOUND');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('REPLY.NOT_FOUND');
    }

    if (result.rows[0].owner !== owner) {
      throw new AuthorizationError('REPLY.NOT_OWNER');
    }
  }

  async verifyReplyInComment(replyId, commentId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND comment_id = $2',
      values: [replyId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('REPLY.NOT_FOUND');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1 RETURNING id',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('REPLY.NOT_FOUND');
    }
  }

  async getRepliesByCommentIds(commentIds) {
    if (!Array.isArray(commentIds) || commentIds.length === 0) return [];

    const query = {
      text: `
        SELECT
          replies.id,
          replies.comment_id,
          users.username,
          replies.created_at AS date,
          replies.content,
          replies.is_delete
        FROM replies
        LEFT JOIN users ON users.id = replies.owner
        WHERE replies.comment_id = ANY($1::text[])
        ORDER BY replies.created_at ASC
      `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      commentId: row.comment_id,
      username: row.username,
      date: row.date.toISOString(),
      content: row.content,
      isDelete: row.is_delete,
    }));
  }
}

module.exports = ReplyRepositoryPostgres;
