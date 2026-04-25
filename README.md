# Monad Blitz GDL

## What is Monad Blitz

Monad Blitz GDL is a beginner-friendly builder sprint in Guadalajara focused on turning an idea into a working demo fast. The event flow is practical: Monad basics, hands-on workshops, team formation, mentor-supported building, and a final showcase.

The judging signal from previous Monad Blitz winners is product-first. Strong projects connect a real-world problem to one credible onchain component, then explain why blockchain improves the workflow. Winning-style themes included SME financing, real-world asset tokenization, and parametric insurance with sensor-triggered onchain payouts.

Monad itself is an EVM-compatible Layer 1 blockchain. For this hackathon, that means we should think in familiar Ethereum tooling instead of custom blockchain infrastructure:

- Solidity smart contracts.
- Foundry, Hardhat, or Remix-style deployment flows.
- A React frontend with wallet connection.
- Optional supporting infra such as an oracle, indexer, simple backend, or AI workflow.
- One clear onchain action that makes the product auditable, programmable, settleable, or easier to coordinate.

The best pitch shape is:

1. Here is the real-world problem.
2. Here is the product workflow.
3. Here is the onchain state or transaction.
4. Here is why Monad/EVM makes this credible.
5. Here is the working demo.

## Current Stack

This repo is a minimal TypeScript-first Bun workspace. The goal is to keep a clean base skeleton for hackathon experiments, then branch ideas into local worktrees without disturbing the working wallet/routing setup.

Current layout:

```txt
apps/
  web/          # React 19 + Vite 8 frontend
worktrees/      # local ignored git worktrees for feature experiments
```

Implemented choices:

- **Runtime/package manager:** Bun with workspaces.
- **Frontend:** React 19, Vite 8, TypeScript.
- **Routing:** TanStack Router with `/` and protected `/app`.
- **Wallet/onchain base:** Wagmi/Viem with explicit Brave Wallet and MetaMask injected-provider selection.
- **Chain config:** Monad Testnet, chain id `10143`, RPC `https://testnet-rpc.monad.xyz`.
- **Formatting/linting:** Biome.
- **Backend:** none for now. Keep the demo browser-first unless AI API keys, persistence, indexing, or server-owned actions become necessary.

The wallet setup intentionally uses injected providers. That means Brave Wallet and MetaMask are read from the browser's `window.ethereum` provider. We explicitly separate Brave from MetaMask because Brave can expose MetaMask-compatible flags, and generic injected discovery can produce confusing provider behavior.

The current app behavior is:

- `/` shows a connect wallet button.
- `/app` shows the protected app placeholder when connected.
- Direct visits to `/app` wait for Wagmi reconnect before deciding whether to redirect.
- Clicking disconnect sets an app-level disconnect preference so refreshes stay visually disconnected until the user clicks connect again.

Likely expansion points, only when needed:

- **Contracts:** add `packages/contracts` with Solidity and Foundry.
- **Shared schemas:** add `packages/shared` when form, AI, contract, and route types start repeating.
- **AI product layer:** add Vercel AI SDK for typed "Fill with AI" or "Enhance by AI" actions.
- **Agent/workflow layer:** add Mastra only when a workflow needs tools, repeatable multi-step logic, or agent debugging. Verify Mastra APIs against installed docs before coding.
- **Validation:** add Zod as soon as user-entered or AI-generated data feeds UI state or contract inputs.

The preferred demo shape is still one narrow onchain loop:

1. User creates or improves structured product data.
2. User reviews and confirms typed fields.
3. App writes one meaningful record, claim, quote, policy, invoice, asset, or settlement action on Monad.
4. UI shows transaction state and the resulting onchain record.

## Development

Install dependencies:

```sh
bun install
```

Run the web app:

```sh
bun run dev
```

Check the project:

```sh
bun run lint
bun run check
bun run build
```

Create feature worktrees under the ignored `worktrees/` directory:

```sh
git worktree add worktrees/masa-critica -b feature/masa-critica
```

Use the main checkout as the clean base skeleton. Use worktrees for fast idea branches and messy product experiments.

## Coding Guidelines

Speed is the constraint, but the code should still be easy for humans and AI agents to modify.

Frontend first principles:

- Every user-facing interface should be reactive, stateful, typed, and demoable.
- Prefer real controls and state transitions over static mockups.
- Use explicit TypeScript types for product entities, form state, AI request payloads, AI response payloads, contract inputs, and contract outputs.
- Design data structures so AI features can consume them directly. "Fill with AI" and "Enhance by AI" should receive verbose, typed context instead of scraping UI text.
- Keep files under 200 lines where practical. Split by responsibility: schema, component, hook, action, contract client, agent tool.
- Treat Zod schemas as product contracts. Reuse them for forms, API validation, AI structured outputs, and shared package boundaries.
- Avoid giant components. A good component has one job, clear props, and no hidden global assumptions.
- Keep demo paths resilient: loading, empty, error, wallet-disconnected, transaction-pending, transaction-success, and AI-generating states should all exist.
- Make UI copy concrete and pitch-friendly. The product should explain itself through labels, states, and results, not through a separate wall of instructions.
- Keep route guards explicit. A protected route should handle loading/reconnecting, connected, disconnected, and explicitly-disconnected states.
- Keep wallet behavior honest. App-level disconnect is not the same as revoking wallet site permission in Brave or MetaMask.

AI feature guidelines:

- Prefer typed structured generation over free-form text when the output affects UI state or contract inputs.
- Keep prompts close to schemas. The model should know what fields it is filling, what each field means, and what constraints matter.
- Store AI-generated drafts separately from confirmed user data.
- Make AI actions reversible or reviewable before writing onchain.
- For Mastra, check installed docs before coding agents, tools, and workflows because APIs change quickly.

Onchain guidelines:

- The smart contract should be intentionally small and pitchable.
- Put only the state or event that benefits from being onchain into Solidity.
- Emit events for anything the frontend may need to display.
- Avoid complex tokenomics, custom marketplaces, or governance unless the whole product depends on them.
- Prefer one successful transaction path over many half-working flows.

Hackathon delivery guidelines:

- Optimize for a clean 3-minute demo path.
- Keep the product narrative visible in the app state: draft, AI-enhanced, reviewed, submitted onchain, settled/verified.
- Use seeded examples so the demo works without typing a full story live.
- Commit to one target user and one painful workflow.
- If a feature does not support the pitch, defer it.
