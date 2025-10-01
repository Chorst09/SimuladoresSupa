#!/bin/bash

# Install testing dependencies for the commission tables test suite
echo "Installing testing dependencies..."

npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest \
  jest-environment-jsdom \
  @types/jest \
  ts-jest

echo "Testing dependencies installed successfully!"
echo "You can now run the tests with: npm test"