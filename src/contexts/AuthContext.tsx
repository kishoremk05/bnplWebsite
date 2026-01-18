import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, UserExtended, CustomerProfile, MerchantProfile } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userExtended: UserExtended | null;
  customerProfile: CustomerProfile | null;
  merchantProfile: MerchantProfile | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole, businessName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userExtended, setUserExtended] = useState<UserExtended | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [merchantProfile, setMerchantProfile] = useState<MerchantProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch extended user data
      const { data: extendedData, error: extendedError } = await supabase
        .from('users_extended')
        .select('*')
        .eq('id', userId)
        .single();

      if (extendedError) throw extendedError;
      
      setUserExtended(extendedData);
      setRole(extendedData.role);

      // Fetch role-specific profile
      if (extendedData.role === 'customer') {
        const { data: customerData, error: customerError } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!customerError) {
          setCustomerProfile(customerData);
        }
      } else if (extendedData.role === 'merchant') {
        const { data: merchantData, error: merchantError } = await supabase
          .from('merchant_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!merchantError) {
          setMerchantProfile(merchantData);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserExtended(null);
        setCustomerProfile(null);
        setMerchantProfile(null);
        setRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    userRole: UserRole,
    businessName?: string
  ) => {
    // Sign up the user with metadata
    // The database trigger will automatically create the profile
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: userRole,
          business_name: businessName,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // If email confirmation is disabled, update the profile with correct role
    // The trigger creates a default customer profile, so we need to update if merchant
    if (authData.session && userRole === 'merchant') {
      // Update the role
      const { error: roleError } = await supabase
        .from('users_extended')
        .update({ role: 'merchant', full_name: fullName })
        .eq('id', authData.user.id);

      if (roleError) console.error('Error updating role:', roleError);

      // Delete the auto-created customer profile
      await supabase
        .from('customer_profiles')
        .delete()
        .eq('user_id', authData.user.id);

      // Create merchant profile
      const { error: merchantError } = await supabase
        .from('merchant_profiles')
        .insert({
          user_id: authData.user.id,
          business_name: businessName || '',
        });

      if (merchantError) console.error('Error creating merchant profile:', merchantError);
    } else if (authData.session && userRole === 'customer') {
      // Just update the name for customers
      await supabase
        .from('users_extended')
        .update({ full_name: fullName })
        .eq('id', authData.user.id);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    userExtended,
    customerProfile,
    merchantProfile,
    role,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
