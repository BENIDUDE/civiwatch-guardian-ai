// api/manage-users.js
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Initialize Supabase with the secure SERVICE_ROLE key
  const supabaseAdmin = createClient(
    process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { action, users, requestingUserRole } = req.body;

  // 3. Security Check: Ensure caller is an Admin
  const validAdminRoles = ['ngo admin', 'moderator l2', 'global admin', 'super admin', 'admin'];
  if (!validAdminRoles.includes(requestingUserRole?.toLowerCase()?.trim())) {
    return res.status(403).json({ error: 'Unauthorized: Admin clearance required.' });
  }

  const results = { successful: [], failed: [] };

  // 4. Process Bulk Add
  if (action === 'add') {
    for (const user of users) {
      try {
        // Create the user in Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password || 'CiviWatchTemp2026!',
          email_confirm: true,
          user_metadata: { display_name: user.displayName, role: user.role }
        });

        if (authError) throw authError;

        // Add them to the public user_profiles table
        const { error: profileError } = await supabaseAdmin.from('user_profiles').insert([{
          id: authData.user.id,
          email: user.email,
          display_name: user.displayName,
          role: user.role || 'operator',
          organization_id: user.organizationId // Ensure they belong to the correct NGO
        }]);

        if (profileError) throw profileError;
        results.successful.push({ email: user.email, status: 'Created' });
      } catch (err) {
        results.failed.push({ email: user.email, error: err.message });
      }
    }
  }

  // 5. Process Bulk Remove
  if (action === 'remove') {
    for (const user of users) {
      try {
        // Find the user ID by email first
        const { data: profiles, error: lookupError } = await supabaseAdmin
          .from('user_profiles')
          .select('id')
          .eq('email', user.email);

        if (lookupError || profiles.length === 0) throw new Error('User not found in database.');

        const userId = profiles[0].id;

        // Delete from Auth (which cascades to public.user_profiles if foreign keys are set)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;

        results.successful.push({ email: user.email, status: 'Deleted' });
      } catch (err) {
        results.failed.push({ email: user.email, error: err.message });
      }
    }
  }

  return res.status(200).json(results);
}