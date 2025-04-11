import { FC } from 'react';

interface TimestampOverlayProps {
  currentTime: number;
  duration: number;
  onTimeUpdate?: (time: number) => void;
  disabled?: boolean;
}

export const TimestampOverlay: FC<TimestampOverlayProps>;
