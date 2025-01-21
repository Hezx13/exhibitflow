import React, { useState, useEffect } from 'react';
import { useLoadListsQuery, useLoadSingleListQuery } from '../store/api/listsApi';
import { eventEmitter } from '../state/EventEmitter';
import CircularProgress from '@mui/material/CircularProgress';

type InjectedProps = {
  initialState: AppState;
};

type PropsWithoutInjected<TBaseProps> = Omit<TBaseProps, keyof InjectedProps>;

export const LoadingSpinner = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white',
      }}
    >
      <CircularProgress sx={{ color: 'orange' }} />
      <div>Development sample</div>
      <div>Loading may take a while...</div>
    </div>
  );
};

export function withInitialState<TProps>(WrappedComponent: any) {
  return function WithInitialStateComponent(props: PropsWithoutInjected<TProps>) {
    const { data, refetch, isLoading } = useLoadListsQuery();
    const [initialState, setInitialState] = useState<AppState>({
      lists: [],
      listsToAdd: {},
      archiveToAdd: {},
      listsToRemove: {},
      archiveToRemove: {},
      listsToUpdate: {},
      archiveToUpdate: {},
      archive: [],
      processSave: true,
      role: 'User',
    });
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
      const fetchInitialState = async () => {
        try {
          setInitialState({
            ...data,
            listsToAdd: {},
            archiveToAdd: {},
            listsToRemove: {},
            archiveToRemove: {},
            listsToUpdate: {},
            archiveToUpdate: {},
            processSave: false,
          });
        } catch (e) {
          if (e instanceof Error) {
            setError(e);
          }
        }
      };

      const handleRefetch = () => {
        if (localStorage.getItem('token')) {
          refetch();
          fetchInitialState();
        }
      };

      eventEmitter.on('login', handleRefetch);
      eventEmitter.on('savedMaterialsAdded', handleRefetch);
      eventEmitter.on('changedDepartment', handleRefetch);

      if (localStorage.getItem('token')) {
        fetchInitialState();
      }

      return () => {
        eventEmitter.off('login', handleRefetch);
        eventEmitter.off('savedMaterialsAdded', handleRefetch);
        eventEmitter.off('changedDepartment', handleRefetch);
      };
    }, [data, refetch]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return <div>{error.message}</div>;
    }

    return <WrappedComponent {...props} initialState={initialState} />;
  };
}
