#!/bin/bash

npm run build
npm run copy-artifacts
cd app
npm install
npm run build
