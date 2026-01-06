class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadDetailHandler = this.getThreadDetailHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance('AddThreadUseCase');
    const addedThread = await addThreadUseCase.execute(credentialId, request.payload);

    return h.response({
      status: 'success',
      data: { addedThread },
    }).code(201);
  }

  async getThreadDetailHandler(request) {
    const { threadId } = request.params;
    const getThreadDetailUseCase = this._container.getInstance('GetThreadDetailUseCase');
    const thread = await getThreadDetailUseCase.execute(threadId);

    return {
      status: 'success',
      data: { thread },
    };
  }
}

module.exports = ThreadsHandler;
