const { getSupabase } = require('../services/supabaseService');

const createGift = async (giftData) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('gifts')
    .insert([
      {
        name: giftData.name,
        link: giftData.link || '',
        image_path: giftData.imagePath || '',
        taken: false,
        taken_by: null,
        taken_at: null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating gift:', error);
    throw new Error('Error creating gift');
  }

  return data;
};

const getGift = async (giftId) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', giftId)
    .single();

  if (error) {
    console.error('Error getting gift:', error);
    throw new Error('Error getting gift');
  }

  return data;
};

const getAllGifts = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error getting all gifts:', error);
    throw new Error('Error getting all gifts');
  }

  return data;
};

const updateGift = async (giftId, giftData) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('gifts')
    .update(giftData)
    .eq('id', giftId)
    .select()
    .single();

  if (error) {
    console.error('Error updating gift:', error);
    throw new Error('Error updating gift');
  }

  return data;
};

const takeGift = async (giftId, email) => {
  const supabase = getSupabase();

  // Note: This is not a true transaction and could lead to race conditions.
  // For a more robust solution, a database function (RPC) should be used.
  const { data: gift, error: getError } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', giftId)
    .single();

  if (getError || !gift) {
    throw new Error('Gift not found');
  }

  if (gift.taken) {
    throw new Error('Gift already taken');
  }

  const { data, error: updateError } = await supabase
    .from('gifts')
    .update({
      taken: true,
      taken_by: email,
      taken_at: new Date(),
    })
    .eq('id', giftId)
    .select()
    .single();

  if (updateError) {
    throw new Error('Error taking gift');
  }

  return data;
};

const unselectGift = async (giftId) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('gifts')
        .update({
            taken: false,
            taken_by: null,
            taken_at: null,
        })
        .eq('id', giftId)
        .select()
        .single();

    if (error) {
        console.error('Error unselecting gift:', error);
        throw new Error('Error unselecting gift');
    }

    return data;
};

module.exports = {
  createGift,
  getGift,
  getAllGifts,
  updateGift,
  takeGift,
  unselectGift,
};
