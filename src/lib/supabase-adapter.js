/**
 * Supabase adapter — wraps the Supabase client with the same
 * interface as memory-db.js so getDb() returns a uniform API.
 */

export function createSupabaseAdapter(supabase) {
  return {
    // Creators
    // Creators
    async findCreatorByWallet(wallet) {
      const { data } = await supabase
        .from('creators')
        .select('*')
        .eq('wallet_address', wallet)
        .maybeSingle();
      return data;
    },

    async findCreatorByEmail(email) {
      const { data } = await supabase
        .from('creators')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      return data;
    },

    async createCreator(wallet, username, email) {
      const { data, error } = await supabase
        .from('creators')
        .insert({ wallet_address: wallet, username, email })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getCreator(id) {
      const { data } = await supabase
        .from('creators')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return data;
    },

    // Registry
    async register(entry) {
      const { data, error } = await supabase
        .from('registry')
        .insert(entry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async findByUrl(url) {
      const { data } = await supabase
        .from('registry')
        .select('*')
        .eq('canonical_url', url)
        .maybeSingle();
      return data;
    },

    async getRegistryByCreator(creatorId) {
      const { data } = await supabase
        .from('registry')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });
      return data || [];
    },

    async getRegistryById(id) {
      const { data } = await supabase
        .from('registry')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      return data;
    },

    // Payments
    async recordPayment(p) {
      const { data, error } = await supabase
        .from('payments')
        .insert(p)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getPaymentsByRegistryId(registryId) {
      const { data } = await supabase
        .from('payments')
        .select('*')
        .eq('registry_id', registryId);
      return data || [];
    },

    async getRegistryFeed(limit, offset) {
      const { data } = await supabase
        .from('registry')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      return data || [];
    },

    async getRegistryCount() {
      const { count } = await supabase
        .from('registry')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  };
}
