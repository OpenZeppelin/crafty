#!/bin/bash

# Delete any old artifacts from the app's directory
rm -f app/src/artifacts/*

# Copy the newly compiled artifacts to the app's directory
cp -r build/contracts/* app/src/artifacts
