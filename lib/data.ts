// Mock data for the ORB Lotto app

export const pastDraws = [
  {
    id: "draw-0",
    amount: 500,
    drawDate: "2025-04-07T20:00:00Z",
    ticketsSold: 320,
    firstPrize: 96000,
  },
  {
    id: "draw-1",
    amount: 100,
    drawDate: "2025-04-06T20:00:00Z",
    ticketsSold: 1250,
    firstPrize: 87500,
  },
  {
    id: "draw-2",
    amount: 10,
    drawDate: "2025-04-05T20:00:00Z",
    ticketsSold: 3420,
    firstPrize: 23940,
  },
  {
    id: "draw-3",
    amount: 5,
    drawDate: "2025-04-04T20:00:00Z",
    ticketsSold: 5680,
    firstPrize: 19880,
  },
  {
    id: "draw-4",
    amount: 2,
    drawDate: "2025-04-03T20:00:00Z",
    ticketsSold: 12450,
    firstPrize: 14940,
  },
  {
    id: "draw-5",
    amount: 100,
    drawDate: "2025-04-02T20:00:00Z",
    ticketsSold: 980,
    firstPrize: 68600,
  },
  {
    id: "draw-6",
    amount: 10,
    drawDate: "2025-04-01T20:00:00Z",
    ticketsSold: 2870,
    firstPrize: 20090,
  },
]

// Mock draw details
export function getDrawDetails(drawId: string) {
  // This would normally fetch from an API or database
  const drawDetails = {
    "draw-0": {
      winningNumber: "42B 78901",
      winners: [
        {
          username: "jackpotking",
          ticketNumber: "42B 78901",
          prize: 96000,
          tier: 1,
        },
        {
          username: "luckywinner",
          ticketNumber: "33C 78901",
          prize: 9600,
          tier: 2,
        },
        {
          username: "orbuser42",
          ticketNumber: "15G 78901",
          prize: 9600,
          tier: 2,
        },
        // More tier 2 winners...
        {
          username: "alice_web3",
          ticketNumber: "22F 18901",
          prize: 1280,
          tier: 3,
        },
        {
          username: "bob_crypto",
          ticketNumber: "33D 38901",
          prize: 1280,
          tier: 3,
        },
        // More tier 3 winners...
      ],
      tickets: [
        {
          username: "jackpotking",
          ticketNumber: "42B 78901",
          isWinner: true,
          tier: 1,
        },
        {
          username: "luckywinner",
          ticketNumber: "33C 78901",
          isWinner: true,
          tier: 2,
        },
        {
          username: "orbuser42",
          ticketNumber: "15G 78901",
          isWinner: true,
          tier: 2,
        },
        {
          username: "alice_web3",
          ticketNumber: "22F 18901",
          isWinner: true,
          tier: 3,
        },
        {
          username: "bob_crypto",
          ticketNumber: "33D 38901",
          isWinner: true,
          tier: 3,
        },
        {
          username: "charlie_nft",
          ticketNumber: "44C 12345",
          isWinner: false,
        },
        // More tickets...
      ],
    },
    "draw-1": {
      winningNumber: "93A 29521",
      winners: [
        {
          username: "worlduser1",
          ticketNumber: "93A 29521",
          prize: 87500,
          tier: 1,
        },
        {
          username: "cryptofan42",
          ticketNumber: "67B 29521",
          prize: 5250,
          tier: 2,
        },
        {
          username: "orbuser42",
          ticketNumber: "15G 29521",
          prize: 5250,
          tier: 2,
        },
        // More tier 2 winners...
        {
          username: "alice_web3",
          ticketNumber: "22F 19521",
          prize: 700,
          tier: 3,
        },
        {
          username: "bob_crypto",
          ticketNumber: "33D 39521",
          prize: 700,
          tier: 3,
        },
        // More tier 3 winners...
      ],
      tickets: [
        {
          username: "worlduser1",
          ticketNumber: "93A 29521",
          isWinner: true,
          tier: 1,
        },
        {
          username: "cryptofan42",
          ticketNumber: "67B 29521",
          isWinner: true,
          tier: 2,
        },
        {
          username: "orbuser42",
          ticketNumber: "15G 29521",
          isWinner: true,
          tier: 2,
        },
        {
          username: "alice_web3",
          ticketNumber: "22F 19521",
          isWinner: true,
          tier: 3,
        },
        {
          username: "bob_crypto",
          ticketNumber: "33D 39521",
          isWinner: true,
          tier: 3,
        },
        {
          username: "charlie_nft",
          ticketNumber: "44C 12345",
          isWinner: false,
        },
        // More tickets...
      ],
    },
    // Add more draw details for other draws...
    "draw-2": {
      winningNumber: "45B 78901",
      winners: [
        {
          username: "cryptofan42",
          ticketNumber: "45B 78901",
          prize: 23940,
          tier: 1,
        },
        // More winners...
      ],
      tickets: [
        {
          username: "cryptofan42",
          ticketNumber: "45B 78901",
          isWinner: true,
          tier: 1,
        },
        // More tickets...
      ],
    },
  }

  return (
    drawDetails[drawId as keyof typeof drawDetails] || {
      winningNumber: "00A 00000",
      winners: [],
      tickets: [],
    }
  )
}

// Mock user tickets
export function getUserTickets(username: string) {
  // This would normally fetch from an API or database
  return [
    {
      ticketNumber: "15G 29521",
      purchaseDate: "2025-04-06T15:30:00Z",
      amount: 100,
      drawId: "draw-1",
    },
    {
      ticketNumber: "15G 78901",
      purchaseDate: "2025-04-07T12:15:00Z",
      amount: 500,
      drawId: "draw-0",
    },
    {
      ticketNumber: "22H 45678",
      purchaseDate: "2025-04-05T14:20:00Z",
      amount: 10,
      drawId: "draw-2",
    },
    {
      ticketNumber: "33J 56789",
      purchaseDate: "2025-04-04T16:45:00Z",
      amount: 5,
      drawId: "draw-3",
    },
    {
      ticketNumber: "44K 67890",
      purchaseDate: "2025-04-03T12:10:00Z",
      amount: 1,
      drawId: "draw-4",
    },
    {
      ticketNumber: "55L 78901",
      purchaseDate: "2025-04-02T09:30:00Z",
      amount: 100,
      drawId: "draw-5",
    },
  ]
}

// Mock user winnings
export function getUserWinnings(username: string) {
  // This would normally fetch from an API or database
  return [
    {
      ticketNumber: "15G 78901",
      drawDate: "2025-04-07T20:00:00Z",
      amount: 9600,
      tier: 2,
      drawId: "draw-0",
    },
    {
      ticketNumber: "15G 29521",
      drawDate: "2025-04-06T20:00:00Z",
      amount: 5250,
      tier: 2,
      drawId: "draw-1",
    },
    {
      ticketNumber: "33J 56789",
      drawDate: "2025-04-04T20:00:00Z",
      amount: 700,
      tier: 3,
      drawId: "draw-3",
    },
  ]
}
