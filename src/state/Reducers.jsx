const reducerBluePrint = ({ REQUEST, SUCCESS, FAIL, RESET, initialState }) => {
    return (state = initialState, action) => {
      switch (action.type) {
        case REQUEST:
          return { ...state, loading: true };
        case SUCCESS:
          return {
            ...state,
            data: action.payload,
            loading: false,
          };
        case FAIL:
          return { ...state, loading: false, error: action.payload };
        case RESET:
          return { ...initialState };
        default:
          return state;
      }
    };
  };
  
  export const fetchReducer = reducerBluePrint({
    REQUEST: 'FETCH_REQUEST',
    SUCCESS: 'FETCH_SUCCESS',
    FAIL: 'FETCH_FAIL',
    RESET: 'FETCH_RESET',
    initialState: { data: [], loading: false, error: null },
  });

  export const createReducer = reducerBluePrint({
    REQUEST: 'CREATE_REQUEST',
    SUCCESS: 'CREATE_SUCCESS',
    FAIL: 'CREATE_FAIL',
    RESET: 'CREATE_RESET',
    initialState: { data: [], loading: false, error: null },
  });
  
  export const deleteReducer = reducerBluePrint({
    REQUEST: 'DELETE_REQUEST',
    SUCCESS: 'DELETE_SUCCESS',
    FAIL: 'DELETE_FAIL',
    RESET: 'DELETE_RESET',
    initialState: { loading: false, success: false, error: null },
  });
  
  export const updateReducer = reducerBluePrint({
    REQUEST: 'UPDATE_REQUEST',
    SUCCESS: 'UPDATE_SUCCESS',
    FAIL: 'UPDATE_FAIL',
    RESET: 'UPDATE_RESET',
    initialState: { loading: false, success: false, error: null },
  });
  
  export const uploadReducer = reducerBluePrint({
    REQUEST: 'UPLOAD_REQUEST',
    SUCCESS: 'UPLOAD_SUCCESS',
    FAIL: 'UPLOAD_FAIL',
    RESET: 'UPLOAD_RESET',
    initialState: { loading: false, success: false, error: null },
  });

//   usage
// const [fetchState, fetchDispatch] = useReducer(fetchReducer, {
//     data: [],
//     loading: false,
//     error: null,
//   });
  
  // const [deleteState, deleteDispatch] = useReducer(deleteReducer, {
  //   loading: false,
  //   success: false,
  //   error: null,
  // });
  
//   const [updateState, updateDispatch] = useReducer(updateReducer, {
//     loading: false,
//     success: false,
//     error: null,
//   });
  
//   const [uploadState, uploadDispatch] = useReducer(uploadReducer, {
//     loading: false,
//     success: false,
//     error: null,
//   });
  
  