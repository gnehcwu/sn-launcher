export interface Debounced<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
}

export default function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  wait: number
): Debounced<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: TArgs | null = null;

  const debounced = ((...args: TArgs) => {
    pendingArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (pendingArgs) {
        const a = pendingArgs;
        pendingArgs = null;
        fn(...a);
      }
    }, wait);
  }) as Debounced<TArgs>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingArgs = null;
  };

  debounced.flush = () => {
    if (timer && pendingArgs) {
      clearTimeout(timer);
      timer = null;
      const a = pendingArgs;
      pendingArgs = null;
      fn(...a);
    }
  };

  return debounced;
}
