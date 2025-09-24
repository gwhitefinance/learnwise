
'use client';

import React, { createContext, useState, useCallback, ReactNode } from 'react';

type RewardInfo = 
  | { type: 'xp'; amount: number }
  | { type: 'levelUp'; level: number; coins: number };

interface RewardContextType {
  isRewardVisible: boolean;
  rewardInfo: RewardInfo | null;
  showReward: (info: RewardInfo) => void;
  hideReward: () => void;
}

export const RewardContext = createContext<RewardContextType>({
  isRewardVisible: false,
  rewardInfo: null,
  showReward: () => {},
  hideReward: () => {},
});

export const RewardProvider = ({ children }: { children: ReactNode }) => {
  const [isRewardVisible, setIsRewardVisible] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<RewardInfo | null>(null);

  const showReward = useCallback((info: RewardInfo) => {
    setRewardInfo(info);
    setIsRewardVisible(true);
    setTimeout(() => {
        setIsRewardVisible(false);
    }, 5000); // Auto-hide after 5 seconds
  }, []);

  const hideReward = useCallback(() => {
    setIsRewardVisible(false);
  }, []);

  return (
    <RewardContext.Provider value={{ isRewardVisible, rewardInfo, showReward, hideReward }}>
      {children}
    </RewardContext.Provider>
  );
};
