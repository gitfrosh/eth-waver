// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

    struct Wave {
        address waver;
        uint256 timestamp;
    }

    Wave[] waves;

    constructor() {
        console.log("Yo yo, I am a contract am I am smart");
    }

    function wave() public {
        totalWaves += 1;
        waves.push(Wave(msg.sender, block.timestamp));
        console.log("%s has waved!", msg.sender);
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("We have %d total waves!", totalWaves);
        return totalWaves;
    }

    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }
}
