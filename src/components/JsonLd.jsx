/** Renders a JSON-LD block. Server component — no client JS shipped. */
export default function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is generated from our own typed helpers, never user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
