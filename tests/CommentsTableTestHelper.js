/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    threadId = 'thread-123',
    content = 'comment',
    owner = 'user-123',
    isDelete = false,
    createdAt = new Date(),
  }) {
    const query = {
      text: `
        INSERT INTO comments (id, thread_id, content, owner, is_delete, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [id, threadId, content, owner, isDelete, createdAt],
    };
    await pool.query(query);
  },

  async findCommentById(id) {
    const result = await pool.query({
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    });
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments');
  },
};

module.exports = CommentsTableTestHelper;
