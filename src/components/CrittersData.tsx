'use client'

import { useEffect, useState } from 'react';
import CrittersTable from '@/components/CrittersTable';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import Error from '@/components/Error';
import { Critter } from '@/types/critter';

type CrittersDataProps = {
  critters: Promise<Critter[]>;
  startTime: number;
};

export function CrittersData({ critters, startTime }: CrittersDataProps) {
  const [crittersData, setCrittersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (critters instanceof Promise) {
      setIsLoading(true);
      critters.then(setCrittersData);
    } else {
      setCrittersData(critters);
    }

    // @ts-expect-error ReactPromise is not typed
    if (critters.status === 'rejected') {
      // @ts-expect-error ReactPromise is not typed
      setError(critters.reason);
    }
  }, [critters]);

  useEffect(() => {
    if (crittersData.length > 0) {
      setIsLoading(false);
    }
  }, [crittersData]);

  return (
    <div className="space-y-4">
      {error ? (
        <Error error={error} />
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : (
        <CrittersTable data={crittersData} startTime={startTime} />
      )}
    </div>
  )
} 