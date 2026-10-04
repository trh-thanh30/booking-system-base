/* eslint-disable @next/next/no-img-element -- Fixed-size local SVG logo needs no raster optimization. */

export function GoogleIcon() {
  return (
    <img
      src="/icons/google.svg"
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
      className="size-5 shrink-0"
    />
  );
}
