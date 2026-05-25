/** Müşteri ekranlarında görünen sipariş no: şube başına 33–133, sonra başa döner */
export const DISPLAY_NUMBER_MIN = 33;
export const DISPLAY_NUMBER_MAX = 133;

export function nextBranchDisplayNumber(last: number | null | undefined): number {
  if (last == null || last < DISPLAY_NUMBER_MIN || last >= DISPLAY_NUMBER_MAX) {
    return DISPLAY_NUMBER_MIN;
  }
  return last + 1;
}
