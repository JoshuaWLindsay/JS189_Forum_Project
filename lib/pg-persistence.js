const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

module.exports = class pgPersistence {
  constructor(session) {
    this.username = session.username;
    this.limit = 4;
  }

  async churches(pageNumber) {
    const ALL_CHURCHES = "SELECT * FROM churches" +
                         " ORDER BY lower(name) ASC LIMIT $1 OFFSET $2";

    let offset = (+pageNumber - 1) * this.limit;

    let resultChurches = await dbQuery(ALL_CHURCHES, this.limit, offset);

    return resultChurches.rows;
  }

  async church(churchName) {
    const CHURCH = "SELECT * FROM churches" +
                   " WHERE name ILIKE $1";
     
    let resultChurch = await dbQuery(CHURCH, churchName);

    return resultChurch.rows[0];
  }

  async churchSeries(churchId, pageNumber) {
    const ALL_SERIES = "SELECT MIN(date) AS date, series" +
                       "  FROM sermons WHERE church_id = $1" +
                       " GROUP BY series ORDER BY date DESC" +
                       " LIMIT $2 OFFSET $3";

    let offset = (+pageNumber - 1) * this.limit;

    let resultSeries = await dbQuery(ALL_SERIES, +churchId, this.limit, offset);

    let seriesNames = resultSeries.rows.map(object => object.series);

    return seriesNames;
  }

  async seriesSermons(churchId, seriesName, pageNumber) {
    const SERIES_SERMONS = "SELECT * FROM sermons" +
                           " WHERE church_id = $1 AND series ILIKE $2" +
                           " ORDER BY date DESC LIMIT $3 OFFSET $4";

    let offset = (+pageNumber - 1) * this.limit;

    let resultSermonNames = await dbQuery(
      SERIES_SERMONS, +churchId, seriesName, this.limit, offset);

    return resultSermonNames.rows;
  }

  async sermon(churchId, seriesName, sermonName) {
    const SERMON = "SELECT * FROM sermons WHERE church_id = $1 AND" +
                   "              series ILIKE $2 AND name ILIKE $3";

    let resultSermon = await dbQuery(SERMON, +churchId, seriesName, sermonName);

    return resultSermon.rows[0];
  }

  async threads(sermonId, pageNumber) {
    const PROMPT = "SELECT * from threads" +
                   " WHERE sermon_id = $1" +
                   " ORDER BY lower(group_name), date DESC LIMIT $2 OFFSET $3";

    let offset = (+pageNumber - 1) * this.limit;

    let resultPrompt = await dbQuery(PROMPT, +sermonId, this.limit, offset);

    if (resultPrompt.rowCount === 0) return undefined;

    return resultPrompt.rows;
  }

  defaultPrompt() {
    const DEFAULT = "What does God want you to know about him? About " +
    "yourself?\rFor what is the soul thankful?\rWhat are the words or " +
    "actions that demonstrate your soul’s love for Christ?\r" +
    "What is your soul afraid of God knowing?\rTo what extent " +
    "is your soul willing to go to preserve unity in your community?";

    return DEFAULT;
  }

  async createThread(threadName, prompt, sermonId) {
    const NEW_THREAD = "INSERT INTO threads " +
                       "(group_name, prompt, username, sermon_id) " +
                       "VALUES ($1, $2, $3, $4)";

    if (!prompt) prompt = this.defaultPrompt();

    let result = await dbQuery(NEW_THREAD, threadName, prompt, 
      this.username, +sermonId);

    return result.rowCount > 0;
  }

  async newThreadId(groupName, sermonId) {
    const NEW_THREAD = "SELECT id FROM threads" + 
                       " WHERE group_name ILIKE $1 AND sermon_id = $2" +
                       " ORDER BY date DESC LIMIT 1";

    let resultThread = await dbQuery(NEW_THREAD, groupName, sermonId);

    return resultThread.rows[0].id;
  }

  async threadExists(threadId) {
    const THREAD_EXISTS = "SELECT * FROM threads WHERE id = $1";

    let resultExists = await dbQuery(THREAD_EXISTS, +threadId);

    return (resultExists.rowCount !== 0);
  }

  async thread(sermonId, threadId) {
    const PROMPT = "SELECT * FROM threads" +
                   " WHERE sermon_id = $1 AND id = $2";

    if (!Number.isInteger(+threadId)) return undefined;

    let resultPrompt = await dbQuery(PROMPT, +sermonId, +threadId);

    if (resultPrompt.rowCount === 0) return undefined;

    return resultPrompt.rows[0];
  }

  async editThread(newName, newPrompt, threadId) {
    const EDIT_THREAD = "UPDATE threads SET group_name = $1, prompt = $2" +
                        " WHERE username = $3 AND id = $4";

    if (!newPrompt) newPrompt = this.defaultPrompt();

    let result = await dbQuery(EDIT_THREAD, newName, newPrompt, 
      this.username, +threadId);
    return result.rowCount > 0;
  }

  async deleteThread(threadId) {
    const DELETE_POST = "DELETE FROM threads" +
                        " WHERE username = $1 AND id = $2";

    let result = await dbQuery(DELETE_POST, this.username, +threadId);
    return result.rowCount > 0;

  }

  async posts(threadId, pageNumber) {
    const PROMPT = "SELECT * from posts" +
                   " WHERE thread_id = $1 ORDER BY date DESC, id DESC" + 
                   " LIMIT $2 OFFSET $3";

    let offset = (+pageNumber - 1) * 5;

    if (Number.isNaN(offset)) return undefined;

    let resultPrompt = await dbQuery(PROMPT, +threadId, 5, offset);

    if (resultPrompt.rowCount === 0) return undefined;

    return resultPrompt.rows;
  }

  async createPost(content, threadId) {
    const CREATE_POST = "INSERT INTO posts (content, thread_id, username)" +
                        " VALUES ($1, $2, $3)";

    let result = await dbQuery(CREATE_POST, content, +threadId, this.username);
    return result.rowCount > 0;
  }

  async post(postId) {
    const POST = "SELECT * FROM posts WHERE id = $1";

    let resultPost = await dbQuery(POST, +postId);
    return resultPost.rows[0];
  }

  async editPost(newContent, threadId, postId) {
    const EDIT_POST = "UPDATE posts SET content = $1" +
                      " WHERE username = $2 AND thread_id = $3 AND id = $4";

    let result = await dbQuery(EDIT_POST, newContent, this.username, 
      +threadId, +postId);
    return result.rowCount > 0;
  }

  async deletePost(postId) {
    const DELETE_POST = "DELETE FROM posts" +
                        " WHERE username = $1 AND id = $2";

    let result = await dbQuery(DELETE_POST, this.username, +postId);
    return result.rowCount > 0;
  }

  async churchPages() {
    const CHURCH_COUNT = "SELECT COUNT(id) FROM churches";

    let resultChurchCount = await dbQuery(CHURCH_COUNT);

    if (resultChurchCount.rows[0].count === 0) return 1;

    return Math.ceil(resultChurchCount.rows[0].count / this.limit) || 1;
  }

  async seriesPages(churchName) {
    const SERIES_COUNT =   "SELECT COUNT(DISTINCT series) FROM sermons" +
                           " INNER JOIN churches" +
                           "    ON sermons.church_id = churches.id" +
                           " WHERE churches.name ILIKE $1";

    let resultSeriesCount = await dbQuery(SERIES_COUNT, churchName);

    if (resultSeriesCount.rows[0].count === 0) return 1;

    return Math.ceil(resultSeriesCount.rows[0].count / this.limit) || 1;
  }

  async sermonPages(churchName, seriesName) {
    const SERMON_COUNT =   "SELECT COUNT(sermons.id) FROM sermons" +
                           " INNER JOIN churches" +
                           "    ON sermons.church_id = churches.id" +
                           " WHERE churches.name ILIKE $1 AND" + 
                           "       sermons.series ILIKE $2";

    let resultSermonCount = await dbQuery(SERMON_COUNT, churchName, 
      seriesName);

    if (resultSermonCount.rows[0].count === 0) return 1;

    return Math.ceil(resultSermonCount.rows[0].count / this.limit) || 1;
  }

  async threadPages(sermonId) {
    const THREAD_COUNT =   "SELECT COUNT(id) FROM threads" +
                           " WHERE sermon_id = $1";

    let resultThreadCount = await dbQuery(THREAD_COUNT, +sermonId);

    return Math.ceil(resultThreadCount.rows[0].count / this.limit) || 1;
  }

  async postPages(threadId) {
    const POST_COUNT =   "SELECT COUNT(id) FROM posts" +
                         " WHERE thread_id = $1";

    let resultPostCount = await dbQuery(POST_COUNT, +threadId);

    return Math.ceil(resultPostCount.rows[0].count / 5) || 1;
  }

  async authenticateUser(username, password) {
    const FIND_HASHED_PASSWORD = "SELECT password FROM users" +
                         " WHERE username = $1";
                        
    let result = await dbQuery(FIND_HASHED_PASSWORD, username);
    if (result.rowCount === 0) return false;

    return bcrypt.compare(password, result.rows[0].password);
  }
}