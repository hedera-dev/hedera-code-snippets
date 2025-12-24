#!/usr/bin/env bash
set -euo pipefail

# generate_hedera_sc_metadata.sh
#
# A universal script to generate inline metadata.json bundles for HashScan/Sourcify verification.
# Supports both Hardhat and Foundry projects automatically.
#
# USAGE: 
#   ./generate_hedera_sc_metadata.sh [ContractName] [ContractName=0xAddress] ...
#
# EXAMPLES:
#   ./generate_hedera_sc_metadata.sh MyToken
#   ./generate_hedera_sc_metadata.sh MyToken=0x1234567890abcdef...
#   ./generate_hedera_sc_metadata.sh src/MyContract.sol:MyContract=0x9876...

OUT_BASE="verify-bundles"
MANIFEST="$OUT_BASE/MANIFEST.txt"

die() { echo "ERROR: $*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "Missing dependency: $1"; }
need jq

# Detect Framework
IS_HARDHAT=false
IS_FOUNDRY=false

if [ -f "hardhat.config.js" ] || [ -f "hardhat.config.ts" ]; then
  IS_HARDHAT=true
elif [ -f "foundry.toml" ]; then
  IS_FOUNDRY=true
else
  die "Could not detect 'hardhat.config.js', 'hardhat.config.ts', or 'foundry.toml'. Please run from project root."
fi

to_upper() { echo "$1" | tr '[:lower:]' '[:upper:]'; }

# --- RESOLVER UTILS ---

resolve_local_source() {
  local key="$1"
  local cand

  # 1. Check node_modules via standard npm style
  if [[ "$key" == npm/* ]]; then
    local rest="${key#npm/}"
    if [[ "$rest" == @* ]]; then
      local scope="$(cut -d/ -f1 <<<"$rest")"
      local pkg_ver="$(cut -d/ -f2 <<<"$rest")"
      local path="$(cut -d/ -f3- <<<"$rest")"
      local pkg="${pkg_ver%@*}"
      cand="node_modules/$scope/$pkg/$path"
    else
      local pkg_ver="$(cut -d/ -f1 <<<"$rest")"
      local path="$(cut -d/ -f2- <<<"$rest")"
      local pkg="${pkg_ver%@*}"
      cand="node_modules/$pkg/$path"
    fi
    [ -f "$cand" ] && { echo "$cand"; return 0; }
  fi

  # 2. Check direct path
  if [ -f "$key" ]; then echo "$key"; return 0; fi

  # 3. Check standard roots
  for root in contracts src lib node_modules; do
    cand="$root/$key"
    [ -f "$cand" ] && { echo "$cand"; return 0; }
  done

  # 4. Strip prefixes
  if [[ "$key" == */contracts/* ]]; then
    cand="contracts/${key#*/contracts/}"
    [ -f "$cand" ] && { echo "$cand"; return 0; }
  fi
  if [[ "$key" == */src/* ]]; then
    cand="src/${key#*/src/}"
    [ -f "$cand" ] && { echo "$cand"; return 0; }
  fi

  # 5. Foundry Remappings Support
  if [ "$IS_FOUNDRY" = true ]; then
    if [ -z "${__REMAPPINGS:-}" ]; then
      __REMAPPINGS=$(forge remappings 2>/dev/null || true)
    fi
    if [ -n "$__REMAPPINGS" ]; then
      while IFS= read -r line; do
        local from="${line%%=*}"
        local to="${line#*=}"
        if [[ "$key" == "$from"* ]]; then
           local remainder="${key#$from}"
           cand="$to$remainder"
           [ -f "$cand" ] && { echo "$cand"; return 0; }
        fi
      done <<< "$__REMAPPINGS"
    fi
  fi

  # 6. Recursive fallback
  local basename
  basename=$(basename "$key")
  cand=$(find . -type f -name "$basename" -not -path "*/node_modules/*" -not -path "*/artifacts/*" -not -path "*/out/*" | head -n 1)
  if [ -n "$cand" ] && [ -f "$cand" ]; then echo "$cand"; return 0; fi

  return 1
}

# --- HARDHAT STRATEGY ---

get_metadata_hardhat() {
  local name="$1"
  local ARTIFACTS_DIR="artifacts"
  local BUILD_INFO_DIR="artifacts/build-info"

  if [ ! -d "$ARTIFACTS_DIR" ]; then
    die "Hardhat artifacts not found. Run: npx hardhat compile"
  fi

  # Strategy 1: .dbg.json
  local dbg_file
  dbg_file="$(find "$ARTIFACTS_DIR" -type f -name "${name}.dbg.json" -print -quit)"

  if [ -n "$dbg_file" ]; then
    local bi_hash
    bi_hash="$(jq -r '.buildInfo.id // empty' "$dbg_file" 2>/dev/null || true)"
    if [ -n "$bi_hash" ]; then
      local candidate="$BUILD_INFO_DIR/${bi_hash}.json"
      if [ -f "$candidate" ]; then
        jq -r --arg n "$name" '
          [ (.output.contracts // .contracts) | to_entries[] | .value[$n].metadata // empty ] | first
        ' "$candidate"
        return 0
      fi
    fi
  fi

  # Strategy 2: Scan build-info directly
  local candidates
  candidates="$(grep -l "\"$name\"" "$BUILD_INFO_DIR"/*.json 2>/dev/null || true)"
  for f in $candidates; do
    if jq -e --arg n "$name" '
      (.output.contracts // .contracts) | to_entries | any(.value | has($n))
    ' "$f" >/dev/null 2>&1; then
       jq -r --arg n "$name" '
          [ (.output.contracts // .contracts) | to_entries[] | .value[$n].metadata // empty ] | first
        ' "$f"
       return 0
    fi
  done

  return 1
}

# --- FOUNDRY STRATEGY ---

get_metadata_foundry() {
  local name="$1"
  
  need forge

  if echo "Testing" | forge inspect "$name" metadata >/dev/null 2>&1; then
     forge inspect "$name" metadata
     return 0
  fi

  # Strategy 2: Look in `out/` directory for artifacts
  local candidate
  candidate="$(find out -name "${name}.json" -print -quit)"
  
  if [ -n "$candidate" ] && [ -f "$candidate" ]; then
    local meta
    meta="$(jq -r '.metadata // empty' "$candidate")"
    if [ -n "$meta" ] && [ "$meta" != "null" ]; then
       echo "$meta"
       return 0
    fi
  fi

  return 1
}

# --- MAIN EXECUTION ---

mkdir -p "$OUT_BASE"

# Always overwrite MANIFEST start
echo "HashScan Verify Upload Guide" > "$MANIFEST"
echo "============================" >> "$MANIFEST"
echo "Detected System: $(if $IS_HARDHAT; then echo "Hardhat"; else echo "Foundry"; fi)" >> "$MANIFEST"
echo "" >> "$MANIFEST"

echo "== Generating Metadata Bundles ($(if $IS_HARDHAT; then echo "Hardhat"; else echo "Foundry"; fi)) =="

if [ $# -eq 0 ]; then
  echo "Usage: $0 [ContractName] [ContractName=0xAddress] ..."
  exit 1
fi

for CONTRACT_ARG in "$@"; do
  # Parse Argument: Check for "Contract=0xAddress" syntax
  if [[ "$CONTRACT_ARG" == *"="* ]]; then
     CONTRACT_INPUT="${CONTRACT_ARG%%=*}"
     EXPLICIT_ADDR="${CONTRACT_ARG#*=}"
  else
     CONTRACT_INPUT="$CONTRACT_ARG"
     EXPLICIT_ADDR=""
  fi

  # Clean contract name for directory usage (remove colons for Foundry FQCN)
  CONTRACT_SAFE_NAME=$(basename "${CONTRACT_INPUT%%:*}" .sol) 
  if [[ "$CONTRACT_INPUT" == *:* ]]; then
    CONTRACT_SAFE_NAME="${CONTRACT_INPUT##*:}"
  fi

  echo ""
  echo "Processing: $CONTRACT_INPUT"

  META_JSON=""
  
  if [ "$IS_HARDHAT" = true ]; then
    META_JSON="$(get_metadata_hardhat "$CONTRACT_INPUT")"
  elif [ "$IS_FOUNDRY" = true ]; then
    META_JSON="$(get_metadata_foundry "$CONTRACT_INPUT")"
  fi

  if [ -z "$META_JSON" ] || [ "$META_JSON" = "null" ]; then
    echo "  ! FAIL: Metadata not found for '$CONTRACT_INPUT'."
    echo "    Ensure the contract is compiled."
    if [ "$IS_HARDHAT" = true ]; then
      echo "    Try: npx hardhat clean && npx hardhat compile"
    else
      echo "    Try: forge build"
    fi
    continue
  fi

  CONTRACT_DIR="$OUT_BASE/$CONTRACT_SAFE_NAME"
  mkdir -p "$CONTRACT_DIR"
  OUT_FILE="$CONTRACT_DIR/metadata.json"
  
  echo "$META_JSON" | jq . > "$OUT_FILE"
  
  echo "  • Inlining source code..."
  SOURCE_KEYS="$(jq -r '.sources | keys[]' "$OUT_FILE")"
  MISSING_COUNT=0

  while IFS= read -r key; do
    [ -z "$key" ] && continue
    
    if [ "$(jq -r --arg k "$key" '(.sources[$k].content != null)' "$OUT_FILE")" = "true" ]; then
        tmp=$(mktemp)
        jq --arg k "$key" '(.sources[$k] |= del(.urls))' "$OUT_FILE" > "$tmp" && mv "$tmp" "$OUT_FILE"
        continue
    fi

    if local_path="$(resolve_local_source "$key")"; then
      tmp=$(mktemp)
      jq --arg k "$key" --rawfile c "$local_path" '(.sources[$k].content = $c) | (.sources[$k] |= del(.urls))' "$OUT_FILE" > "$tmp" && mv "$tmp" "$OUT_FILE"
    else
      echo "    ! WARNING: Local source not found: $key"
      MISSING_COUNT=$((MISSING_COUNT + 1))
    fi
  done <<< "$SOURCE_KEYS"

  STATUS="OK"
  [ "$MISSING_COUNT" -gt 0 ] && STATUS="WARNINGS ($MISSING_COUNT missing sources)"
  echo "  -> $STATUS"

  # Determine Address: Explicit Arg > Env Var > Placeholder
  if [ -n "$EXPLICIT_ADDR" ]; then
      ADDRESS_VAL="$EXPLICIT_ADDR"
  else
      ENV_VAR_NAME="$(to_upper "${CONTRACT_SAFE_NAME}")_ADDRESS"
      ADDRESS_VAL="${!ENV_VAR_NAME:-}"
      [ -z "$ADDRESS_VAL" ] && ADDRESS_VAL="<set env $ENV_VAR_NAME>"
  fi

  {
    echo "- $CONTRACT_SAFE_NAME"
    echo "  File: $OUT_FILE"
    echo "  Address: $ADDRESS_VAL"
    
    CTOR_ARGS=$(jq -r 'try (.output.abi[] | select(.type == "constructor").inputs) catch []' "$OUT_FILE")
    if [ -n "$CTOR_ARGS" ] && [ "$CTOR_ARGS" != "[]" ] && [ "$CTOR_ARGS" != "null" ]; then
        echo "  Constructor args required:"
        echo "$CTOR_ARGS" | jq -r '.[] | "    \(.name) (\(.type))"' 
    fi
    echo ""
  } >> "$MANIFEST"
done

echo ""
echo "Done. Open $MANIFEST"