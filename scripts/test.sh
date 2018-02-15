# This is hacky, but works. Suggestions on how to improve it are welcome

# For the test suite to run, a local blockchain needs to be running. Using npx
# concurrently or similar alternatives doeesn't work because the SIGTERM
# received by the blockchain after the tests finish causes the whole process to
# return a non-zero result code, which is interpreted as a failed test.

# Start the blockchain as a background process to allow the testing suite to
# connect to it
npx ganache-cli -d &>logs/blockchain.log &
blockchain_pid=$! # $! holds the pid of the last executed process

# Give it some time to start and print the initial logs (which hold addresses
# and balance)
sleep 2
cat logs/blockchain.log

# Compile, deploy and test
npx truffle migrate && npx truffle test
test_result=$?

kill $blockchain_pid

exit $test_result