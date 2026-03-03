import { HousePointAward } from '../../types';

export function computeHousePointDeltas(
  oldAwards: HousePointAward[],
  newAwards: HousePointAward[],
): Map<string, number> {
  const deltas = new Map<string, number>();

  for (const award of oldAwards) {
    deltas.set(award.student_id, (deltas.get(award.student_id) || 0) - award.points);
  }

  for (const award of newAwards) {
    deltas.set(award.student_id, (deltas.get(award.student_id) || 0) + award.points);
  }

  for (const [studentId, delta] of deltas) {
    if (delta === 0) deltas.delete(studentId);
  }

  return deltas;
}
