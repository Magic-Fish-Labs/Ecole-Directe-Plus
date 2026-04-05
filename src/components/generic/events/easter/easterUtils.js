const EGG_SALT = "magic-fishes-easter-2026-ewalwi";

export function generateEggHash(score) {
  return btoa(score.toString() + EGG_SALT);
}

export function verifyEggHash(score, hash) {
  if (score === 0 && !hash) return true;
  return generateEggHash(score) === hash;
}

export function saveSecureScore(score) {
  localStorage.setItem("easter_eggs_count", score.toString());
  localStorage.setItem("easter_eggs_hash", generateEggHash(score));
}

export function getSecureScore(options = {}) {
  const { onTamper, emitEvent = true } = options;
  const scoreStr = localStorage.getItem("easter_eggs_count") || "0";
  const hash = localStorage.getItem("easter_eggs_hash");
  const score = parseInt(scoreStr, 10);

  if (verifyEggHash(score, hash)) {
    return score;
  } else {
    if (score !== 0) {
      onTamper?.();
      if (emitEvent) {
        window.dispatchEvent(new CustomEvent("easterScoreTampered"));
      }
      saveSecureScore(0);
    }
    return 0;
  }
}
