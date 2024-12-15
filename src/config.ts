const HEART_BEAT_SECRET = String(Deno.env.get("HEART_BEAT_SECRET"));

export default {
  HEART_BEAT_SECRET,
};
