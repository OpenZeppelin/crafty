module.exports = async(promise) => {
  try {
    await promise;
  } catch (error) {
    return;
  }
  assert.fail("Expected throw not received");
};
