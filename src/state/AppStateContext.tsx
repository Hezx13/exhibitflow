import { createContext, useContext, useEffect, useCallback, useRef } from "react"
import { useImmerReducer } from "use-immer"
import { appStateReducer} from "./appStateReducer"
import { Action, resetRequests } from "./actions"
import { withInitialState } from "../utils/withInitialState"
import { debounce } from "throttle-debounce-ts"
import { save } from "../api"
import { DragItem } from "../components/DragItem"
import { useSocket } from "./socketContext"

const AppStateContext = createContext<AppStateContextProps>(
  {} as AppStateContextProps
)


export const AppStateProvider = withInitialState<AppStateProviderProps>(
  ({ children, initialState }) => {
    const [state, dispatch] = useImmerReducer(appStateReducer, initialState);
    // useRef to keep track of the previous state
    const prevStateRef = useRef(initialState);
    const socket = useSocket()
    const debouncedSave = useCallback(debounce(500, (currentState, prevState) => {
      save(currentState, prevState).then((res)=>{
        if(res === 200)
          dispatch(resetRequests())
      });
      prevStateRef.current = currentState;
    }), []);
    
    useEffect(() => {
      if(!!localStorage.getItem('token') && state.processSave)
      debouncedSave(state, prevStateRef.current);
      
    }, [state.lists, state.archive, debouncedSave]);

    const { 
    lists, 
    listsToAdd,
    archiveToAdd,
    listsToRemove,
    archiveToRemove,
    listsToUpdate,
    archiveToUpdate,
    archive,
    role 
  } = state;

    const getTasksByListId = (id: string) => {
      return lists.find((list) => list.id === id)?.tasks || [];
    };
    const getTasksByArchiveId = (id: string) => {
      return archive.find((list) => list.id === id)?.tasks || [];
    };

    return (
      <AppStateContext.Provider
        value={{ lists, archive,listsToAdd,
          archiveToAdd,
          listsToRemove,
          archiveToRemove,
          listsToUpdate,
          archiveToUpdate, role, getTasksByListId, getTasksByArchiveId, dispatch }}
      >
        {children}
      </AppStateContext.Provider>
    );
  }
);


export const useAppState = () => {
  return useContext(AppStateContext)
}
