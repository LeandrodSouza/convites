const { getSupabase } = require('../services/supabaseService');

const authMiddleware = async (req, res, next) => {
    const supabase = getSupabase();
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (userError || !userData) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = userData;
        next();
    } catch (error) {
        console.error('Error in auth middleware:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = authMiddleware;
