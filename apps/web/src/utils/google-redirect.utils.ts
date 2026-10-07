export function createGoogleRedirect(navigate: (url: string) => void) {
  let pending = false;
  return {
    start(url: string) {
      if (pending) return false;
      pending = true;
      try {
        navigate(url);
      } catch (error) {
        pending = false;
        throw error;
      }
      return true;
    },
    reset() {
      pending = false;
    },
  };
}
