import Image from "next/image";

export function GoogleIcon() {
  return (
    <Image
      src="/icons/google.svg"
      alt=""
      aria-hidden="true"
      width={20}
      height={20}
      className="size-5 shrink-0"
    />
  );
}
