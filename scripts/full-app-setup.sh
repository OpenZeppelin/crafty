#!/bin/bash

npm run deploy local
npm run copy-artifacts
cd app
npm run start
