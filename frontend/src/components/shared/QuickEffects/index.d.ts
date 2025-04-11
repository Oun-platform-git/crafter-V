import { FC } from 'react';

interface QuickEffectsProps {
  onEffectSelect: (effectId: string) => void;
  selectedEffect?: string;
  disabled?: boolean;
}

export const QuickEffects: FC<QuickEffectsProps>;
