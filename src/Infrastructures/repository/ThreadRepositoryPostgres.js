const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(owner, newThread) {
    const { title, body } = newThread;
    const id = `thread-${this._idGenerator(16)}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyThreadAvailability(threadId) {
    const query = {
      text: 'SELECT id FROM threads WHERE id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('THREAD.NOT_FOUND');
    }
  }

  async getThreadById(threadId) {
    const query = {
      text: `SELECT 
        threads.id,
        threads.title,
        threads.body,
        threads.created_at as date,
        users.username
      FROM threads
      LEFT JOIN users ON users.id = threads.owner
      WHERE threads.id = $1`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('THREAD.NOT_FOUND');
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      body: row.body,
      date: row.date.toISOString(),
      username: row.username,
    };
  }
}

module.exports = ThreadRepositoryPostgres;
