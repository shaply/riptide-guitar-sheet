# Riptide — print-style Beginner Mode demo

An independent LMC 3403 interface redesign by David Gu.

## Live site

Visit [Riptide Guitar Sheet](https://shaply.github.io/riptide-guitar-sheet/) to use the demo in your browser.

## Open locally
Double-click `index.html` with `app.js` and `styles.css` beside it. No install, build, server, internet connection, or account needed.

## What changed
The revised demo uses a plain white printed-sheet layout instead of the earlier dashboard. Each fretboard diagram sits above the exact character position where its chord changes. Chord labels remain above the lyric line; directional strumming and beat counts sit beneath the same phrase. The source's character spacing is preserved instead of putting phrases into separate cards.

## Load your full sheet
Click **Edit / paste sheet**, paste chord-and-lyric text from your copy, then click **Apply to sheet**. Keep each chord line directly above its lyric line. Keep the original spaces. Put section titles in square brackets on their own lines. For example:

```
[Verse]
Am            G                  C
An original line for checking alignment.
```

A chord-only line followed by a blank line is instrumental. Text without a chord line is displayed as ordinary sheet text. Tabs expand to four spaces. Diagrams are provided for Am, G, C, and Fmaj7. Other chord names retain their labels with a notice that a diagram is not included. Closely spaced chords place their guides on separate vertical lanes to avoid overlap while preserving horizontal lyric alignment. On narrow screens, swipe a line sideways rather than wrapping and losing alignment.

Edits save only in this browser when browser storage is available. The demo does not upload or transmit pasted text. Use **Restore default sheet** in the editor to return to the loaded default; it clears the saved override without confirmation.

## Change the project’s default sheet
Edit the `defaultSheet` text between the backticks near the top of `app.js`. Keep chord spacing and `[Section names]` as shown above. Reload the project after saving.

Saved browser edits take priority. Choose **Edit / paste sheet → Restore default sheet** to clear the saved override and load the default from `app.js`. Editing the sheet in the browser does not modify project files.

## Present the redesign
1. Turn Beginner Mode off to show the familiar compact chord-and-lyric sheet.
2. Turn it on to show fingering and strumming anchored to those same lyric positions.
3. Point out the capo/tuning information and the finger-number legend.
4. Press Play to demonstrate a visual strumming guide. Set the practice tempo or turn Follow sheet off for manual scrolling.
5. Click or tap a chord, diagram, lyric position, or individual strumming beat to move the highlight. Chord buttons also support Tab and Enter/Space. Pause retains the current chord and beat; **Clear highlight** pauses and removes the highlight. Play resumes from the chosen position. Text-size changes retain that position. Use Next section to jump to the next heading, or Focus to hide the surrounding toolbar and legend.
6. Use the **Customize sheet** panel on the right to adjust text size (12–20 px), choose comfortable or compact spacing, and show chord fingerings and strumming independently. On smaller screens, the panel appears above the sheet. **Customize / print** in the toolbar jumps to it.
7. Click **Print / Save PDF**, then choose a printer or **Save as PDF** in the browser’s print window. Paper size and orientation are set there. The printout uses the current customization and hides the controls. Wide imported lines shrink to fit the page while preserving chord alignment.
8. Use **Reset customization** to restore the default appearance without replacing your pasted sheet. Appearance choices last for the current page session.

Space plays/pauses when the page has focus; B toggles Beginner Mode; F toggles Focus; Esc exits Focus. Buttons and input fields retain normal keyboard behavior. Shortcuts are disabled while editing or viewing the guide.

## Peer review revision — October 26, 2026
Atharva’s [peer review](https://docs.google.com/document/d/16S31BKe47egTwnjTWF40qO62uGHLBe1ceMl4_GlnQIc/edit) recommended restoring the original print view’s sheet-customization menu and ability to save printable sheets. The redesign now includes a right-side customization panel and a clearly labeled Print / Save PDF action, while retaining the positively reviewed spacing, aligned fingerings, and Beginner Mode. The panel changes the sheet immediately, so the reading surface previews the choices before printing.

## Scope
The initial sheet includes one short lyric excerpt, instrumental example, and clearly marked placeholders. The complete song lyrics are not bundled. Paste your own copy to populate the full sheet locally.

The visual guide uses one illustrative four-beat strumming pattern per chord. It is not an exact timing map of the recording, and it does not infer timing from lyrics. There is no audio, microphone access, recording synchronization, or playing evaluation. Diagram frets are relative to the capo. Low E is on the left; the displayed finger numbers are 1=index, 2=middle, 3=ring, 4=little finger.

Reference: https://tabs.ultimate-guitar.com/tab/print?app_utm_campaign=Export2pdfDownload&flats=0&font_size=0&id=1237247&is_ukulele=0&simplified=0&transpose=0

The public repository contains the current demo and this guide. Assignment drafts and the previous demo are kept separately in the local workspace.
