# Nebula System - Comprehensive Test Plan & Review
**Module Focus**: Text-to-Image, Text-to-Video, Text-to-Audio
**Date**: 2026-02-04
**Objective**: ensure full system stability, error handling, and asset persistence.

---

## 1. Text-to-Image Module

### Test Cases

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| **IMG-01** | **Navigation & Loading** | 1. Navigate to `/app/create/text-to-image`<br>2. Observe page load. | Page loads without errors. "Prompt" bar is visible. Sidebar is present. | |
| **IMG-02** | **Dashboard Redirection** | 1. Go to Dashboard (`/app/dashboard`).<br>2. Enter "A futuristic city" in the main input.<br>3. Select "Image" mode (if applicable) or click "Generate". | User is redirected to `/app/create/text-to-image`. Prompt field is pre-filled with "A futuristic city". | |
| **IMG-03** | **Generation Success** | 1. Enter prompt "Red sports car on mars".<br>2. Click `Generate`. | 1. Loading spinner appears.<br>2. After 5-10s, image appears in the main view.<br>3. "Credits" are deducted (visual check). | |
| **IMG-04** | **Aspect Ratio Selection** | 1. Select `16:9` ratio.<br>2. Generate image. | Generated image has landscape dimensions. Metadata shows correct ratio. | |
| **IMG-05** | **Asset Persistence** | 1. Navigate to `Asset Library`.<br>2. Filter by "Image". | The newly generated "Red sports car" image is visible. Thumbnail loads correctly (from local `/uploads` path, not external URL). | |
| **IMG-06** | **Error Handling** | 1. Disconnect network or mock 500 Image Error.<br>2. Click Generate. | Toast notification displays "Generation failed". App does **not** crash/white screen. Loading state resets. | |

### Code Review Notes (Internal)
*   **Controller**: `ai.controller.ts` -> `generateImage`.
*   **Safety**: Uses `downloadAndSaveFile` with `try/catch`. If download fails, it correctly falls back to the original URL.
*   **Stability**: Prompt sanitization is in place.

---

## 2. Text-to-Video Module

### Test Cases

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| **VID-01** | **Navigation & Init** | 1. Navigate to `/app/create/text-to-video`. | Page loads. Video player placeholder is visible. Controls are centered. | |
| **VID-02** | **Validation** | 1. Leave prompt empty.<br>2. Click `Generate Video`. | Button should be disabled or show "Please enter a prompt" toast. No API call made. | |
| **VID-03** | **Generation Cycle** | 1. Enter prompt "Panda eating bamboo".<br>2. Click `Generate`. | 1. UI switches to "Processing" state (progress bar or spinner).<br>2. User is **not** blocked from navigating away.<br>3. Notification appears upon completion. | |
| **VID-04** | **Result Playback** | 1. Wait for generation success.<br>2. Click Play on the result. | Video plays smoothly. Poster image is displayed before play. | |
| **VID-05** | **Library Sync** | 1. Go to `Asset Library`.<br>2. Find the new video. | Video card exists. Thumbnail is visible (not black). Clicking it opens preview. | |
| **VID-06** | **Settings** | 1. Change duration to 4s (Runway).<br>2. Generate. | Request payload includes `duration: 4`. | |

### Code Review Notes (Internal)
*   **Controller**: `ai.controller.ts` -> `generateVideo`.
*   **Stability**: Heavy processing is offloaded to background jobs. Polling mechanism (`checkStatus`) handles timeouts gracefully.
*   **Asset Logic**: Video files are large. `downloadAndSaveFile` ensures we don't rely on signed URLs that expire after 24h.

---

## 3. Text-to-Audio (Voice) Module

### Test Cases

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| **AUD-01** | **Voice Selection** | 1. Navigate to `/app/create/text-to-audio`.<br>2. Click Voice Dropdown. | List of voices appears. No "undefined" labels (fixed previous `desc` bug). | |
| **AUD-02** | **Generation** | 1. Select a voice.<br>2. Enter text "Hello Nebula users".<br>3. Click `Generate`. | Audio player appears. Waveform (if applicable) or progress bar shows activity. | |
| **AUD-03** | **Playback** | 1. Click Play on generated audio. | Audio plays clearly. | |
| **AUD-04** | **Empty State** | 1. Clear text.<br>2. Try to generate. | Error toast: "Text is required". | |

### Code Review Notes (Internal)
*   **Page**: `TextToAudioPage.tsx`.
*   **Fix Verification**: The issue with accessing `voice.desc` (which didn't exist) was resolved. Dropdown now renders safely.

---

## 4. Asset Library & General Stability

### Test Cases

| ID | Test Case | Steps | Expected Result | Pass/Fail |
|----|-----------|-------|-----------------|-----------|
| **LIB-01** | **Broken Asset Fallback** | 1. View Library.<br>2. Identify an old expired asset. | It displays the "Media Archived" premium card, not a broken image icon. | |
| **LIB-02** | **New Asset Display** | 1. Generate new image/video.<br>2. Refresh Library. | New asset appears with correct thumbnail. | |
| **LIB-03** | **Search** | 1. Type "Panda" in Library search. | List filters to show only prompts containing "Panda". | |

