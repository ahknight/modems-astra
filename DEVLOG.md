# Development journal

## 2026-11-20 · Project opened
The designated workspace was empty and had no Git remote. Chose a buildless, relative-URL static publication suitable for GitHub Pages, with local media and Web Audio. Separate the historical essay from per-generation listening instruments so technical bounds and evidence stay beside each example.

The sandbox denied creation of the workspace .git directory. Maintain checkpoints in a temporary Git repository and export the history as a portable bundle. The GitHub CLI could not reach api.github.com. A destination repository has been requested.

## 2026-11-20 · Cover and publication checkpoint
Built a responsive listening instrument and eight-stop chapter index. Generated a short educational montage locally. Its waterfall uses windowed frequency measurements from the exact PCM array played by Web Audio. Held tones and normalized levels make this an explanatory comparison, with the time and phase approximations disclosed in Field notes. The Pages workflow copies only public site assets.

## 2026-11-20 · Sources and signal reconstruction
Added the eight chapter essays and wired-network epilogue, reading Bell System Practices alongside CCITT and ITU-T recommendations. V.32 clauses distinguish mandatory and optional rates; the October 1996 V.34 revision supplies the two optional top rates. Oral histories supplement contemporary construction articles and product documentation. The Pennywhistle account flags an issue-date discrepancy. Both local JPEGs match the checksums documented in assets/CREDITS.md.

Reconstructed individual protocol signals separately from editorial pacing. Sources and approximations live in the signal notes of each player. The waveform reads the PCM buffer played by the audio device. The chapter synth checks covered 24 non-silent clips, sample bounds and lengths, the V.32bis answer-scrambler test vector, V.34 L2/L1 amplitude ratio and silence throughout the V.90 connected-monitor stage. Full modems, loop distortion, hardware measurements and interoperable end-to-end negotiations are outside the implementation.

## 2026-11-20 · Static publication and final verification
Moved the editorial text, chapter navigation, citations and photograph credits into index.html so reading works with JavaScript disabled. The public page and its two photographs total under 0.5 MB before HTTP compression. Added an explicit teaching-montage label on the cover and placed each player's method beside its controls. Source-derived V.34 probe phase signs now apply on the cover too. With reduced motion enabled, the cover's selected slice and chapter waveforms hold still within each stage.

A real Playwright-controlled Chrome 155 browser loaded the workspace files through intercepted same-origin requests. A local HTTP listener was denied by the sandbox. Tested keyboard play across all eight players, pause, jump to the final stage, restart, opening-waveform and grid toggles, disclosure controls, mutual exclusion with the cover, and reduced-motion playback. The final 56K chapter reached the 30-second CONNECT stage of its 40-second study. Both local photos decoded at the expected widths. All local navigation targets resolved, with no page exceptions in the final interaction run. Checked the desktop cover visually and tested widths of 375 and 320 pixels for horizontal overflow. Local Firefox and WebKit test processes aborted at startup. Safari and Firefox rendering and physical speaker output remain unverified. Browser UI, protocol-derived sample checks, and testing a modem against real telephone hardware are distinct forms of evidence.

There is no destination remote in this workspace. The Pages workflow has been prepared, but a push, GitHub Actions deployment, and public URL have not been verified. The portable Git bundle contains the checkpoint history because the workspace .git path is write-protected.

## 2026-11-20 · Destination confirmed
The owner supplied ahknight/modems-astra. Verified the public repository was empty through the connected GitHub API. Shell Git could not resolve github.com, and the sandbox policy rejected requesting network escalation for git push. Switched to the GitHub connector to transport Git objects and reproduce the checkpoint sequence in the destination. Verified the static chapter index and all eight essays and epilogue remain present when script requests are blocked. A further Chrome test confirmed that starting the cover stops a chapter and starting a chapter stops the cover.

Verified the remote main update at 1d5c950e47e929d3eda9a272a5b57be036626b8d. The remote content trees for the editorial and final site checkpoints match their local Git tree IDs. The Pages URL returned HTTP 404 on the first post-push check. The connector has no Pages settings operation, and the browser session has no access to the settings page.

## 2026-11-20 · Live Pages deployment verified
The public endpoint subsequently returned HTTP 200 at https://ahknight.github.io/modems-astra/. Chrome loaded “Line Signal — The modem handshake”, found all eight custom players on the deployed page and started the Bell 103 example through its on-screen Play control. The GitHub public Actions API listed successful completed runs. This live check supersedes the earlier pending and 404 observations.
