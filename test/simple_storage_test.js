const SimpleStorage = artifacts.require("SimpleStorage");

contract("SimpleStorage", accounts => {
  it("should store the value 42", async () => {
    const simpleStorageInstance = await SimpleStorage.deployed();
    
    // Set value to 42
    await simpleStorageInstance.set(42, { from: accounts[0] });
    
    // Get stored value
    const storedData = await simpleStorageInstance.get();
    
    assert.equal(storedData, 42, "The value 42 was not stored.");
  });
});