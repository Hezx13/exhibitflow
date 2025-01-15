import React, { useState, useEffect } from "react";
import { load } from "../api";
import CircularProgress from '@mui/material/CircularProgress';
import { eventEmitter } from "../state/EventEmitter";

type InjectedProps = {
  initialState: AppState;
};

type PropsWithoutInjected<TBaseProps> = Omit<
  TBaseProps,
  keyof InjectedProps
>;

type WithInjectedProps<TProps> = TProps & InjectedProps;


export const LoadingSpinner = () => {
  return (
    <div style={{ 
      display: 'flex',
       flexDirection: 'column',
        justifyContent: 'center',
         alignItems: 'center',
          height: '100vh',
          color: 'white'
          }}>
      <CircularProgress sx={{color: 'orange'}}/>
      <div>Development sample</div>
      <div>Loading may take a while...</div>
    </div>
  );
};


export function withInitialState<TProps>(
  WrappedComponent
) {
  return (props: PropsWithoutInjected<TProps>) => {
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | undefined>();

    useEffect(() => {
      const fetchInitialState = async () => {
        setIsLoading(true);
        try {
          const data = await load();
          setInitialState({
            ...data,
             listsToAdd: {},
            archiveToAdd: {},
            listsToRemove: {},
            archiveToRemove: {},
            listsToUpdate: {},
            archiveToUpdate: {},
            processSave: false
          });
        } catch (e) {
          if (e instanceof Error) {
            setError(e);
          }
        }
        setIsLoading(false);
      };

      const handleRefetch = () => {
        if (localStorage.getItem('token')) {
        fetchInitialState();
      } else {
        setIsLoading(false);
      }
      };
  
      eventEmitter.on('login', handleRefetch);
      eventEmitter.on('savedMaterialsAdded', handleRefetch);
      eventEmitter.on('changedDepartment', handleRefetch);
  
      if (localStorage.getItem('token')) {
        fetchInitialState();
      } else {
        setIsLoading(false);
      }
  
      return () => {
        eventEmitter.off('login', handleRefetch);
        eventEmitter.off('savedMaterialsAdded', handleRefetch);
        eventEmitter.off('changedDepartment', handleRefetch);

      };
    }, []);
    

    if (isLoading) {
      return <LoadingSpinner></LoadingSpinner>;
    }

    if (error) {
      return <div>{error.message}</div>;
    }

    // Pass props and initialState to WrappedComponent
    return <WrappedComponent {...props} initialState={initialState} />;
  };
}
