#!/bin/bash

# Deploy contracts
npx truffle exec deploy/deploy.js --network $1
