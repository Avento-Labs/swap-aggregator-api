# Swap Aggregator API

The Swap Aggregator API provides a backend solution for interacting with the Swap Aggregator smart contracts, facilitating token swaps on various Ethereum-based AMMs.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine.

### Prerequisites

- Node.js
- npm

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Avento-Labs/swap-aggregator-api.git
   ```

2. **Install Dependencies**

   ```bash
    npm install
   ```

3. **Setup Environment Variables**
   Create a `.env` file in the root directory of the project and add the following variables:
   ```bash
    PRIVATE_KEY = "Copy the Private key from the terminal after running the forked mainnet node"
    PROVIDER_URL = "http://127.0.0.1:8545/"
    AGGREGATOR_CONTRACT_ADDRESS = "Copy the contract address from the terminal after running the migration script for the aggregator contract"
   ```
4. **Run the Project**

   ```bash
    npm run start
   ```

   The project will be running on `http://localhost:3000/`

5. **Run Tests for the API**
   ```bash
    npm run test
   ```
   > This will run a testing script from the `test` directory and will test the API endpoints with arbitrary data for ETH -> token swap.

```diff
- Many values have been hardcoded in the `test` script for the sake of assignment.
+ Current flow is written for the ETH -> Token swap only. The script in the `test` directory runs for ETH/USDT pair.
```
