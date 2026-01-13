const CommentLikeRepository = require('../../Domains/likes/CommentLikeRepository');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addLike(commentId, userId) {
    try {
      const id = `like-${this._idGenerator(16)}`;
      const query = {
        text: 'INSERT INTO comment_likes VALUES($1, $2, $3) RETURNING id',
        values: [id, commentId, userId],
      };

      const result = await this._pool.query(query);
      return result.rows[0].id;
    } catch (error) {
      if (error.code === '23505') {
        throw new InvariantError('user sudah menyukai komentar ini');
      }
      throw error;
    }
  }

  async deleteLike(commentId, userId) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE comment_id = $1 AND user_id = $2 RETURNING id',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new InvariantError('like tidak ditemukan');
    }

    return result.rows[0]?.id;
  }

  async isCommentLiked(commentId, userId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rowCount > 0;
  }

  async getLikeCountByCommentId(commentId) {
    const query = {
      text: 'SELECT COUNT(*) as like_count FROM comment_likes WHERE comment_id = $1',
      values: [commentId],
    };

    const result = await this._pool.query(query);
    return parseInt(result.rows[0]?.like_count || 0, 10);
  }

  async getLikeCountsByCommentIds(commentIds) {
    if (commentIds.length === 0) {
      return {};
    }

    const placeholders = commentIds.map((_, index) => `$${index + 1}`).join(',');
    const query = {
      text: `SELECT comment_id, COUNT(*) as like_count 
             FROM comment_likes 
             WHERE comment_id IN (${placeholders}) 
             GROUP BY comment_id`,
      values: commentIds,
    };

    const result = await this._pool.query(query);

    const likeCounts = {};
    result.rows.forEach((row) => {
      likeCounts[row.comment_id] = parseInt(row.like_count, 10);
    });

    return likeCounts;
  }
}

module.exports = CommentLikeRepositoryPostgres;
