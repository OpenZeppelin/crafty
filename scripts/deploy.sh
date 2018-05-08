#!/bin/bash

# Deploy contracts to testnet
rm -rf build
npx truffle migrate --network $1
