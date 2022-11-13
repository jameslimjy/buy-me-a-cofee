const { ethers } = require("hardhat");
// seems like don't need to explicitly import hre

// Returns the Ether balance of a given address.
async function getBalance(address) {
  const balanceBigInt = await ethers.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses.
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases.
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const tipper = memo.name;
    const tipperAddress = memo.from;
    const message = memo.message;
    console.log(
      `At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`
    );
  }
}

async function main() {
  // initialize accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // deploy contract
  const BuyMeACoffeeFactory = await hre.ethers.getContractFactory(
    "BuyMeACoffee"
  );
  const buyMeACoffee = await BuyMeACoffeeFactory.deploy();
  await buyMeACoffee.deployed();
  console.log("BuyMeACofee deployed to", buyMeACoffee.address);

  // check bal before purchases
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log("----- start -----");
  await printBalances(addresses);

  // buy coffees
  const tip = { value: hre.ethers.utils.parseEther("1") };
  await buyMeACoffee.connect(tipper).buyCoffee("Alice", "you rocks", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Bob", "a for average", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Charlie", "teh c peng", tip);

  // check bal after purchases
  console.log("----- after buying coffees -----");
  await printBalances(addresses);

  // withdraw funds
  await buyMeACoffee.connect(owner).withdrawTips();

  // check bal after withdraw
  console.log("----- after withdrawing tips -----");
  await printBalances(addresses);

  // read memos
  console.log("----- memos -----");
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
