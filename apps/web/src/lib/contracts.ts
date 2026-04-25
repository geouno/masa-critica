import type { Address } from "viem";
import { formatUnits, parseAbi, parseUnits } from "viem";

export const MASA_MXN_ADDRESS = "0xD34E7d8ad6316E112e6df273c6C7b5b5004B8795" as Address;
export const CONSOLIDATION_POOL_ADDRESS =
  "0xDCDCE6B9d60b22F2bF3bd5fAC7d33E60eb1eC197" as Address;

export const ADMIN_ADDRESS = "0x5f268b26427dA31CfaA6B650CFb6053347aFb98b" as Address;

export const MASA_MXN_ABI = parseAbi([
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 value) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "function transfer(address to, uint256 value) external returns (bool)",
]);

export const CONSOLIDATION_POOL_ABI = parseAbi([
  "function createDemand(string title, string description, uint256 targetAmount, uint256 deadline) external returns (uint256)",
  "function commitToDemand(uint256 demandId, uint256 amount, string productDescription, string deliveryTimeline) external",
  "function consolidateDemand(uint256 demandId) external",
  "function withdrawCommitment(uint256 demandId) external",
  "function cancelDemand(uint256 demandId) external",
  "function demandCount() external view returns (uint256)",
  "function demands(uint256) external view returns (address distributor, uint256 targetAmount, uint256 deadline, uint256 committedAmount, string title, string description, bool isActive, bool isConsolidated)",
  "function getCommitmentCount(uint256 demandId) external view returns (uint256)",
  "function getCommitment(uint256 demandId, uint256 index) external view returns (address supplier, uint256 amount, string productDescription, string deliveryTimeline)",
  "function supplierCommitted(uint256, address) external view returns (uint256)",
  "function mMXN() external view returns (address)",
]);

export const MXN_DECIMALS = 18;
const MXN_DIVISOR = 10n ** 18n;

export function parseMXN(value: number | string): bigint {
  const normalized = String(value).trim();
  if (!/^\d+(\.\d{1,18})?$/.test(normalized)) {
    throw new Error("Invalid MXN amount");
  }
  return parseUnits(normalized, MXN_DECIMALS);
}

export function formatMXN(value: bigint | undefined): string {
  if (value === undefined || value === null) return "0.00";
  const [int, frac = ""] = formatUnits(value, MXN_DECIMALS).split(".");
  const formattedInt = Number(int).toLocaleString();
  return `${formattedInt}.${frac.padEnd(2, "0").slice(0, 2)}`;
}

export function formatMXNCompact(value: bigint): string {
  const int = BigInt(value) / MXN_DIVISOR;
  if (int >= 1_000_000n) return `$${Number(int) / 1_000_000}M`;
  if (int >= 1_000n) return `$${Number(int) / 1_000}K`;
  return `$${int}`;
}
