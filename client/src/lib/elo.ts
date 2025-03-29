/**
 * Calculate new ELO ratings after a match
 * 
 * @param winnerRating - Current ELO rating of the winner
 * @param loserRating - Current ELO rating of the loser
 * @param kFactor - K-factor determines the maximum change in rating (default: 32)
 * @returns Object containing new ratings and the score delta
 */
export function calculateElo(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): { newWinnerRating: number; newLoserRating: number; scoreDelta: number } {
  // Calculate expected scores (probability of winning)
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
  
  // Calculate rating changes
  const winnerScoreDelta = Math.round(kFactor * (1 - expectedWinner));
  
  // New ratings
  const newWinnerRating = Math.round(winnerRating + winnerScoreDelta);
  const newLoserRating = Math.round(loserRating - winnerScoreDelta);
  
  return {
    newWinnerRating,
    newLoserRating,
    scoreDelta: winnerScoreDelta
  };
}
