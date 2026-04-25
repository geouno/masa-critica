// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ConsolidationPool {
    using SafeERC20 for IERC20;

    IERC20 public immutable mMXN;

    struct Demand {
        address distributor;
        uint256 targetAmount;
        uint256 deadline;
        uint256 committedAmount;
        string title;
        string description;
        bool isActive;
        bool isConsolidated;
    }

    struct Commitment {
        address supplier;
        uint256 amount;
        string productDescription;
        string deliveryTimeline;
    }

    uint256 public demandCount;
    mapping(uint256 => Demand) public demands;
    mapping(uint256 => Commitment[]) public commitments;
    mapping(uint256 => mapping(address => uint256)) public supplierCommitted;

    event DemandCreated(
        uint256 indexed demandId,
        address indexed distributor,
        uint256 targetAmount,
        uint256 deadline,
        string title,
        string description
    );
    event Committed(
        uint256 indexed demandId,
        address indexed supplier,
        uint256 amount,
        string productDescription,
        string deliveryTimeline
    );
    event CommitmentWithdrawn(
        uint256 indexed demandId,
        address indexed supplier,
        uint256 amount
    );
    event Consolidated(uint256 indexed demandId);
    event DemandCancelled(uint256 indexed demandId);

    constructor(address _mMXN) {
        mMXN = IERC20(_mMXN);
    }

    function createDemand(
        string calldata title,
        string calldata description,
        uint256 targetAmount,
        uint256 deadline
    ) external returns (uint256) {
        require(targetAmount > 0, "Target must be > 0");
        require(deadline > block.timestamp, "Deadline must be in the future");

        mMXN.safeTransferFrom(msg.sender, address(this), targetAmount);

        uint256 demandId = demandCount++;
        demands[demandId] = Demand({
            distributor: msg.sender,
            targetAmount: targetAmount,
            deadline: deadline,
            committedAmount: 0,
            title: title,
            description: description,
            isActive: true,
            isConsolidated: false
        });

        emit DemandCreated(demandId, msg.sender, targetAmount, deadline, title, description);
        return demandId;
    }

    function commitToDemand(
        uint256 demandId,
        uint256 amount,
        string calldata productDescription,
        string calldata deliveryTimeline
    ) external {
        Demand storage demand = demands[demandId];
        require(demand.isActive, "Demand not active");
        require(!demand.isConsolidated, "Already consolidated");
        require(block.timestamp < demand.deadline, "Deadline passed");
        require(amount > 0, "Amount must be > 0");
        require(
            demand.committedAmount + amount <= demand.targetAmount,
            "Exceeds target"
        );

        commitments[demandId].push(Commitment({
            supplier: msg.sender,
            amount: amount,
            productDescription: productDescription,
            deliveryTimeline: deliveryTimeline
        }));

        demand.committedAmount += amount;
        supplierCommitted[demandId][msg.sender] += amount;

        emit Committed(demandId, msg.sender, amount, productDescription, deliveryTimeline);
    }

    function consolidateDemand(uint256 demandId) external {
        Demand storage demand = demands[demandId];
        require(demand.isActive, "Demand not active");
        require(!demand.isConsolidated, "Already consolidated");
        require(
            demand.committedAmount >= demand.targetAmount,
            "Target not met"
        );

        demand.isConsolidated = true;
        demand.isActive = false;

        Commitment[] storage comms = commitments[demandId];
        for (uint256 i = 0; i < comms.length; i++) {
            mMXN.safeTransfer(comms[i].supplier, comms[i].amount);
        }

        emit Consolidated(demandId);
    }

    function withdrawCommitment(uint256 demandId) external {
        Demand storage demand = demands[demandId];
        require(demand.isActive, "Demand not active");
        require(!demand.isConsolidated, "Already consolidated");

        uint256 total = supplierCommitted[demandId][msg.sender];
        require(total > 0, "No commitment");

        supplierCommitted[demandId][msg.sender] = 0;
        demand.committedAmount -= total;

        Commitment[] storage comms = commitments[demandId];
        uint256 remaining = total;
        for (uint256 i = comms.length; i > 0; i--) {
            if (comms[i - 1].supplier == msg.sender) {
                if (comms[i - 1].amount <= remaining) {
                    remaining -= comms[i - 1].amount;
                    comms[i - 1] = comms[comms.length - 1];
                    comms.pop();
                } else {
                    comms[i - 1].amount -= remaining;
                    remaining = 0;
                }
                if (remaining == 0) break;
            }
        }

        emit CommitmentWithdrawn(demandId, msg.sender, total);
    }

    function cancelDemand(uint256 demandId) external {
        Demand storage demand = demands[demandId];
        require(msg.sender == demand.distributor, "Not distributor");
        require(demand.isActive, "Demand not active");
        require(!demand.isConsolidated, "Already consolidated");
        require(block.timestamp >= demand.deadline, "Deadline not passed");

        demand.isActive = false;
        mMXN.safeTransfer(demand.distributor, demand.targetAmount);

        emit DemandCancelled(demandId);
    }

    function getCommitmentCount(uint256 demandId) external view returns (uint256) {
        return commitments[demandId].length;
    }

    function getCommitment(uint256 demandId, uint256 index)
        external
        view
        returns (Commitment memory)
    {
        return commitments[demandId][index];
    }
}
