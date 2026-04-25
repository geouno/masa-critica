// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/MasaMXN.sol";
import "../src/ConsolidationPool.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        MasaMXN token = new MasaMXN();
        console.log("MasaMXN deployed at:", address(token));

        ConsolidationPool pool = new ConsolidationPool(address(token));
        console.log("ConsolidationPool deployed at:", address(pool));

        token.mint(msg.sender, 10_000_000 * 10 ** 18);
        console.log("Minted 10M mMXN to deployer");

        vm.stopBroadcast();
    }
}
