## Masa Critica contracts

Foundry package for the Masa Critica MVP on Monad testnet.

### Contracts

- `MasaMXN`: simple ERC20 test stablecoin used as mMXN.
- `ConsolidationPool`: demand and commitment pool where distributors escrow mMXN
  demand value and suppliers commit product offers until a target is met.

### Commands

```shell
forge test --offline
forge build
forge script script/Deploy.s.sol:Deploy --rpc-url <rpc-url> --broadcast
```

Do not commit `.env`; it is ignored because it can contain deployer private keys.
