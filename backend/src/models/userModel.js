const { getSupabase } = require('../services/supabaseService');

const updateUser = async (userId, userData) => {
    const supabase = getSupabase();
    const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Error updating user:', error);
        throw new Error('Error updating user');
    }

    return data;
};

module.exports = {
    updateUser,
};
