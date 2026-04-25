// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/MasaMXN.sol";
import "../src/ConsolidationPool.sol";

contract ConsolidationPoolTest is Test {
    MasaMXN public token;
    ConsolidationPool public pool;

    address distributor = makeAddr("distributor");
    address supplier1 = makeAddr("supplier1");
    address supplier2 = makeAddr("supplier2");

    uint256 constant TARGET = 300_000e18;
    uint256 constant DEADLINE = 2_000_000_000;

    function setUp() public {
        token = new MasaMXN();
        pool = new ConsolidationPool(address(token));

        token.mint(distributor, 10_000_000e18);
        token.mint(supplier1, 1_000_000e18);
        token.mint(supplier2, 1_000_000e18);

        vm.prank(distributor);
        token.approve(address(pool), type(uint256).max);
    }

    function test_createDemand() public {
        vm.prank(distributor);
        uint256 id = pool.createDemand("Test", "Desc", TARGET, DEADLINE);

        assertEq(id, 0);
        (address dist, uint256 target, uint256 deadline, uint256 committed, , , bool isActive, bool isConsolidated) =
            pool.demands(id);
        assertEq(dist, distributor);
        assertEq(target, TARGET);
        assertEq(deadline, DEADLINE);
        assertEq(committed, 0);
        assertTrue(isActive);
        assertFalse(isConsolidated);
    }

    function test_commitToDemand() public {
        vm.prank(distributor);
        pool.createDemand("Test", "Desc", TARGET, DEADLINE);

        uint256 amount = 100_000e18;
        vm.prank(supplier1);
        pool.commitToDemand(0, amount, "Lemonade", "3 months");

        (, , , uint256 committed, , , , ) = pool.demands(0);
        assertEq(committed, amount);
        assertEq(pool.supplierCommitted(0, supplier1), amount);
    }

    function test_consolidate() public {
        vm.prank(distributor);
        pool.createDemand("Test", "Desc", TARGET, DEADLINE);

        vm.prank(supplier1);
        pool.commitToDemand(0, 200_000e18, "Lemonade", "3 months");

        vm.prank(supplier2);
        pool.commitToDemand(0, 100_000e18, "Ice cream", "5 months");

        uint256 bal1Before = token.balanceOf(supplier1);
        uint256 bal2Before = token.balanceOf(supplier2);

        pool.consolidateDemand(0);

        assertEq(token.balanceOf(supplier1), bal1Before + 200_000e18);
        assertEq(token.balanceOf(supplier2), bal2Before + 100_000e18);

        (, , , , , , bool isActive, bool isConsolidated) = pool.demands(0);
        assertFalse(isActive);
        assertTrue(isConsolidated);
    }

    function test_cannotExceedTarget() public {
        vm.prank(distributor);
        pool.createDemand("Test", "Desc", TARGET, DEADLINE);

        vm.prank(supplier1);
        pool.commitToDemand(0, 200_000e18, "Lemonade", "3 months");

        vm.prank(supplier2);
        vm.expectRevert("Exceeds target");
        pool.commitToDemand(0, 200_000e18, "Ice cream", "5 months");
    }

    function test_withdrawCommitment() public {
        vm.prank(distributor);
        pool.createDemand("Test", "Desc", TARGET, DEADLINE);

        vm.prank(supplier1);
        pool.commitToDemand(0, 100_000e18, "Lemonade", "3 months");

        vm.prank(supplier1);
        pool.withdrawCommitment(0);

        (, , , uint256 committed, , , , ) = pool.demands(0);
        assertEq(committed, 0);
        assertEq(pool.supplierCommitted(0, supplier1), 0);
    }

    function test_cancelAfterDeadline() public {
        vm.prank(distributor);
        pool.createDemand("Test", "Desc", TARGET, DEADLINE);

        vm.prank(supplier1);
        pool.commitToDemand(0, 100_000e18, "Lemonade", "3 months");

        vm.warp(DEADLINE + 1);

        uint256 balBefore = token.balanceOf(distributor);
        vm.prank(distributor);
        pool.cancelDemand(0);

        assertEq(token.balanceOf(distributor), balBefore + TARGET);
    }
}
