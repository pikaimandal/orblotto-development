# ORB Lotto - Worldcoin Mini App

ORB Lotto is a lottery mini app for the Worldcoin WorldApp platform. It allows users to purchase lottery tickets of different values and participate in daily draws.

## Features

- Five lottery tiers: Basic ($2), Plus ($5), Super ($10), Mega ($100), and Jackpot ($500)
- Integrated with Worldcoin WorldApp via MiniKit
- Support for payments in both WLD and USDC currencies
- Daily draws with transparent prize distribution
- Dark mode UI optimized for WorldApp

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Worldcoin app ID:
   ```
   NEXT_PUBLIC_WORLDCOIN_APP_ID=your_app_id_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## WorldApp Integration

This app uses the Worldcoin MiniKit for integration with WorldApp. The app will display a status indicator showing whether it's properly connected to WorldApp.

When testing outside of WorldApp:
- The app will show a warning that it's not running in WorldApp
- A fallback wallet connection is provided for testing
- Simulated payment flows are used for development

## Payment Integration

This app integrates with WorldApp's payment system using the MiniKit pay command. The payment flow works as follows:

1. User selects ticket type and quantity on the Buy page
2. User chooses preferred currency (WLD or USDC)
3. Backend initiates payment via `api/initiate-payment` endpoint, generating a unique payment ID
4. Frontend triggers MiniKit.commandsAsync.pay with appropriate parameters:
   ```typescript
   const payParams = {
     recipient: recipientAddress,
     amount: totalAmount.toString(),
     currency: selectedCurrency,
     requestId: paymentId
   };
   const result = await MiniKit.commandsAsync.pay(payParams as any);
   ```
5. WorldApp displays payment confirmation modal to user
6. After payment completion, the backend verifies the payment via `api/verify-payment` endpoint
7. On successful verification, tickets are generated for the user

### Whitelisted Recipient Address
The payment recipient address is: `0xe0C663edaC17EF5dB4DfB5de063A014f856D0042`

## Ticket Types

- ORB Lotto Basic - $2
- ORB Lotto Plus - $5
- ORB Lotto Super - $10
- ORB Lotto Mega - $100
- ORB Lotto Jackpot - $500

## Prize Distribution

- 60% of ticket sales go to the prize pool
- 10% goes to foundation contribution
- 30% for operational costs

## API Endpoints

### 1. Initiate Payment (/api/initiate-payment)
- **Method**: POST
- **Purpose**: Start a payment transaction
- **Parameters**:
  - `ticketCount`: Number of tickets to purchase
  - `amount`: Price per ticket in USD
  - `currency`: Either 'WLD' or 'USDC'
- **Response**: Payment ID and details needed for MiniKit.pay command

### 2. Verify Payment (/api/verify-payment)
- **Method**: POST
- **Purpose**: Verify a completed payment and generate tickets
- **Parameters**:
  - `paymentId`: The unique payment ID
  - `transactionId`: The blockchain transaction ID
- **Response**: Verification status and generated ticket details

## Production Considerations

For a production environment, the following enhancements are recommended:

1. Implement a database to store payment records and tickets
2. Add on-chain transaction verification to validate payments
3. Set up a secure backend API with proper authentication
4. Implement comprehensive error handling and retry mechanisms
5. Add webhook support for payment notifications
6. Set up monitoring for payment processes

## Building for Production

```bash
npm run build
```

## Deploying to WorldApp

Follow the [Worldcoin Mini App documentation](https://docs.world.org/mini-apps/) for instructions on how to deploy your app to WorldApp. 