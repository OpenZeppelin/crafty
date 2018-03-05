#!/bin/bash

# Delete any old build artifacts and compile new ones
rm -rf build
npx truffle compile

# Delete any old artifacts from the app's directory
rm -f app/contracts/*

# Copy the newly compiled artifacts to the app's directory
rsync build/contracts/* app/contracts/ --exclude=Migrations.json
