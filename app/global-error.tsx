"use client"; // Error boundaries must be Client Components
/* eslint-disable @typescript-eslint/no-unused-vars */

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <h2>Something went wrong Gobally!</h2>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
