const LandRegistry = artifacts.require("LandRegistry");
module.exports = async function (deployer) {
  await deployer.deploy(LandRegistry);
  const instance = await LandRegistry.deployed();
  console.log("LandRegistry deployed at:", instance.address);
};
