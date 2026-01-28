




/**
 * Helper function to get appropriate error hint
 * 
 * @param {Error} error - Error object
 * @returns {string} Error hint
 */
function getErrorHint(error) {
  const message = error.message.toLowerCase();

  if (message.includes('authentication') || message.includes('api key')) {
    return 'Check your OpenAI API key in .env file';
  }

  if (message.includes('database') || message.includes('sql')) {
    return 'Check your database connection and query syntax';
  }

  if (message.includes('timeout')) {
    return 'Query took too long. Try adding filters to reduce data size';
  }

  if (message.includes('table') || message.includes('column')) {
    return 'Referenced table or column may not exist. Check your database schema';
  }

  return 'Try rephrasing your prompt or check the server logs for details';
}