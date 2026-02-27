## OBT ERC-20 Token and Token-Weighted Governance

This project implements the **OBT** ERC-20 token with a fixed total supply of **1,000,000 OBT** and an on-chain **token-weighted governance system** using OpenZeppelin Governor.

- **Token:** `OBTToken` – ERC-20 with `ERC20Permit` and `ERC20Votes` so holders can delegate their voting power and participate in governance.
- **Governance:** `OBTGovernor` – OpenZeppelin Governor using OBT as the voting token, with simple for/against/abstain counting and quorum defined as a fraction of total supply.

The high-level plan comes from the attached project plan and is documented here before implementation so this README is the primary reference.

---

## Project structure (planned)

- `package.json` – Hardhat + TypeScript toolchain, OpenZeppelin contracts, and supporting libraries.
- `hardhat.config.ts` – Solidity compiler configuration (0.8.24), Hardhat settings, and toolbox plugins.
- `contracts/OBTToken.sol` – ERC-20 OBT token with 1,000,000 OBT total supply and `ERC20Votes` support.
- `contracts/OBTGovernor.sol` – Governor that uses OBT voting power for token-weighted proposals and voting.
- `scripts/deploy.ts` – Deployment script for OBT token and Governor, including optional self-delegation of votes.
- `test/OBTToken.test.ts` – Tests for token metadata, supply, transfers, and voting power via delegation.
- `test/OBTGovernor.test.ts` – Tests for proposal creation, voting with token weights, and proposal execution.

---

## Design summary

- **Total supply:** 1,000,000 OBT (18 decimals), minted once at deployment to a configurable initial owner address.
- **Voting power:** Based on **delegated** balances via `ERC20Votes`; holders self-delegate to vote directly.
- **Governance:** OpenZeppelin `Governor` + `GovernorVotes` + `GovernorCountingSimple` + `GovernorVotesQuorumFraction`.
  - **Voting delay:** 1 block (configurable).
  - **Voting period:** Shorter duration suitable for local testing (configurable).
  - **Proposal threshold:** Initially 0 (any account with non-zero voting power can propose).
  - **Quorum:** Fraction of the total OBT supply at the proposal’s snapshot block (e.g. 4%).
- **Execution:** No timelock in v1; proposals that pass are executed immediately by the Governor.

---

## Getting started

### Prerequisites

- Node.js and npm installed locally.

### Install dependencies

From the project root:

```bash
npm install
```

### Compile contracts

```bash
npm run build
```

### Run tests

```bash
npm test
```

### Deploy

Deploy to the default Hardhat network:

```bash
npx hardhat run scripts/deploy.ts
```

Or to a configured network:

```bash
npx hardhat run scripts/deploy.ts --network <network>
```

This README will be kept up to date alongside major code changes, including any adjustments to governance parameters such as quorum, voting period, or proposal thresholds.

