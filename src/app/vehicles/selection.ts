export function getExistingCustomerId(
  customerIds: number[],
  requestedId: number | undefined,
): number | undefined {
  return requestedId !== undefined && customerIds.includes(requestedId)
    ? requestedId
    : undefined;
}
