global.fetch = jest.fn(require('node-fetch'));

afterEach(() => global.fetch.mockClear());
