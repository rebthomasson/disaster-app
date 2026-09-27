export default {
    getItem: jest.fn(async (key) => null),
    setItem: jest.fn(async (key, value) => {}),
    removeItem: jest.fn(async (key) => {}),
};