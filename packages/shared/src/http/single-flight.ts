export function createSingleFlight<T>(operation: () => Promise<T>) {
  let inFlight: Promise<T> | undefined;

  return (): Promise<T> => {
    inFlight ??= Promise.resolve()
      .then(operation)
      .finally(() => {
        inFlight = undefined;
      });

    return inFlight;
  };
}
