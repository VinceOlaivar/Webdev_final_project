import { createClient } from '@supabase/supabase-js'

// It's best practice to store these in a .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key are required. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const LOWER_IS_BETTER_GAMES = ['reaction', 'memory', 'minesweeper'];

/**
 * Shared utility to save a game score to Supabase
 * It only updates the record if the new score is higher than the existing one.
 */
export const saveScore = async (gameSlug: string, finalScore: number) => {
  console.log(`[saveScore] Initiated for ${gameSlug}. Current attempt: ${finalScore}`);
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error("[saveScore] Error: No user logged in. Scores can only be saved for registered users.");
    return;
  }

  const lowerIsBetter = LOWER_IS_BETTER_GAMES.includes(gameSlug);

  // 1. Fetch the best existing score for this user/game (sorted by "best" first)
  const { data: records, error: fetchError } = await supabase
    .from('scores')
    .select('id, score')
    .eq('user_id', user.id)
    .eq('game_slug', gameSlug)
    .order('score', { ascending: lowerIsBetter });

  const existingRecord = records && records.length > 0 ? records[0] : null;

  if (fetchError) {
    console.error("[saveScore] Database error checking existing score:", fetchError.message);
    return;
  }

  if (existingRecord) {
    const isBetter = lowerIsBetter 
      ? finalScore < existingRecord.score 
      : finalScore > existingRecord.score;

    if (isBetter) {
      console.log(`[saveScore] 🏆 New Personal Best! Updating ${existingRecord.score} -> ${finalScore} (Lower is better: ${lowerIsBetter})`);
      const { error: updateError } = await supabase
        .from('scores')
        .update({ score: finalScore })
        .eq('id', existingRecord.id);
      
      if (updateError) console.error("[saveScore] Update failed:", updateError.message);
      else console.log("[saveScore] Successfully updated high score in database.");
    } else {
      console.log(`[saveScore] ℹ️ Score of ${finalScore} did not beat your best of ${existingRecord.score}. No update sent.`);
    }
  } else {
    console.log(`[saveScore] No existing score found for ${gameSlug}. Creating first record...`);
    const { error: insertError } = await supabase
      .from('scores')
      .insert([{ game_slug: gameSlug, score: finalScore, user_id: user.id }]);
    
    if (insertError) console.error("[saveScore] Database error saving initial score:", insertError.message);
    else console.log("[saveScore] Successfully saved initial score to database.");
  }
};