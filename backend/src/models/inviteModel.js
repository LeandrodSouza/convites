const { getSupabase } = require('../services/supabaseService');

const createInvite = async (token) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('invites')
    .insert([
      {
        token,
        email: null,
        name: null,
        confirmed: false,
        gift_id: null,
        used: false,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating invite:', error);
    throw new Error('Error creating invite');
  }

  return data;
};

const getInvite = async (token) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .single();

  if (error) {
    // This is not a critical error if the invite simply doesn't exist.
    // The controller should handle the case where data is null.
    if (error.code !== 'PGRST116') { // 'PGRST116' is "JSON object requested, multiple (or no) rows returned"
        console.error('Error getting invite:', error);
    }
    return null;
  }

  return data;
};

const updateInvite = async (token, inviteData) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('invites')
    .update(inviteData)
    .eq('token', token)
    .select()
    .single();

  if (error) {
    console.error('Error updating invite:', error);
    throw new Error('Error updating invite');
  }

  return data;
};

const getAllInvites = async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('invites')
    .select('*');

  if (error) {
    console.error('Error getting all invites:', error);
    throw new Error('Error getting all invites');
  }

  return data;
};

module.exports = {
  createInvite,
  getInvite,
  updateInvite,
  getAllInvites,
};
