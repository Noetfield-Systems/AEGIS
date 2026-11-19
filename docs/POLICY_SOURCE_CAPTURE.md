# Policy-source byte capture — bounded engineering proof

## Purpose

Remove the artificial dependency between public-source capture (an autonomous engineering operation) and subsequent qualified policy/legal review (a separate independent-evidence requirement). This utility never promotes a policy clause to an approved control or changes the private ISC readiness score.

## Capture official DADM bytes in a controlled environment

```sh
node scripts/capture-policy-source.mjs \
  --id DIRECTIVE_ADM \
  --url 'https://www.tbs-sct.canada.ca/pol/doc-eng.aspx?id=32592' \
  --out /secure/aegis-source-archive
```

The destination holds the exact original HTML/PDF HTTP-response bytes and a JSON manifest with requested/final URL, redirect chain, content type, timestamp, byte length and SHA-256 checksum. A second run of the same source bytes reuses the same snapshot file and verifies it has not changed.

Store source snapshots in a controlled, backed-up evidence repository; commit or publish only under a reviewed data and license policy. The code rejects insecure URLs, redirects off approved government hosts, unexpected response types, excessive sizes and empty responses. Source websites may require a different approved capture method if they redirect to another genuine domain; this should not weaken the allowlist without a recorded reason.

## Honest proof levels

1. **Capture completed:** Original HTTP response bytes and SHA-256 manifest are saved and can be independently rehashed. This is not an attested effective policy version.
2. **Clause mapped:** A candidate clause and technical control are bound to a snapshot with exact source anchors; review status remains `PROPOSED`.
3. **Expert review:** A qualified identified human checks the source version, effective dates, applicability and proposed control, and records an attributable decision.
4. **External validation:** An independent verifier checks bytes, mappings and the representative test dataset. Only proven outcomes may change the ISC evidence status.

The code and CI tests shipped with this pull request establish **offline capture capability**, not an actual archived federal source or independent expert approval. The next agent run should perform the real capture and attach the resulting manifest to the existing Company OS WorkPacket.

Existing work: [AEGIS-103](https://github.com/Noetfield-Systems/AEGIS/issues/3), [AEGIS-105](https://github.com/Noetfield-Systems/AEGIS/issues/5), [audit #23](https://github.com/Noetfield-Systems/AEGIS/issues/23).
