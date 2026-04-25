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

## Suggested Stack

Use a TypeScript-first monorepo with Bun workspaces. Keep the build surface small, but structure it like a real product so we can move quickly without painting ourselves into a corner.

Recommended layout:

```txt
apps/
  web/          # React 19 + Vite frontend
  agent/        # Mastra agents/workflows for AI features
packages/
  contracts/    # Solidity contracts, deployment scripts, ABIs
  shared/       # Shared TypeScript types, schemas, constants
  ui/           # Reusable React components if duplication appears
```

Core choices:

- **Runtime/package manager:** Bun with workspaces.
- **Frontend:** React 19, Vite 8, TypeScript, Tailwind or CSS modules depending on setup speed.
- **AI product layer:** Vercel AI SDK for chat/completion UX, streaming, and model calls from app routes or API handlers.
- **Agent/workflow layer:** Mastra for structured AI workflows, tools, and repeatable "Fill with AI" or "Enhance by AI" flows. Verify Mastra APIs against the installed package docs before implementation.
- **Contracts:** Solidity with Foundry if we want fast local testing and scripts; Hardhat only if team familiarity is stronger.
- **Wallet/onchain:** Wagmi/Viem for typed wallet connection, contract reads, and contract writes.
- **Validation:** Zod for all user-facing forms, AI outputs, and cross-package DTOs.

Build the demo around one narrow onchain loop:

- User creates or improves structured business data with AI.
- User reviews and confirms typed fields.
- App writes a meaningful record, claim, quote, policy, invoice, asset, or settlement action on Monad.
- UI shows transaction state and the resulting onchain record.

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
