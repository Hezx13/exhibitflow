type Material = {
    id: string;
    text: string;
    article: string;
    price: string;
    quantity: number;
    date: Date; // Assuming date is stored as an ISO string
    unit: string;
    comment: string;
    deliveryDate: Date;
    orderedBy: string;
    status: string;
    payment: string;
  };

  
 type Task = {
  _id?: string;
  id: string;
  text: string;
  article: string;
  price: string;
  quantity: number;
  date: Date;
  unit: string;
  comment: string;
  deliveryDate: Date;
  orderedBy: string;
  status: string;
  payment: string;
}


 type List = {
  _id?: string
  id: string
  text: string
  department: string,
  tasks: Task[]
}

 type AppState = {
  lists: List[]
  archive: List[]
  listsToAdd: TODO
  archiveToAdd: TODO
  listsToRemove: TODO
  archiveToRemove: TODO
  listsToUpdate: TODO
  archiveToUpdate: TODO
  processSave?: boolean
  role: string
}


  type AppStateContextProps = {
    lists: List[]
    archive: List[]
    listsToAdd: TODO
    archiveToAdd: TODO
    listsToRemove: TODO
    archiveToRemove: TODO
    listsToUpdate: TODO
    archiveToUpdate: TODO
    processSave?: boolean
    role: string
    getTasksByListId(id: string): Task[]
    getTasksByArchiveId(id: string) : Task[]
    dispatch: React.Dispatch<Action>
}

type AppStateProviderProps = {
  children: React.ReactNode
  initialState: AppState
}
  
type User = {
  _id: string;
  username: string;
  password?: string;
  email: string;
  department?: string;
  role?: UserRole;
  isApproved?: boolean;
}

type Department = {
  name: string;
  users?: [User] | null;
}

type TODO = any;