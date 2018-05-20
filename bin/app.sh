#!/bin/bash

npm run build
npm run copy-artifacts
cd app
npm run start
