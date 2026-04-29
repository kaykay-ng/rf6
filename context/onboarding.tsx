import { createContext, useContext, useReducer, type ReactNode } from 'react';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';
import { saveSession } from '@/lib/session';

// ── State ─────────────────────────────────────────────────────────────────────
type State = {
  name: string;
  address: string;
  bio: string;
  vibeTags: string[];
  pin: string;
  imageUri: string;
};

const initial: State = { name: '', address: '', bio: '', vibeTags: [], pin: '', imageUri: '' };

type Action =
  | { type: 'SET_NAME';      name: string }
  | { type: 'SET_ADDRESS';   address: string }
  | { type: 'SET_BIO';       bio: string }
  | { type: 'SET_VIBE_TAGS'; vibeTags: string[] }
  | { type: 'SET_PIN';       pin: string }
  | { type: 'SET_IMAGE_URI'; imageUri: string }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_NAME':      return { ...state, name: action.name };
    case 'SET_ADDRESS':   return { ...state, address: action.address };
    case 'SET_BIO':       return { ...state, bio: action.bio };
    case 'SET_VIBE_TAGS': return { ...state, vibeTags: action.vibeTags };
    case 'SET_PIN':       return { ...state, pin: action.pin };
    case 'SET_IMAGE_URI': return { ...state, imageUri: action.imageUri };
    case 'RESET':         return initial;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
type Ctx = {
  data: State;
  setName:     (name: string) => void;
  setAddress:  (address: string) => void;
  setBio:      (bio: string) => void;
  setVibeTags: (tags: string[]) => void;
  setPin:      (pin: string) => void;
  setImageUri: (uri: string) => void;
  reset:       () => void;
  submit:      (overrideImageUri?: string) => Promise<{ campId: string } | { error: string }>;
};

const OnboardingContext = createContext<Ctx | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, initial);

  async function submit(overrideImageUri?: string): Promise<{ campId: string } | { error: string }> {
    const pinHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      data.pin,
    );
    const { data: row, error } = await supabase
      .from('camps')
      .insert({
        name:           data.name.trim(),
        address:        data.address,
        bio:            data.bio.trim(),
        vibe_tags:      data.vibeTags,
        pin_hash:       pinHash,
        flag_image_url: overrideImageUri ?? (data.imageUri || null),
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        if (error.message.includes('name'))    return { error: 'name_taken' };
        if (error.message.includes('address')) return { error: 'address_taken' };
      }
      if (error.code === '23514' && error.message.includes('address_format')) {
        return { error: 'address_invalid' };
      }
      return { error: error.message };
    }

    await saveSession({ campId: row.id, campName: data.name.trim(), address: data.address, pinHash });
    dispatch({ type: 'RESET' });
    return { campId: row.id };
  }

  return (
    <OnboardingContext.Provider value={{
      data,
      setName:     (name)      => dispatch({ type: 'SET_NAME',      name }),
      setAddress:  (address)   => dispatch({ type: 'SET_ADDRESS',   address }),
      setBio:      (bio)       => dispatch({ type: 'SET_BIO',       bio }),
      setVibeTags: (vibeTags)  => dispatch({ type: 'SET_VIBE_TAGS', vibeTags }),
      setPin:      (pin)       => dispatch({ type: 'SET_PIN',       pin }),
      setImageUri: (imageUri)  => dispatch({ type: 'SET_IMAGE_URI', imageUri }),
      reset:       ()          => dispatch({ type: 'RESET' }),
      submit,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
